"use client";
import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  weekNumber: number;
  dayIndex: number;
  initialData: any;
  onSave: (updatedDay: any) => void;
}

export default function DayEditModal({
  isOpen,
  onClose,
  planId,
  weekNumber,
  dayIndex,
  initialData,
  onSave,
}: DayEditModalProps) {
  const [topic, setTopic] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setTopic(initialData.topic || "");
      setResources(initialData.resources || []);
      setMilestones(initialData.project_milestones || []);
    }
  }, [initialData]);

  const handleSave = async () => {
    const updatedDay = {
      week_number: weekNumber,
      day_index: dayIndex,
      topic,
      resources,
      project_milestones: milestones,
    };

    const res = await fetch(`http://127.0.0.1:8000/planner/update-day/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDay),
    });

    if (res.ok) {
      const data = await res.json();
      onSave(data.plan);
      onClose();
    } else {
      alert("Failed to update day");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true"></div>
      <div className="bg-white p-6 rounded shadow-xl w-1/3 z-10">
        <Dialog.Title className="text-xl font-bold mb-4">Edit Day</Dialog.Title>

        <label className="block mb-2">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2">Resources (comma-separated)</label>
        <input
          type="text"
          value={resources.join(", ")}
          onChange={(e) => setResources(e.target.value.split(",").map((r) => r.trim()))}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2">Project Milestones (comma-separated)</label>
        <input
          type="text"
          value={milestones.join(", ")}
          onChange={(e) => setMilestones(e.target.value.split(",").map((m) => m.trim()))}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
}
