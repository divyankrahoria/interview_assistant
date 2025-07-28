import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in .env")
if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
    print("Warning: Google Custom Search API keys are missing. Enrichment will be skipped.")

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_study_plan(role: str, timeline_weeks: int, skills: str) -> dict:
    """
    Generate a structured interview preparation plan using GPT.
    """
    prompt = f"""
    Create a {timeline_weeks}-week interview preparation plan for a {role}.
    Include daily topics, key resources (just names), and project milestones.
    Assume skill level: {skills}.
    Respond ONLY with valid JSON. No explanations, no markdown.
    Structure:
    {{
        "week": [
            {{
                "week_number": int,
                "days": [
                    {{
                        "day": "Monday",
                        "topic": "Topic name",
                        "resources": ["Resource 1", "Resource 2"],
                        "project_milestones": ["Milestone 1", "Milestone 2"]
                    }}
                ]
            }}
        ]
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    content = response.choices[0].message.content.strip()

    # Strip Markdown fences if present
    if content.startswith("```"):
        content = content.strip("`")
        if content.startswith("json"):
            content = content[4:].strip()

    # Try to parse JSON
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        print("RAW MODEL OUTPUT:", content)  # Debugging
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")

    # Add a 'completed' flag
    for week in parsed.get("week", []):
        for day in week.get("days", []):
            day["completed"] = False

    return parsed


def enrich_resources(plan: dict) -> dict:
    """
    Replace generic resource names with live links using Google Custom Search.
    Preserve original resource names as titles with associated URLs.
    """
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        print("Google API not configured; skipping enrichment.")
        return plan

    def search(query: str) -> list:
        url = (
            f"https://www.googleapis.com/customsearch/v1"
            f"?key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}&q={query}"
        )
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            data = r.json()
            return [item.get("link") for item in data.get("items", [])[:3] if item.get("link")]
        except Exception as e:
            print(f"Search failed for '{query}': {e}")
            return []

    for week in plan.get("week", []):
        for day in week.get("days", []):
            enriched = []
            for res in day.get("resources", []):
                if isinstance(res, dict) and "title" in res and "links" in res:
                    # Already enriched - keep as is
                    enriched.append(res)
                elif isinstance(res, str):
                    links = search(res)
                    enriched.append({
                        "title": res,
                        "links": links
                    })
            if enriched:
                day["resources"] = enriched

    return plan
