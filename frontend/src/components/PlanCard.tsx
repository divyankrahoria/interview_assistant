"use client";
import { useState } from "react";
import axios from "axios";

export default function PlanCard({
  week,
  planId,
  locked = false,
}: {
  week: any;
  planId: string | null;
  locked?: boolean;
}) {
  const [localWeek, setLocalWeek] = useState(week);

  // Update backend when a field changes
  const handleUpdate = async (dayIndex: number, field: string, value: any) => {
    const updated = { ...localWeek };
    updated.days[dayIndex][field] = value;
    setLocalWeek(updated);

    if (!planId) return;

    try {
      await axios.patch(`http://127.0.0.1:8000/planner/update-day/${planId}`, {
        week_number: localWeek.week_number,
        day_index: dayIndex,
        [field]: value,
      });
    } catch (err) {
      console.error("Failed to update day:", err);
    }
  };

  // Render resources (auto-handle strings, single URLs, or enriched objects with multiple links)
  const renderResources = (resources: any[]) => {
    return resources.map((r, idx) => {
      // Plain string resource
      if (typeof r === "string") {
        return <li key={idx}>{r}</li>;
      }
      // Enriched object with single or multiple links
      if (r && (r.url || r.links)) {
        return (
          <li key={idx} className="mb-1">
            <strong>{r.title || "Resource"}</strong>
            <ul className="pl-4 list-disc">
              {(r.links || [r.url]).map((link: string, linkIdx: number) => (
                <li key={linkIdx}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        );
      }
      return null;
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-3">Week {localWeek.week_number}</h2>
      <div className="space-y-3">
        {localWeek.days.map((day: any, i: number) => {
          const hasEnrichedLinks = Array.isArray(day.resources) && day.resources.some((r: any) => typeof r === "object");

          return (
            <div
              key={i}
              className="p-3 border rounded bg-gray-50 flex flex-col space-y-2"
            >
              {/* Day header */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={day.completed || false}
                  onChange={(e) =>
                    handleUpdate(i, "completed", e.target.checked)
                  }
                  disabled={locked}
                  className="h-4 w-4"
                />
                <input
                  type="text"
                  value={day.topic}
                  onChange={(e) => handleUpdate(i, "topic", e.target.value)}
                  disabled={locked}
                  className="w-full border-b focus:outline-none bg-transparent"
                />
              </div>

              {/* Resources */}
              <div>
                <label className="text-sm font-semibold">Resources:</label>
                {hasEnrichedLinks ? (
                  <ul className="list-disc list-inside mt-1">
                    {renderResources(day.resources)}
                  </ul>
                ) : (
                  <textarea
                    value={day.resources?.join("\n") || ""}
                    onChange={(e) =>
                      handleUpdate(
                        i,
                        "resources",
                        e.target.value
                          .split("\n")
                          .filter((r) => r.trim() !== "")
                      )
                    }
                    disabled={locked}
                    className="w-full border rounded p-1 text-sm"
                  />
                )}
              </div>

              {/* Project milestones */}
              <div>
                <label className="text-sm font-semibold">Project Milestones:</label>
                <textarea
                  value={day.project_milestones?.join("\n") || ""}
                  onChange={(e) =>
                    handleUpdate(
                      i,
                      "project_milestones",
                      e.target.value
                        .split("\n")
                        .filter((r) => r.trim() !== "")
                    )
                  }
                  disabled={locked}
                  className="w-full border rounded p-1 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
