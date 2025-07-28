from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os, json, uuid
from datetime import datetime
from app.agents.planner_agent import generate_study_plan, enrich_resources

router = APIRouter()
PLANS_DIR = "plans"
os.makedirs(PLANS_DIR, exist_ok=True)

# --- Models ---
class GeneratePlan(BaseModel):
    name: str
    role: str
    timeline_weeks: int
    skills: str

class UpdateDay(BaseModel):
    week_number: int
    day_index: int
    topic: str | None = None
    resources: list[str] | None = None
    project_milestones: list[str] | None = None
    completed: bool | None = None

class RenamePlan(BaseModel):
    name: str


# --- Helpers ---
def plan_path(plan_id: str) -> str:
    return os.path.join(PLANS_DIR, f"{plan_id}.json")

def read_plan(plan_id: str) -> dict:
    path = plan_path(plan_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Plan not found")
    with open(path, "r") as f:
        return json.load(f)

def write_plan(plan_id: str, plan: dict):
    with open(plan_path(plan_id), "w") as f:
        json.dump(plan, f, indent=2)


# --- Endpoints ---

@router.post("/generate")
def generate_plan(data: GeneratePlan):
    """
    Generate and save a new study plan.
    """
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Plan name cannot be empty")

    try:
        plan_data = generate_study_plan(data.role, data.timeline_weeks, data.skills)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")

    plan_id = str(uuid.uuid4())
    plan = {
        "id": plan_id,
        "name": data.name.strip(),
        "role": data.role,
        "timeline_weeks": data.timeline_weeks,
        "skills": data.skills,
        "created_at": datetime.utcnow().isoformat(),
        "week": plan_data.get("week", [])
    }
    write_plan(plan_id, plan)
    return {"plan_id": plan_id, "plan": plan}


@router.post("/enrich/{plan_id}")
def enrich_plan(plan_id: str):
    """
    Enrich an existing plan with live resource links.
    """
    plan = read_plan(plan_id)
    enriched = enrich_resources(plan)
    write_plan(plan_id, enriched)
    return {"message": "Plan enriched with live resources", "plan": enriched}


@router.get("/plan/{plan_id}")
def get_plan(plan_id: str):
    """
    Retrieve a single study plan by ID.
    """
    return read_plan(plan_id)


@router.get("/plans")
def list_plans():
    """
    List all saved plans (id, name, created_at).
    """
    plans = []
    for filename in os.listdir(PLANS_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(PLANS_DIR, filename), "r") as f:
                plan = json.load(f)
                plans.append({
                    "id": plan.get("id"),
                    "name": plan.get("name"),
                    "created_at": plan.get("created_at")
                })
    plans.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return {"plans": plans}


@router.patch("/update-day/{plan_id}")
def update_day(plan_id: str, update: UpdateDay):
    """
    Update details for a specific day in a plan.
    """
    plan = read_plan(plan_id)
    updated = False
    for week in plan.get("week", []):
        if week.get("week_number") == update.week_number:
            if 0 <= update.day_index < len(week.get("days", [])):
                day = week["days"][update.day_index]
                if update.topic is not None: day["topic"] = update.topic
                if update.resources is not None: day["resources"] = update.resources
                if update.project_milestones is not None: day["project_milestones"] = update.project_milestones
                if update.completed is not None: day["completed"] = update.completed
                updated = True
                break
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid week_number or day_index")
    write_plan(plan_id, plan)
    return {"message": "Day updated", "plan": plan}


@router.patch("/plan/{plan_id}")
def rename_plan(plan_id: str, data: RenamePlan):
    """
    Rename a study plan.
    """
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Plan name cannot be empty")
    plan = read_plan(plan_id)
    plan["name"] = data.name.strip()
    write_plan(plan_id, plan)
    return {"message": "Plan renamed", "plan": plan}


@router.delete("/plan/{plan_id}")
def delete_plan(plan_id: str):
    """
    Delete a study plan.
    """
    path = plan_path(plan_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Plan not found")
    os.remove(path)
    return {"message": "Plan deleted"}
