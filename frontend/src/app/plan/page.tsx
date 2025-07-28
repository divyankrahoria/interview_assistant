"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PlanCard from "@/components/PlanCard";
import axios from "axios";

export default function PlanPage() {
  const [name, setName] = useState<string>("My Study Plan");
  const [role, setRole] = useState<string>("Data Scientist");
  const [timelineWeeks, setTimelineWeeks] = useState<number>(4);
  const [skills, setSkills] = useState<string>("Intermediate Python; weak in system design");

  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);

  // Rename modal
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/planner/plans");
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  const fetchPlan = async (planId: string) => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/planner/plan/${planId}`);
      const loadedPlan = res.data.plan || res.data; // Handle both possible responses
      setPlan(loadedPlan);
      setSelectedPlan(planId);
      setName(loadedPlan.name || "Untitled Plan");
      setRole(loadedPlan.role || "");
      setTimelineWeeks(loadedPlan.timeline_weeks || 1);
      setSkills(loadedPlan.skills || "");
    } catch (err) {
      console.error("Failed to fetch plan", err);
      alert("Failed to fetch plan.");
    }
    setLoading(false);
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/planner/generate", {
        name: name || "Untitled Plan",
        role,
        timeline_weeks: timelineWeeks,
        skills,
      });
      setPlan(res.data.plan);
      setSelectedPlan(res.data.plan_id);
      await fetchPlans();
    } catch (err) {
      console.error("Failed to generate plan", err);
      alert("Failed to generate plan.");
    }
    setLoading(false);
  };

  const enrichPlan = async () => {
    if (!selectedPlan) {
      alert("Select a plan to enrich first!");
      return;
    }
    setEnriching(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/planner/enrich/${selectedPlan}`);
      setPlan(res.data.plan);
    } catch (err) {
      console.error("Failed to enrich plan", err);
      alert("Failed to enrich plan.");
    }
    setEnriching(false);
  };

  const deletePlan = async () => {
    if (!selectedPlan) return;
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/planner/plan/${selectedPlan}`);
      setSelectedPlan(null);
      setPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error("Failed to delete plan", err);
      alert("Failed to delete plan.");
    }
  };

  const renamePlan = async () => {
    if (!selectedPlan || !newName.trim()) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/planner/plan/${selectedPlan}`, { name: newName });
      setRenameModalOpen(false);
      setNewName("");
      await fetchPlans();
      if (plan) setPlan({ ...plan, name: newName });
      setName(newName);
    } catch (err) {
      console.error("Failed to rename plan", err);
      alert("Failed to rename plan.");
    }
  };

  const completedDays =
    plan?.week?.reduce((acc: number, w: any) => acc + (w.days?.filter((d: any) => d.completed)?.length || 0), 0) || 0;
  const totalDays = plan?.week?.reduce((acc: number, w: any) => acc + (w.days?.length || 0), 0) || 0;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Study Plan</h1>
          <div className="flex space-x-2">
            {selectedPlan && (
              <>
                <button
                  onClick={enrichPlan}
                  disabled={enriching}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {enriching ? "Enriching..." : "Enrich Plan"}
                </button>
                <button
                  onClick={() => setRenameModalOpen(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Rename
                </button>
                <button
                  onClick={deletePlan}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={generatePlan}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate New Plan"}
            </button>
          </div>
        </div>

        {/* Plan Selector */}
        {plans.length > 0 && (
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Select Existing Plan</label>
            <select
              value={selectedPlan || ""}
              onChange={(e) => fetchPlan(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">-- Select a plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Plan Form */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Plan Name</label>
            <input
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Role</label>
            <input
              type="text"
              value={role || ""}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Timeline (weeks)</label>
            <input
              type="number"
              value={timelineWeeks || 1}
              onChange={(e) => setTimelineWeeks(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min={1}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Skills / Weaknesses</label>
            <input
              type="text"
              value={skills || ""}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Plan Content */}
        {plan?.week && Array.isArray(plan.week) && plan.week.length > 0 ? (
          <>
            <div className="mb-6 bg-white p-4 rounded shadow">
              <p className="font-semibold mb-2">Overall Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${((completedDays / totalDays) * 100).toFixed(1)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                {completedDays} / {totalDays} days completed
              </p>
            </div>
            {plan.week.map((week: any, i: number) => (
              <PlanCard key={i} week={week} planId={selectedPlan} />
            ))}
          </>
        ) : (
          <p className="text-gray-700">No plan selected. Create a new one or choose from existing plans above.</p>
        )}

        {/* Rename Modal */}
        {renameModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onKeyDown={(e) => e.key === "Enter" && renamePlan()}
          >
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Rename Plan</h2>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New plan name"
                className="w-full px-3 py-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRenameModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={renamePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
