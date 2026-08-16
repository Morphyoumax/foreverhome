import { useState, useMemo, useRef, useEffect } from "react";
import { useSimulationEngine } from "./hooks/useSimulationEngine";
import { TimelineView } from "./components/TimelineView";
import { ScenarioControls } from "./components/ScenarioControls";
import {
  PropertyInputs,
  PropertyScenario,
  ActiveInteraction,
  SimulationDataPoint,
  FutureExpense,
  FutureIncome,
} from "./types";
import {
  ACCOUNT_BALANCES,
  DEFAULT_INPUTS,
  adjustInputs,
  TIMELINE_KEYS,
  DECIDED_PROPERTY_ADDRESS,
} from "./constants/defaults";

const Icons = {
  Farm: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10V21h10V10L8 6 3 10z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 21v-5h4v5M6 16l4 5M10 16l-4 5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21V9.5a2.5 2.5 0 0 1 5 0V21"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 9.5h5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18"
      />
    </svg>
  ),
  Home: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  Dollar: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.195-.12a3.375 3.375 0 0 0 4.105 0l.196-.121m-3-4.122h.008v.008H12V11.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  ),
  TrendUp: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
      />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  ),
  Warning: ({ className = "w-5 h-5 text-amber-700" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5 text-emerald-750" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  Book: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  ),
  Download: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  ),
  DragHandle: () => (
    <div className="flex flex-col gap-0.5 px-1 cursor-ew-resize hover:bg-black/15 h-full justify-center items-center rounded select-none no-print">
      <span className="w-0.5 h-3 bg-slate-700"></span>
      <span className="w-0.5 h-3 bg-slate-700"></span>
    </div>
  ),
};

// Stated Financial Position as of July 6, 2026

export default function App() {
  const [inputs, setInputs] = useState<PropertyInputs>(() =>
    adjustInputs(DEFAULT_INPUTS)
  );

  const [financialScenarios, setFinancialScenarios] = useState<PropertyScenario[]>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v10_financial");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          return list.map((sc: any) => ({
            name: sc.name,
            inputs: adjustInputs({
              ...DEFAULT_INPUTS,
              ...sc.inputs,
              depletionPriorityToggle: sc.inputs.depletionPriorityToggle || "paulan"
            })
          }));
        }
      }
    } catch {
      // standard fallback below
    }
    return [
      {
        name: "Decided Property ($1.07M)",
        inputs: adjustInputs(DEFAULT_INPUTS),
      },
      {
        name: "Under Budget ($950k)",
        inputs: adjustInputs({ ...DEFAULT_INPUTS, purchasePrice: 950000 }),
      },
      {
        name: "Slight Premium ($1.2M)",
        inputs: adjustInputs({ ...DEFAULT_INPUTS, purchasePrice: 1200000 }),
      },
    ];
  });

  const [newScenarioName, setNewScenarioName] = useState("");
  const [isPaulanLinkedHovered, setIsPaulanLinkedHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "mortgage" | "settles" | "futureExpenses" | "paulan">("overview");
  const [trajectoryTableMode, setTrajectoryTableMode] = useState<"key" | "all">("key");
  const [trajectorySearch, setTrajectorySearch] = useState("");
  const [overviewNotes, setOverviewNotes] = useState(() => localStorage.getItem("overview_notes") || "");

  useEffect(() => {
    localStorage.setItem("overview_notes", overviewNotes);
  }, [overviewNotes]);

  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v11_future_expenses");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return [
      {
        id: "exp-1",
        name: "Meryl GF",
        amount: 300000,
        timingYears: 0.5,
        source: "offset_fh",
      },
      {
        id: "exp-2",
        name: "Ute and Buggy",
        amount: 100000,
        timingYears: 1.0,
        source: "offset_fh",
      },
    ];
  });

  const [futureIncomes, setFutureIncomes] = useState<FutureIncome[]>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v11_future_incomes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return [
      {
        id: "inc-1",
        name: "Teaching",
        annualAmount: 40000,
        timingStartYears: 1.0,
        timingEndYears: null,
      },
      {
        id: "inc-2",
        name: "Agistment",
        annualAmount: 5000,
        timingStartYears: 1.0,
        timingEndYears: null,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v11_future_expenses", JSON.stringify(futureExpenses));
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [futureExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v11_future_incomes", JSON.stringify(futureIncomes));
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [futureIncomes]);

  // New Build State Hooks
  const [newBuildSpend, setNewBuildSpend] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v12_new_build_spend");
      if (saved) return parseInt(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return 1200000;
  });
  const [newBuildTiming, setNewBuildTiming] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v12_new_build_timing");
      if (saved) return parseFloat(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return 2.5;
  });
  const [newBuildBuffer, setNewBuildBuffer] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v12_new_build_buffer");
      if (saved) return parseInt(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return 200000;
  });
  const [newBuildDrawChoicePct, setNewBuildDrawChoicePct] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v12_new_build_draw_choice_pct");
      if (saved) return parseInt(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return 100;
  });

  const [newBuildPostWeeklySavingsOverride, setNewBuildPostWeeklySavingsOverride] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v12_new_build_post_weekly_savings_override");
      if (saved && saved !== "null") return parseInt(saved);
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (newBuildPostWeeklySavingsOverride === null) {
        localStorage.removeItem("property_scenarios_v12_new_build_post_weekly_savings_override");
      } else {
        localStorage.setItem("property_scenarios_v12_new_build_post_weekly_savings_override", newBuildPostWeeklySavingsOverride.toString());
      }
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [newBuildPostWeeklySavingsOverride]);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v12_new_build_spend", newBuildSpend.toString());
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [newBuildSpend]);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v12_new_build_timing", newBuildTiming.toString());
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [newBuildTiming]);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v12_new_build_buffer", newBuildBuffer.toString());
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [newBuildBuffer]);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v12_new_build_draw_choice_pct", newBuildDrawChoicePct.toString());
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [newBuildDrawChoicePct]);



  const WeeklyNetSalary = inputs.weeklyIncome ?? 5303.35; // Family weekly salary inflow

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v10_financial", JSON.stringify(financialScenarios));
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [financialScenarios]);

  // Helper to format simulation weeks into clear Month Year calendar blocks
  const getMilestoneDateStr = (weekNum: number) => {
    const startDelayDays = Math.max(timeline.paulanSettleEnd, timeline.merylSettleEnd);
    const d = new Date(2026, 6, 6); // July 6, 2026
    d.setDate(d.getDate() + startDelayDays + weekNum * 7);
    return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  };

  // Timeline Calculation: Decoupled into three parallel swimlanes
  const timeline = useMemo(() => {
    const startDate = new Date(2026, 6, 6); // July 6, 2026

    // 1. Meryl's Track (Green Sequential Shades)
    const merylPrepStart = inputs.merylStartDelay;
    const merylPrepEnd = merylPrepStart + inputs.merylPrepDays;
    const merylCampaignStart = merylPrepEnd;
    const merylCampaignEnd = merylCampaignStart + inputs.merylCampaignDays;
    const merylSettleStart = merylCampaignEnd;
    const merylSettleEnd = merylSettleStart + inputs.merylSettleDays;

    // 2. Forever Home Track (Blue Sequential Shades)
    const fhContractSign = inputs.fhStartDelay;
    const fhSettleStart = fhContractSign;
    const fhSettleEnd = fhSettleStart + inputs.fhSettleDays;
    const renoStart = fhSettleEnd;
    const renoEnd = renoStart + inputs.renoDays;
    const moveStart = renoEnd;
    const moveEnd = moveStart + inputs.moveDays;

    // 3. Paulan Court Track (Red/Pink/Maroon Shades) - Shifted dynamically to start after Swimlane B concludes
    const paulanPrepStart = moveEnd;
    const paulanPrepEnd = paulanPrepStart + inputs.paulanPrepDays;
    const paulanCampaignStart = paulanPrepEnd;
    const paulanCampaignEnd = paulanCampaignStart + inputs.paulanCampaignDays;
    const paulanSettleStart = paulanCampaignEnd;
    const paulanSettleEnd = paulanSettleStart + inputs.paulanSettleDays;

    // 4. Meryl Renting Track (Starts 14 days before merylSettleEnd by default + merylRentStartOffset)
    const merylRentStart = Math.max(0, merylSettleEnd - 14 + inputs.merylRentStartOffset);
    const merylRentEnd = moveEnd + inputs.merylRentingExtraDays;
    const merylRentDays = Math.max(1, merylRentEnd - merylRentStart);

    // GFI capital transfer (1-day event relative to merylSettleEnd by gfiStartOffset)
    const gfiStart = merylSettleEnd + inputs.gfiStartOffset;
    const gfiEnd = gfiStart + 1;

    const maxDuration = Math.max(
      merylSettleEnd,
      gfiEnd,
      moveEnd,
      paulanSettleEnd,
      merylRentEnd,
      200
    );

    const addDays = (days: number) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + days);
      return d.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    // Assemble Monthly Labels
    const monthDetails = [];
    const tempDate = new Date(startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + maxDuration);

    while (tempDate <= endDate) {
      const monthName = tempDate.toLocaleDateString("en-AU", { month: "short" });
      const year = tempDate.getFullYear();
      const month = tempDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const spanStart = Math.max(startDate.getTime(), firstDayOfMonth.getTime());
      const spanEnd = Math.min(endDate.getTime(), lastDayOfMonth.getTime());
      const diffDays = Math.max(
        0,
        Math.ceil((spanEnd - spanStart) / (1000 * 60 * 60 * 24)) + 1
      );

      monthDetails.push({
        name: `${monthName} ${year.toString().slice(-2)}`,
        days: diffDays,
        weight: (diffDays / maxDuration) * 100,
      });

      tempDate.setMonth(tempDate.getMonth() + 1);
      tempDate.setDate(1);
    }

    return {
      merylPrepStart,
      merylPrepEnd,
      merylCampaignStart,
      merylCampaignEnd,
      merylSettleStart,
      merylSettleEnd,
      gfiStart,
      gfiEnd,
      merylRentStart,
      merylRentEnd,
      merylRentDays,
      fhContractSign,
      fhSettleStart,
      fhSettleEnd,
      renoStart,
      renoEnd,
      moveStart,
      moveEnd,
      paulanPrepStart,
      paulanPrepEnd,
      paulanCampaignStart,
      paulanCampaignEnd,
      paulanSettleStart,
      paulanSettleEnd,
      totalDurationDays: maxDuration,
      monthAxis: monthDetails,
      dates: {
        start: addDays(0),
        merylPrepStart: addDays(merylPrepStart),
        merylPrepEnd: addDays(merylPrepEnd),
        merylContract: addDays(merylCampaignEnd),
        merylSettle: addDays(merylSettleEnd),
        gfiDate: addDays(gfiStart),
        merylRentStart: addDays(merylRentStart),
        merylRentEnd: addDays(merylRentEnd),
        fhContract: addDays(fhContractSign),
        fhSettle: addDays(fhSettleEnd),
        renoEnd: addDays(renoEnd),
        moveEnd: addDays(moveEnd),
        paulanPrepStart: addDays(paulanPrepStart),
        paulanReady: addDays(paulanPrepEnd),
        paulanContract: addDays(paulanCampaignEnd),
        paulanSettle: addDays(paulanSettleEnd),
      },
    };
  }, [inputs]);

  // Dynamic Constraints and Financial Modelling Engine
  const finances = useSimulationEngine({
    inputs,
    timeline,
    futureExpenses,
    futureIncomes,
    newBuildSpend,
    newBuildTiming,
    newBuildBuffer,
    newBuildDrawChoicePct,
    newBuildPostWeeklySavingsOverride,
  });

  const handleInputChange = (field: keyof PropertyInputs, value: any) => {
    setInputs((prev) => {
      const next = { ...prev, [field]: value };
      const currentIncome = next.weeklyIncome ?? prev.weeklyIncome ?? 5303.35;

      if (field === "weeklyIncome") {
        const totalOutlays = finances.totalCommittedWeeklyOutlays;
        if (prev.useFixedDiscretionary) {
          next.weeklySavings = Math.max(0, Math.round(currentIncome - totalOutlays - (prev.fixedDiscretionaryCash ?? 3000)));
        } else {
          next.fixedDiscretionaryCash = Math.max(0, Math.round(currentIncome - totalOutlays - prev.weeklySavings));
        }
      } else if (field === "useFixedDiscretionary") {
        if (value === true) {
          // Switching to Fixed Discretionary Cash:
          // Initialize fixedDiscretionaryCash to current leftoverDiscretionaryCash
          const totalOutlays = finances.totalCommittedWeeklyOutlays;
          const currentLeftover = Math.max(0, currentIncome - totalOutlays - prev.weeklySavings);
          next.fixedDiscretionaryCash = Math.round(currentLeftover);
        } else {
          // Switching to Weekly Extra Savings:
          // Initialize weeklySavings to current effectiveWeeklySavings
          const totalOutlays = finances.totalCommittedWeeklyOutlays;
          const currentSavings = Math.max(0, currentIncome - totalOutlays - (prev.fixedDiscretionaryCash ?? 3000));
          next.weeklySavings = Math.round(currentSavings);
        }
      } else if (field === "weeklySavings" && prev.useFixedDiscretionary) {
        // In fixed discretionary mode, modifying weeklySavings directly also updates fixedDiscretionaryCash
        const totalOutlays = finances.totalCommittedWeeklyOutlays;
        next.fixedDiscretionaryCash = Math.max(0, Math.round(currentIncome - totalOutlays - value));
      } else if (field === "fixedDiscretionaryCash") {
        // Modifying fixedDiscretionaryCash updates weeklySavings
        const totalOutlays = finances.totalCommittedWeeklyOutlays;
        next.weeklySavings = Math.max(0, Math.round(currentIncome - totalOutlays - value));
      } else if (field === "usePostBuildFixedDiscretionary") {
        if (value === true) {
          // Switching to Fixed Post-Build Discretionary Cash:
          // Initialize postBuildFixedDiscretionaryCash to current post-build discretionary surplus
          const postBuildGross = finances.postBuildGrossCashSurplus || 0;
          const currentPostBuildSavings = newBuildPostWeeklySavingsOverride !== null ? newBuildPostWeeklySavingsOverride : prev.weeklySavings;
          const currentPostBuildLeftover = Math.max(0, postBuildGross - currentPostBuildSavings);
          next.postBuildFixedDiscretionaryCash = Math.round(currentPostBuildLeftover);
        } else {
          // Switching to Post-Build Savings Rate:
          // Initialize newBuildPostWeeklySavingsOverride to current effective post-build savings
          const postBuildGross = finances.postBuildGrossCashSurplus || 0;
          const currentPostBuildSavings = Math.max(0, postBuildGross - (prev.postBuildFixedDiscretionaryCash ?? 3000));
          setNewBuildPostWeeklySavingsOverride(Math.round(currentPostBuildSavings));
        }
      } else if (field === "postBuildFixedDiscretionaryCash") {
        // Modifying postBuildFixedDiscretionaryCash updates newBuildPostWeeklySavingsOverride
        const postBuildGross = finances.postBuildGrossCashSurplus || 0;
        const currentPostBuildSavings = Math.max(0, postBuildGross - value);
        setNewBuildPostWeeklySavingsOverride(Math.round(currentPostBuildSavings));
      }

      return adjustInputs(next);
    });
  };

  const handleSaveFinancialScenario = () => {
    if (!newScenarioName.trim()) return;
    const name = newScenarioName.trim();
    const updated = [
      ...financialScenarios.filter((s) => s.name !== name),
      { name, inputs },
    ];
    setFinancialScenarios(updated);
    setNewScenarioName("");
  };

  const handleLoadFinancialScenario = (scenario: PropertyScenario) => {
    setInputs((current) => {
      const updated = { ...current };
      (Object.keys(current) as (keyof PropertyInputs)[]).forEach((key) => {
        if (!TIMELINE_KEYS.includes(key)) {
          (updated as any)[key] = scenario.inputs[key];
        }
      });
      return adjustInputs(updated);
    });
  };

  const handleDeleteFinancialScenario = (name: string) => {
    setFinancialScenarios((prev) => prev.filter((s) => s.name !== name));
  };

  const handleExportCsv = () => {
    // Generate CSV contents
    const headers = ["Week", "Year", "Forever Home Loan ($)", "Forever Home Offset ($)", "Fern St Loan ($)", "Fern St Offset ($)", "Net Portfolio Debt ($)"];
    const rows = finances.simulationData.map(d => [
      d.week,
      d.year,
      d.loanFH,
      d.offsetFH,
      d.loanFern,
      d.offsetFern,
      d.netDebt
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Forever_Home_Portfolio_Trajectory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHtmlReport = () => {
    const reportDate = new Date().toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forever Home Scenario Snapshot - Financial Modeler</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Inter", -apple-system, sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.5;
    }
    .container {
      max-width: 1000px;
      margin: 40px auto;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    header {
      background: #1e3a8a;
      color: white;
      padding: 40px;
      border-bottom: 4px solid #b45309;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: #93c5fd;
      font-size: 0.95rem;
    }
    .meta-stamp {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      margin-top: 16px;
      color: #94a3b8;
    }
    .content {
      padding: 40px;
    }
    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      color: #1e3a8a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin: 32px 0 16px 0;
    }
    h2:first-of-type {
      margin-top: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 20px;
    }
    .card-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .kpi {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #0f766e;
    }
    .kpi-unit {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      color: #64748b;
    }
    .kpi-interest {
      font-size: 0.8rem;
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-radius: 6px;
      padding: 8px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      color: #166534;
      font-weight: 500;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 0.85rem;
    }
    .data-table th, .data-table td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
    }
    .data-table tr:hover {
      background: #f8fafc;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-rose { background: #ffe4e6; color: #9f1239; }
    .footer {
      background: #f1f5f9;
      padding: 24px 40px;
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    @media print {
      body { background: white; }
      .container { border: none; box-shadow: none; margin: 0; max-width: 100%; }
      header { background: #ffffff !important; color: #000000 !important; border-bottom: 2px solid #000000; padding: 20px 0; }
      .subtitle { color: #555555; }
      .content { padding: 20px 0; }
      .card { background: white; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Forever Home Scenario Snapshot</h1>
      <div class="subtitle" style="font-size: 1.05rem; font-weight: bold; color: #0f766e; margin-top: 4px;">📍 419 Old Yarragon-Leongatha Road, Yarragon South, VIC</div>
      <div class="subtitle">Forever Home Financial Modeler</div>
      <div class="meta-stamp">Scenario Export Date: ${reportDate} AEST</div>
    </header>
    
    <div class="content">
      <h2>Key Modeling Milestones</h2>
      <div class="grid">
        <div class="card" style="border-left: 4px solid #0f766e;">
          <div class="card-title">Years to Offset Forever Home</div>
          <div class="kpi">${finances.fhOffsetYears} <span class="kpi-unit">Years</span></div>
          <div class="kpi-interest">
            <span>Est. Interest Paid Prior:</span>
            <span class="mono">$${Math.round(finances.fhInterestAtOffset).toLocaleString()}</span>
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:12px;">
            Wipes out Forever Home interest exposure completely. Dynamic base on savings.
          </div>
        </div>

        <div class="card" style="border-left: 4px solid #14b8a6;">
          <div class="card-title">Years to Complete Portfolio Freedom</div>
          <div class="kpi">${finances.activeFullyOffsetYears} <span class="kpi-unit">Years</span></div>
          <div class="kpi-interest" style="background:#f0fdfa; border-color:#ccfbf1; color:#0f766e; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between;">
              <span>Portfolio Interest Paid:</span>
              <span class="mono">$${Math.round(finances.combinedInterestAtActiveFullyOffset).toLocaleString()}</span>
            </div>
            <div style="font-size:0.75rem; font-weight:normal; color:#475569; margin-top:2px;">
              Includes Forever Home, Fern St, and New Build construction or custom simulated loans.
            </div>
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:12px;">
            Entire portfolio of modeled properties and construction completely neutralized in offsets.
          </div>
        </div>
      </div>

      <h2>Applied Modeled Inputs</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">Assets & Properties</div>
          <table class="data-table">
            <tr>
              <td>Forever Home purchase</td>
              <td class="mono font-bold">$${inputs.purchasePrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Paulan Court Gross Sale</td>
              <td class="mono font-bold">$${inputs.paulanSalePrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Twin Ranges Gross Sale</td>
              <td class="mono font-bold">$${inputs.merylSalePrice.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Meryl's Cash Capital Contribution</td>
              <td class="mono font-bold" style="color:#0f766e">$${inputs.merylContribution.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Post-commission Paulan Net</td>
              <td class="mono font-bold">$${Math.round(finances.paulanNetProceeds).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="card">
          <div class="card-title">Mortgage & Cashflow Parameters</div>
          <table class="data-table">
            <tr>
              <td>Assumed Loan Rate</td>
              <td class="mono font-bold">${inputs.interestRate}%</td>
            </tr>
            <tr>
              <td>Weekly Savings Buffer Addition</td>
              <td className="mono font-bold" style={{ color: inputs.useFixedDiscretionary ? '#4f46e5' : '#0d9488' }}>
                ${Math.round(finances.effectiveWeeklySavings)}/wk
                {inputs.useFixedDiscretionary && (
                  <span className="text-[9px] text-stone-400 font-normal block font-sans">
                    (derived from $3k/wk discretionary)
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td>Principal Reduction Split (Recast)</td>
              <td class="mono font-bold">${inputs.internalVariationPct}%</td>
            </tr>
            <tr>
              <td>Target Cash Cushion Buffer</td>
              <td class="mono font-bold">$${inputs.offsetBuffer.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Prioritized Depletion Target</td>
              <td class="badge badge-blue">${inputs.depletionPriorityToggle}</td>
            </tr>
          </table>
        </div>
      </div>

      <h2>Gantt Timeline Schedule Dates</h2>
      <table class="data-table" style="margin-top:16px;">
        <thead>
          <tr>
            <th>Swimlane Event / Stage</th>
            <th>Commences</th>
            <th>Finishes</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Forever Home Settlement</strong></td>
            <td>Day 0</td>
            <td>${timeline.dates.fhSettle}</td>
            <td>${inputs.fhSettleDays} Days</td>
          </tr>
          <tr>
            <td><strong>Meryl's Twin Ranges Selling Prep & Settlement</strong></td>
            <td>Day 0</td>
            <td>${timeline.dates.merylSettle}</td>
            <td>${inputs.merylPrepDays + inputs.merylCampaignDays + inputs.merylSettleDays} Days</td>
          </tr>
          <tr>
            <td><strong>Paulan Court Prep & Selling Campaign</strong></td>
            <td>${timeline.dates.paulanPrepStart}</td>
            <td>${timeline.dates.paulanSettle}</td>
            <td>${inputs.paulanPrepDays + inputs.paulanCampaignDays + inputs.paulanSettleDays} Days</td>
          </tr>
          <tr>
            <td><strong>Renovation Window (Forever Home)</strong></td>
            <td>${timeline.dates.renoStart}</td>
            <td>${timeline.dates.renoEnd}</td>
            <td>${inputs.renoDays} Days</td>
          </tr>
          <tr>
            <td><strong>Household Relocation & Settling-In</strong></td>
            <td>${timeline.dates.moveStart}</td>
            <td>${timeline.dates.moveEnd}</td>
            <td>${inputs.moveDays} Days</td>
          </tr>
        </tbody>
      </table>

      <h2 style="margin-top: 36px;">Notes / Scenario Analysis</h2>
      <p style="font-size: 0.85rem; color:#475569; font-style:italic; line-height:1.6;">
        This document represents an analytical modeled snapshot of alternative outcomes based on the 
        Forever Home Financial Modeler tool. Any alteration to sale parameters, 
        settlement dates, or internal recasting allocation offsets impacts overall simulation schedules and total combined 
        interest paid. Keep this report snapshot for your strategic records.
      </p>
    </div>
    
    <div class="footer">
      Forever Home Financial Modeler • 419 Old Yarragon-Leongatha Road, Yarragon South • Baseline July 2026
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Forever_Home_Scenario_${inputs.internalVariationPct}pctRecast_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans pb-12 selection:bg-blue-600 selection:text-white">
      {/* STICKY MAIN HEADER */}
      <header className="border-b border-blue-900 bg-white text-blue-900 shadow-sm sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[95vw] xl:max-w-[90vw] 2xl:max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 shadow-sm">
                <Icons.Farm className="w-6 h-6 text-emerald-800" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-emerald-900">
                Forever Home Financial Modeler
              </h1>
              <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold font-serif shadow-xs self-center">
                📍 {DECIDED_PROPERTY_ADDRESS}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 font-serif italic">
              Multigenerational Transition & Cashflow Portfolio Modeler • Decided Property Scenario • Baseline July 2026
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right border-r pr-4 border-stone-200 hidden sm:block">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                Combined Family Income
              </span>
              <span className="text-sm font-bold font-serif text-blue-900">
                $5,303.35{" "}
                <span className="text-xs font-sans text-stone-500">
                  Net / wk
                </span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                Bank Lender Capacity Cap
              </span>
              <span className="text-sm font-bold font-serif text-amber-700">
                $1,500,000{" "}
                <span className="text-xs font-sans text-stone-500">
                  Concurrent Limit
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[95vw] xl:max-w-[90vw] 2xl:max-w-[1700px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* CRITICAL WARNING: TIMING BANNERS */}
        {timeline.fhSettleEnd < timeline.merylSettleEnd && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Icons.Warning className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">
                Multigenerational Cash Flow Alert: Forever Home Settle precedes
                Meryl's Twin Ranges Sale Settle
              </p>
              <p className="mt-1 opacity-90 leading-relaxed font-serif">
                You are settling on the Forever Home on{" "}
                <span className="font-semibold">{timeline.dates.fhSettle}</span>
                , but Meryl's Twin Ranges proceeds of{" "}
                <span className="font-semibold">
                  ${inputs.merylContribution.toLocaleString()}
                </span>{" "}
                are not injected until{" "}
                <span className="font-semibold">
                  {timeline.dates.merylSettle}
                </span>
                . During this{" "}
                {Math.round(timeline.merylSettleEnd - timeline.fhSettleEnd)}{" "}
                day lag, your Forever Home loan is fully active at its peak debt
                level of{" "}
                <span className="font-semibold">
                  ${Math.round(finances.loanRequired).toLocaleString()}
                </span>
                , requiring maximum interest servicing prior to her cash
                arrival.
              </p>
            </div>
          </div>
        )}

        {timeline.paulanPrepStart < timeline.moveEnd && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-950">
            <Icons.Warning className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">
                Logistical Schedule Overlay: Prep of Paulan Court starts before
                Household Move
              </p>
              <p className="mt-1 opacity-95 leading-relaxed font-serif">
                Paulan Court preparation starts on{" "}
                <span className="font-semibold">
                  {timeline.dates.paulanPrepStart}
                </span>{" "}
                , prior to completing your household move-out on{" "}
                <span className="font-semibold">{timeline.dates.moveEnd}</span>.
                Ensure staging coordinators have clear access to the property.
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ALWAYS VISIBLE LEFT THIRD: OVERVIEW & MAJOR VARIABLES */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px] h-auto lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-1 no-scrollbar no-print">
            {/* EXPLICITLY REQUESTED OVERVIEW SECTION (RELOCATED TO LEFT BAR) */}
            <section className="bg-gradient-to-br from-stone-50 to-stone-100/30 border border-stone-250 border-stone-200 p-5 rounded-xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                <Icons.Eye className="w-5 h-5 text-slate-850" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                  Overview & Control Center
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200 inline-block w-full text-center">
                  <h4 className="text-[10px] font-bold text-stone-700 font-serif uppercase tracking-wider">
                    Major Active Variables
                  </h4>
                </div>
                
                <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  {/* 1. Forever Home Purchase Price */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                      <span>Forever Home Purchase Price:</span>
                      <span className="font-mono font-bold text-blue-900">
                        ${inputs.purchasePrice.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000000}
                      max={finances.maxAffordablePrice}
                      step={10000}
                      value={inputs.purchasePrice}
                      onChange={(e) =>
                        handleInputChange("purchasePrice", parseInt(e.target.value))
                      }
                      className="w-full accent-blue-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                      <span>Min: $1.0M</span>
                      <span>Max: ${(finances.maxAffordablePrice / 1000000).toFixed(3)}M</span>
                    </div>
                  </div>

                  {/* 2. Cash Cushion Buffer */}
                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                      <span>Target Day 1 Cash Cushion Buffer:</span>
                      <span className="font-mono font-bold text-indigo-900">
                        ${inputs.offsetBuffer.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50000}
                      max={500000}
                      step={5000}
                      value={inputs.offsetBuffer}
                      onChange={(e) =>
                        handleInputChange("offsetBuffer", parseInt(e.target.value))
                      }
                      className="w-full accent-indigo-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                      <span>Min: $50k</span>
                      <span>Max: $500k</span>
                    </div>
                  </div>

                  {/* 3. Meryl's Capital Contribution */}
                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                      <span>Meryl's Capital Contribution:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ${inputs.merylContribution.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.round(finances.merylNetProceeds)}
                      step={5000}
                      value={inputs.merylContribution}
                      onChange={(e) =>
                        handleInputChange("merylContribution", parseInt(e.target.value))
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                      <span>Min: $0</span>
                      <span>Max Capacity: ${Math.round(finances.merylNetProceeds).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 4. Weekly Extra Savings Rate / Fixed Discretionary */}
                  {!inputs.useFixedDiscretionary ? (
                    <div className="space-y-1 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                        <span>Weekly Extra Savings Rate:</span>
                        <span className="font-mono font-bold text-teal-800">
                          ${inputs.weeklySavings}/wk
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5000}
                        step={100}
                        value={inputs.weeklySavings}
                        onChange={(e) =>
                          handleInputChange("weeklySavings", parseInt(e.target.value))
                        }
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>Min: $0/wk</span>
                        <span>Max: $5.0k/wk</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                        <span>Fixed Discretionary Cash:</span>
                        <span className="font-mono font-bold text-indigo-900">
                          ${inputs.fixedDiscretionaryCash}/wk
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(3000, Math.floor((inputs.weeklyIncome ?? 5303.35) - finances.totalCommittedWeeklyOutlays))}
                        step={50}
                        value={inputs.fixedDiscretionaryCash ?? 3000}
                        onChange={(e) =>
                          handleInputChange("fixedDiscretionaryCash", parseInt(e.target.value))
                        }
                        className="w-full accent-indigo-700 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>Min: $0/wk</span>
                        <span>Max: ${Math.max(3000, Math.floor((inputs.weeklyIncome ?? 5303.35) - finances.totalCommittedWeeklyOutlays)).toLocaleString()}/wk</span>
                      </div>
                      <div className="text-[9px] text-indigo-600 italic font-sans mt-1">
                        Derived Savings: ${Math.round(finances.effectiveWeeklySavings)}/wk
                      </div>
                    </div>
                  )}

                  {/* 5. Recast Slider (Smaller footprint) */}
                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <div className="flex justify-between text-xs font-semibold text-stone-700 font-serif">
                      <span>Joint Post-Sale Cash Recast Allocation:</span>
                      <span className="font-mono font-bold text-amber-800 text-[11px]">
                        {inputs.internalVariationPct}% Paydown / {100 - inputs.internalVariationPct}% Offset
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={2.5}
                      value={inputs.internalVariationPct}
                      onChange={(e) =>
                        handleInputChange("internalVariationPct", parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-stone-400 uppercase tracking-tight font-sans">
                      <span>0% (Full Offset)</span>
                      <span>100% (Full Recast)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200 inline-block w-full text-center">
                  <h4 className="text-[10px] font-bold text-stone-700 font-serif uppercase tracking-wider">
                    Major Simulated Outcomes
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Years to Offset Forever Home */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                        Forever Home Offset Time
                      </span>
                      <p className="text-lg font-bold text-emerald-800 mt-2 font-serif leading-tight">
                        {finances.fhOffsetYears !== "30+" ? (
                          <>
                            {finances.fhOffsetYears} <span className="text-xs font-sans font-normal text-stone-500">Years</span>
                            <span className="block text-xs font-sans font-semibold text-stone-700 mt-1">
                              {getMilestoneDateStr(finances.milestoneFHOffset.week)}
                            </span>
                          </>
                        ) : (
                          <span className="text-amber-800">30+ Years (Not Offset)</span>
                        )}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between items-center text-[10.5px] font-serif text-stone-500">
                      <span>Interest Paid:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ${Math.round(finances.fhInterestAtOffset).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Years to Complete Portfolio Freedom */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                        Complete Portfolio Freedom
                      </span>
                      <p className="text-lg font-bold text-teal-800 mt-2 font-serif leading-tight">
                        {finances.activeFullyOffsetYears !== "30+" ? (
                          <>
                            {finances.activeFullyOffsetYears} <span className="text-xs font-sans font-normal text-stone-500">Years</span>
                            <span className="block text-xs font-sans font-semibold text-stone-700 mt-1">
                              {getMilestoneDateStr(finances.milestoneActiveFullyOffset.week)}
                            </span>
                          </>
                        ) : (
                          <span className="text-amber-800">30+ Years (Not Offset)</span>
                        )}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[10px] font-serif text-stone-500">
                      <div className="flex justify-between items-center text-[9px] leading-tight">
                        <span>Forever Home Int:</span>
                        <span className="font-mono text-stone-700">
                          ${Math.round(finances.fhInterestAtActiveFullyOffset).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] leading-tight">
                        <span>Fern St Interest:</span>
                        <span className="font-mono text-teal-750 text-teal-700">
                          ${Math.round(finances.fernInterestAtActiveFullyOffset).toLocaleString()}
                        </span>
                      </div>
                      {finances.nbInterestAtActiveFullyOffset > 0 && (
                        <div className="flex justify-between items-center text-[9px] leading-tight">
                          <span>New Build Interest:</span>
                          <span className="font-mono text-purple-700">
                            ${Math.round(finances.nbInterestAtActiveFullyOffset).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {finances.newLoansInterestAtActiveFullyOffset > 0 && (
                        <div className="flex justify-between items-center text-[9px] leading-tight">
                          <span>Expense Loans Int:</span>
                          <span className="font-mono text-amber-700">
                            ${Math.round(finances.newLoansInterestAtActiveFullyOffset).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-stone-600 border-t border-stone-100/60 pt-0.5 mt-0.5">
                        <span>Total Portfolio Int:</span>
                        <span className="font-mono text-slate-800">
                          ${Math.round(finances.combinedInterestAtActiveFullyOffset).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Uncommitted Discretionary Cash */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                        Uncommitted Discretionary Cash
                      </span>
                      <p className={`text-lg font-bold mt-2 font-mono ${finances.leftoverDiscretionaryCash >= 0 ? "text-slate-800" : "text-rose-700"}`}>
                        ${Math.round(finances.leftoverDiscretionaryCash).toLocaleString()}<span className="text-[11px] text-stone-500 font-sans font-normal">/wk</span>
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] font-serif text-stone-500">
                      {finances.leftoverDiscretionaryCash >= 0 ? (
                        <span className="text-emerald-700 font-medium font-sans">✓ Positive Cash Flow</span>
                      ) : (
                        <span className="text-rose-600 font-semibold font-sans">⚠️ Deficit limit breached!</span>
                      )}
                    </div>
                  </div>

                  {/* Kept Inside Offset (Liquid) Balance */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                        Kept Inside Offset (Liquid)
                      </span>
                      <p className="text-lg font-bold text-amber-800 mt-2 font-mono">
                        ${Math.round(finances.keptInOffsetAccount).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] font-serif text-stone-500 leading-tight">
                      Funds remaining highly liquid inside offset following recasting choice.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* RIGHT COL: TWO THIRDS TABS */}
          <div className="lg:col-span-8 space-y-6">
            {/* TABS ROW */}
            <div className="flex flex-wrap border border-stone-200 gap-1.5 text-sm no-print bg-white p-1.5 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Overview
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "timeline"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <Icons.Calendar className="w-4 h-4" />
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("mortgage")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "mortgage"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <Icons.Settings className="w-4 h-4" />
                Mortgage Settings
              </button>
              <button
                onClick={() => setActiveTab("settles")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "settles"
                    ? "bg-blue-950 bg-blue-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <Icons.TrendUp className="w-4 h-4" />
                When the dust settles
              </button>

              <button
                onClick={() => setActiveTab("futureExpenses")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "futureExpenses"
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <Icons.Calendar className="w-4 h-4" />
                Future Expenses
              </button>

              <button
                onClick={() => setActiveTab("paulan")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-serif font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "paulan"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <Icons.Home className="w-4 h-4" />
                Paulan Sell/Rent
              </button>
            </div>

            {/* TAB CONTENTS */}
            {/* OVERVIEW TAB CONTENT (A4 ONE-PAGER SNAPSHOT) */}
            <div className={`space-y-4 ${activeTab === "overview" ? "block print:block" : "hidden"}`}>
              {/* Elegant A4 container */}
              <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xl shadow-sm print-card space-y-6">
                
                {/* Header Information Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-4 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider font-sans">
                      Strategic Scenario Summary Sheet (A4 One-Pager)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-0.5">
                      Forever Home Portfolio Transition Overview
                    </h2>
                    <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                      Analytical snapshot for scenario comparisons and family strategy discussions.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 no-print self-stretch sm:self-auto">
                    <button
                      onClick={() => window.print()}
                      className="bg-emerald-900 hover:bg-emerald-950 text-white font-serif font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.113-.49-1.12-1.127L6.34 18m11.32 0-1.09-5.321m1.09 5.321H6.34m0 0 1.09-5.321m0 0A42.404 42.404 0 0 1 12 11.25c1.782 0 3.524.165 5.218.479L17.66 12.75M9 7.5c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v2.217m-6 0h6" />
                      </svg>
                      Print Sheet (A4)
                    </button>
                  </div>
                </div>

                {/* DECIDED PROPERTY HIGHLIGHT BANNER */}
                <div className="bg-emerald-50/60 border border-emerald-150 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded border border-emerald-200 shadow-xs mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-sans block">
                        Decided Property Focus
                      </span>
                      <h4 className="font-bold text-slate-900 font-serif text-sm">
                        {DECIDED_PROPERTY_ADDRESS}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                        Premium multigenerational acreage property selected for purchase settlement.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-6 text-xs font-serif shrink-0">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">Purchase Price</span>
                      <strong className="text-blue-900 font-mono text-sm">${inputs.purchasePrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-sans">Loan Interest Rate</span>
                      <strong className="text-emerald-800 font-mono text-sm">{inputs.interestRate}% p.a.</strong>
                    </div>
                  </div>
                </div>

                {/* Key Summary Milestones KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-stone-100 pb-6">
                  {/* KPI 1: Est. Year of Total Portfolio Freedom */}
                  <div className="bg-emerald-50/70 border border-emerald-150 p-4 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block font-sans">
                      Portfolio Offset Freedom
                    </span>
                    <span className="text-2xl font-bold font-serif text-emerald-900 block mt-1">
                      {finances.activeFullyOffsetYears} <span className="text-xs font-sans font-medium text-stone-500 mr-1">Years</span>
                      {finances.activeFullyOffsetYears !== "30+" && (
                        <span className="text-xs font-sans font-medium text-emerald-700 block sm:inline">
                          ({getMilestoneDateStr(finances.milestoneActiveFullyOffset.week)})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-stone-550 block mt-1 font-sans leading-tight">
                      When combined offsets completely neutralize all active debts.
                    </span>
                  </div>

                  {/* KPI 2: Consolidated Lifetime Interest Paid */}
                  {(() => {
                    const activeTotalInterest = finances.fhTotalInterestPaidSim + finances.fernTotalInterestPaidSim + (newBuildSpend > 0 ? finances.nbTotalInterestPaidSim : 0) + (finances.activeNewLoansInterestPaid ?? 0);
                    const baselineTotalInterest = finances.baselineTotalInterestPaid ?? 0;
                    const interestSaved = Math.max(0, baselineTotalInterest - activeTotalInterest);
                    return (
                      <div className="bg-blue-50/70 border border-blue-150 p-4 rounded-xl text-center shadow-xs">
                        <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block font-sans">
                          Lifetime Interest Paid
                        </span>
                        <span className="text-2xl font-bold font-serif text-blue-900 block mt-1">
                          ${Math.round(activeTotalInterest).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-sans block mt-1 font-medium bg-emerald-100/50 py-0.5 px-1.5 rounded-full inline-block">
                          Baseline: ${Math.round(baselineTotalInterest).toLocaleString()} (${Math.round(interestSaved).toLocaleString()} saved)
                        </span>
                      </div>
                    );
                  })()}

                  {/* KPI 3: Year 30 Projected Net Wealth */}
                  {(() => {
                    const activeY30 = finances.simulationData[finances.simulationData.length - 1]?.netWealth || 0;
                    const baselineY30 = finances.baselineSimulationData[finances.baselineSimulationData.length - 1]?.netWealth || 0;
                    const delta = activeY30 - baselineY30;
                    return (
                      <div className="bg-purple-50/70 border border-purple-150 p-4 rounded-xl text-center shadow-xs">
                        <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block font-sans">
                          Year 30 Projected Net Wealth
                        </span>
                        <span className="text-2xl font-bold font-serif text-purple-900 block mt-1">
                          ${Math.round(activeY30).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-sans font-bold block mt-1 py-0.5 px-1.5 rounded-full inline-block ${delta >= 0 ? "text-emerald-700 bg-emerald-100/50" : "text-rose-700 bg-rose-100/50"}`}>
                          Delta: {delta >= 0 ? "+" : ""}${Math.round(delta).toLocaleString()} vs Base
                        </span>
                      </div>
                    );
                  })()}

                  {/* KPI 4: Recirculation Cascade System */}
                  <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block font-sans">
                      Weekly Outlays vs Strain
                    </span>
                    <span className="text-2xl font-bold font-serif text-amber-900 block mt-1">
                      ${Math.round(finances.totalCommittedWeeklyOutlays).toLocaleString()} <span className="text-xs font-sans font-medium text-stone-500">/wk</span>
                    </span>
                    <span className="text-[10px] text-stone-550 block mt-1 font-sans leading-tight">
                      Income Strain: <strong>{finances.mortgageToIncomeRatio.toFixed(1)}%</strong> of Net. Active Cascade repayment loops enabled.
                    </span>
                  </div>
                </div>

                {/* ADVANCED MORTGAGE TRAJECTORIES COMPARISON */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                    <Icons.Settings className="w-4 h-4 text-slate-800" />
                    <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-slate-900">
                      I. Model Active Mortgages and Cascading Repayments
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Forever Home Loan */}
                    <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                            Primary Home
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 font-serif mt-1">
                            Forever Home Mortgage
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-900 bg-white border border-stone-200 px-2 py-0.5 rounded shadow-2xs">
                          {inputs.interestRate}% P&I
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-700 font-serif">
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Starting Principal:</span>
                          <span className="font-mono font-semibold">${Math.round(finances.recastForeverHomeLoanPrincipal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Weekly Repayment:</span>
                          <span className="font-mono font-semibold text-rose-800">-${Math.round(finances.recastWeeklyPayment)}/wk</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Status @ Offset:</span>
                          <span className="font-semibold text-emerald-800 font-sans">
                            {finances.fhNeutralizedWeek !== -1 ? `Yr ${(finances.fhNeutralizedWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Fully Paid Off:</span>
                          <span className="font-semibold text-blue-900 font-sans">
                            {finances.fhPaidOffWeek !== -1 ? `Yr ${(finances.fhPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-900 pt-1 font-bold">
                          <span>Lifetime Interest Paid:</span>
                          <span className="font-mono text-amber-800">${Math.round(finances.fhTotalInterestPaidSim).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fern St Holiday House */}
                    <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-cyan-100 text-cyan-900 font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                            Holiday House
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 font-serif mt-1">
                            Fern St Mortgage
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-900 bg-white border border-stone-200 px-2 py-0.5 rounded shadow-2xs">
                          5.95% P&I
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-700 font-serif">
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Starting Principal:</span>
                          <span className="font-mono font-semibold">$392,000</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Weekly Repayment:</span>
                          <span className="font-mono font-semibold text-rose-800">-${Math.round(finances.fernWeeklyPayment)}/wk</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Status @ Offset:</span>
                          <span className="font-semibold text-emerald-800 font-sans">
                            {finances.fernNeutralizedWeek !== -1 ? `Yr ${(finances.fernNeutralizedWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                          <span>Fully Paid Off:</span>
                          <span className="font-semibold text-blue-900 font-sans">
                            {finances.fernPaidOffWeek !== -1 ? `Yr ${(finances.fernPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-900 pt-1 font-bold">
                          <span>Lifetime Interest Paid:</span>
                          <span className="font-mono text-amber-800">${Math.round(finances.fernTotalInterestPaidSim).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* New Build proposed or Active new loans */}
                    <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-sans ${newBuildSpend > 0 ? "bg-amber-100 text-amber-900" : "bg-stone-200 text-stone-600"}`}>
                            {newBuildSpend > 0 ? "Construction Mortgage" : "Construction"}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900 font-serif mt-1">
                            New Build Loan
                          </h4>
                        </div>
                        {newBuildSpend > 0 && (
                          <span className="text-xs font-mono font-bold text-amber-900 bg-white border border-stone-200 px-2 py-0.5 rounded shadow-2xs">
                            {inputs.interestRate}% P&I
                          </span>
                        )}
                      </div>

                      {newBuildSpend > 0 ? (
                        <div className="space-y-1.5 text-xs text-stone-700 font-serif">
                          <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                            <span>Initial Loan Amount:</span>
                            <span className="font-mono font-semibold">${Math.round(newBuildSpend).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                            <span>Weekly Repayment:</span>
                            <span className="font-mono font-semibold text-rose-800">-${Math.round(finances.newBuildWeeklyPayment)}/wk</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                            <span>Status @ Offset:</span>
                            <span className="font-semibold text-emerald-800 font-sans">
                              {finances.nbFullyOffsetWeek !== -1 ? `Yr ${(finances.nbFullyOffsetWeek / 52).toFixed(1)}` : "30+ Years"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-stone-200 pb-1">
                            <span>Fully Paid Off:</span>
                            <span className="font-semibold text-blue-900 font-sans">
                              {finances.nbPaidOffWeek !== -1 ? `Yr ${(finances.nbPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                            </span>
                          </div>
                          <div className="flex justify-between text-stone-900 pt-1 font-bold">
                            <span>Lifetime Interest Paid:</span>
                            <span className="font-mono text-amber-800">${Math.round(finances.nbTotalInterestPaidSim).toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-stone-500 font-serif leading-relaxed italic text-center py-6">
                          Proposed New Build currently inactive. Define a custom budget on the Mortgage Settings tab to model construction outlays.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PROPERTY PORTFOLIO & RECIRCULATION REALIZATION COMPONENT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                  
                  {/* Property Assets & Sales Matrix */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                      <span className="text-xs font-bold font-serif uppercase tracking-wider text-slate-800">
                        1. Real Estate Asset Base & Liquidity Waterfall
                      </span>
                    </div>
                    <table className="w-full text-xs text-left text-stone-600 font-sans">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400">
                          <th className="py-2 font-medium">Asset Source</th>
                          <th className="py-2 text-right font-medium">Gross Target Price</th>
                          <th className="py-2 text-right font-medium">Net Est. Proceeds</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Paulan Court Gross Sale</td>
                          <td className="py-2.5 text-right font-mono">${inputs.paulanSalePrice.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-stone-800" title="Minus commission, remaining loan $230000 and reno expenses">
                            ${Math.round(finances.paulanNetProceeds).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Meryl's Twin Ranges Gross</td>
                          <td className="py-2.5 text-right font-mono">${inputs.merylSalePrice.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-stone-800" title="Minus commission and reno expenses">
                            ${Math.round(finances.merylNetProceeds).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50 bg-emerald-50/20">
                          <td className="py-2.5 font-medium text-emerald-950">Meryl's Cash Contribution</td>
                          <td className="py-2.5 text-right font-mono">-</td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-800">
                            ${inputs.merylContribution.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Existing Liquid Cash Offset</td>
                          <td className="py-2.5 text-right font-mono">-</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-stone-800">
                            $619,830
                          </td>
                        </tr>
                        <tr className="border-t-2 border-stone-200 bg-stone-50/50 font-bold">
                          <td className="py-3 text-stone-900 font-serif">Total Post-Sale Cash Pool</td>
                          <td className="py-3 text-right font-mono">-</td>
                          <td className="py-3 text-right font-mono text-blue-900">
                            ${Math.round(finances.totalPostSaleCashPool + 619830).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Property Acquisitions & Funding Outlays */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                      <span className="text-xs font-bold font-serif uppercase tracking-wider text-slate-800">
                        2. Capital Expenditures & Acquisition outlays
                      </span>
                    </div>
                    <table className="w-full text-xs text-left text-stone-600 font-sans">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400">
                          <th className="py-2 font-medium">Friction Element</th>
                          <th className="py-2 text-right font-medium">Value / Outlay</th>
                          <th className="py-2 text-right font-medium">Status / Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Forever Home Purchase Price</td>
                          <td className="py-2.5 text-right font-mono">${inputs.purchasePrice.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-sans text-stone-500">Day 1 Capital</td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Stamp Duty Friction (Victoria)</td>
                          <td className="py-2.5 text-right font-mono">${Math.round(finances.stampDuty).toLocaleString()}</td>
                          <td className="py-2.5 text-right text-rose-800 font-semibold font-sans">Friction Loss</td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Rego, Conveyancing & Fees</td>
                          <td className="py-2.5 text-right font-mono">$5,000</td>
                          <td className="py-2.5 text-right text-rose-800 font-semibold font-sans">Process Friction</td>
                        </tr>
                        <tr className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="py-2.5 font-medium text-stone-850">Forever Home Initial Loan</td>
                          <td className="py-2.5 text-right font-mono font-bold text-blue-900">${Math.round(finances.loanRequired).toLocaleString()}</td>
                          <td className="py-2.5 text-right text-emerald-800 font-semibold font-sans" title="Concurrent peak loan value">Funded debt</td>
                        </tr>
                        {newBuildSpend > 0 && (
                          <tr className="border-b border-stone-100 hover:bg-stone-50/50 bg-amber-50/20">
                            <td className="py-2.5 font-medium text-stone-850">Proposed New Build spend</td>
                            <td className="py-2.5 text-right font-mono font-bold text-amber-950">${Math.round(newBuildSpend).toLocaleString()}</td>
                            <td className="py-2.5 text-right text-amber-800 font-semibold font-sans">Yr {newBuildTiming} Capex</td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-stone-200 bg-stone-50/50 font-bold font-serif">
                          <td className="py-3 text-stone-900">Total Asset Acquisition Outlay</td>
                          <td className="py-3 text-right font-mono text-blue-900">
                            ${Math.round(finances.totalAcquisitionCost + (newBuildSpend > 0 ? newBuildSpend : 0)).toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-stone-400 font-sans">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Restructuring recast breakdown box */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold font-serif uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-serif">
                      <span>🔄</span>
                      <span>3. Cash Recasting Partition & Progressive Cash Flow Recirculation</span>
                    </span>
                    <span className="bg-emerald-100 text-emerald-950 font-sans font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Applied Recast Split: {inputs.internalVariationPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-600">
                    
                    {/* Column 1: Asset Allocation & Recast Direction */}
                    <div className="space-y-2.5 font-sans">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-sans block">
                        Capital Recasting Allocation
                      </span>
                      <p className="font-serif leading-relaxed text-[11px]">
                        Upon completing settlements, a total cash pool of <strong className="text-slate-900">${Math.round(finances.totalPostSaleCashPool + finances.remainingDay1CashCushion).toLocaleString()}</strong> is compiled. Your specified split directs:
                      </p>
                      <ul className="space-y-1.5 list-disc pl-4 text-[11px] font-serif">
                        <li>
                          <strong className="text-blue-900">{inputs.internalVariationPct}% reduction</strong>: <strong>${Math.round(finances.appliedToPrincipalReduction).toLocaleString()}</strong> is paid directly to shrink the loan principal.
                        </li>
                        <li>
                          <strong className="text-emerald-800">Offset preservation</strong>: <strong>${Math.round(finances.keptInOffsetAccount).toLocaleString()}</strong> is preserved in your offset account (leaving a liquid buffer after deducting ${Math.round(inputs.fhRenoMovingCost ?? 5000).toLocaleString()} for moving and reno outlays).
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Individual Repayments & Gross Cash Flow */}
                    <div className="space-y-2.5 font-sans border-t lg:border-t-0 lg:border-x border-stone-200 pb-2 lg:px-5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                        Committed Weekly Cash Flow
                      </span>
                      <div className="space-y-2 text-stone-700">
                        <div className="flex justify-between items-center text-[11px] pb-1 border-b border-stone-105 italic font-serif">
                          <span>Gross net Family salary:</span>
                          <span className="font-mono font-bold text-emerald-700">+$5,303.35/wk</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pb-1 border-b border-stone-100 font-serif">
                          <div>
                            <span className="font-medium text-stone-800">Forever Home (Dynamic Recast):</span>
                            <span className="text-[9px] block text-stone-400">Post-Recast P&I Repayment</span>
                          </div>
                          <span className="font-mono text-red-700 font-medium">-${Math.round(finances.recastWeeklyPayment)}/wk</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pb-1 border-b border-stone-100 font-serif">
                          <div>
                            <span className="font-medium text-stone-800">Fern St Holiday House:</span>
                            <span className="text-[9px] block text-stone-400">Constant Outlay</span>
                          </div>
                          <span className="font-mono text-red-700 font-medium font-semibold">-$784/wk</span>
                        </div>
                        {newBuildSpend > 0 && (
                          <div className="flex justify-between items-center text-[11px] pb-1 border-b border-stone-100 font-serif">
                            <div>
                              <span className="font-medium text-stone-800">New Build Mortgage:</span>
                              <span className="text-[9px] block text-stone-400">Proposed Construction Outlay</span>
                            </div>
                            <span className="font-mono text-red-750 font-medium font-semibold">-${Math.round(finances.newBuildWeeklyPayment)}/wk</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-900 bg-stone-100 p-2 rounded">
                          <span>Gross Discretionary Surplus:</span>
                          <span className="font-mono text-blue-900">+${Math.round(WeeklyNetSalary - finances.totalCommittedWeeklyOutlays - (newBuildSpend > 0 ? finances.newBuildWeeklyPayment : 0))}/wk</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Extra Savings Setting & Uncommitted Net */}
                    <div className="space-y-2.5 font-sans">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                        Savings Plan & Repayment Redirection
                      </span>
                      
                      <p className="font-serif leading-relaxed text-[11px]">
                        Your planned budget allocates a **Weekly Extra Savings Rate** of <strong className="text-emerald-800 font-semibold">${Math.round(finances.effectiveWeeklySavings).toLocaleString()}</strong> per week {inputs.useFixedDiscretionary ? "(dynamically calculated from your $3,000/wk fixed discretionary cash ceiling)" : ""} to accelerate loan offsets.
                      </p>
                      <p className="font-serif leading-relaxed text-[11px]">
                        <strong>Redirection cascade active:</strong> as individual loans are fully paid off, their respective weekly repayments are dynamically redirected into remaining offsets, compounding the speed of your portfolio\'s debt reduction.
                      </p>
                      <p className="font-serif leading-relaxed text-[11px] mt-1.5 pt-1.5 border-t border-stone-100">
                        Uncommitted Discretionary Net: <strong className={`font-semibold ${
                          (finances.leftoverDiscretionaryCash - (newBuildSpend > 0 ? finances.newBuildWeeklyPayment : 0)) >= 0 ? "text-emerald-800" : "text-rose-800"
                        }`}>${Math.round(finances.leftoverDiscretionaryCash - (newBuildSpend > 0 ? finances.newBuildWeeklyPayment : 0)).toLocaleString()} / week</strong>.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Direct interactive textbox for couple comparisons */}
                <div className="border border-stone-200 bg-stone-50/50 p-4 rounded-xl space-y-2 no-print font-sans">
                  <div className="flex justify-between items-center bg-transparent">
                    <label className="text-[11px] font-bold text-stone-750 uppercase tracking-widest font-serif block">
                      💬 Scenario Notes & Couples Discussion Box (Saved to browser)
                    </label>
                    {overviewNotes.trim() && (
                      <button 
                        onClick={() => setOverviewNotes("")}
                        className="text-[9px] font-bold text-red-700 hover:underline cursor-pointer"
                      >
                        Clear Notes
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="E.g., Scenario A targets Meryls fast settlement. Tell me Josh, if Paulan sells for $750k instead of $740k we can keep more offsets."
                    className="w-full text-xs font-serif leading-relaxed bg-white border border-stone-300 rounded-lg p-3 focus:ring-1 focus:ring-emerald-900 focus:outline-none"
                    value={overviewNotes}
                    onChange={(e) => setOverviewNotes(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>Write in your discussion notes or scenario thoughts—they persist in your local state.</span>
                    <span className="font-mono text-emerald-800 font-semibold">{overviewNotes.trim() ? "• State Saved" : ""}</span>
                  </div>
                </div>

                {/* Print only watermark */}
                <div className="hidden print:block text-center border-t border-stone-200 pt-4 text-[9px] text-stone-400 font-serif">
                  Document prepared dynamically via Forever Home Financial transition Modeler. Discussed by Josh and wife. Current Snapshot Scenario Recast: {inputs.internalVariationPct}%.
                </div>

              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className={`space-y-6 ${activeTab === "timeline" ? "block" : "hidden"} ${activeTab === "overview" ? "print:hidden" : "print:block"}`}>
              <TimelineView
                inputs={inputs}
                setInputs={setInputs}
                timeline={timeline}
                finances={finances}
                activeTab={activeTab}
                isPaulanLinkedHovered={isPaulanLinkedHovered}
                setIsPaulanLinkedHovered={setIsPaulanLinkedHovered}
              />
            </div>
            <div className={`space-y-6 ${activeTab === "mortgage" ? "block" : "hidden"} ${activeTab === "overview" ? "print:hidden" : "print:block"}`}>
              <ScenarioControls
                inputs={inputs}
                setInputs={setInputs}
                handleInputChange={handleInputChange}
                finances={finances}
                newScenarioName={newScenarioName}
                setNewScenarioName={setNewScenarioName}
                financialScenarios={financialScenarios}
                handleSaveFinancialScenario={handleSaveFinancialScenario}
                handleLoadFinancialScenario={handleLoadFinancialScenario}
                handleDeleteFinancialScenario={handleDeleteFinancialScenario}
                isPaulanLinkedHovered={isPaulanLinkedHovered}
                setIsPaulanLinkedHovered={setIsPaulanLinkedHovered}
                handleExportHtmlReport={handleExportHtmlReport}
              />
            </div>

            <div className={`space-y-6 ${activeTab === "settles" ? "block" : "hidden"} ${activeTab === "overview" ? "print:hidden" : "print:block"}`}>

        {/* SECTION 5: LIVE CASH FLOW FORECAST & KEY PERFORMANCE INDICATORS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* STABILIZED WEEKLY CASH FLOW MATRIX */}
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between print-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                <Icons.Dollar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-blue-900 text-base font-serif">
                  Live Cash Flow Forecast (Post-Paulan Stability)
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-serif">
                <div className="flex justify-between items-center text-stone-600 border-b border-stone-100 pb-1.5 gap-2">
                  <span className="font-medium text-stone-700">Gross Weekly Income Inflow:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-700 font-mono text-xs">+$</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={inputs.weeklyIncome ?? 5303.35}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleInputChange("weeklyIncome", isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="w-28 px-2 py-1 text-right border border-stone-200 hover:border-emerald-500 focus:border-emerald-700 rounded font-mono text-emerald-800 font-bold text-xs bg-stone-50 focus:bg-white focus:outline-none transition-all shadow-xs"
                    />
                    <span className="text-[11px] text-stone-400 font-mono">/wk</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-stone-600 border-b border-stone-100 pb-1.5">
                  <span>Forever Home P&I Repay (Dynamic Recast):</span>
                  <span className="font-semibold text-red-700 font-mono">
                    -${Math.round(finances.recastWeeklyPayment)}/wk
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-600 border-b border-stone-100 pb-1.5">
                  <span>Fern St Mortgage Repay:</span>
                  <span className="font-semibold text-red-700 font-mono">
                    -$784/wk
                  </span>
                </div>

                {/* CASH FLOW MODE TOGGLE, DUAL SLIDERS & ANZ SAVINGS RATE */}
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
                  {/* Mode Selector */}
                  <div className="space-y-1.5 pb-1 border-b border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                      Cash Flow Control Mode
                    </span>
                    <div className="grid grid-cols-2 gap-2 no-print mt-1">
                      <button
                        onClick={() => handleInputChange("useFixedDiscretionary", false)}
                        className={`px-2 py-1.5 rounded border text-center font-serif text-[10.5px] font-medium transition-all cursor-pointer ${
                          !inputs.useFixedDiscretionary
                            ? "bg-emerald-800 text-white border-emerald-900 shadow-sm font-bold"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        Adjust Savings Rate
                      </button>
                      <button
                        onClick={() => handleInputChange("useFixedDiscretionary", true)}
                        className={`px-2 py-1.5 rounded border text-center font-serif text-[10.5px] font-medium transition-all cursor-pointer ${
                          inputs.useFixedDiscretionary
                            ? "bg-emerald-800 text-white border-emerald-900 shadow-sm font-bold"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        Fix Discretionary Cash
                      </button>
                    </div>
                  </div>

                  {!inputs.useFixedDiscretionary ? (
                    /* SAVINGS RATE MODE */
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-stone-750">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Weekly Extra Savings rate:</span>
                          <div className="group relative cursor-pointer inline-flex items-center text-[10px] bg-stone-200 hover:bg-stone-300 w-4 h-4 justify-center rounded-full text-stone-600 select-none">
                            ?
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-stone-900 text-white text-[10px] p-2.5 rounded shadow-lg font-serif z-50 leading-relaxed font-normal">
                              Elective cash regularly deposited to offsets to shorten mortgage durations. High settings test savings threshold tolerance.
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 text-sm">
                          ${inputs.weeklySavings}/wk
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min={0}
                        max={3000}
                        step={50}
                        value={inputs.weeklySavings}
                        onChange={(e) =>
                          handleInputChange("weeklySavings", parseInt(e.target.value))
                        }
                        className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg animate-fade-in"
                      />
                      
                      <div className="flex justify-between text-[9px] text-stone-400">
                        <span>$0 min</span>
                        <span>$3,000/wk cap</span>
                      </div>
                    </div>
                  ) : (
                    /* FIXED DISCRETIONARY CASH MODE */
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-stone-750">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Fixed Discretionary Cash:</span>
                          <div className="group relative cursor-pointer inline-flex items-center text-[10px] bg-stone-200 hover:bg-stone-300 w-4 h-4 justify-center rounded-full text-stone-600 select-none">
                            ?
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-stone-900 text-white text-[10px] p-2.5 rounded shadow-lg font-serif z-50 leading-relaxed font-normal">
                              The fixed amount of uncommitted cash you want to keep for personal/family overheads per week. Any income beyond this and your loan payments is automatically saved!
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-indigo-900 text-sm">
                          ${inputs.fixedDiscretionaryCash}/wk
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min={0}
                        max={Math.max(3000, Math.floor((inputs.weeklyIncome ?? 5303.35) - finances.totalCommittedWeeklyOutlays))}
                        step={50}
                        value={inputs.fixedDiscretionaryCash ?? 3000}
                        onChange={(e) =>
                          handleInputChange("fixedDiscretionaryCash", parseInt(e.target.value))
                        }
                        className="w-full accent-indigo-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg animate-fade-in"
                      />
                      
                      <div className="flex justify-between text-[9px] text-stone-400">
                        <span>$0 min</span>
                        <span>${Math.max(3000, Math.floor((inputs.weeklyIncome ?? 5303.35) - finances.totalCommittedWeeklyOutlays)).toLocaleString()}/wk cap</span>
                      </div>
                    </div>
                  )}

                  {/* ANZ SAVINGS ACCOUNT RATE OF RETURN */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex justify-between items-center text-stone-750">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">ANZ Plus Savings Rate:</span>
                        <div className="group relative cursor-pointer inline-flex items-center text-[10px] bg-stone-200 hover:bg-stone-300 w-4 h-4 justify-center rounded-full text-stone-600 select-none">
                          ?
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-stone-900 text-white text-[10px] p-2.5 rounded shadow-lg font-serif z-50 leading-relaxed font-normal">
                            The current rate of return on cash savings (ANZ Plus Save current rate is ~4.75% p.a.). Cash savings accumulate interest at this rate once loans are fully offset.
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-blue-900 text-sm">
                        {(inputs.anzSavingsRate ?? 4.75).toFixed(2)}% p.a.
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min={0.0}
                      max={8.0}
                      step={0.1}
                      value={inputs.anzSavingsRate ?? 4.75}
                      onChange={(e) =>
                        handleInputChange("anzSavingsRate", parseFloat(e.target.value))
                      }
                      className="w-full accent-blue-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                    
                    <div className="flex justify-between text-[9px] text-stone-400">
                      <span>0.0% min</span>
                      <span>8.0% p.a. cap</span>
                    </div>
                  </div>

                  {finances.leftoverDiscretionaryCash < 0 && (
                    <div className="bg-[#590d0d] text-red-100 border border-red-900 text-[10px] p-1.5 rounded flex items-center gap-1.5 font-bold font-sans animate-pulse">
                      <span>⚠️ High Repayment Strain: Discretionary limit breached!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              {/* MORTGAGE TO INCOME STRIVE */}
              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-lg flex justify-between items-center">
                <div className="max-w-[70%]">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                    Mortgage-to-Income Strain Ratio
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Aggregated bank-committed repayments compared against take-home
                    salary.
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-base font-bold font-mono ${
                      finances.mortgageToIncomeRatio > 40
                        ? "text-rose-600"
                        : "text-blue-900"
                    }`}
                  >
                    {finances.mortgageToIncomeRatio.toFixed(1)}%
                  </span>
                  <span className="text-[9px] block text-stone-400 font-medium font-serif italic">
                    {finances.mortgageToIncomeRatio > 40
                      ? "High Servicing Strain"
                      : "Safe Framework"}
                  </span>
                </div>
              </div>

              {/* MORTGAGE TO INCOME STRAIN WITH EXTRA SAVINGS */}
              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-lg flex justify-between items-center">
                <div className="max-w-[70%]">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                    Mortgage-to-Income Strain Ratio with Extra Savings
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Includes both mandatory repayments and your custom weekly extra savings rate of <strong className="font-mono">${Math.round(finances.effectiveWeeklySavings)}/wk</strong> on the mortgage/offset side.
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-base font-bold font-mono ${
                      finances.mortgageWithSavingsStrainRatio > 55
                        ? "text-rose-600"
                        : finances.mortgageWithSavingsStrainRatio > 40
                        ? "text-amber-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {finances.mortgageWithSavingsStrainRatio.toFixed(1)}%
                  </span>
                  <span className="text-[9px] block text-stone-400 font-medium font-serif italic">
                    {finances.mortgageWithSavingsStrainRatio > 55
                      ? "High Outflow Strain"
                      : finances.mortgageWithSavingsStrainRatio > 40
                      ? "Moderate Outflow"
                      : "Optimum Outflow"}
                  </span>
                </div>
              </div>

              {/* DYNAMIC SPENDING CASH BOX */}
              <div
                className={`p-3.5 rounded-lg border ${
                  finances.leftoverDiscretionaryCash >= 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-red-50 border-red-200 text-red-950"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[10px] uppercase tracking-wider font-serif">
                    Uncommitted Discretionary Cash:
                  </span>
                  <span className="text-lg font-bold font-mono">
                    $
                    {finances.leftoverDiscretionaryCash.toLocaleString("en-AU", {
                      maximumFractionDigits: 0,
                    })}
                    /wk
                  </span>
                </div>
                <p className="text-[10px] mt-1 opacity-90 leading-relaxed font-serif">
                  {finances.leftoverDiscretionaryCash >= 0
                    ? "Robust surplus margins available to safely absorb multi-generational family overheads."
                    : "Warning: Extra weekly savings exceed your discretionary cash limits. Reduce savings velocity slider."}
                </p>
              </div>
            </div>
          </div>

          {/* 2X2 HIGH IMPACT KPIS */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {/* KPI CARD 1: RECAST MORTGAGE */}
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between print-card">
                <div className="absolute top-0 right-0 p-3 text-stone-100">
                  <Icons.Home className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider font-serif">
                    Forever Home Loan Principal
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-serif">
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Initial Loan Required:</span>
                      <span className="font-bold font-mono">
                        ${Math.round(finances.loanRequired).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Paid Down via Recast:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        -$
                        {Math.round(
                          finances.appliedToPrincipalReduction
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Recast Principal Balance:</span>
                      <span className="font-bold text-blue-900 font-mono">
                        -$
                        {Math.round(
                          finances.recastForeverHomeLoanPrincipal
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs border-t border-stone-100 pt-3 mt-3 flex justify-between items-center font-serif">
                  <span className="text-stone-500 font-medium">
                    Recast Repayment:
                  </span>
                  <span className="font-bold text-blue-900 font-mono">
                    ${Math.round(finances.recastWeeklyPayment)}/wk
                  </span>
                </div>
              </div>

              {/* KPI CARD 2: TIME TO OFFSET FOREVER */}
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between print-card">
                <div className="absolute top-0 right-0 p-3 text-stone-105">
                  <Icons.TrendUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider font-serif">
                    Years to Offset Forever Home
                  </p>
                  <p className="text-3xl font-bold text-emerald-700 mt-3 font-serif">
                    {finances.fhOffsetYears}{" "}
                    <span className="text-xs font-sans font-normal text-stone-500">
                      Years
                    </span>
                  </p>
                  <div className="text-[11px] text-stone-600 mt-2 font-serif font-medium bg-emerald-50/50 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex justify-between items-center gap-2">
                    <span>Est. Interest Paid:</span>
                    <span className="font-bold font-mono text-emerald-800">
                      ${Math.round(finances.fhInterestAtOffset).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-3 mt-3 font-serif leading-relaxed">
                  Wipes out your Forever Home interest exposure completely. Dynamic
                  based on your ${Math.round(finances.effectiveWeeklySavings)}/wk contributions.
                </div>
              </div>

              {/* KPI CARD 3: INVERLOCH STATUS */}
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between print-card">
                <div className="absolute top-0 right-0 p-3 text-stone-100">
                  <Icons.Shield className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider font-serif">
                    Fern St Holiday House
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-serif">
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Property Valuation:</span>
                      <span className="font-bold text-stone-800 font-mono">
                        $850,000
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Rental Yield / Income:</span>
                      <span className="font-semibold text-rose-750 italic">
                        $0 / wk (Private Use)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Fern St Loan Balance:</span>
                      <span className="font-bold text-cyan-850 font-mono">
                        ${ACCOUNT_BALANCES.fernLoan.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Opening Offset Balance:</span>
                      <span className="font-bold text-amber-700 font-mono">
                        $
                        {Math.round(
                          ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-50 pb-1">
                      <span>Redirected Recast Cash:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        +$
                        {Math.round(
                          finances.surplusCashRedirectedToFern
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs border-t border-stone-100 pt-3 mt-3 flex justify-between items-center font-serif">
                  <span className="text-stone-500 font-medium">
                    Constant payment:
                  </span>
                  <span className="font-bold text-indigo-950 font-mono">
                    $783.74/wk
                  </span>
                </div>
              </div>

              {/* KPI CARD 4: TIME TO GLOBAL OFFSET */}
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between print-card">
                <div className="absolute top-0 right-0 p-3 text-stone-105 opacity-40">
                  <Icons.Shield className="w-8 h-8 text-stone-300" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider font-serif">
                    Years to Complete Portfolio Freedom
                  </p>
                  <p className="text-3xl font-bold text-teal-700 mt-3 font-serif">
                    {finances.activeFullyOffsetYears}{" "}
                    <span className="text-xs font-sans font-normal text-stone-500">
                      Years
                    </span>
                  </p>
                  <div className="text-[10.5px] text-stone-605 text-stone-600 mt-2 font-serif font-medium bg-teal-50/40 border border-teal-100 rounded-lg px-2.5 py-1.5 space-y-1">
                    <div className="flex justify-between gap-4">
                      <span>Forever Home Int:</span>
                      <strong className="font-mono text-stone-700">
                        ${Math.round(finances.fhInterestAtActiveFullyOffset).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Fern St Interest:</span>
                      <strong className="font-mono text-teal-850 text-teal-700">
                        ${Math.round(finances.fernInterestAtActiveFullyOffset).toLocaleString()}
                      </strong>
                    </div>
                    {finances.nbInterestAtActiveFullyOffset > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>New Build Interest:</span>
                        <strong className="font-mono text-purple-700">
                          ${Math.round(finances.nbInterestAtActiveFullyOffset).toLocaleString()}
                        </strong>
                      </div>
                    )}
                    {finances.newLoansInterestAtActiveFullyOffset > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Expense Loans Int:</span>
                        <strong className="font-mono text-amber-700">
                          ${Math.round(finances.newLoansInterestAtActiveFullyOffset).toLocaleString()}
                        </strong>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 pt-1 border-t border-teal-100/50 mt-1 font-bold">
                      <span>Combined Total:</span>
                      <span className="font-bold font-mono text-slate-800">
                        ${Math.round(finances.combinedInterestAtActiveFullyOffset).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-3 mt-3 font-serif leading-relaxed">
                  Entire portfolio of modeled properties and construction completely isolated and net debt-free globally
                  across your entire footprint.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FINANCIAL PROJECTION TRAJECTORY */}
        <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
          <div>
            <h3 className="text-lg font-bold text-blue-900 font-serif">
              Portfolio Financial Projection Trajectory (First 4 Years)
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-serif">
              Models the compounding impact of weekly extra offset accumulations and the Paulan proceeds release dynamically scaled to neutralize debt.
            </p>
          </div>

          {/* TRAJECTORY GRAPH */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-serif font-bold text-blue-950 mb-3 justify-end leading-none print:hidden">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-purple-700 inline-block"></span>
                <span>Primary Home Loan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span>
                <span>Primary Offsets</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-cyan-600 inline-block"></span>
                <span>Fern St Loan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-600 inline-block" style={{ borderBottom: "1.5px dashed #d97706" }}></span>
                <span>Fern St Offset</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-violet-700 inline-block"></span>
                <span>New Build Loan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-orange-500 inline-block"></span>
                <span>Expense Loans</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-teal-500 inline-block" style={{ borderBottom: "1.5px dashed #14b8a6" }}></span>
                <span>Extra Cash Savings (Income)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-rose-600 inline-block"></span>
                <span className="text-rose-700 font-extrabold">Net Portfolio Debt</span>
              </div>
            </div>

            <svg
              viewBox="0 0 800 280"
              className="w-full h-auto overflow-visible select-none"
            >
              {(() => {
                const maxDisplayYear = 4;
                const data = finances.simulationData.filter((d) => parseFloat(d.year) <= maxDisplayYear);
                if (!data || data.length === 0) return null;

                const maxDataVal =
                  Math.max(
                    1000000,
                    ...data.map((d) =>
                      Math.max(
                        d.loanFH || 0,
                        d.offsetFH || 0,
                        d.loanFern || 0,
                        d.offsetFern || 0,
                        d.newBuildLoan || 0,
                        d.newBuildOffset || 0,
                        d.newLoansPayable || 0,
                        d.newLoansOffset || 0,
                        d.extraCashSavings || 0,
                        Math.max(0, d.netDebt || 0)
                      )
                    )
                  ) || 1200000;

                const yStep = maxDataVal > 2500000 ? 500000 : maxDataVal > 1200000 ? 250000 : 200000;
                const yMax = Math.ceil(maxDataVal / yStep) * yStep;

                const yTicks = [];
                for (let val = 0; val <= yMax; val += yStep) {
                  yTicks.push(val);
                }

                const getX = (d: any) =>
                  60 + ((d.week ?? (parseFloat(d.year) * 52)) / (maxDisplayYear * 52)) * 700;
                const getY = (val: number) => 240 - (Math.min(yMax, Math.max(0, val)) / yMax) * 200;

                let primaryLoanPoints = "";
                let primaryOffsetPoints = "";
                let fernLoanPoints = "";
                let fernOffsetPoints = "";
                let newBuildLoanPoints = "";
                let newBuildOffsetPoints = "";
                let newLoansPoints = "";
                let extraSavingsPoints = "";
                let netDebtPoints = "";

                data.forEach((d) => {
                  const x = getX(d);
                  primaryLoanPoints += `${x.toFixed(1)},${getY(d.loanFH || 0).toFixed(1)} `;
                  primaryOffsetPoints += `${x.toFixed(1)},${getY(d.offsetFH || 0).toFixed(1)} `;
                  fernLoanPoints += `${x.toFixed(1)},${getY(d.loanFern || 0).toFixed(1)} `;
                  fernOffsetPoints += `${x.toFixed(1)},${getY(d.offsetFern || 0).toFixed(1)} `;
                  newBuildLoanPoints += `${x.toFixed(1)},${getY(d.newBuildLoan || 0).toFixed(1)} `;
                  newBuildOffsetPoints += `${x.toFixed(1)},${getY(d.newBuildOffset || 0).toFixed(1)} `;
                  newLoansPoints += `${x.toFixed(1)},${getY(d.newLoansPayable || 0).toFixed(1)} `;
                  extraSavingsPoints += `${x.toFixed(1)},${getY(d.extraCashSavings || 0).toFixed(1)} `;
                  netDebtPoints += `${x.toFixed(1)},${getY(Math.max(0, d.netDebt || 0)).toFixed(1)} `;
                });

                const xTicks = [0, 1, 2, 3, 4];

                return (
                  <g>
                    {/* Y-Axis lines at dynamic intervals */}
                    {yTicks.map((tick) => {
                      const y = getY(tick);
                      const isBaseline = tick === 0;
                      return (
                        <g key={tick}>
                          <line
                            x1="60"
                            y1={y}
                            x2="760"
                            y2={y}
                            stroke={isBaseline ? "#94a3b8" : "#e2e8f0"}
                            strokeWidth={isBaseline ? "1.5" : "1"}
                            strokeDasharray={isBaseline ? "0" : "4 4"}
                          />
                          <text
                            x="52"
                            y={y + 3.5}
                            textAnchor="end"
                            className="fill-stone-500 font-mono text-[9px] font-medium"
                          >
                            {tick === 0
                              ? "$0"
                              : tick >= 1000000
                              ? `$${(tick / 1000000)
                                  .toFixed(2)
                                  .replace(/\.0+$/, "")}M`
                              : `$${tick / 1000}k`}
                          </text>
                        </g>
                      );
                    })}

                    {/* X-Axis increments representing years up to 4 */}
                    {xTicks.map((yr) => {
                      const x = 60 + (yr / maxDisplayYear) * 700;
                      const calYear = 2026 + yr;
                      return (
                        <g key={yr}>
                          <line
                            x1={x}
                            y1={240}
                            x2={x}
                            y2={245}
                            stroke="#94a3b8"
                            strokeWidth="1"
                          />
                          <text
                            x={x}
                            y={262}
                            textAnchor="middle"
                            className="font-serif text-[10px] font-semibold text-stone-600"
                          >
                            Yr {yr} - {calYear}
                          </text>
                        </g>
                      );
                    })}

                    {/* Primary Home Loan & Offset */}
                    <polyline
                      fill="none"
                      stroke="#6b21a8"
                      strokeWidth="2.5"
                      points={primaryLoanPoints}
                    />
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      points={primaryOffsetPoints}
                    />

                    {/* Fern St Holiday Loan & Offset */}
                    <polyline
                      fill="none"
                      stroke="#0891b2"
                      strokeWidth="1.5"
                      points={fernLoanPoints}
                    />
                    <polyline
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="1.5"
                      points={fernOffsetPoints}
                      strokeDasharray="3 3"
                    />

                    {/* New Build Loan & Offset (if any) */}
                    <polyline
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="1.5"
                      points={newBuildLoanPoints}
                    />
                    <polyline
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      points={newBuildOffsetPoints}
                      strokeDasharray="3 3"
                    />

                    {/* Future Expense Loans (if any) */}
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      points={newLoansPoints}
                    />

                    {/* Extra Cash Savings (Accumulated Future Incomes / Surplus) */}
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      points={extraSavingsPoints}
                      strokeDasharray="4 3"
                    />

                    {/* Portfolio Net Debt Line */}
                    <polyline
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      points={netDebtPoints}
                    />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* THREE LEDGER MILESTONE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARD 1: LOANS RECAST */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-150 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-900 block font-serif border-b border-blue-200 pb-1.5">
                Loans Recast — {getMilestoneDateStr(0)}
              </span>
              <div className="space-y-2 text-xs font-serif flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded border border-blue-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-slate-900">Forever Home Residence</span>
                      <span className="text-[9px] text-stone-400">P&I Loan State</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-700">Loan: ${finances.milestoneRecast.fhLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-semibold">Offset: ${finances.milestoneRecast.fhOffset.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-blue-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-slate-900">Fern St Property</span>
                      <span className="text-[9px] text-stone-400">Holiday Home State</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-700">Loan: ${finances.milestoneRecast.fernLoan.toLocaleString()}</div>
                      <div className="text-amber-700 font-semibold">Offset: ${finances.milestoneRecast.fernOffset.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100/50 p-2 rounded text-[10px] font-sans font-bold text-blue-950 flex justify-between items-center">
                  <span>Net Portfolio Debt:</span>
                  <span className="font-mono text-xs">
                    ${(finances.milestoneRecast.fhLoan - finances.milestoneRecast.fhOffset + (finances.milestoneRecast.fernLoan - finances.milestoneRecast.fernOffset)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: FOREVER OFFSET */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-900 block font-serif border-b border-emerald-200 pb-1.5">
                {finances.fhOffsetYears !== "30+" ? `Forever Offset — ${getMilestoneDateStr(finances.milestoneFHOffset.week)}` : `Forever Offset — 30+ Years`}
              </span>
              <div className="space-y-2 text-xs font-serif flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded border border-emerald-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-emerald-950">Forever Home Residence</span>
                      <span className="text-[9px] text-emerald-600 font-medium font-semibold">Fully Neutralized ✓</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-400 line-through">Loan: ${finances.milestoneFHOffset.fhLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-bold">Offset: ${finances.milestoneFHOffset.fhOffset.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-emerald-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-slate-900">Fern St Property</span>
                      <span className="text-[9px] text-stone-400">Holiday Home State</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-700">Loan: ${finances.milestoneFHOffset.fernLoan.toLocaleString()}</div>
                      <div className="text-amber-700 font-semibold">Offset: ${finances.milestoneFHOffset.fernOffset.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-100/50 p-2 rounded text-[10px] font-sans font-bold text-emerald-950 flex justify-between items-center">
                  <span>Net Portfolio Debt:</span>
                  <span className="font-mono text-xs">
                    ${(finances.milestoneFHOffset.fhLoan - finances.milestoneFHOffset.fhOffset + (finances.milestoneFHOffset.fernLoan - finances.milestoneFHOffset.fernOffset)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: PORTFOLIO FREEDOM */}
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-150 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-teal-955 block font-serif border-b border-teal-200 pb-1.5">
                {finances.activeFullyOffsetYears !== "30+" ? `Portfolio Freedom — ${getMilestoneDateStr(finances.milestoneActiveFullyOffset.week)}` : `Portfolio Freedom — 30+ Years`}
              </span>
              <div className="space-y-2 text-xs font-serif flex-1 flex flex-col justify-between">
                <div className="space-y-2 select-none overflow-y-auto max-h-[220px]">
                  <div className="bg-white p-2 border border-teal-100/60 rounded flex justify-between items-center gap-1.5">
                    <div>
                      <span className="font-bold block text-teal-950">Forever Home Residence</span>
                      <span className="text-[9.5px] text-teal-600 font-medium">Fully Neutralized ✓</span>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <div className="text-stone-400 line-through">Loan: ${finances.milestoneActiveFullyOffset.fhLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-bold font-semibold">Offset: ${finances.milestoneActiveFullyOffset.fhOffset.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-white p-2 border border-teal-100/60 rounded flex justify-between items-center gap-1.5">
                    <div>
                      <span className="font-bold block text-teal-950 leading-tight">Fern St Property</span>
                      <span className="text-[9.5px] text-teal-600 font-medium">Fully Neutralized ✓</span>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <div className="text-stone-400 line-through">Loan: ${finances.milestoneActiveFullyOffset.fernLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-bold font-semibold">Offset: ${finances.milestoneActiveFullyOffset.fernOffset.toLocaleString()}</div>
                    </div>
                  </div>
                  {finances.milestoneActiveFullyOffset.nbLoan > 0 && (
                    <div className="bg-white p-2 border border-teal-100/60 rounded flex justify-between items-center gap-1.5">
                      <div>
                        <span className="font-bold block text-teal-950">New Build Loan</span>
                        <span className="text-[9.5px] text-teal-600 font-medium">Fully Neutralized ✓</span>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <div className="text-stone-400 line-through">Loan: ${finances.milestoneActiveFullyOffset.nbLoan.toLocaleString()}</div>
                        <div className="text-emerald-700 font-bold font-semibold">Offset: ${finances.milestoneActiveFullyOffset.nbOffset.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {finances.milestoneActiveFullyOffset.otherLoan > 0 && (
                    <div className="bg-white p-2 border border-teal-100/60 rounded flex justify-between items-center gap-1.5">
                      <div>
                        <span className="font-bold block text-teal-950">Other Expense Loans</span>
                        <span className="text-[9.5px] text-teal-600 font-medium">Fully Neutralized ✓</span>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <div className="text-stone-400 line-through">Loan: ${finances.milestoneActiveFullyOffset.otherLoan.toLocaleString()}</div>
                        <div className="text-emerald-700 font-bold font-semibold">Offset: ${finances.milestoneActiveFullyOffset.otherOffset.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-teal-100/50 p-2 rounded text-[10px] font-sans font-bold text-teal-950 flex justify-between items-center">
                  <span>Net Portfolio Debt:</span>
                  <span className="font-mono text-xs">
                    ${(
                      (finances.milestoneActiveFullyOffset.fhLoan - finances.milestoneActiveFullyOffset.fhOffset) +
                      (finances.milestoneActiveFullyOffset.fernLoan - finances.milestoneActiveFullyOffset.fernOffset) +
                      (finances.milestoneActiveFullyOffset.nbLoan - finances.milestoneActiveFullyOffset.nbOffset) +
                      (finances.milestoneActiveFullyOffset.otherLoan - finances.milestoneActiveFullyOffset.otherOffset)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SENSITIVITY AND TRAJECTORY SECTIONS - FULL WIDTH STACK */}
          <div className="space-y-6 pt-4">
            {/* PART 1: STRATEGY SENSITIVITY STRESS-TESTING MATRIX */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 space-y-4 w-full">
              <div className="space-y-1.5 pb-3 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-bold font-serif text-blue-955 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse"></span>
                    Programmatic Sensitivity Stress-Testing Matrix
                  </h4>
                  <p className="text-[10px] text-stone-400 font-serif leading-relaxed mt-0.5">
                    Evaluate years to <strong>Forever Home Offset</strong> and <strong>Portfolio Freedom (Combined Offset)</strong> alongside contractual repayments under variable economic friction.
                  </p>
                </div>
                <span className="text-[9.5px] font-mono bg-red-50 text-red-800 border border-red-105 border-red-100 px-2 py-0.5 rounded font-semibold uppercase">
                  Extended 30-Year Stress Range
                </span>
              </div>

              {/* Stress testing Grid/Table */}
              <div className="overflow-x-auto border border-stone-150 rounded-lg">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-[#590d0d] text-white text-[9.5px] uppercase font-bold tracking-wider font-serif border-b border-stone-205">
                    <tr>
                      <th className="p-3 w-[260px]">Interest Rate Scenario</th>
                      <th className="p-3 text-center">Savings Reduced (-25%)</th>
                      <th className="p-3 text-center bg-stone-900 text-yellow-350 text-yellow-350 text-yellow-300">Stated Investment Strategy (Current)</th>
                      <th className="p-3 text-center">Savings Increased (+25%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-serif text-[11px]">
                    {finances.sensitivityMatrix.map((rowObj: any, rIdx: number) => {
                      const { rateDelta, testRate, testInitialPayment, testRecastPayment, cells } = rowObj;
                      return (
                        <tr key={rIdx} className="hover:bg-red-50/10 transition-colors">
                          <td className="p-3 font-bold font-sans bg-stone-50 text-stone-850 w-[260px] border-r border-stone-200/60">
                            <div>
                              <span className="text-xs font-extrabold text-blue-955 block font-mono">
                                {testRate.toFixed(2)}% p.a.
                              </span>
                              <span className="text-[9.5px] text-stone-500 block font-normal font-serif">
                                {rateDelta === 0 ? "Base Interest Rate" : `+${rateDelta.toFixed(1)}% Rate Shift`}
                              </span>
                              <div className="mt-2.5 pt-2 border-t border-stone-200/80 space-y-1.5 text-left text-[10px]">
                                <span className="font-serif block text-[8.5px] text-stone-400 font-bold uppercase tracking-wider">
                                  Forever Home Repayments
                                </span>
                                <div className="text-stone-500 font-sans space-y-0.5 leading-normal">
                                  <div className="flex justify-between">
                                    <span>Pre-Recast:</span>
                                    <strong className="font-mono font-bold text-stone-800">${Math.round(testInitialPayment).toLocaleString()}/wk</strong>
                                  </div>
                                  <div className="flex justify-between text-purple-950 font-semibold bg-purple-50/50 px-1 py-0.5 rounded">
                                    <span>Post-Recast:</span>
                                    <strong className="font-mono font-extrabold text-purple-800">${Math.round(testRecastPayment).toLocaleString()}/wk</strong>
                                  </div>
                                </div>
                                <div className="text-[9px] text-stone-400 font-serif leading-tight pt-1 border-t border-dotted border-stone-200 flex justify-between">
                                  <span>Total Post-Recast Port*:</span>
                                  <strong className="font-mono font-bold text-teal-800">${Math.round(testRecastPayment + 783.74).toLocaleString()}/wk</strong>
                                </div>
                              </div>
                            </div>
                          </td>
                          {cells.map((cell: any, cIdx: number) => {
                            const isStated = cell.rateDelta === 0 && cell.savingsMultiplier === 1.0;
                            return (
                              <td
                                key={cIdx}
                                className={`p-3 font-sans text-center transition-all ${
                                  isStated ? "bg-amber-50/40 border-x border-amber-200/80 shadow-inner" : ""
                                }`}
                              >
                                <div className="space-y-2 py-1.5">
                                  <div className="bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                                    <span className="text-[8.5px] text-stone-400 block uppercase font-serif font-bold tracking-wider">FH Offset Time:</span>
                                    <strong className="font-mono text-emerald-800 font-extrabold text-xs">
                                      {cell.fhYears} Years
                                    </strong>
                                  </div>
                                  <div className="bg-teal-50/50 p-1.5 rounded border border-teal-100">
                                    <span className="text-[8.5px] text-stone-400 block uppercase font-serif font-bold tracking-wider">Global Portfolio Freedom:</span>
                                    <strong className="font-mono text-teal-800 font-extrabold text-xs">
                                      {cell.bothYears} Years
                                    </strong>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-100/80 text-[10px] text-stone-500 font-serif leading-snug">
                <strong>Stress-Testing Metric Guide:</strong> Rate additions apply multiplier scale contraction directly onto loan balances. *Total Post-Recast includes Forever Home Contract repayments & Fern St repayments of $783.74/wk.
              </div>
            </div>

            {/* PART 2: INTERACTIVE TRAJECTORY LEDGER */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between space-y-4 p-6 w-full">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-stone-100">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-blue-955 uppercase tracking-wide">
                      Simulation Ledgers (Dynamic Trajectory)
                    </h4>
                    <p className="text-[10px] text-stone-400 font-serif">
                      Track individual loan drops and consolidated offset growths over a 30-year lifecycle.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 no-print self-stretch sm:self-auto">
                    <button
                      onClick={handleExportCsv}
                      className="px-2 py-1 bg-stone-900 border border-stone-850 hover:bg-black text-white text-[10px] font-sans font-bold rounded shadow-sm hover:shadow transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Icons.Download className="w-3 h-3 text-stone-300" />
                      Download CSV
                    </button>
                    <div className="flex rounded bg-stone-100 p-0.5 text-[10px] font-medium border border-stone-200">
                      <button
                        onClick={() => setTrajectoryTableMode("key")}
                        className={`px-2 py-0.5 rounded transition-all ${
                          trajectoryTableMode === "key"
                            ? "bg-white text-stone-800 shadow-xs font-semibold"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Milestones
                      </button>
                      <button
                        onClick={() => setTrajectoryTableMode("all")}
                        className={`px-2 py-0.5 rounded transition-all ${
                          trajectoryTableMode === "all"
                            ? "bg-white text-stone-800 shadow-xs font-semibold"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        All (30 Yr)
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEARCH FILTER */}
                {trajectoryTableMode === "all" && (
                  <div className="no-print relative">
                    <input
                      type="text"
                      value={trajectorySearch}
                      onChange={(e) => setTrajectorySearch(e.target.value)}
                      placeholder="Search simulation by Year (e.g., Year 1, Year 15, Year 30)..."
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-blue-900 bg-stone-50/50"
                    />
                    {trajectorySearch && (
                      <button
                        onClick={() => setTrajectorySearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 font-sans text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* THE TABLE */}
              <div className="overflow-x-auto border border-stone-100 rounded-lg max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 text-[10px] uppercase text-stone-500 font-bold tracking-wider font-serif border-b border-stone-200 sticky top-0 bg-stone-50">
                    <tr>
                      <th className="p-3">Timeline Year</th>
                      <th className="p-3">FH Offset Balance</th>
                      <th className="p-3">Fern St Offset</th>
                      <th className="p-3 text-right">Net Portfolio Debt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                    {(() => {
                      let filtered = finances.simulationData;
                      if (trajectoryTableMode === "key") {
                        // Keep Year 0, Year 5, Year 10, Year 20, Year 30 milestones
                        filtered = finances.simulationData.filter((d) => {
                          const yrFloat = parseFloat(d.year);
                          return d.week === 0 || yrFloat === 5.0 || yrFloat === 10.0 || yrFloat === 20.0 || yrFloat === 30.0;
                        });
                      } else {
                        if (trajectorySearch.trim() !== "") {
                          const s = trajectorySearch.trim().toLowerCase();
                          filtered = finances.simulationData.filter((d) => {
                            const yrFloat = parseFloat(d.year);
                            const yearLabel = `year ${d.year}`.toLowerCase();
                            const isYearly = yrFloat % 1 === 0 || d.week === 0;
                            return isYearly && (yearLabel.includes(s) || d.year.includes(s));
                          });
                        } else {
                          filtered = finances.simulationData.filter((d) => {
                            const yrFloat = parseFloat(d.year);
                            return yrFloat % 1 === 0 || d.week === 0;
                          });
                        }
                      }

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-stone-400 italic font-serif">
                              No matching yearly intervals found.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((d, i) => (
                        <tr key={i} className="hover:bg-stone-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 font-sans">
                            {d.week === 0 ? "Post-Recast (Day 1)" : `Year ${Math.round(parseFloat(d.year))}`}
                          </td>
                          <td className="p-3 text-emerald-800 font-bold">
                            ${d.offsetFH.toLocaleString()}
                          </td>
                          <td className="p-3 text-amber-800 font-bold">
                            ${d.offsetFern.toLocaleString()}
                          </td>
                          <td
                            className={`p-3 font-semibold text-right ${
                              d.netDebt <= 0 ? "text-emerald-700" : "text-rose-800"
                            }`}
                          >
                            ${d.netDebt.toLocaleString()}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TRAJECTORY ANALYSIS */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-xs text-blue-900 leading-relaxed font-serif space-y-3 mt-6">
            <span className="font-bold text-blue-955 text-blue-950 text-sm block uppercase tracking-wider">
              Key Portfolio Trajectory Analysis:
            </span>
            <p>
              By transitioning under a concurrent loan structure, you bypass
              complex bridging products and isolate risk cleanly. Your primary
              home loan commences at{" "}
              <span className="font-semibold">
                ${Math.round(finances.loanRequired).toLocaleString()}
              </span>{" "}
              before being contractually paid down and recast to{" "}
              <span className="font-semibold">
                ${Math.round(finances.recastForeverHomeLoanPrincipal).toLocaleString()}
              </span>{" "}
              upon receiving the joint{" "}
              <span className="font-semibold">
                ${Math.round(finances.totalPostSaleCashPool).toLocaleString()}
              </span>{" "}
              post-sale injection.
            </p>
            <p>
              With your chosen internal variation allocation, your Forever Home
              becomes **100% Interest-Free and Fully Offset by Year{" "}
              {finances.fhOffsetYears}**. Once neutralized, your cumulative State
              cash velocity instantly redirects into the remaining loans, wiping out your remaining debt exposure globally
              to achieve **complete portfolio freedom in Year{" "}
              {finances.activeFullyOffsetYears}**.
            </p>
          </div>
        </section>

            </div> {/* Closing When the dust settles tab wrapper */}



            <div className={`space-y-6 ${activeTab === "futureExpenses" ? "block" : "hidden print:hidden"}`}>
              {/* Elegant Header section */}
              <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-xl shadow-md border-b border-white/[0.08] relative overflow-hidden">
                <div className="relative z-10 space-y-2 font-serif">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest font-mono">
                    <Icons.Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Portfolios & Capital Allocation Simulation</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                    Future Portfolio Planning & Expenses
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm font-serif max-w-3xl leading-relaxed">
                    Model large cash outlays (for cars, construction, or land improvements) alongside cattle agistment or supplementary income streams. Test alternative drawdown strategies dynamically to secure long-term portfolio freedom.
                  </p>
                </div>
              </section>

              {/* Top Section: Expense Creator & Other Income Creator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card A: Create Future Expense */}
                <div className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-lg">
                      <Icons.Dollar className="w-5 h-5 text-rose-800" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-stone-900 font-serif">Add Large Future Expense</h4>
                      <p className="text-[10px] text-stone-500 font-serif">Model cash purchases or new construction loan draws</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-serif">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Expense Label / Description:</label>
                        <input
                          type="text"
                          placeholder="e.g. Purchase Landcruiser"
                          id="exp-label"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50 hover:border-stone-300 focus:outline-none focus:border-blue-900 font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Amount ($):</label>
                        <input
                          type="number"
                          placeholder="e.g. 100000"
                          id="exp-amount"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50 hover:border-stone-300 focus:outline-none focus:border-blue-900 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Funding Source:</label>
                        <select
                          id="exp-source"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50 hover:border-stone-300 focus:outline-none focus:border-blue-900 font-sans text-xs"
                        >
                          <option value="offset_fh">Forever Home Offset Account</option>
                          <option value="offset_fern">Fern St Offset Account</option>
                          <option value="new_loan">Brand New Loan (Construction, etc.)</option>
                        </select>
                        <span className="text-[9px] text-stone-400 block pt-0.5 leading-snug">
                          New loans default to {inputs.interestRate}% interest rate with standard terms.
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="font-semibold text-stone-700">Timing Slider:</label>
                          <span className="font-mono text-blue-900 font-bold" id="exp-timing-display">
                            Year 1.0 (Month 12)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.08333" // 1/12th of a year (exactly one month)
                          defaultValue="1.0"
                          id="exp-timing-range"
                          onChange={(e) => {
                            const yearVal = parseFloat(e.target.value);
                            const monthsTotal = Math.round(yearVal * 12);
                            const displayYears = Math.floor(monthsTotal / 12);
                            const displayMonths = monthsTotal % 12;
                            const disp = document.getElementById("exp-timing-display");
                            if (disp) {
                              disp.textContent = `Year ${displayYears}.${displayMonths} (${monthsTotal} mth${monthsTotal === 1 ? '' : 's'})`;
                            }
                          }}
                          className="w-full accent-blue-900 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-stone-400 font-mono">
                          <span>Day 1 (0m)</span>
                          <span>Year 15 (180m)</span>
                          <span>Year 30 (360m)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const labelInput = document.getElementById("exp-label") as HTMLInputElement;
                        const amountInput = document.getElementById("exp-amount") as HTMLInputElement;
                        const sourceSelect = document.getElementById("exp-source") as HTMLSelectElement;
                        const timingSlider = document.getElementById("exp-timing-range") as HTMLInputElement;

                        if (!labelInput || !amountInput || !sourceSelect || !timingSlider) return;

                        const label = labelInput.value.trim() || "Unlabelled Expense";
                        const amount = parseFloat(amountInput.value) || 0;
                        const source = sourceSelect.value as any;
                        const timingYears = parseFloat(timingSlider.value) || 0;

                        if (amount <= 0) {
                          alert("Please enter a valid expense amount.");
                          return;
                        }

                        const newExp: FutureExpense = {
                          id: "exp_" + Date.now().toString(),
                          name: label,
                          amount,
                          timingYears,
                          source,
                        };

                        setFutureExpenses((prev) => [...prev, newExp]);

                        // Reset
                        labelInput.value = "";
                        amountInput.value = "";
                        sourceSelect.value = "offset_fh";
                        timingSlider.value = "1.0";
                        const disp = document.getElementById("exp-timing-display");
                        if (disp) disp.textContent = "Year 1.0 (Month 12)";
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white font-serif font-bold text-xs py-2 rounded-lg cursor-pointer transition-all shadow-sm"
                    >
                      Add Expense Drawdown
                    </button>
                  </div>
                </div>

                {/* Card B: Create Future Other Income Stream */}
                <div className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                      <Icons.Farm className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-stone-900 font-serif">Add Other Income Stream</h4>
                      <p className="text-[10px] text-stone-500 font-serif">Model extra revenue streams with a 15% tax haircut</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-serif">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Income Stream Name / Label:</label>
                        <input
                          type="text"
                          placeholder="e.g. Agistment Cattle"
                          id="inc-label"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50 hover:border-stone-300 focus:outline-none focus:border-blue-900 font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Annual Return ($ p.a.):</label>
                        <input
                          type="number"
                          placeholder="e.g. 30000"
                          id="inc-amount"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50 hover:border-stone-300 focus:outline-none focus:border-blue-900 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="font-semibold text-stone-700">Starts At Timing:</label>
                          <span className="font-mono text-emerald-800 font-bold" id="inc-start-display">
                            Year 1.0 (Month 12)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.08333"
                          defaultValue="1.0"
                          id="inc-start-range"
                          onChange={(e) => {
                            const yearVal = parseFloat(e.target.value);
                            const monthsTotal = Math.round(yearVal * 12);
                            const displayYears = Math.floor(monthsTotal / 12);
                            const displayMonths = monthsTotal % 12;
                            const disp = document.getElementById("inc-start-display");
                            if (disp) {
                              disp.textContent = `Year ${displayYears}.${displayMonths} (${monthsTotal} mth${monthsTotal === 1 ? '' : 's'})`;
                            }
                          }}
                          className="w-full accent-emerald-700 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-stone-400 font-mono">
                          <span>Day 1 (0m)</span>
                          <span>Year 15 (180m)</span>
                          <span>Year 30 (360m)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-semibold text-stone-700 flex items-center gap-1.5 select-none">
                            <input
                              type="checkbox"
                              defaultChecked
                              id="inc-indefinite-chk"
                              onChange={(e) => {
                                const block = document.getElementById("inc-end-container");
                                if (block) {
                                  block.style.opacity = e.target.checked ? "0.4" : "1.0";
                                  block.style.pointerEvents = e.target.checked ? "none" : "auto";
                                }
                              }}
                              className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                            />
                            Run Indefinitely
                          </label>
                          <span className="font-mono text-stone-500 font-semibold text-[10px]" id="inc-end-display">
                            Until Year 30
                          </span>
                        </div>
                        <div id="inc-end-container" style={{ opacity: "0.4", pointerEvents: "none" }} className="transition-all">
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="0.08333"
                            defaultValue="30.0"
                            id="inc-end-range"
                            onChange={(e) => {
                              const yearVal = parseFloat(e.target.value);
                              const monthsTotal = Math.round(yearVal * 12);
                              const displayYears = Math.floor(monthsTotal / 12);
                              const displayMonths = monthsTotal % 12;
                              const disp = document.getElementById("inc-end-display");
                              if (disp) {
                                disp.textContent = `Until Year ${displayYears}.${displayMonths} (${monthsTotal}m)`;
                              }
                            }}
                            className="w-full accent-emerald-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const labelInput = document.getElementById("inc-label") as HTMLInputElement;
                        const amountInput = document.getElementById("inc-amount") as HTMLInputElement;
                        const startSlider = document.getElementById("inc-start-range") as HTMLInputElement;
                        const endSlider = document.getElementById("inc-end-range") as HTMLInputElement;
                        const indefiniteChk = document.getElementById("inc-indefinite-chk") as HTMLInputElement;

                        if (!labelInput || !amountInput || !startSlider || !endSlider || !indefiniteChk) return;

                        const label = labelInput.value.trim() || "Other Income";
                        const annualAmount = parseFloat(amountInput.value) || 0;
                        const timingStartYears = parseFloat(startSlider.value) || 0;
                        const isIndefinite = indefiniteChk.checked;
                        const timingEndYears = isIndefinite ? null : parseFloat(endSlider.value);

                        if (annualAmount <= 0) {
                          alert("Please enter a valid annual income amount.");
                          return;
                        }

                        if (!isIndefinite && timingEndYears !== null && timingEndYears <= timingStartYears) {
                          alert("The income end date must be after the start date.");
                          return;
                        }

                        const newInc: FutureIncome = {
                          id: "inc_" + Date.now().toString(),
                          name: label,
                          annualAmount,
                          timingStartYears,
                          timingEndYears,
                        };

                        setFutureIncomes((prev) => [...prev, newInc]);

                        // Reset
                        labelInput.value = "";
                        amountInput.value = "";
                        startSlider.value = "1.0";
                        endSlider.value = "30.0";
                        indefiniteChk.checked = true;
                        const dispStart = document.getElementById("inc-start-display");
                        if (dispStart) dispStart.textContent = "Year 1.0 (Month 12)";
                        const dispEnd = document.getElementById("inc-end-display");
                        if (dispEnd) dispEnd.textContent = "Until Year 30";
                        const block = document.getElementById("inc-end-container");
                        if (block) {
                          block.style.opacity = "0.4";
                          block.style.pointerEvents = "none";
                        }
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white font-serif font-bold text-xs py-2 rounded-lg cursor-pointer transition-all shadow-sm"
                    >
                      Add Custom Income Stream
                    </button>
                  </div>
                </div>
              </div>

              {/* Active / Listed Elements Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                {/* Active Expenses */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-4 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-800 font-serif border-b border-stone-100 pb-2 flex items-center justify-between">
                    <span>Active Future Expense Schedule ({futureExpenses.length})</span>
                    <span className="text-[10px] text-stone-400 font-serif font-normal">Saves automatically</span>
                  </h4>
                  {futureExpenses.length === 0 ? (
                    <div className="py-6 text-center text-stone-400 text-xs font-serif">
                      No future expenses added yet. Create one above to model cash drawdowns!
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-[11px] sm:text-xs">
                      <table className="w-full text-left font-serif text-stone-600 border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-[10px] uppercase text-stone-400 font-bold bg-stone-50/50">
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                            <th className="py-2 px-3">Funding Source</th>
                            <th className="py-2 px-3">Timing (Month)</th>
                            <th className="py-2 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {futureExpenses.map((exp) => {
                            const monthsTotal = Math.round(exp.timingYears * 12);
                            const displayYears = Math.floor(monthsTotal / 12);
                            const displayMonths = monthsTotal % 12;
                            return (
                              <tr key={exp.id} className="border-b border-stone-150 hover:bg-stone-50/50">
                                <td className="py-2.5 px-3 font-semibold text-stone-800">{exp.name}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-rose-800 font-semibold">
                                  ${exp.amount.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 font-medium capitalize">
                                  {exp.source === "offset_fh"
                                    ? "FH Offset"
                                    : exp.source === "offset_fern"
                                    ? "Fern St Offset"
                                    : "New Loan"}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-medium">
                                  Yr {displayYears}.{displayMonths} ({monthsTotal}m)
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => setFutureExpenses((prev) => prev.filter((x) => x.id !== exp.id))}
                                    className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer font-bold text-[10px]"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Active Incomes */}
                <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-4 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-800 font-serif border-b border-stone-100 pb-2 flex items-center justify-between">
                    <span>Active Other Income Schedule ({futureIncomes.length})</span>
                    <span className="text-[10px] text-stone-400 font-serif font-normal">15% haircut applied</span>
                  </h4>
                  {futureIncomes.length === 0 ? (
                    <div className="py-6 text-center text-stone-400 text-xs font-serif">
                      No other income streams added yet. Create one above to model cattle/agistment yield!
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-[11px] sm:text-xs">
                      <table className="w-full text-left font-serif text-stone-600 border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 text-[10px] uppercase text-stone-400 font-bold bg-stone-50/50">
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3 text-right">Annual Gross p.a.</th>
                            <th className="py-2 px-3 text-right">Net Extra Weekly</th>
                            <th className="py-2 px-3">Timing Window</th>
                            <th className="py-2 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {futureIncomes.map((inc) => {
                            const sMonths = Math.round(inc.timingStartYears * 12);
                            const sY = Math.floor(sMonths / 12);
                            const sM = sMonths % 12;

                            const hasEnd = inc.timingEndYears !== null;
                            const eMonths = hasEnd ? Math.round(inc.timingEndYears! * 12) : 0;
                            const eY = hasEnd ? Math.floor(eMonths / 12) : 0;
                            const eM = hasEnd ? eMonths % 12 : 0;

                            const netWeekly = (inc.annualAmount * 0.85) / 52;
                            return (
                              <tr key={inc.id} className="border-b border-stone-150 hover:bg-stone-50/50">
                                <td className="py-2.5 px-3 font-semibold text-stone-800">{inc.name}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-bold">
                                  ${inc.annualAmount.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-medium text-stone-600">
                                  +${netWeekly.toFixed(2)}/wk
                                </td>
                                <td className="py-2.5 px-3 font-medium text-stone-500">
                                  Yr {sY}.{sM} → {hasEnd ? `Yr ${eY}.${eM} (${eMonths}m)` : "Indefinite"}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => setFutureIncomes((prev) => prev.filter((x) => x.id !== inc.id))}
                                    className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer font-bold text-[10px]"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* NEW BUILD SECTION */}
              <div className="bg-white border border-stone-250 p-6 rounded-xl space-y-6 shadow-md border-t-4 border-t-purple-900">
                <div className="flex items-start justify-between border-b border-stone-155 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-purple-900 text-white font-mono text-[9px] font-extrabold rounded">MODELER</span>
                       <h4 className="font-bold text-lg text-purple-950 font-serif leading-tight">New Build Capital Allocator</h4>
                    </div>
                    <p className="text-xs text-stone-500 font-serif">
                       Configure when &amp; how you draw capital to construct the new build on site. Liquid offsets dynamically change based on the build timing!
                    </p>
                  </div>
                  <Icons.Home className="w-5 h-5 text-purple-900 flex-shrink-0" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-serif">
                  {/* Left Column: Sliders */}
                  <div className="space-y-5 bg-stone-50/50 p-4 rounded-xl border border-stone-150">
                    {/* Slider 1: Total Spend */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-stone-800">Total Spend ($):</label>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-stone-400 font-bold">$</span>
                          <input
                            type="number"
                            value={newBuildSpend}
                            onChange={(e) => setNewBuildSpend(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-2 py-1 text-right border border-stone-200 rounded font-mono text-slate-800 font-semibold focus:outline-none focus:border-purple-900"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2500000"
                        step="10000"
                        value={newBuildSpend}
                        onChange={(e) => setNewBuildSpend(parseInt(e.target.value))}
                        className="w-full accent-purple-900 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>$0</span>
                        <span>$500k</span>
                        <span>$1.0M</span>
                        <span>$1.5M</span>
                        <span>$2.0M</span>
                        <span>$2.5M</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap pt-0.5">
                        {[250000, 500000, 1000000, 1200000, 1500000, 2000000, 2500000].map((val) => (
                          <button
                            key={val}
                            onClick={() => setNewBuildSpend(val)}
                            className={`px-2 py-0.5 text-[9px] font-mono border rounded cursor-pointer transition ${
                              newBuildSpend === val
                                ? "bg-purple-900 text-white border-purple-950 font-bold"
                                : "bg-white text-stone-600 hover:bg-stone-50 border-stone-200"
                            }`}
                          >
                            {val >= 1000000 ? `$${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M` : `$${(val / 1000).toFixed(0)}k`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slider 2: Timing of Draw */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-stone-800">Build Settle Timing:</label>
                        <span className="font-mono text-purple-900 font-extrabold text-[13px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          Yr {Math.floor(Math.round(newBuildTiming * 12) / 12)}.{Math.round(newBuildTiming * 12) % 12} ({Math.round(newBuildTiming * 12)}m) — {2026 + Math.floor(newBuildTiming)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.08333" // monthly
                        value={newBuildTiming}
                        onChange={(e) => setNewBuildTiming(parseFloat(e.target.value))}
                        className="w-full accent-purple-900 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>Immediate (0m)</span>
                        <span>15 Years</span>
                        <span>30 Years</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap pt-0.5">
                        {[0, 1, 2, 2.5, 3, 5, 10, 15].map((val) => {
                          const m = Math.round(val * 12);
                          return (
                            <button
                              key={val}
                              onClick={() => setNewBuildTiming(val)}
                              className={`px-2 py-0.5 text-[9px] font-mono border rounded cursor-pointer transition ${
                                Math.abs(newBuildTiming - val) < 0.02
                                  ? "bg-purple-900 text-white border-purple-950 font-bold"
                                  : "bg-white text-stone-600 hover:bg-stone-50 border-stone-200"
                              }`}
                            >
                              {val === 0 ? "Day 1" : val % 1 === 0 ? `Yr ${val}` : `Yr ${val}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slider 3: Retained Offset Cash Buffer */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="font-bold text-stone-800">Retained Cash Buffer:</label>
                          <span className="text-[10px] text-stone-400 font-serif block font-normal leading-tight">Preserves this much cash; won't draw from it</span>
                        </div>
                        <span className="font-mono text-stone-700 font-bold">${newBuildBuffer.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="400000"
                        step="5000"
                        value={newBuildBuffer}
                        onChange={(e) => setNewBuildBuffer(parseInt(e.target.value))}
                        className="w-full accent-purple-900 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>$0 (Aggressive)</span>
                        <span>$100k</span>
                        <span>$200k</span>
                        <span>$400k (Safe)</span>
                      </div>
                    </div>

                    {/* Slider 4: Capital Draw Percentage */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="font-bold text-stone-800">Liquid Offset Draw Ratio:</label>
                          <span className="text-[10px] text-stone-400 font-serif block font-normal leading-tight">Percentage of excess offset cash block to pull</span>
                        </div>
                        <span className="font-mono text-purple-900 font-extrabold text-[13px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{newBuildDrawChoicePct}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={newBuildDrawChoicePct}
                        onChange={(e) => setNewBuildDrawChoicePct(parseInt(e.target.value))}
                        className="w-full accent-purple-900 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                        <span>0% (All Loan)</span>
                        <span>50% (Symmetrical)</span>
                        <span>100% (All Retained Cash)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key-value HUD & Dynamic Insights */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="bg-purple-50/40 rounded-xl border border-purple-100 p-5 space-y-4 flex-1">
                      <h5 className="font-bold text-xs uppercase font-serif tracking-wide text-purple-900 border-b border-purple-100 pb-2">
                        Dynamic Ingress & Drawdown Ledger
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-2.5 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-stone-400 font-bold block uppercase leading-snug">Available Offset Liquid Reserves</span>
                          <span className="font-mono text-zinc-800 text-[14px] font-extrabold">
                            ${(finances.liquidOffsetAtBuild || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-stone-400 block pt-0.5 leading-snug">
                            Total offsets saved by month {Math.round(newBuildTiming * 12)}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-stone-400 font-bold block uppercase leading-snug">Draw Cap (Excess Over Buffer)</span>
                          <span className="font-mono text-emerald-800 text-[14px] font-semibold">
                            ${Math.max(0, (finances.liquidOffsetAtBuild || 0) - newBuildBuffer).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-stone-400 block pt-0.5 leading-snug font-serif">
                            Maximum possible draw to avoid cash strain
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-stone-400 font-bold block uppercase leading-snug">Drawn from Retained Offsets</span>
                          <span className="font-mono text-purple-800 text-[14px] font-extrabold">
                            -${(finances.actualDrawFromOffsets || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-stone-400 block pt-0.5 leading-snug">
                            Offset money pulled to pay build costs
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-stone-400 font-bold block uppercase leading-snug">Build Loan Balance Formed</span>
                          <span className="font-mono text-zinc-950 text-[14px] font-extrabold">
                            ${(finances.newBuildLoanAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-stone-400 block pt-0.5 leading-snug">
                            Remaining cost placed on purple loan
                          </span>
                        </div>
                      </div>

                      {/* Summary details inside right card */}
                      <div className="bg-white p-3 rounded-xl border border-purple-150 space-y-2 mt-4 text-[11px] leading-relaxed">
                        <div className="flex justify-between">
                          <span className="font-semibold text-stone-600">Model Loan Interest Rate:</span>
                          <span className="font-mono text-stone-850 font-bold">{inputs.interestRate}% <span className="font-normal text-[10px]">(Inherited)</span></span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-stone-600">Weekly P&amp;I Repayment:</span>
                          <span className="font-mono text-purple-900 font-extrabold text-xs">
                            +${Math.round(finances.newBuildWeeklyPayment || 0)}/wk
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-stone-600">Total Build Loan Interest Paid:</span>
                          <span className="font-mono text-zinc-800 font-semibold">
                            ${Math.round(finances.newBuildInterestPaid || 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[9px] text-justify text-stone-400 font-serif pt-1.5 border-t border-dashed border-stone-150">
                          *Mechanics Note: The New Build Offset account automatically attaches to this purple loan. When Forever Home and Fern St loans are fully offset, any surplus weekly savings (+ cattle agistment, etc.) will stream here to accelerate compounding, save interest, and shorten payoff years.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC POST-BUILD WEEKLY CASH FLOW ANALYSIS TABLE/TOOL */}
                {(() => {
                  const buildWeek = Math.round(newBuildTiming * 52);
                  const isFHPaidOffByBuild = finances.fhPaidOffWeek !== -1 && buildWeek >= finances.fhPaidOffWeek;
                  const isFernPaidOffByBuild = finances.fernPaidOffWeek !== -1 && buildWeek >= finances.fernPaidOffWeek;
                  const isNBPaidOffByBuild = finances.nbPaidOffWeek !== -1 && buildWeek >= finances.nbPaidOffWeek;

                  // 1. Weekly Income Calculation at newBuildTiming
                  const activeExtraIncomes = futureIncomes.filter(inc => {
                    const startY = inc.timingStartYears;
                    const endY = inc.timingEndYears !== null ? inc.timingEndYears : 30;
                    return newBuildTiming >= startY && newBuildTiming <= endY;
                  });
                  const totalActiveExtraWeeklyIncome = activeExtraIncomes.reduce((sum, inc) => {
                    return sum + (inc.annualAmount * 0.85) / 52;
                  }, 0);
                  const baseWages = inputs.weeklyIncome ?? 5303.35;
                  const totalWeeklyNetIncome = baseWages + totalActiveExtraWeeklyIncome;

                  // 2. Weekly Outflow Calculations
                  const fhRepayment = isFHPaidOffByBuild ? 0 : finances.recastWeeklyPayment;
                  const fernRepayment = isFernPaidOffByBuild ? 0 : finances.fernWeeklyPayment;
                  const nbRepayment = isNBPaidOffByBuild ? 0 : (finances.newBuildWeeklyPayment || 0);

                  // Calculate active expense loans at newBuildTiming
                  const activeExpenseLoansAtBuild = futureExpenses
                    .filter(exp => exp.source === "new_loan" && exp.timingYears <= newBuildTiming)
                    .map(exp => {
                      const rLoanWeekly = (inputs.interestRate / 100) / 52;
                      const nLoanWeeks = 30 * 52;
                      const pmt = rLoanWeekly > 0 
                        ? (exp.amount * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
                        : 0;
                      return {
                        name: exp.name || "Expense Loan",
                        amount: exp.amount,
                        payment: pmt,
                      };
                    });
                  const totalExpenseLoansPayment = activeExpenseLoansAtBuild.reduce((sum, l) => sum + l.payment, 0);

                  const totalRepayments = fhRepayment + fernRepayment + nbRepayment + totalExpenseLoansPayment;

                  // 3. Discretionary cash surplus calculations
                  const grossCashSurplus = totalWeeklyNetIncome - totalRepayments;

                  // Resolve the post-build weekly savings rate (defaulting to the other weekly savings rate variable)
                  const finalWeeklySavings = inputs.usePostBuildFixedDiscretionary
                    ? Math.max(0, Math.round(grossCashSurplus - (inputs.postBuildFixedDiscretionaryCash ?? 3000)))
                    : (newBuildPostWeeklySavingsOverride !== null ? newBuildPostWeeklySavingsOverride : inputs.weeklySavings);

                  const netCashSurplus = grossCashSurplus - finalWeeklySavings;

                  // Percentages for the waterfall visual representation
                  const fhPct = Math.min(100, (fhRepayment / totalWeeklyNetIncome) * 100);
                  const fernPct = Math.min(100, (fernRepayment / totalWeeklyNetIncome) * 100);
                  const nbPct = Math.min(100, (nbRepayment / totalWeeklyNetIncome) * 100);
                  const expPct = Math.min(100, (totalExpenseLoansPayment / totalWeeklyNetIncome) * 100);
                  const savingsPct = Math.min(100, (finalWeeklySavings / totalWeeklyNetIncome) * 100);
                  const leftoverPct = Math.max(0, 100 - (fhPct + fernPct + nbPct + expPct + savingsPct));

                  return (
                    <div className="mt-6 border border-purple-100 rounded-xl p-5 bg-gradient-to-br from-purple-50/35 to-zinc-50/20 shadow-sm space-y-4 font-serif">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                            <h5 className="font-bold text-sm text-purple-950 uppercase tracking-wider">
                              Post-Build Weekly Cash Flow Analysis
                            </h5>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed font-sans">
                            A snapshot of your consolidated weekly household budget at <strong className="text-stone-705">Year {newBuildTiming.toFixed(1)} ({Math.round(newBuildTiming * 12)} months)</strong> once the new build construction concludes and mortgage repayments commence.
                          </p>
                        </div>
                        <div className="bg-purple-100/50 px-2.5 py-1 rounded text-[10px] font-mono text-purple-950 font-bold text-center self-start sm:self-center">
                          Active State: Yr {newBuildTiming.toFixed(1)}
                        </div>
                      </div>

                      {/* POST-BUILD CASH FLOW MODE TOGGLE & DUAL SLIDERS */}
                      <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-150 space-y-4">
                        {/* Mode Selector */}
                        <div className="space-y-1.5 pb-2 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block font-sans">
                              Post-Build Cash Flow Control Mode
                            </span>
                            <p className="text-[9px] text-stone-500 leading-none font-sans">
                              Choose how you want to manage your cash flow in the post-building loan period.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 no-print self-start sm:self-center w-full sm:w-auto">
                            <button
                              onClick={() => handleInputChange("usePostBuildFixedDiscretionary", false)}
                              className={`px-3 py-1 rounded border text-center font-sans text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                                !inputs.usePostBuildFixedDiscretionary
                                  ? "bg-purple-800 text-white border-purple-900 shadow-sm"
                                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              Adjust Savings Rate
                            </button>
                            <button
                              onClick={() => handleInputChange("usePostBuildFixedDiscretionary", true)}
                              className={`px-3 py-1 rounded border text-center font-sans text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                                inputs.usePostBuildFixedDiscretionary
                                  ? "bg-purple-800 text-white border-purple-900 shadow-sm"
                                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              Fix Discretionary Cash
                            </button>
                          </div>
                        </div>

                        {!inputs.usePostBuildFixedDiscretionary ? (
                          /* SAVINGS RATE MODE */
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1 md:max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-sans font-bold text-xs text-purple-900">Post-New Build Weekly Savings Rate</span>
                                {newBuildPostWeeklySavingsOverride !== null && (
                                  <button 
                                    onClick={() => setNewBuildPostWeeklySavingsOverride(null)}
                                    className="text-[10px] text-purple-600 hover:text-purple-800 font-sans font-semibold underline cursor-pointer"
                                    title="Click to match the global savings rate again"
                                  >
                                    (Reset to match global: ${Math.round(finances.effectiveWeeklySavings)}/wk)
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-550 leading-normal font-sans">
                                {newBuildPostWeeklySavingsOverride === null ? (
                                  <span className="text-stone-400 italic">Currently matching your global Weekly Extra Savings Rate of <strong>${Math.round(finances.effectiveWeeklySavings)}/wk</strong>. Drag the slider to override this specifically for the post-build period.</span>
                                ) : (
                                  <span className="text-purple-800 font-semibold">Custom post-build savings rate active. This will affect your post-build mortgage amortization trajectory in the 30-year simulation.</span>
                                )}
                              </p>
                            </div>
                            <div className="w-full md:w-60 space-y-1.5 flex-shrink-0">
                              <div className="flex justify-between text-xs font-sans">
                                <span className="text-stone-400 font-normal">Adjustment:</span>
                                <span className="font-mono font-bold text-purple-950">
                                  ${finalWeeklySavings.toLocaleString()}/wk
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={Math.max(3000, Math.floor(grossCashSurplus))}
                                step={50}
                                value={finalWeeklySavings}
                                onChange={(e) => setNewBuildPostWeeklySavingsOverride(parseInt(e.target.value))}
                                className="w-full accent-purple-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                              />
                              <div className="flex justify-between text-[9px] text-stone-400 font-sans">
                                <span>$0/wk min</span>
                                <span>${Math.max(3000, Math.floor(grossCashSurplus)).toLocaleString()}/wk cap</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* FIXED DISCRETIONARY CASH MODE */
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1 md:max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-sans font-bold text-xs text-purple-900">Post-New Build Fixed Discretionary Cash</span>
                                <button 
                                  onClick={() => {
                                    // Reset to match the global uncommitted cash
                                    const globalLeftover = finances.leftoverDiscretionaryCash || 500;
                                    handleInputChange("postBuildFixedDiscretionaryCash", Math.round(globalLeftover));
                                  }}
                                  className="text-[10px] text-purple-600 hover:text-purple-800 font-sans font-semibold underline cursor-pointer"
                                  title="Click to match the global uncommitted discretionary cash"
                                >
                                  (Reset to match global uncommitted: ${Math.round(finances.leftoverDiscretionaryCash || 0)}/wk)
                                </button>
                              </div>
                              <p className="text-[10px] text-stone-550 leading-normal font-sans">
                                <span className="text-purple-800 font-semibold">
                                  Post-build discretionary spending is fixed. Any additional cash surplus is automatically saved, accelerating offset accumulation.
                                </span>
                              </p>
                            </div>
                            <div className="w-full md:w-60 space-y-1.5 flex-shrink-0">
                              <div className="flex justify-between text-xs font-sans">
                                <span className="text-stone-400 font-normal">Adjustment:</span>
                                <span className="font-mono font-bold text-purple-950">
                                  ${(inputs.postBuildFixedDiscretionaryCash ?? 3000).toLocaleString()}/wk
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={Math.max(3000, Math.floor(grossCashSurplus))}
                                step={50}
                                value={inputs.postBuildFixedDiscretionaryCash ?? 3000}
                                onChange={(e) => handleInputChange("postBuildFixedDiscretionaryCash", parseInt(e.target.value))}
                                className="w-full accent-purple-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                              />
                              <div className="flex justify-between text-[9px] text-stone-400 font-sans">
                                <span>$0/wk min</span>
                                <span>${Math.max(3000, Math.floor(grossCashSurplus)).toLocaleString()}/wk cap</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cash Flow Bento Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                        {/* 1. Cash Inflows Card */}
                        <div className="bg-white/90 p-4 border border-emerald-100 rounded-lg shadow-xs flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9.5px] uppercase font-sans font-extrabold tracking-widest text-emerald-800 block mb-2">
                              1. Weekly Net Revenue (Inflows)
                            </span>
                            <div className="space-y-1.5 font-serif text-[11px]">
                              <div className="flex justify-between text-stone-600 font-sans">
                                <span>Locked Family Salary (Net):</span>
                                <span className="font-mono font-semibold text-emerald-800">+${baseWages.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              {activeExtraIncomes.map((inc, idx) => {
                                const incWeekly = (inc.annualAmount * 0.85) / 52;
                                return (
                                  <div key={idx} className="flex justify-between text-stone-500 leading-snug font-sans">
                                    <span className="truncate max-w-[150px]" title={inc.name}>
                                      • {inc.name || "Other Income"}:
                                    </span>
                                    <span className="font-mono text-emerald-700 font-medium">+${incWeekly.toFixed(2)}</span>
                                  </div>
                                );
                              })}
                              {activeExtraIncomes.length === 0 && (
                                <div className="text-[9.5px] text-stone-450 italic font-sans pt-1">
                                  No additional active other income streams at Year {newBuildTiming.toFixed(1)}.
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="border-t border-emerald-50 pt-2 flex justify-between items-end">
                            <span className="font-bold text-[10.5px] text-emerald-950 font-sans">Total Net Income:</span>
                            <span className="font-mono text-emerald-700 font-bold text-base leading-none">
                              +${Math.round(totalWeeklyNetIncome).toLocaleString()}/wk
                            </span>
                          </div>
                        </div>

                        {/* 2. Debt Repayment Outflows Card */}
                        <div className="bg-white/90 p-4 border border-rose-100 rounded-lg shadow-xs flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9.5px] uppercase font-sans font-extrabold tracking-widest text-rose-800 block mb-2">
                              2. Loan Repayments (Outflows)
                            </span>
                            <div className="space-y-1.5 font-serif text-[11px]">
                              <div className="flex justify-between text-stone-600 font-sans">
                                <span>Forever Home P&amp;I:</span>
                                {isFHPaidOffByBuild ? (
                                  <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 px-1 rounded uppercase">PAID OFF</span>
                                ) : (
                                  <span className="font-mono font-semibold text-rose-700">-${Math.round(fhRepayment)}/wk</span>
                                )}
                              </div>
                              <div className="flex justify-between text-stone-600 font-sans">
                                <span>Fern St Holiday House:</span>
                                {isFernPaidOffByBuild ? (
                                  <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 px-1 rounded uppercase">PAID OFF</span>
                                ) : (
                                  <span className="font-mono font-semibold text-rose-700">-${Math.round(fernRepayment)}/wk</span>
                                )}
                              </div>
                              <div className="flex justify-between text-stone-600 font-sans">
                                <span>New Build Construction:</span>
                                {isNBPaidOffByBuild ? (
                                  <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 px-1 rounded uppercase">PAID OFF</span>
                                ) : (
                                  <span className="font-mono font-semibold text-rose-700">-${Math.round(nbRepayment)}/wk</span>
                                )}
                              </div>
                              {activeExpenseLoansAtBuild.map((l, idx) => (
                                <div key={idx} className="flex justify-between text-stone-500 leading-snug font-sans">
                                  <span className="truncate max-w-[155px]" title={l.name}>
                                    • {l.name}:
                                  </span>
                                  <span className="font-mono text-rose-600">-${Math.round(l.payment)}/wk</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-rose-50 pt-2 flex justify-between items-end">
                            <span className="font-bold text-[10.5px] text-rose-950 font-sans">Total Committed P&amp;I:</span>
                            <span className="font-mono text-rose-700 font-bold text-base leading-none">
                              -${Math.round(totalRepayments).toLocaleString()}/wk
                            </span>
                          </div>
                        </div>

                        {/* 3. Discretionary Surplus Buffer Card */}
                        <div className="bg-white/90 p-4 border border-purple-100 rounded-lg shadow-xs flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9.5px] uppercase font-sans font-extrabold tracking-widest text-purple-900 block mb-2">
                              3. Discretionary Cash Surplus
                            </span>
                            <div className="space-y-1.5 font-serif text-[11px]">
                              <div className="flex justify-between text-stone-600 font-sans">
                                <span>Gross Discretionary Cash:</span>
                                <span className="font-mono text-purple-950 font-bold">+${Math.round(grossCashSurplus).toLocaleString()}/wk</span>
                              </div>
                              <div className="flex justify-between text-stone-500 font-sans">
                                <div>
                                  <span>Voluntary Weekly Savings:</span>
                                  <span className="text-[9px] text-stone-400 block font-normal leading-none">
                                    {newBuildPostWeeklySavingsOverride !== null ? "(Custom post-build rate)" : "(Set by global rate)"}
                                  </span>
                                </div>
                                <span className="font-mono font-semibold text-stone-700">-${Math.round(finalWeeklySavings)}/wk</span>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-purple-100 pt-2 flex justify-between items-end">
                            <span className="font-bold text-[10.5px] text-zinc-900 font-sans">Net Excess Buffer:</span>
                            <span className={`font-mono font-extrabold text-base leading-none ${netCashSurplus >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                              ${Math.round(netCashSurplus).toLocaleString()}/wk
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Flow Distribution Waterfall Progress Bar */}
                      <div className="p-3 bg-white/70 border border-purple-100/40 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 font-sans font-semibold">
                          <span>WEEKLY INCOME ALLOCATION WATERFALL</span>
                          <span className="font-mono text-[9px] text-purple-950 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded leading-none">100% of Net Earnings</span>
                        </div>

                        {/* Bar with rounded chunks */}
                        <div className="w-full h-3.5 bg-stone-100 rounded-full flex overflow-hidden">
                          {fhRepayment > 0 && (
                            <div 
                              className="bg-indigo-500 border-r border-white/20 transition-all duration-300"
                              style={{ width: `${fhPct}%` }}
                              title={`Forever Home P&I: $${Math.round(fhRepayment)}/wk (${fhPct.toFixed(1)}%)`}
                            />
                          )}
                          {fernRepayment > 0 && (
                            <div 
                              className="bg-teal-500 border-r border-white/20 transition-all duration-300"
                              style={{ width: `${fernPct}%` }}
                              title={`Fern St P&I: $${Math.round(fernRepayment)}/wk (${fernPct.toFixed(1)}%)`}
                            />
                          )}
                          {nbRepayment > 0 && (
                            <div 
                              className="bg-purple-600 border-r border-white/20 transition-all duration-300"
                              style={{ width: `${nbPct}%` }}
                              title={`New Build Construction P&I: $${Math.round(nbRepayment)}/wk (${nbPct.toFixed(1)}%)`}
                            />
                          )}
                          {totalExpenseLoansPayment > 0 && (
                            <div 
                              className="bg-rose-500 border-r border-white/20 transition-all duration-350"
                              style={{ width: `${expPct}%` }}
                              title={`Expense Loans: $${Math.round(totalExpenseLoansPayment)}/wk (${expPct.toFixed(1)}%)`}
                            />
                          )}
                          {finalWeeklySavings > 0 && (
                            <div 
                              className="bg-sky-500 border-r border-white/20 transition-all duration-300"
                              style={{ width: `${savingsPct}%` }}
                              title={`Voluntary Savings: $${Math.round(finalWeeklySavings)}/wk (${savingsPct.toFixed(1)}%)`}
                            />
                          )}
                          {leftoverPct > 0 && (
                            <div 
                              className="bg-emerald-400 transition-all duration-300"
                              style={{ width: `${leftoverPct}%` }}
                              title={`Remaining Free Cushion: $${Math.round(grossCashSurplus - finalWeeklySavings)}/wk (${leftoverPct.toFixed(1)}%)`}
                            />
                          )}
                        </div>

                        {/* Allocation Color Labels Row */}
                        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[9.5px] font-medium text-stone-500 font-sans leading-none pt-0.5">
                          {fhRepayment > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded bg-indigo-500 inline-block"></span>
                              <span>FH: <span className="font-mono text-[9px] font-bold text-stone-750">${Math.round(fhRepayment)}/wk</span></span>
                            </div>
                          )}
                          {fernRepayment > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded bg-teal-500 inline-block"></span>
                              <span>Fern St: <span className="font-mono text-[9px] font-bold text-stone-750">${Math.round(fernRepayment)}/wk</span></span>
                            </div>
                          )}
                          {nbRepayment > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded bg-purple-600 inline-block"></span>
                              <span className="text-purple-900 font-bold">New Build: <span className="font-mono text-[9px]">${Math.round(nbRepayment)}/wk</span></span>
                            </div>
                          )}
                          {totalExpenseLoansPayment > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded bg-rose-500 inline-block"></span>
                              <span>Extra Loans: <span className="font-mono text-[9px] font-bold text-stone-750">${Math.round(totalExpenseLoansPayment)}/wk</span></span>
                            </div>
                          )}
                          {finalWeeklySavings > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded bg-sky-500 inline-block"></span>
                              <span>Vol Savings: <span className="font-mono text-[9px] font-bold text-stone-750">${Math.round(finalWeeklySavings)}/wk</span></span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="w-2 h-2 rounded bg-emerald-400 inline-block"></span>
                            <span className="text-emerald-800 font-bold">Uncommitted Net Buffer: <span className="font-mono text-[9px]">${Math.round(netCashSurplus)}/wk</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Warnings / Insights Row */}
                      {netCashSurplus < 0 ? (
                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-100/60 p-2.5 text-[10px] text-rose-850 rounded font-sans leading-relaxed">
                          <Icons.Warning className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-rose-950">Attention Needed:</strong> Your current budget setup leads to a net cash flow deficit of <span className="font-mono font-extrabold text-rose-900">${Math.abs(Math.round(netCashSurplus))}/week</span> after voluntary savings. Consider reducing your custom post-build weekly savings contribution (`${finalWeeklySavings}/wk`) or scheduling a larger offset draw contribution ratio to scale down the formed build mortgage.
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 bg-emerald-50/70 border border-emerald-100/40 p-2.5 text-[10px] text-emerald-850 rounded font-sans leading-relaxed">
                          <Icons.CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-emerald-950">Comfortable Cushion Secured:</strong> You retain <span className="font-mono font-extrabold text-emerald-950">${Math.round(netCashSurplus)}/week</span> in uncommitted excess cash flow buffer AFTER accounting for contractual repayments, custom post-build lifestyle savings pool allocations, and the new construction mortgage payments!
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* SECTION: Impact on Finances in the Future */}
              <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
                <div>
                  <h3 className="text-lg font-bold text-blue-900 font-serif">
                    Financial Impact Analysis & Comparison
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-serif">
                    Double-bonded comparison: Models the standard baseline portfolio net debt trajectory against the active custom scenario with future draws or income streams.
                  </p>
                </div>

                {/* TRAJECTORY COMPARISON GRAPH */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-serif font-bold text-blue-950 mb-3 justify-end leading-none print:hidden">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-rose-500 inline-block" style={{ borderBottom: "1.5px dashed #f43f5e" }}></span>
                      <span className="text-rose-700 font-extrabold">Baseline Net Debt (No Inc/Exp)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-teal-600 inline-block"></span>
                      <span className="text-teal-800 font-extrabold">Active Net Debt (With Inc/Exp)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-indigo-500 inline-block"></span>
                      <span>FH Loan Principal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-indigo-300 inline-block" style={{ borderBottom: "1.5px dashed #a5b4fc" }}></span>
                      <span>FH Offset</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span>
                      <span>Fern St Loan Principal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-emerald-300 inline-block" style={{ borderBottom: "1.5px dashed #6ee7b7" }}></span>
                      <span>Fern St Offset</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span>
                      <span>New Loans Principal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-amber-300 inline-block" style={{ borderBottom: "1.5px dashed #fcd34d" }}></span>
                      <span>New Loans Offset</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5" style={{ borderBottom: "1.5px solid #7e22ce" }}></span>
                      <span className="text-purple-700 font-extrabold">New Build Loan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5" style={{ borderBottom: "1.5px dashed #a855f7" }}></span>
                      <span className="text-purple-500 font-extrabold">New Build Offset</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-cyan-500 inline-block" style={{ borderBottom: "1.5px dashed #06b6d4" }}></span>
                      <span className="text-cyan-600">Extra Cash Savings</span>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 800 280"
                    className="w-full h-auto overflow-visible select-none"
                  >
                    {(() => {
                      if (!finances.simulationData || finances.simulationData.length === 0) return null;

                      // Calculate safe maximum bounds considering individual loans, offsets, cash savings, and net debts
                      const rawMaxDataVal = Math.max(
                        1000000,
                        ...finances.simulationData.map((d: any) => Math.max(
                          d.loanFH || 0,
                          d.offsetFH || 0,
                          d.loanFern || 0,
                          d.offsetFern || 0,
                          d.newBuildLoan || 0,
                          d.newBuildOffset || 0,
                          d.newLoansPayable || 0,
                          d.newLoansOffset || 0,
                          d.extraCashSavings || 0,
                          Math.max(0, d.netDebt || 0)
                        )),
                        ...(finances.baselineSimulationData || []).map((d: any) => Math.max(0, d.netDebt || 0))
                      ) || 1200000;

                      // Scalable maximum for the y-axis capped at $2M
                      const maxDataVal = Math.min(2000000, rawMaxDataVal);

                      // Make clean rounding steps for cleaner lines
                      const yStep = maxDataVal >= 1500000 ? 500000 : maxDataVal > 800000 ? 250000 : 200000;
                      const yMax = Math.min(2000000, Math.ceil(maxDataVal / yStep) * yStep);

                      const yTicks = [];
                      for (let val = 0; val <= yMax; val += yStep) {
                        yTicks.push(val);
                      }

                      const getX = (d: any) => 60 + ((d.week ?? (parseFloat(d.year) * 52)) / (30 * 52)) * 700;
                      const getY = (val: number) => 240 - (Math.min(yMax, Math.max(0, val)) / yMax) * 200;

                      let fhLoanPoints = "";
                      let fhOffsetPoints = "";
                      let fernLoanPoints = "";
                      let fernOffsetPoints = "";
                      let newBuildLoanPoints = "";
                      let newBuildOffsetPoints = "";
                      let newLoansLoanPoints = "";
                      let newLoansOffsetPoints = "";
                      let extraSavingsPoints = "";
                      let activeNetDebtPoints = "";
                      let baselineNetDebtPoints = "";

                      finances.simulationData.forEach((d: any) => {
                        const x = getX(d);

                        fhLoanPoints += `${x.toFixed(2)},${getY(d.loanFH || 0).toFixed(2)} `;
                        fhOffsetPoints += `${x.toFixed(2)},${getY(d.offsetFH || 0).toFixed(2)} `;

                        fernLoanPoints += `${x.toFixed(2)},${getY(d.loanFern || 0).toFixed(2)} `;
                        fernOffsetPoints += `${x.toFixed(2)},${getY(d.offsetFern || 0).toFixed(2)} `;

                        newBuildLoanPoints += `${x.toFixed(2)},${getY(d.newBuildLoan || 0).toFixed(2)} `;
                        newBuildOffsetPoints += `${x.toFixed(2)},${getY(d.newBuildOffset || 0).toFixed(2)} `;

                        newLoansLoanPoints += `${x.toFixed(2)},${getY(d.newLoansPayable || 0).toFixed(2)} `;
                        newLoansOffsetPoints += `${x.toFixed(2)},${getY(d.newLoansOffset || 0).toFixed(2)} `;

                        extraSavingsPoints += `${x.toFixed(2)},${getY(d.extraCashSavings || 0).toFixed(2)} `;

                        activeNetDebtPoints += `${x.toFixed(2)},${getY(Math.max(0, d.netDebt || 0)).toFixed(2)} `;
                      });

                      if (finances.baselineSimulationData) {
                        finances.baselineSimulationData.forEach((bd: any) => {
                          const x = getX(bd);
                          baselineNetDebtPoints += `${x.toFixed(2)},${getY(Math.max(0, bd.netDebt || 0)).toFixed(2)} `;
                        });
                      }

                      // We have exactly 30 years in simulation
                      const xTicks = [0, 5, 10, 15, 20, 25, 30];

                      return (
                        <g>
                          {/* Y-Axis lines at rounded intervals */}
                          {yTicks.map((tick) => {
                            const y = getY(tick);
                            const isBaseline = tick === 0;
                            return (
                              <g key={tick}>
                                <line
                                  x1="60"
                                  y1={y}
                                  x2="760"
                                  y2={y}
                                  stroke={isBaseline ? "#94a3b8" : "#e2e8f0"}
                                  strokeWidth={isBaseline ? "1.5" : "1"}
                                  strokeDasharray={isBaseline ? "0" : "4 4"}
                                />
                                <text
                                  x="52"
                                  y={y + 3.5}
                                  textAnchor="end"
                                  className="fill-stone-500 font-mono text-[9px] font-medium"
                                >
                                  {tick === 0
                                    ? "$0"
                                    : tick >= 1000000
                                    ? `$${(tick / 1000000)
                                        .toFixed(2)
                                        .replace(/\.0+$/, "")}M`
                                    : `$${tick / 1000}k`}
                                </text>
                              </g>
                            );
                          })}

                          {/* X-Axis increments representing years up to 30 */}
                          {xTicks.map((yr) => {
                            const x = 60 + (yr / 30) * 700;
                            const calYear = 2026 + yr;
                            return (
                              <g key={yr}>
                                <line
                                  x1={x}
                                  y1={40}
                                  x2={x}
                                  y2={240}
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                  strokeDasharray="4 4"
                                />
                                <line
                                  x1={x}
                                  y1={240}
                                  x2={x}
                                  y2={245}
                                  stroke="#94a3b8"
                                  strokeWidth="1"
                                />
                                <text
                                  x={x}
                                  y={262}
                                  textAnchor="middle"
                                  className="font-serif text-[10px] font-semibold text-stone-600"
                                >
                                  Yr {yr} - {calYear}
                                </text>
                              </g>
                            );
                          })}

                          {/* Baseline Net Debt Trajectory (No Future Expense/Income) */}
                          <polyline
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            points={baselineNetDebtPoints}
                          />

                          {/* Active Net Debt Trajectory (With Future Expense/Income) */}
                          <polyline
                            fill="none"
                            stroke="#0d9488"
                            strokeWidth="3"
                            points={activeNetDebtPoints}
                          />

                          {/* Forever Home Loan Line */}
                          <polyline
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            points={fhLoanPoints}
                          />

                          {/* Forever Home Offset Line */}
                          <polyline
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            points={fhOffsetPoints}
                          />

                          {/* Fern Street Loan Line */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            points={fernLoanPoints}
                          />

                          {/* Fern Street Offset Line */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            points={fernOffsetPoints}
                          />

                          {/* New Build Loan Line */}
                          <polyline
                            fill="none"
                            stroke="#7e22ce"
                            strokeWidth="1.5"
                            points={newBuildLoanPoints}
                          />

                          {/* New Build Offset Line */}
                          <polyline
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            points={newBuildOffsetPoints}
                          />

                          {/* New Loans Loan Line */}
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            points={newLoansLoanPoints}
                          />

                          {/* New Loans Offset Line */}
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            points={newLoansOffsetPoints}
                          />

                          {/* Extra Cash Savings Line */}
                          <polyline
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            points={extraSavingsPoints}
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* THREE LEDGER MILESTONE COMPARATIVE CARDS */}
                {(() => {
                  // FIND NEW BUILD FULL OFFSET WEEK
                  const nbFullyOffsetItem = finances.simulationData.find(
                    (d: any) => d.newBuildLoan > 0 && d.newBuildOffset >= d.newBuildLoan
                  );
                  const nbFullyOffsetWeek = nbFullyOffsetItem ? nbFullyOffsetItem.week : -1;

                  // FIND NEW LOANS FULL OFFSET WEEK
                  const nlFullyOffsetItem = finances.simulationData.find(
                    (d: any) => d.newLoansPayable > 0 && d.newLoansOffset >= d.newLoansPayable
                  );
                  const nlFullyOffsetWeek = nlFullyOffsetItem ? nlFullyOffsetItem.week : -1;

                  // REMAINDER IN OFFSET AFTER BUILD DEDUCTION
                  const remainingOffsetAfterBuild = Math.max(0, finances.liquidOffsetAtBuild - finances.actualDrawFromOffsets);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* BOX 1: PORTFOLIO DEBT NEUTRALIZATION (ALL ACTIVE LOANS) */}
                      <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-150 shadow-sm flex flex-col justify-between space-y-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-900 block font-serif border-b border-blue-200/50 pb-1.5 mb-2">
                            Portfolio Debt Neutralization
                          </span>
                          <div className="text-xs font-serif leading-relaxed text-stone-700 space-y-2">
                            <div>
                              Status:{" "}
                              {finances.activeFullyOffsetWeek !== -1 ? (
                                <span className="text-emerald-700 font-extrabold font-sans">
                                  Achieved in {getMilestoneDateStr(finances.activeFullyOffsetWeek)}
                                </span>
                              ) : (
                                <span className="text-rose-700 font-bold font-sans">
                                  Not fully offset in 30 years
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-600">
                              When all mortgages and simulated loans in your active portfolio are 100% neutralized by offsets.
                              {finances.activeFullyOffsetWeek !== -1 ? (
                                ` This is projected to occur in Yr ${finances.activeFullyOffsetYears} under the current setting of $${Math.round(finances.effectiveWeeklySavings).toLocaleString()}/wk savings.`
                              ) : (
                                " Increasing your weekly savings rate or routing sale proceeds would pull this timeline forward."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BOX 2: NEW BUILD COMMENCEMENT STATS */}
                      <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-150 shadow-sm flex flex-col justify-between space-y-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-900 block font-serif border-b border-purple-200/50 pb-1.5 mb-2">
                            New Build Launch State
                          </span>
                          <div className="text-xs font-serif leading-relaxed text-stone-700 space-y-2">
                            <div>
                              Commencement:{" "}
                              <span className="text-purple-900 font-extrabold font-sans">
                                Yr {newBuildTiming} ({getMilestoneDateStr(Math.round(newBuildTiming * 52))})
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-stone-600">
                              <p>
                                • Loan drawn: <strong className="text-stone-800">${Math.round(finances.newBuildLoanAmount).toLocaleString()}</strong>
                              </p>
                              <p>
                                • Repayment rate: <strong className="text-purple-900">+${Math.round(finances.newBuildWeeklyPayment || 0)}/wk</strong>
                              </p>
                              <p>
                                • Buffer retained: <strong className="text-emerald-700">${Math.round(remainingOffsetAfterBuild).toLocaleString()}</strong> remaining in offsets of your <strong className="text-stone-800">${Math.round(finances.liquidOffsetAtBuild).toLocaleString()}</strong> cash reserve.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BOX 3: INDIVIDUAL OFFSET MILESTONES */}
                      <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-150 shadow-sm flex flex-col justify-between space-y-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-900 block font-serif border-b border-emerald-200/50 pb-1.5 mb-2 font-bold font-bold">
                            Loan Neutrality Target Dates
                          </span>
                          <div className="text-[11px] font-sans leading-relaxed text-stone-600 space-y-1.5">
                            <div className="flex justify-between border-b border-dashed border-stone-200/60 pb-1 font-serif">
                              <span>Forever Home:</span>
                              <strong className="text-stone-800">
                                {finances.fhNeutralizedWeek !== -1
                                  ? `${getMilestoneDateStr(finances.fhNeutralizedWeek)} (Yr ${finances.fhOffsetYears})`
                                  : "30+ Years"}
                              </strong>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-stone-200/60 pb-1 font-serif">
                              <span>Fern Street:</span>
                              <strong className="text-stone-800">
                                {finances.bothNeutralizedWeek !== -1
                                  ? `${getMilestoneDateStr(finances.bothNeutralizedWeek)} (Yr ${finances.bothOffsetYears})`
                                  : "30+ Years"}
                              </strong>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-stone-200/60 pb-1 font-serif">
                              <span>New Build:</span>
                              <strong className="text-stone-800">
                                {nbFullyOffsetWeek !== -1
                                  ? `${getMilestoneDateStr(nbFullyOffsetWeek)} (Yr ${(nbFullyOffsetWeek / 52).toFixed(1)})`
                                  : "Not offset / No build"}
                              </strong>
                            </div>
                            {nlFullyOffsetWeek !== -1 && (
                              <div className="flex justify-between border-b border-dashed border-stone-200/60 pb-1 font-serif">
                                <span>Other Loans:</span>
                                <strong className="text-stone-800">
                                  {getMilestoneDateStr(nlFullyOffsetWeek)} (Yr {(nlFullyOffsetWeek / 52).toFixed(1)})
                                </strong>
                              </div>
                            )}
                            <div className="flex justify-between font-serif pt-1 bg-teal-150/20 px-1 border border-teal-200 rounded font-bold">
                              <span>Portfolio Freedom:</span>
                              <span className="text-teal-900">
                                {finances.activeFullyOffsetWeek !== -1
                                  ? `${getMilestoneDateStr(finances.activeFullyOffsetWeek)} (Yr ${finances.activeFullyOffsetYears})`
                                  : "30+ Years"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Trajectory comparison grid */}
                <div className="border-t border-stone-150 pt-4">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5 font-serif">
                    Comparative Trajectory Snapshot (Selected Year Milestones)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-[10px] font-mono leading-normal">
                    {(() => {
                      const getMilestoneAtYear = (arr: any[], targetYr: number) => {
                        if (!arr || arr.length === 0) return null;
                        const targetWeek = targetYr * 52;
                        return arr.find((d: any) => d.week >= targetWeek) || arr[arr.length - 1];
                      };

                      const activeMilestones = [
                        getMilestoneAtYear(finances.simulationData, 0),
                        getMilestoneAtYear(finances.simulationData, 5),
                        getMilestoneAtYear(finances.simulationData, 10),
                        getMilestoneAtYear(finances.simulationData, 15),
                        getMilestoneAtYear(finances.simulationData, 20),
                        getMilestoneAtYear(finances.simulationData, 25),
                        getMilestoneAtYear(finances.simulationData, 30),
                      ].filter(Boolean);

                      const baselineMilestones = [
                        getMilestoneAtYear(finances.baselineSimulationData, 0),
                        getMilestoneAtYear(finances.baselineSimulationData, 5),
                        getMilestoneAtYear(finances.baselineSimulationData, 10),
                        getMilestoneAtYear(finances.baselineSimulationData, 15),
                        getMilestoneAtYear(finances.baselineSimulationData, 20),
                        getMilestoneAtYear(finances.baselineSimulationData, 25),
                        getMilestoneAtYear(finances.baselineSimulationData, 30),
                      ].filter(Boolean);

                      return activeMilestones.map((item: any, idx: number) => {
                        const base = baselineMilestones[idx] || { netDebt: 0 };
                        const yearNum = Math.round(item.week / 52);
                        return (
                          <div key={idx} className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg space-y-1">
                            <span className="font-serif font-bold text-stone-500 block text-[9px]">Yr {yearNum} Net Debt</span>
                            <div className="text-[9px] text-stone-400">
                              Base: ${base.netDebt.toLocaleString()}
                            </div>
                            <div className="font-bold text-indigo-950 font-sans text-[10.5px]">
                              Active: ${item.netDebt.toLocaleString()}
                            </div>
                            <div className={`text-[8.5px] font-bold ${item.netDebt > base.netDebt ? "text-rose-700" : item.netDebt < base.netDebt ? "text-emerald-700" : "text-stone-400"}`}>
                              {item.netDebt > base.netDebt
                                ? `+$${Math.abs(item.netDebt - base.netDebt).toLocaleString()}`
                                : item.netDebt < base.netDebt
                                ? `-$${Math.abs(base.netDebt - item.netDebt).toLocaleString()}`
                                : "±0"}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 font-serif leading-relaxed italic text-center pt-2">
                  * All simulated secondary income streams (cattle leases, custom agistment yields) are subjected to a standard capital taxation haircut of 15% which is clearly shown in small writing underneath and fully dynamically computed inside your visual portfolio models above.
                </div>
              </section>

              {/* SECTION: MONEY OVERVIEW */}
              <section className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm print-card space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Icons.Dollar className="w-5 h-5 text-blue-900" />
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider font-serif">
                      Money Overview — Portfolio Mortgages & Net Wealth Tracker
                    </h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-705 px-2 py-1 rounded font-medium font-sans border border-slate-200">
                    Simulation Horizon: 30 Years (1560 Weeks)
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-serif">
                  Underneath target metrics, this section reconciles long-term mortgage amortizations with asset growth to calculate total interest, contractual timelines, and portfolio net wealth. Property values are projected dynamically using a conservative <strong>5.0% annual compound growth rate</strong> on top of custom build investments.
                </p>

                {/* BOXES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* BOX 1: FOREVER HOME MORTGAGE */}
                  <div className="bg-gradient-to-br from-purple-50/50 to-white border border-purple-100 p-4 rounded-xl shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full -mr-6 -mt-6 -z-10 opacity-60"></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-purple-800 font-sans block mb-1">
                        Mortgage A (Forever Home)
                      </span>
                      <span className="font-serif font-bold text-stone-800 text-[13px] block">
                        Forever Home Residence
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs font-serif leading-relaxed text-stone-700">
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Repayment:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          ${Math.round(finances.recastWeeklyPayment).toLocaleString()}/wk
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Timeline Start:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          Day 1 (Yr 0)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Fully Offset:</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          {finances.fhNeutralizedWeek !== -1 ? `Yr ${(finances.fhNeutralizedWeek / 52).toFixed(1)}` : "30+ Years"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Fully Paid Off:</span>
                        <span className="font-semibold text-blue-900 font-mono">
                          {finances.fhPaidOffWeek !== -1 ? `Yr ${(finances.fhPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Total Interest Paid:</span>
                        <span className="font-bold text-amber-700 font-mono">
                          ${Math.round(finances.fhTotalInterestPaidSim).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-purple-100/50 pt-2.5 mt-2 flex justify-between items-center bg-purple-50/40 px-2 py-1.5 rounded-lg">
                      <span className="text-[10px] text-purple-950 font-bold font-sans uppercase">Total paid back:</span>
                      <span className="font-mono text-xs font-bold text-purple-900">
                        ${Math.round(finances.fhTotalPaidSim).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* BOX 2: FERN ST HOLIDAY HOUSE */}
                  <div className="bg-gradient-to-br from-cyan-50/50 to-white border border-cyan-100 p-4 rounded-xl shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-50 rounded-full -mr-6 -mt-6 -z-10 opacity-60"></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-800 font-sans block mb-1">
                        Mortgage B (Fern St)
                      </span>
                      <span className="font-serif font-bold text-stone-800 text-[13px] block">
                        Fern St Holiday House
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-serif leading-relaxed text-stone-700">
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Repayment:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          ${Math.round(finances.fernWeeklyPayment).toLocaleString()}/wk
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Timeline Start:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          Pre-existing
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Fully Offset:</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          {finances.fernNeutralizedWeek !== -1 ? `Yr ${(finances.fernNeutralizedWeek / 52).toFixed(1)}` : "30+ Years"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Fully Paid Off:</span>
                        <span className="font-semibold text-blue-900 font-mono">
                          {finances.fernPaidOffWeek !== -1 ? `Yr ${(finances.fernPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-1">
                        <span className="text-stone-500">Total Interest Paid:</span>
                        <span className="font-bold text-amber-700 font-mono">
                          ${Math.round(finances.fernTotalInterestPaidSim).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-cyan-100/50 pt-2.5 mt-2 flex justify-between items-center bg-cyan-50/40 px-2 py-1.5 rounded-lg font-sans">
                      <span className="text-[10px] text-cyan-955 font-bold uppercase">Total paid back:</span>
                      <span className="font-mono text-xs font-bold text-cyan-900">
                        ${Math.round(finances.fernTotalPaidSim).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* BOX 3: NEW BUILD */}
                  <div className="bg-gradient-to-br from-amber-50/50 to-white border border-amber-100 p-4 rounded-xl shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full -mr-6 -mt-6 -z-10 opacity-60"></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 font-sans block mb-1">
                        Mortgage C (New Build)
                      </span>
                      <span className="font-serif font-bold text-stone-800 text-[13px] block">
                        Proposed New Construction
                      </span>
                    </div>

                    {newBuildSpend > 0 ? (
                      <div className="space-y-1.5 text-xs font-serif leading-relaxed text-stone-700">
                        <div className="flex justify-between border-b border-stone-50 pb-1">
                          <span className="text-stone-500">Repayment:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            ${Math.round(finances.newBuildWeeklyPayment).toLocaleString()}/wk
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-1">
                          <span className="text-stone-500">Timeline Start:</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            Yr {newBuildTiming} ({Math.round(newBuildTiming * 12)}m)
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-1">
                          <span className="text-stone-500">Fully Offset:</span>
                          <span className="font-semibold text-emerald-700 font-mono">
                            {finances.nbFullyOffsetWeek !== -1 ? `Yr ${(finances.nbFullyOffsetWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-1">
                          <span className="text-stone-500">Fully Paid Off:</span>
                          <span className="font-semibold text-blue-900 font-mono">
                            {finances.nbPaidOffWeek !== -1 ? `Yr ${(finances.nbPaidOffWeek / 52).toFixed(1)}` : "30+ Years"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-stone-50 pb-1">
                          <span className="text-stone-550 mr-1 text-stone-500">Total Interest Paid:</span>
                          <span className="font-bold text-amber-700 font-mono">
                            ${Math.round(finances.nbTotalInterestPaidSim).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-stone-500 text-xs py-3 leading-relaxed font-serif text-center italic">
                        New Build inactive.<br />
                        Set custom budget above to activate this mortgage tracker box.
                      </div>
                    )}

                    <div className="border-t border-amber-100/50 pt-2.5 mt-2 flex justify-between items-center bg-amber-50/40 px-2 py-1.5 rounded-lg font-sans">
                      <span className="text-[10px] text-amber-955 font-bold uppercase">Total paid back:</span>
                      <span className="font-mono text-xs font-bold text-amber-900">
                        {newBuildSpend > 0 ? `$${Math.round(finances.nbTotalPaidSim).toLocaleString()}` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* BOX 4: PORTFOLIO SUMMARY (FAR RIGHT) */}
                  <div className="bg-gradient-to-br from-emerald-600 to-indigo-950 p-4 rounded-xl shadow-md text-white space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-25"></div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200 block mb-1 font-sans">
                        Consolidated Overview
                      </span>
                      <span className="font-serif font-bold text-[14px] block">
                        Portfolio Totals (Banks)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-serif leading-relaxed">
                      <div className="flex justify-between border-b border-white/20 pb-1">
                        <span className="text-emerald-100">Total Active Loans:</span>
                        <span className="font-bold font-mono">
                          {newBuildSpend > 0 ? "3 Contracts" : "2 Contracts"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/20 pb-1">
                        <span className="text-emerald-100">Total Interest Paid:</span>
                        <span className="font-bold text-amber-300 font-mono text-[12.5px]">
                          ${Math.round(finances.fhTotalInterestPaidSim + finances.fernTotalInterestPaidSim + (newBuildSpend > 0 ? finances.nbTotalInterestPaidSim : 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-2 mt-1 font-serif">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-100 block mb-1 font-sans">
                        Sum of All Back-Payments
                      </span>
                      <div className="text-xl font-bold leading-none tracking-tight font-mono text-emerald-200">
                        ${Math.round(finances.fhTotalPaidSim + finances.fernTotalPaidSim + (newBuildSpend > 0 ? finances.nbTotalPaidSim : 0)).toLocaleString()}
                      </div>
                      <span className="text-[8px] text-emerald-300 italic block mt-0.5">
                        Principal + Interest over 30 yrs
                      </span>
                    </div>
                  </div>

                </div>

                {/* NET WEALTH TRACKER GRAPH */}
                <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-150 pb-2.5 gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest font-serif flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                        Net Wealth Tracker Line Graph
                      </h4>
                      <p className="text-[10px] text-stone-500 font-serif mt-1">
                        Aggregates projected property values (with 5% compound growth) + cash/offset savings balances, minus active mortgage debts over time.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-sans font-semibold text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 bg-cyan-500 rounded-xs inline-block"></span>
                        <span>Active Portfolio Net Wealth</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 border-t border-dashed border-stone-400 inline-block"></span>
                        <span>Baseline Scenario</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG RENDERING */}
                  <div className="relative pt-2">
                    <svg viewBox="0 0 800 280" className="w-full h-auto overflow-visible select-none">
                      {(() => {
                        const data = finances.simulationData;
                        const baseData = finances.baselineSimulationData;
                        if (!data || data.length === 0) return null;

                        const maxActive = Math.max(...data.map(d => d.netWealth ?? 0));
                        const maxBase = Math.max(...baseData.map(d => d.netWealth ?? 0));
                        const maxVal = Math.max(maxActive, maxBase, 4000000);

                        const yMax = Math.ceil(maxVal / 1000000) * 1000000;
                        const step = yMax >= 8000000 ? 2000000 : 1000000;
                        const yTicks: number[] = [];
                        for (let val = 0; val <= yMax; val += step) {
                          yTicks.push(val);
                        }

                        const getX = (d: any) => 70 + ((d.week ?? (parseFloat(d.year) * 52)) / (30 * 52)) * 690;
                        const getY = (val: number) => 230 - (val / yMax) * 190;

                        let activePoints = "";
                        let basePoints = "";

                        data.forEach((d) => {
                          const x = getX(d);
                          activePoints += `${x.toFixed(1)},${getY(d.netWealth ?? 0).toFixed(1)} `;
                        });

                        baseData.forEach((d) => {
                          const x = getX(d);
                          basePoints += `${x.toFixed(1)},${getY(d.netWealth ?? 0).toFixed(1)} `;
                        });

                        const yearTicks = [0, 5, 10, 15, 20, 25, 30];

                        return (
                          <g>
                            {/* Grid / Y-axis labels */}
                            {yTicks.map(tick => {
                              const y = getY(tick);
                              const isZero = tick === 0;
                              return (
                                <g key={tick}>
                                  <line
                                    x1="70"
                                    y1={y}
                                    x2="760"
                                    y2={y}
                                    stroke={isZero ? "#78716c" : "#e7e5e4"}
                                    strokeWidth={isZero ? "1.5" : "1"}
                                    strokeDasharray={isZero ? "0" : "4 4"}
                                  />
                                  <text
                                    x="60"
                                    y={y + 3.5}
                                    textAnchor="end"
                                    className="fill-stone-500 font-mono text-[9px] font-semibold"
                                  >
                                    {tick === 0 ? "$0" : `$${(tick / 1000000).toFixed(0)}M`}
                                  </text>
                                </g>
                              );
                            })}

                            {/* X-axis labels */}
                            {yearTicks.map(yr => {
                              const x = 70 + (yr / 30) * 690;
                              const calYear = 2026 + yr;
                              return (
                                <g key={yr}>
                                  <line
                                    x1={x}
                                    y1={230}
                                    x2={x}
                                    y2={235}
                                    stroke="#78716c"
                                    strokeWidth="1.2"
                                  />
                                  <text
                                    x={x}
                                    y={252}
                                    textAnchor="middle"
                                    className="font-serif text-[10px] font-bold text-stone-600"
                                  >
                                    Yr {yr}
                                  </text>
                                  <text
                                    x={x}
                                    y={264}
                                    textAnchor="middle"
                                    className="font-mono text-[8px] text-stone-400"
                                  >
                                    ({calYear})
                                  </text>
                                </g>
                              );
                            })}

                            {/* Baseline Net Wealth Line */}
                            <polyline
                              fill="none"
                              stroke="#a8a29e"
                              strokeWidth="2"
                              strokeDasharray="6 4"
                              points={basePoints}
                            />

                            {/* Active Net Wealth Line */}
                            <polyline
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="3.2"
                              points={activePoints}
                            />

                            {/* Accent highlight markers on active trajectory */}
                            {yearTicks.map(yr => {
                              const d = data.find((pt: any) => pt.week >= yr * 52) || data[data.length - 1];
                              if (!d) return null;
                              
                              const x = getX(d);
                              const y = getY(d.netWealth ?? 0);
                              
                              return (
                                <g key={`marker-${yr}`}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4.5"
                                    fill="#ffffff"
                                    stroke="#0891b2"
                                    strokeWidth="2.5"
                                  />
                                  {/* Value label */}
                                  <rect
                                    x={x - 30}
                                    y={y - 21}
                                    width="60"
                                    height="14"
                                    rx="3"
                                    fill="#1e293b"
                                    className="shadow-md"
                                  />
                                  <text
                                    x={x}
                                    y={y - 11}
                                    textAnchor="middle"
                                    className="fill-white font-mono text-[8.5px] font-bold"
                                  >
                                    ${((d.netWealth ?? 0) / 1000000).toFixed(2)}M
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </section>
            </div>

            {/* PAULAN COURT SELL vs RENT TAB CONTENT */}
            <div className={`space-y-6 ${activeTab === "paulan" ? "block" : "hidden"}`}>
              {/* Elegant Header Banner */}
              <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-xl shadow-md border-b border-white/[0.08] relative overflow-hidden">
                <div className="relative z-10 space-y-2 font-serif">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest font-mono">
                    <Icons.Home className="w-4 h-4 text-emerald-400" />
                    <span>Investment Strategy Modeler</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                    Paulan Court: Sell vs. Rent Analysis
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm font-serif max-w-3xl leading-relaxed">
                    Compare the financial trajectory of selling Paulan Court at settlement to release liquid equity, versus keeping it as a long-term rental property with compounding capital growth and rental yields.
                  </p>
                </div>
              </section>

              {/* Strategy Selector Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Sell */}
                <button
                  onClick={() => handleInputChange("paulanStrategy", "sell")}
                  className={`p-6 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    inputs.paulanStrategy === "sell"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/30 shadow-md"
                      : "border-stone-200 bg-white hover:border-stone-300 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Strategy Option A</span>
                      <h4 className="text-lg font-serif font-bold text-slate-900">Sell Paulan Court (Default)</h4>
                      <p className="text-xs text-stone-500 font-serif leading-relaxed mt-1">
                        Sell the property for <span className="font-semibold text-stone-900">${inputs.paulanSalePrice.toLocaleString()}</span> at settlement. Outstanding mortgage of $381,446 is cleared, and the net proceeds are paid down/offset against the Forever Home to immediately reduce weekly outlays and interest.
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${inputs.paulanStrategy === "sell" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Option B: Rent */}
                <button
                  onClick={() => handleInputChange("paulanStrategy", "rent")}
                  className={`p-6 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    inputs.paulanStrategy === "rent"
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/30 shadow-md"
                      : "border-stone-200 bg-white hover:border-stone-300 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Strategy Option B</span>
                      <h4 className="text-lg font-serif font-bold text-slate-900">Keep &amp; Rent Paulan Court</h4>
                      <p className="text-xs text-stone-500 font-serif leading-relaxed mt-1">
                        Retain the property and rent it out at <span className="font-semibold text-stone-900">${inputs.paulanWeeklyRent}/wk</span>. The $381,446 mortgage continues as a P&amp;I loan. Paulan's value grows over time as a capital asset, while rental yield offsets the mortgage repayments.
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${inputs.paulanStrategy === "rent" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Parameters / Sliders */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Property & Valuation Parameters */}
                  <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5">
                    <h4 className="font-bold text-sm text-stone-800 font-serif border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Icons.Settings className="w-4 h-4 text-emerald-800" />
                      <span>Property &amp; Valuation Parameters</span>
                    </h4>

                    {/* Paulan Market Value */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Estimated Property Value</span>
                        <span className="font-mono text-emerald-800 text-sm font-bold">
                          ${inputs.paulanSalePrice.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={500000}
                        max={1200000}
                        step={5000}
                        value={inputs.paulanSalePrice}
                        onChange={(e) => handleInputChange("paulanSalePrice", parseInt(e.target.value))}
                        className="w-full accent-emerald-800 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>Min: $500k</span>
                        <span>Max: $1.2M</span>
                      </div>
                    </div>

                    {/* Paulan preparation slider */}
                    <div className="space-y-1.5 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>{inputs.paulanStrategy === "rent" ? "Preparation & Styling Cost" : "Renovation & Preparation Budget"}</span>
                        <span className="font-mono text-emerald-800 text-sm font-bold">
                          ${inputs.paulanRenoCost.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30000}
                        step={1000}
                        value={inputs.paulanRenoCost}
                        onChange={(e) => handleInputChange("paulanRenoCost", parseInt(e.target.value))}
                        className="w-full accent-emerald-800 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>Min: $0</span>
                        <span>Max: $30k</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-serif mt-1">
                        {inputs.paulanStrategy === "rent" 
                          ? "Required capital outlays to prep the house for premium renters (defaults to $5,000, paid out of starting cash offset reserves)."
                          : "Upfront capital spent to maximize sales campaign result."}
                      </p>
                    </div>
                  </div>

                  {/* Rental Income & Holding Costs (displays when strategy is Rent) */}
                  <div className={`bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5 transition-all duration-200 ${inputs.paulanStrategy === "rent" ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
                    <h4 className="font-bold text-sm text-stone-800 font-serif border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Icons.Dollar className="w-4 h-4 text-emerald-800" />
                      <span>Rental Yield &amp; Outgoings</span>
                    </h4>

                    {/* Weekly Rent */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Weekly Rental Income</span>
                        <span className="font-mono text-emerald-800 text-sm font-bold">
                          ${inputs.paulanWeeklyRent}/wk
                        </span>
                      </div>
                      <input
                        type="range"
                        min={400}
                        max={1000}
                        step={10}
                        value={inputs.paulanWeeklyRent}
                        onChange={(e) => handleInputChange("paulanWeeklyRent", parseInt(e.target.value))}
                        className="w-full accent-emerald-800 cursor-pointer"
                        disabled={inputs.paulanStrategy !== "rent"}
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>Min: $400/w</span>
                        <span>Max: $1,000/w</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-serif italic mt-0.5">
                        Compounded annually at {inputs.annualInflationRate.toFixed(1)}% inflation to model rent rises.
                      </p>
                    </div>

                    {/* Weekly Expenses */}
                    <div className="space-y-1.5 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Weekly Holding Expenses</span>
                        <span className="font-mono text-emerald-800 text-sm font-bold">
                          ${inputs.paulanWeeklyExpenses}/wk
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={300}
                        step={5}
                        value={inputs.paulanWeeklyExpenses}
                        onChange={(e) => handleInputChange("paulanWeeklyExpenses", parseInt(e.target.value))}
                        className="w-full accent-emerald-800 cursor-pointer"
                        disabled={inputs.paulanStrategy !== "rent"}
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>Min: $0/w</span>
                        <span>Max: $300/w</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-serif mt-1">
                        Agent fees, landlord insurance, body corporate, maintenance, and rates.
                      </p>
                    </div>

                    {/* Annual Inflation Rate */}
                    <div className="space-y-1.5 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Inflation Adjustment Rate</span>
                        <span className="font-mono text-emerald-800 text-sm font-bold">
                          {inputs.annualInflationRate.toFixed(1)}% p.a.
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={6.0}
                        step={0.1}
                        value={inputs.annualInflationRate}
                        onChange={(e) => handleInputChange("annualInflationRate", parseFloat(e.target.value))}
                        className="w-full accent-emerald-800 cursor-pointer"
                        disabled={inputs.paulanStrategy !== "rent"}
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>Min: 0%</span>
                        <span>Max: 6%</span>
                      </div>
                    </div>
                  </div>

                  {/* Deferred Sale Strategy card (displays when strategy is Rent) */}
                  <div className={`bg-white border border-stone-200 p-5 rounded-xl shadow-sm space-y-5 transition-all duration-200 ${inputs.paulanStrategy === "rent" ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
                    <h4 className="font-bold text-sm text-stone-800 font-serif border-b border-stone-100 pb-2 flex items-center gap-2">
                      <Icons.Calendar className="w-4 h-4 text-emerald-800" />
                      <span>Deferred Sale Strategy</span>
                    </h4>

                    {/* Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-stone-700 block">Sell Paulan Court Later</span>
                        <p className="text-[10px] text-stone-400 font-serif">
                          Toggle whether to simulate selling the property after a defined period of renting.
                        </p>
                      </div>
                      <button
                        onClick={() => handleInputChange("paulanSellLater", !inputs.paulanSellLater)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${inputs.paulanSellLater ? 'bg-emerald-800' : 'bg-stone-200'}`}
                        disabled={inputs.paulanStrategy !== "rent"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inputs.paulanSellLater ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>

                    {inputs.paulanSellLater && (
                      <>
                        {/* Years held before sale slider */}
                        <div className="space-y-1.5 pt-3 border-t border-stone-100">
                          <div className="flex justify-between text-xs font-bold text-stone-700">
                            <span>Years Held Before Sale</span>
                            <span className="font-mono text-emerald-800 text-sm font-bold">
                              {inputs.paulanYearsBeforeSale ?? 10} Years
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={29}
                            step={1}
                            value={inputs.paulanYearsBeforeSale ?? 10}
                            onChange={(e) => handleInputChange("paulanYearsBeforeSale", parseInt(e.target.value))}
                            className="w-full accent-emerald-800 cursor-pointer"
                            disabled={inputs.paulanStrategy !== "rent"}
                          />
                          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                            <span>Min: 1 Yr</span>
                            <span>Max: 29 Yrs</span>
                          </div>
                        </div>

                        {/* Property growth rate slider */}
                        <div className="space-y-1.5 pt-3 border-t border-stone-100">
                          <div className="flex justify-between text-xs font-bold text-stone-700">
                            <span>Paulan Annual Growth Rate</span>
                            <span className="font-mono text-emerald-800 text-sm font-bold">
                              {(inputs.paulanGrowthRate ?? 5.0).toFixed(1)}% p.a.
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1.0}
                            max={10.0}
                            step={0.1}
                            value={inputs.paulanGrowthRate ?? 5.0}
                            onChange={(e) => handleInputChange("paulanGrowthRate", parseFloat(e.target.value))}
                            className="w-full accent-emerald-800 cursor-pointer"
                            disabled={inputs.paulanStrategy !== "rent"}
                          />
                          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                            <span>Min: 1%</span>
                            <span>Max: 10%</span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-serif leading-relaxed mt-1">
                            Compounding capital growth rate of the house value. Selling transaction fees (2.5%) are deducted and any surplus offsets and net proceeds are fully released into liquid reserves upon sale.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side: Projections & Analytical Comparison */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Key Financial Impact Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: Neutralization Milestone */}
                    <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Portfolio Settle Year</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-900 font-serif font-sans">Yr {finances.activeFullyOffsetYears}</span>
                        <span className="text-xs text-stone-500 font-serif">to pay off completely</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-serif leading-relaxed pt-1">
                        Global neutralization achieves complete debt elimination across all properties combined. 
                        {inputs.paulanStrategy === "sell" 
                          ? " Selling Paulan releases maximum initial cash, accelerating this outcome." 
                          : " Renting Paulan delays debt-neutrality but adds a high-value growth asset."}
                      </p>
                    </div>

                    {/* Card 2: Combined Loan Summary */}
                    <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono font-sans">Paulan Asset Equity</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-emerald-800 font-serif font-sans">
                          ${inputs.paulanStrategy === "rent" ? (inputs.paulanSalePrice - 381446).toLocaleString() : "$0"}
                        </span>
                        <span className="text-xs text-stone-500 font-serif">Initial Net Equity</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-serif leading-relaxed pt-1">
                        {inputs.paulanStrategy === "rent"
                          ? `Valued at $${inputs.paulanSalePrice.toLocaleString()} with a $381,446 P&I mortgage, initial LVR is ${(381446 / inputs.paulanSalePrice * 100).toFixed(0)}%.`
                          : "Property sold, 100% of the equity is deployed immediately to pay off the primary home."}
                      </p>
                    </div>
                  </div>

                  {/* Cash Flow Breakdown Box */}
                  <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm space-y-4">
                    <h4 className="font-bold text-base text-stone-900 font-serif border-b border-stone-100 pb-3 flex items-center gap-2">
                      <Icons.Dollar className="w-5 h-5 text-emerald-800" />
                      <span>{inputs.paulanStrategy === "rent" ? "Weekly Rental Cash Flow Dynamics" : "Financial Proceeds Summary"}</span>
                    </h4>

                    {inputs.paulanStrategy === "rent" ? (
                      <div className="space-y-4">
                        <p className="text-xs text-stone-500 font-serif leading-relaxed">
                          A detailed projection of initial weekly revenues, holding outlays, and financing costs under the 6.05% P&amp;I interest rate:
                        </p>

                        <div className="space-y-2.5 font-serif text-xs">
                          {/* Revenue */}
                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Weekly Gross Rental Income:</span>
                            <span className="font-mono text-emerald-700 font-bold">+${inputs.paulanWeeklyRent.toLocaleString()}/wk</span>
                          </div>

                          {/* Holding Outgoings */}
                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Weekly Property Expenses (Agent, Rates, Corp, Insurance):</span>
                            <span className="font-mono text-rose-700">-${inputs.paulanWeeklyExpenses.toLocaleString()}/wk</span>
                          </div>

                          {/* Mortgage Repayment */}
                          {(() => {
                            const rP = 0.0605 / 52;
                            const nP = 30 * 52;
                            const repayment = (381446 * rP * Math.pow(1 + rP, nP)) / (Math.pow(1 + rP, nP) - 1);
                            const netCashflow = inputs.paulanWeeklyRent - inputs.paulanWeeklyExpenses - repayment;

                            return (
                              <>
                                <div className="flex justify-between pb-2 border-b border-stone-100">
                                  <span className="text-stone-600">Weekly Mortgage Repayment (P&amp;I @ 6.05% on $381,446):</span>
                                  <span className="font-mono text-rose-700">-${Math.round(repayment).toLocaleString()}/wk</span>
                                </div>

                                <div className="bg-stone-50 p-3 rounded-lg border border-stone-150 flex justify-between items-center mt-4">
                                  <div>
                                    <span className="font-serif font-bold text-stone-900 block text-xs">Net Weekly Property Cash Flow</span>
                                    <span className="text-[10px] text-stone-400 font-normal font-sans">Revenues minus expenses and loan servicing</span>
                                  </div>
                                  <span className={`font-mono font-bold text-sm ${netCashflow >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                                    {netCashflow >= 0 ? "+" : ""}${netCashflow.toFixed(2)}/wk
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 text-xs font-serif leading-relaxed text-emerald-950 space-y-1.5">
                          <strong className="text-emerald-900 font-bold font-serif">💡 Long-Term Wealth Accumulation Note:</strong>
                          <p>
                            Renting creates dual benefits: <strong>Compounding Capital Growth</strong> (at 5% p.a., Paulan reaches ${(inputs.paulanSalePrice * Math.pow(1.05, 15) / 1000).toFixed(0)}k in 15 years) and <strong>Inflation-Indexed Rents</strong>. At Year 15, the rental income grows to approximately ${(inputs.paulanWeeklyRent * Math.pow(1 + inputs.annualInflationRate/100, 15)).toFixed(0)}/week, transforming Paulan into a powerful cash-flow engine.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-stone-500 font-serif leading-relaxed">
                          Immediate sale of Paulan Court releases maximum liquid funds to pay down the primary residential debt:
                        </p>

                        <div className="space-y-2.5 font-serif text-xs">
                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Contract Sale Price:</span>
                            <span className="font-mono text-emerald-800 font-bold">${inputs.paulanSalePrice.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Real Estate Agent Sell Commission &amp; Legals (2.5%):</span>
                            <span className="font-mono text-rose-700">-${Math.round(inputs.paulanSalePrice * 0.025).toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Preparation &amp; Reno Expenditures:</span>
                            <span className="font-mono text-rose-700">-${inputs.paulanRenoCost.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-stone-600">Discharge Outstanding Mortgage:</span>
                            <span className="font-mono text-rose-700">-$381,446</span>
                          </div>

                          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex justify-between items-center mt-4">
                            <div>
                              <span className="font-serif font-bold text-emerald-950 block text-xs">Net Cash Released at Settlement</span>
                              <span className="text-[10px] text-stone-400 font-normal font-sans">Paid directly into the Forever Home principal/offset</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-900 text-sm font-sans">
                              +${Math.round(inputs.paulanSalePrice * 0.975 - inputs.paulanRenoCost - 381446).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 text-xs font-serif leading-relaxed text-emerald-950 space-y-1.5">
                          <strong className="text-emerald-900 font-bold font-serif">💡 Interest Reduction Impact:</strong>
                          <p>
                            By injecting the net cash of over $600k into your primary mortgage immediately at settlement, you save approximately <strong>$36,000+ per year in interest outlays</strong>. This reduces your mandatory weekly payments and maximizes cash accumulation velocity.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div> {/* Closing Right Column */}
        </div> {/* Closing WORKSPACE MAIN GRID */}

        {/* SECTION 7: MULTIGENERATIONAL STUDY & INTEL NOTEBOOK */}
        <section className={`bg-stone-100/70 border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 print-card ${activeTab === "overview" ? "print:hidden" : ""}`}>
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <Icons.Book className="w-4 h-4 text-blue-900" />
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider font-serif">
              Calculation Background & Legal Logic
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] text-stone-500 leading-relaxed font-sans">
            <div className="bg-white border border-stone-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
              <span className="font-bold text-blue-950 font-serif block text-[11px]">
                1. Stamp Duty & Acquisition Friction
              </span>
              <p>
                Stamp duty is modeled at Victoria's primary residential sliding
                scale (approx. 5.5% of purchase price). Day 1 outlays include a
                $5,000 buffer for registration, transfer charges, legal fees,
                and conveyancing costs, which are automatically added to the Wait
                purchase price parameters.
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
              <span className="font-bold text-blue-955 text-blue-950 font-serif block text-[11px]">
                2. Concurrent Loan Mechanics
              </span>
              <p>
                Instead of a high-friction bridging loan requiring strict
                pre-settlement sale targets, the bank permits a concurrent
                mortgage of up to $1,500,000. This is supported by your elite
                gross household income, and allows you to hold both properties
                concurrently until Paulan Court is styled, campaigned, and sold.
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
              <span className="font-bold text-blue-955 text-blue-950 font-serif block text-[11px]">
                3. Offset vs. Recast Variation
              </span>
              <p>
                If cash is left in the offset (0% recast), the loan principal
                remains high, resulting in maximum weekly committed repayments.
                If recast (100% recast), the bank contractually amortizes the
                loan over the remaining 30-year term based on the lower net
                balance, dropping your weekly payment baseline.
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-3.5 rounded-lg space-y-1.5 shadow-sm">
              <span className="font-bold text-blue-955 text-blue-950 font-serif block text-[11px]">
                4. Centrelink Granny Flat Interest
              </span>
              <p>
                Meryl’s contribution of $600k is treated as a granny flat
                interest. Under Australian social security law, her life interest
                must be documented in writing, establishing her right to reside
                on the property. This ensures the transfer is not classified as
                a pension-reducing gift.
              </p>
            </div>
          </div>
        </section>

        {/* PRINT EXPORT */}
        <section className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm text-center space-y-3 no-print">
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="font-serif font-bold text-blue-900 text-sm">
              Export Stated Scenario Strategy Report
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed font-serif">
              Generates an executive PDF report containing your parallel Gantt
              timelines, recast loan structures, and 15-year simulation curves.
            </p>
            <button
              onClick={() => window.print()}
              className="bg-blue-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs px-6 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Print / Export Strategy PDF
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 mt-12 py-6 bg-white shadow-inner">
        <div className="max-w-[95vw] xl:max-w-[90vw] 2xl:max-w-[1700px] mx-auto px-6 text-center text-xs text-stone-400 font-serif font-medium">
          <p>
            © 2026 Forever Home Financial Modeler. Prepared for your property transition.
          </p>
        </div>
      </footer>
    </div>
  );
}
