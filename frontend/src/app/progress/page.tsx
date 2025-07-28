"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

export default function ProgressPage() {
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/planner/plan/${planId}`);
      setPlan(res.data.plan);
      setSelectedPlan(planId);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch plan.");
    }
    setLoading(false);
  };

  const completedDays =
    plan?.week?.reduce(
      (acc: number, w: any) => acc + (w.days?.filter((d: any) => d.completed)?.length || 0),
      0
    ) || 0;
  const totalDays =
    plan?.week?.reduce((acc: number, w: any) => acc + (w.days?.length || 0), 0) || 0;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Progress Tracker</h1>

        {plans.length > 0 && (
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Select Plan</label>
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

        {plan ? (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">{plan.name}</h2>
            <p className="mb-3 text-gray-700">
              Role: <strong>{plan.role}</strong> | Timeline: <strong>{plan.timeline_weeks} weeks</strong>
            </p>
            <p className="mb-3 text-gray-700">Skills: {plan.skills}</p>

            <div className="mb-6">
              <p className="font-semibold mb-2">Overall Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{
                    width: `${((completedDays / totalDays) * 100).toFixed(1)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                {completedDays} / {totalDays} days completed
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Week-by-Week Progress</h3>
              <ul className="space-y-3">
                {plan.week.map((week: any) => {
                  const weekCompleted = week.days.filter((d: any) => d.completed).length;
                  return (
                    <li key={week.week_number} className="p-3 bg-gray-50 rounded border">
                      <p className="font-semibold mb-1">
                        Week {week.week_number}: {weekCompleted} / {week.days.length} days completed
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${(weekCompleted / week.days.length) * 100}%` }}
                        ></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-700">Select a plan to view its progress.</p>
        )}
      </div>
    </div>
  );
}
