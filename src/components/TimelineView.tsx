import React, { useState, useRef, useEffect } from "react";
import { PropertyInputs, PropertyScenario, ActiveInteraction } from "../types";
import { TIMELINE_KEYS, adjustInputs } from "../constants/defaults";

interface TimelineViewProps {
  inputs: PropertyInputs;
  setInputs: React.Dispatch<React.SetStateAction<PropertyInputs>>;
  timeline: any;
  finances: any;
  activeTab: string;
  isPaulanLinkedHovered: boolean;
  setIsPaulanLinkedHovered: (v: boolean) => void;
}

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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
);

const DragHandleIcon = () => (
  <div className="flex flex-col gap-0.5 px-1 cursor-ew-resize hover:bg-black/15 h-full justify-center items-center rounded select-none no-print">
    <span className="w-0.5 h-3 bg-slate-700"></span>
    <span className="w-0.5 h-3 bg-slate-700"></span>
  </div>
);

// Stated Financial Position as of May 27, 2026
const ACCOUNT_BALANCES = {
  paulansLoan: 381446,
  paulansOffset: 381456,
  fernLoan: 504000,
  fernOffset: 238374,
};

export function TimelineView({
  inputs,
  setInputs,
  timeline,
  finances,
  activeTab,
  isPaulanLinkedHovered,
  setIsPaulanLinkedHovered,
}: TimelineViewProps) {
  const [timelineScenarios, setTimelineScenarios] = useState<PropertyScenario[]>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v10_timeline");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          return list.map((sc: any) => ({
            name: sc.name,
            inputs: adjustInputs({
              merylStartDelay: sc.inputs.merylStartDelay ?? 0,
              merylPrepDays: sc.inputs.merylPrepDays ?? 60,
              merylCampaignDays: sc.inputs.merylCampaignDays ?? 30,
              merylSettleDays: sc.inputs.merylSettleDays ?? 60,
              fhStartDelay: sc.inputs.fhStartDelay ?? 19,
              fhSettleDays: sc.inputs.fhSettleDays ?? 107,
              renoDays: sc.inputs.renoDays ?? 3,
              moveDays: sc.inputs.moveDays ?? 10,
              paulanStartDelay: sc.inputs.paulanStartDelay ?? 139,
              paulanPrepDays: sc.inputs.paulanPrepDays ?? 14,
              paulanCampaignDays: sc.inputs.paulanCampaignDays ?? 28,
              paulanSettleDays: sc.inputs.paulanSettleDays ?? 42,
              merylRentingExtraDays: sc.inputs.merylRentingExtraDays ?? 14,
              gfiStartOffset: sc.inputs.gfiStartOffset ?? 30,
              merylRentStartOffset: sc.inputs.merylRentStartOffset ?? 0,
              purchasePrice: sc.inputs.purchasePrice ?? 1070000,
              stampDutyRate: sc.inputs.stampDutyRate ?? 5.5,
              interestRate: sc.inputs.interestRate ?? 6.05,
              weeklySavings: sc.inputs.weeklySavings ?? 1750,
              depletionPriorityToggle: sc.inputs.depletionPriorityToggle ?? "paulan",
              offsetBuffer: sc.inputs.offsetBuffer ?? 50000,
              paulanSalePrice: sc.inputs.paulanSalePrice ?? 740000,
              paulanRenoCost: sc.inputs.paulanRenoCost ?? 10000,
              merylSalePrice: sc.inputs.merylSalePrice ?? 730000,
              merylRenoCost: sc.inputs.merylRenoCost ?? 0,
              merylContribution: sc.inputs.merylContribution ?? 450000,
              internalVariationPct: sc.inputs.internalVariationPct ?? 100,
              fhRenoMovingCost: sc.inputs.fhRenoMovingCost ?? 10000,
              recastTriggerEvent: sc.inputs.recastTriggerEvent ?? "gfi",
              merylRentCostPerWeek: sc.inputs.merylRentCostPerWeek ?? 650,
              paulanOffsetPulled: sc.inputs.paulanOffsetPulled ?? 381456,
              fernOffsetPulled: sc.inputs.fernOffsetPulled ?? 238374,
              paulanStrategy: sc.inputs.paulanStrategy ?? "sell",
              paulanWeeklyRent: sc.inputs.paulanWeeklyRent ?? 600,
              paulanWeeklyExpenses: sc.inputs.paulanWeeklyExpenses ?? 150,
              annualInflationRate: sc.inputs.annualInflationRate ?? 3.0,
            }),
          }));
        }
      }
    } catch {
      // standard fallback
    }
    return [
      {
        name: "Sell Twin Ranges before Forever Settles",
        inputs: adjustInputs({
          merylStartDelay: 0,
          merylPrepDays: 60,
          merylCampaignDays: 30,
          merylSettleDays: 60,
          fhStartDelay: 19,
          fhSettleDays: 107,
          renoDays: 3,
          moveDays: 10,
          paulanStartDelay: 139,
          paulanPrepDays: 14,
          paulanCampaignDays: 28,
          paulanSettleDays: 42,
          merylRentingExtraDays: 14,
          gfiStartOffset: 30,
          merylRentStartOffset: 0,
          purchasePrice: 1070000,
          stampDutyRate: 5.5,
          interestRate: 6.05,
          weeklySavings: 1750,
          depletionPriorityToggle: "paulan",
          offsetBuffer: 50000,
          paulanSalePrice: 740000,
          paulanRenoCost: 10000,
          merylSalePrice: 730000,
          merylRenoCost: 0,
          merylContribution: 450000,
          internalVariationPct: 100,
          fhRenoMovingCost: 10000,
          recastTriggerEvent: "gfi",
          merylRentCostPerWeek: 650,
          paulanOffsetPulled: 381456,
          fernOffsetPulled: 238374,
          paulanStrategy: "sell",
          paulanWeeklyRent: 600,
          paulanWeeklyExpenses: 150,
          annualInflationRate: 3.0,
        }),
      },
      {
        name: "Moving House in Jan",
        inputs: adjustInputs({
          merylStartDelay: 0,
          merylPrepDays: 60,
          merylCampaignDays: 30,
          merylSettleDays: 60,
          fhStartDelay: 19,
          fhSettleDays: 107,
          renoDays: 3,
          moveDays: 10,
          paulanStartDelay: 139,
          paulanPrepDays: 14,
          paulanCampaignDays: 28,
          paulanSettleDays: 42,
          merylRentingExtraDays: 14,
          gfiStartOffset: 30,
          merylRentStartOffset: 0,
          purchasePrice: 1070000,
          stampDutyRate: 5.5,
          interestRate: 6.05,
          weeklySavings: 1750,
          depletionPriorityToggle: "paulan",
          offsetBuffer: 50000,
          paulanSalePrice: 740000,
          paulanRenoCost: 10000,
          merylSalePrice: 730000,
          merylRenoCost: 0,
          merylContribution: 450000,
          internalVariationPct: 100,
          fhRenoMovingCost: 10000,
          recastTriggerEvent: "gfi",
          merylRentCostPerWeek: 650,
          paulanOffsetPulled: 381456,
          fernOffsetPulled: 238374,
          paulanStrategy: "sell",
          paulanWeeklyRent: 600,
          paulanWeeklyExpenses: 150,
          annualInflationRate: 3.0,
        }),
      },
    ];
  });

  const [newTimelineScenarioName, setNewTimelineScenarioName] = useState("");
  const [activeInteraction, setActiveInteraction] = useState<ActiveInteraction | null>(null);
  const ganttContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v10_timeline", JSON.stringify(timelineScenarios));
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [timelineScenarios]);

  const handleInputChange = (field: keyof PropertyInputs, value: any) => {
    setInputs((prev) => {
      const next = { ...prev, [field]: value };
      return adjustInputs(next);
    });
  };

  const startGanttDrag = (
    e: any,
    field: keyof PropertyInputs,
    type: string
  ) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setActiveInteraction({
      type,
      field,
      startX: clientX,
      startVals: inputs,
    });
  };

  useEffect(() => {
    const handleGlobalMove = (e: any) => {
      if (!activeInteraction || !ganttContainerRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = ganttContainerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;

      const deltaX = clientX - activeInteraction.startX;
      const deltaDays = Math.round(
        (deltaX / containerWidth) * timeline.totalDurationDays
      );

      let updates: Partial<PropertyInputs> = {};

      if (activeInteraction.type === "dragStart") {
        const field = activeInteraction.field;
        const vals = activeInteraction.startVals;

        if (field === "merylPrepDays") {
          const proposedStart = Math.max(0, vals.merylStartDelay + deltaDays);
          const proposedDuration = Math.max(14, Math.min(180, vals.merylPrepDays - deltaDays));
          updates = {
            merylStartDelay: proposedStart,
            merylPrepDays: proposedDuration,
          };
        } else if (field === "merylCampaignDays") {
          const proposedPrep = Math.max(14, Math.min(180, vals.merylPrepDays + deltaDays));
          const proposedCampaign = Math.max(7, Math.min(90, vals.merylCampaignDays - deltaDays));
          updates = {
            merylPrepDays: proposedPrep,
            merylCampaignDays: proposedCampaign,
          };
        } else if (field === "merylSettleDays") {
          const proposedCampaign = Math.max(7, Math.min(90, vals.merylCampaignDays + deltaDays));
          const proposedSettle = Math.max(14, Math.min(120, vals.merylSettleDays - deltaDays));
          updates = {
            merylCampaignDays: proposedCampaign,
            merylSettleDays: proposedSettle,
          };
        } else if (field === "merylRentStartOffset") {
          const proposedOffset = vals.merylRentStartOffset + deltaDays;
          updates = {
            merylRentStartOffset: proposedOffset,
          };
        } else if (field === "fhSettleDays") {
          const proposedStart = Math.max(0, vals.fhStartDelay + deltaDays);
          const proposedDuration = Math.max(14, Math.min(120, vals.fhSettleDays - deltaDays));
          updates = {
            fhStartDelay: proposedStart,
            fhSettleDays: proposedDuration,
          };
        } else if (field === "renoDays") {
          const proposedSettle = Math.max(14, Math.min(120, vals.fhSettleDays + deltaDays));
          const proposedReno = Math.max(0, Math.min(90, vals.renoDays - deltaDays));
          updates = {
            fhSettleDays: proposedSettle,
            renoDays: proposedReno,
          };
        } else if (field === "moveDays") {
          const proposedReno = Math.max(0, Math.min(90, vals.renoDays + deltaDays));
          const proposedMove = Math.max(1, Math.min(30, vals.moveDays - deltaDays));
          updates = {
            renoDays: proposedReno,
            moveDays: proposedMove,
          };
        } else if (field === "paulanCampaignDays") {
          const proposedPrep = Math.max(1, Math.min(60, vals.paulanPrepDays + deltaDays));
          const proposedCampaign = Math.max(7, Math.min(90, vals.paulanCampaignDays - deltaDays));
          updates = {
            paulanPrepDays: proposedPrep,
            paulanCampaignDays: proposedCampaign,
          };
        } else if (field === "paulanSettleDays") {
          const proposedCampaign = Math.max(7, Math.min(90, vals.paulanCampaignDays + deltaDays));
          const proposedSettle = Math.max(14, Math.min(120, vals.paulanSettleDays - deltaDays));
          updates = {
            paulanCampaignDays: proposedCampaign,
            paulanSettleDays: proposedSettle,
          };
        }
      } else {
        const field = activeInteraction.field;
        const vals = activeInteraction.startVals;
        const startVal = vals[field] ?? 0;
        let newVal = startVal + deltaDays;
        if (field !== "merylRentStartOffset" && field !== "gfiStartOffset") {
          newVal = Math.max(0, newVal);
        } else {
          newVal = Math.max(-180, Math.min(250, newVal));
        }

        if (activeInteraction.type === "resize") {
          if (field === "merylPrepDays") newVal = Math.max(14, Math.min(180, newVal));
          if (field === "merylCampaignDays") newVal = Math.max(7, Math.min(90, newVal));
          if (field === "merylSettleDays") newVal = Math.max(14, Math.min(120, newVal));
          if (field === "fhSettleDays") newVal = Math.max(14, Math.min(120, newVal));
          if (field === "renoDays") newVal = Math.max(0, Math.min(90, newVal));
          if (field === "moveDays") newVal = Math.max(1, Math.min(30, newVal));
          if (field === "paulanPrepDays") newVal = Math.max(1, Math.min(60, newVal));
          if (field === "paulanCampaignDays") newVal = Math.max(7, Math.min(90, newVal));
          if (field === "paulanSettleDays") newVal = Math.max(14, Math.min(120, newVal));
          if (field === "merylRentingExtraDays") newVal = Math.max(0, Math.min(365, newVal));
        } else {
          newVal = Math.max(0, Math.min(250, newVal));
        }

        updates = {
          [field]: newVal,
        };
      }

      setInputs((prev) =>
        adjustInputs({
          ...prev,
          ...updates,
        })
      );
    };

    const handleGlobalUp = () => {
      setActiveInteraction(null);
    };

    if (activeInteraction) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalUp);
      window.addEventListener("touchmove", handleGlobalMove, { passive: false });
      window.addEventListener("touchend", handleGlobalUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [activeInteraction, timeline.totalDurationDays, setInputs]);

  const handleSaveTimelineScenario = () => {
    if (!newTimelineScenarioName.trim()) return;
    const name = newTimelineScenarioName.trim();
    const updated = [
      ...timelineScenarios.filter((s) => s.name !== name),
      { name, inputs },
    ];
    setTimelineScenarios(updated);
    setNewTimelineScenarioName("");
  };

  const handleLoadTimelineScenario = (scenario: PropertyScenario) => {
    setInputs((current) => {
      const updated = { ...current };
      (Object.keys(current) as (keyof PropertyInputs)[]).forEach((key) => {
        if (TIMELINE_KEYS.includes(key)) {
          (updated as any)[key] = scenario.inputs[key];
        }
      });
      return adjustInputs(updated);
    });
  };

  const handleDeleteTimelineScenario = (name: string) => {
    setTimelineScenarios((prev) => prev.filter((s) => s.name !== name));
  };

  const getGanttDateStr = (days: number) => {
    const d = new Date(2026, 4, 15); // May 15, 2026
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  return (
    <div className={`space-y-6 ${activeTab === "timeline" ? "block" : "hidden"} ${activeTab === "overview" ? "print:hidden" : "print:block"}`}>
      {/* SECTION 1: GANTT CHART SWIMLANES */}
      <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-blue-900 font-serif">
              Timeline
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-serif leading-relaxed">
              <strong>Drag any track's body left/right</strong> to shift delay
              offsets, or drag the right handle{" "}
              <span className="font-mono font-bold text-blue-900">||</span> to
              scale stage durations. You can slide events completely out of
              sequence to explore concurrent pathways.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 font-mono">
            Total Span:{" "}
            <span className="font-bold text-blue-900">
              {timeline.totalDurationDays} Days
            </span>
          </div>
        </div>

        {/* TIMELINE SCENARIOS CONTROLLER */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-900" />
              <span className="text-[11px] font-bold text-stone-750 uppercase tracking-wider font-serif">
                Save / Load Timeline Layouts
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <input
                type="text"
                placeholder="Layout Name (e.g. Early Settlement)"
                value={newTimelineScenarioName}
                onChange={(e) => setNewTimelineScenarioName(e.target.value)}
                className="border border-stone-300 rounded bg-white px-2.5 py-1 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-900 flex-1 sm:flex-initial"
              />
              <button
                onClick={handleSaveTimelineScenario}
                className="bg-blue-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs px-3.5 py-1 rounded transition shadow-sm cursor-pointer"
              >
                Save Layout
              </button>
            </div>
          </div>
          
          {/* Render Active Configurations with Load/Delete Controls */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-stone-500 font-serif italic text-[11px]">
              Select Layout:
            </span>
            {timelineScenarios.map((sc, sIdx) => {
              const isActive = TIMELINE_KEYS.every(
                (key) => sc.inputs[key] === inputs[key]
              );

              return (
                <div
                  key={sIdx}
                  className={`inline-flex items-center border rounded px-2.5 py-1 gap-1.5 transition-all ${
                    isActive 
                      ? "bg-blue-900 border-blue-900 text-white shadow-sm" 
                      : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <button
                    onClick={() => handleLoadTimelineScenario(sc)}
                    className="font-semibold transition text-[11px] cursor-pointer text-left text-inherit"
                  >
                    {sc.name}
                  </button>
                  <button
                    onClick={() => handleDeleteTimelineScenario(sc.name)}
                    className={`font-semibold ml-1.5 text-xs cursor-pointer ${
                      isActive ? "text-blue-200 hover:text-white" : "text-stone-400 hover:text-red-600"
                    }`}
                    title="Delete this layout"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* MONTH MATRIX */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative select-none">
          {/* MONTH HEADINGS */}
          <div className="flex w-full text-center border-b border-stone-300 pb-2 mb-4 font-serif text-[11px] font-bold text-blue-900">
            {timeline.monthAxis.map((m: any, idx: number) => (
              <div
                key={idx}
                style={{ width: `${m.weight}%` }}
                className="border-r border-stone-200 last:border-0 truncate px-1"
              >
                {m.name}
              </div>
            ))}
          </div>

          {/* MATRIX GRID LINES */}
          <div className="absolute inset-0 top-12 bottom-4 flex pointer-events-none">
            {timeline.monthAxis.map((m: any, idx: number) => (
              <div
                key={idx}
                style={{ width: `${m.weight}%` }}
                className="border-r border-stone-200/40 h-full border-dashed"
              ></div>
            ))}
          </div>

          {/* TIMELINE SWIMLANES */}
          <div
            ref={ganttContainerRef}
            className="space-y-6 relative z-10 py-1"
          >
            {/* SWIMLANE 1: MERYL'S TWIN RANGES SALE (GREEN THEME) */}
            <div className="space-y-2 border-b border-stone-200/60 pb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-900 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                  Swimlane A: Meryl's Twin Ranges Sale (Concludes:{" "}
                  {timeline.dates.merylSettle})
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[10px] text-stone-400">
                    Shift Delay:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="250"
                    value={inputs.merylStartDelay}
                    onChange={(e) =>
                      handleInputChange(
                        "merylStartDelay",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-10 text-center font-bold text-emerald-800 border border-stone-200 rounded bg-white py-0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Meryl Prep Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      1. Preparation (Twin Ranges House) - (
                      {getGanttDateStr(timeline.merylPrepStart)} -{" "}
                      {getGanttDateStr(timeline.merylPrepEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.merylPrepDays}
                        onChange={(e) =>
                          handleInputChange(
                            "merylPrepDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-emerald-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      className="bg-emerald-100 border-r-4 border-emerald-500 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-emerald-850 transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        marginLeft: `${
                          (timeline.merylPrepStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.merylPrepDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylPrepDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylPrepDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">
                        Prep (Ends: {timeline.dates.merylPrepEnd})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylPrepDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylPrepDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meryl Campaign & Sale Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      2. Twin Ranges Sale Campaign - (
                      {getGanttDateStr(timeline.merylCampaignStart)} -{" "}
                      {getGanttDateStr(timeline.merylCampaignEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="7"
                        max="180"
                        value={inputs.merylCampaignDays}
                        onChange={(e) =>
                          handleInputChange(
                            "merylCampaignDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-emerald-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      className="border-r-4 border-emerald-600 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: "#34d399",
                        marginLeft: `${
                          (timeline.merylCampaignStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.merylCampaignDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylCampaignDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylCampaignDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">
                        Listing Campaign (Contract:{" "}
                        {timeline.dates.merylContract})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylCampaignDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylCampaignDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meryl Settlement Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      3. Twin Ranges Settlement Period - (
                      {getGanttDateStr(timeline.merylSettleStart)} -{" "}
                      {getGanttDateStr(timeline.merylSettleEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="14"
                        max="180"
                        value={inputs.merylSettleDays}
                        onChange={(e) =>
                          handleInputChange(
                            "merylSettleDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-emerald-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "merylStartDelay", "shift")
                      }
                      className="border-r-4 border-emerald-950 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: "#047857",
                        marginLeft: `${
                          (timeline.merylSettleStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.merylSettleDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylSettleDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylSettleDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">
                        Settlement (Cash Injection:{" "}
                        {timeline.dates.merylSettle})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylSettleDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylSettleDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* GFI Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block font-sans"></span>
                      4. GFI - Granny Flat Investment Transfer - ({timeline.dates.gfiDate})
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-sans mr-1">Shift Offset:</span>
                      <input
                        type="number"
                        value={inputs.gfiStartOffset}
                        onChange={(e) =>
                          handleInputChange(
                            "gfiStartOffset",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-emerald-800 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-emerald-50/20 h-7 rounded-md border border-emerald-250/30 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "gfiStartOffset", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "gfiStartOffset", "shift")
                      }
                      className="border-r-4 border-emerald-800 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: "#16a34a",
                        marginLeft: `${
                          (timeline.gfiStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          Math.max(4.0, (1 / timeline.totalDurationDays) * 100)
                        }%`,
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none pl-1">
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pl-3 text-white">
                        GFI Contribution Received (${inputs.merylContribution.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meryl Renting Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span className="flex items-center gap-1 text-purple-700">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                      5. Meryl Renting Period (Temporary Lodging) - (
                      {getGanttDateStr(timeline.merylRentStart)} -{" "}
                      {getGanttDateStr(timeline.merylRentEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-sans mr-1">Extend rent by:</span>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.merylRentingExtraDays}
                        onChange={(e) =>
                          handleInputChange(
                            "merylRentingExtraDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-purple-800 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-purple-50/20 h-7 rounded-md border border-purple-200/40 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "merylRentStartOffset", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "merylRentStartOffset", "shift")
                      }
                      className="border-r-4 border-purple-600 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing opacity-90"
                      style={{
                        backgroundColor: "#a855f7",
                        marginLeft: `${
                          (Math.max(0, timeline.merylRentStart) /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (Math.max(1, timeline.merylRentEnd - Math.max(0, timeline.merylRentStart)) /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylRentStartOffset", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylRentStartOffset", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1 text-white">
                        Lodging Rental Period (~{Math.round(timeline.merylRentDays / 7)} Weeks)
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylRentingExtraDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "merylRentingExtraDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SWIMLANE 2: FOREVER HOME PURCHASE (BLUE THEME) */}
            <div className="space-y-2 border-b border-stone-200/60 pb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-900 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                  Swimlane B: Forever Home Purchase & Reno (Concludes:{" "}
                  {timeline.dates.moveEnd})
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[10px] text-stone-400">
                    Shift Delay:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="250"
                    value={inputs.fhStartDelay}
                    onChange={(e) =>
                      handleInputChange(
                        "fhStartDelay",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-10 text-center font-bold text-blue-800 border border-stone-200 rounded bg-white py-0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* FH Settle Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      1. Forever Home Settlement Duration - (
                      {getGanttDateStr(timeline.fhSettleStart)} -{" "}
                      {getGanttDateStr(timeline.fhSettleEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.fhSettleDays}
                        onChange={(e) =>
                          handleInputChange(
                            "fhSettleDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-blue-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      className="bg-blue-100 border-r-4 border-blue-500 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-blue-900 transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        marginLeft: `${
                          (timeline.fhContractSign /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.fhSettleDays / timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "fhSettleDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "fhSettleDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">
                        Contract to Settlement ({timeline.dates.fhSettle})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "fhSettleDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "fhSettleDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FH Reno Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      2. Post-Settlement Renovation Phase - (
                      {getGanttDateStr(timeline.renoStart)} -{" "}
                      {getGanttDateStr(timeline.renoEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.renoDays}
                        onChange={(e) =>
                          handleInputChange(
                            "renoDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-blue-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      className="border-r-4 border-blue-600 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: "#60a5fa",
                        marginLeft: `${
                          (timeline.renoStart / timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.renoDays / timeline.totalDurationDays) * 100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "renoDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "renoDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">Renovation Period</span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "renoDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "renoDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FH Move Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      3. Household Move-In Block - (
                      {getGanttDateStr(timeline.moveStart)} -{" "}
                      {getGanttDateStr(timeline.moveEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.moveDays}
                        onChange={(e) =>
                          handleInputChange(
                            "moveDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-blue-800 bg-white border border-stone-200 rounded py-0.5"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      onMouseDown={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      onTouchStart={(e) =>
                        startGanttDrag(e, "fhStartDelay", "shift")
                      }
                      className="border-r-4 border-blue-950 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative cursor-grab active:cursor-grabbing"
                      style={{
                        backgroundColor: "#1e3a8a",
                        marginLeft: `${
                          (timeline.moveStart / timeline.totalDurationDays) *
                          105 // Minor padding factor matching original
                        }%`,
                        width: `${
                          (inputs.moveDays / timeline.totalDurationDays) * 100
                        }%`,
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "moveDays", "dragStart");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "moveDays", "dragStart");
                        }}
                        className="absolute left-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                      <span className="truncate pr-1">
                        Move Complete ({timeline.dates.moveEnd})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "moveDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "moveDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SWIMLANE 3: PAULAN COURT SALE (RED/PINK/MAROON THEME) */}
            <div className={`space-y-2 pb-2 p-3.5 rounded-xl transition-all duration-300 ${
              isPaulanLinkedHovered 
                ? "bg-rose-50 border border-rose-300 shadow-sm ring-1 ring-rose-500/20" 
                : "border border-stone-100 bg-stone-50/20"
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-rose-900 font-bold flex items-center gap-1.5 font-serif">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-700 animate-pulse"></span>
                  <span className={isPaulanLinkedHovered ? "text-rose-900 font-extrabold" : "text-rose-900"}>
                    Swimlane C: Paulan Court Prep & Sale (Concludes: {timeline.dates.paulanSettle})
                  </span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                  <span className="text-[10px] font-sans font-semibold">🔗 Locked to B Move-out</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Paulan Prep Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      1. Staging & Styling (Paulan Court) - (
                      {getGanttDateStr(timeline.paulanPrepStart)} -{" "}
                      {getGanttDateStr(timeline.paulanPrepEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.paulanPrepDays}
                        onChange={(e) =>
                          handleInputChange(
                            "paulanPrepDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-rose-800 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      className="bg-pink-100 border-r-4 border-pink-400 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-pink-900 transition-all duration-75 relative"
                      style={{
                        marginLeft: `${
                          (timeline.paulanPrepStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.paulanPrepDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <span className="truncate pr-1">
                        Staging & Styling (Ends: {timeline.dates.paulanPrepEnd})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanPrepDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanPrepDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paulan Campaign Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      2. Marketing & Campaign Span - (
                      {getGanttDateStr(timeline.paulanCampaignStart)} -{" "}
                      {getGanttDateStr(timeline.paulanCampaignEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.paulanCampaignDays}
                        onChange={(e) =>
                          handleInputChange(
                            "paulanCampaignDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-rose-800 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      className="border-r-4 border-rose-500 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
                      style={{
                        backgroundColor: "#f43f5e",
                        marginLeft: `${
                          (timeline.paulanCampaignStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.paulanCampaignDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <span className="truncate pr-1 text-white">
                        Open Homes (Contract Date: {timeline.dates.paulanContract})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanCampaignDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanCampaignDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paulan Settle Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-semibold font-serif">
                    <span>
                      3. Sale Settlement (Proceeds Released) - (
                      {getGanttDateStr(timeline.paulanSettleStart)} -{" "}
                      {getGanttDateStr(timeline.paulanSettleEnd)})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={inputs.paulanSettleDays}
                        onChange={(e) =>
                          handleInputChange(
                            "paulanSettleDays",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center text-xs font-bold font-mono text-rose-800 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <span className="text-[10px] text-stone-500 font-sans">Days</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                    <div
                      className="border-r-4 border-rose-900 h-full flex items-center justify-between pl-[18px] pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
                      style={{
                        backgroundColor: "#9f1239",
                        marginLeft: `${
                          (timeline.paulanSettleStart /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                        width: `${
                          (inputs.paulanSettleDays /
                            timeline.totalDurationDays) *
                          100
                        }%`,
                      }}
                    >
                      <span className="truncate pr-1 text-white">
                        Paulan Sale Settlement ({timeline.dates.paulanSettle})
                      </span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanSettleDays", "resize");
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          startGanttDrag(e, "paulanSettleDays", "resize");
                        }}
                        className="absolute right-0 top-0 bottom-0 flex items-center"
                      >
                        <DragHandleIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRANSITION CONFIGURATION & METRICS */}
      <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Transition Inputs and Recast Trigger Selector */}
          <div className="lg:col-span-5 space-y-5">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-sans border-b border-stone-100 pb-1">
              Transition Cashflow Configuration
            </h4>
            
            {/* Meryl Weekly Rent */}
            <div className="p-3.5 bg-amber-50/20 border border-amber-200/40 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-700 font-serif">Meryl Out-of-Pocket Rent</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[10px] text-stone-400 font-sans">Cost:</span>
                  <span className="text-amber-800 font-bold">${inputs.merylRentCostPerWeek}/wk</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={inputs.merylRentCostPerWeek}
                onChange={(e) => handleInputChange("merylRentCostPerWeek", parseInt(e.target.value) || 0)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[10px] text-stone-400 font-sans leading-tight">
                Cost incurred during Meryl's temporary accommodation. Currently active for{" "}
                <strong className="text-amber-850 font-mono">{Math.round(timeline.merylRentDays / 7)} weeks</strong>{" "}
                (includes any extensions).
              </p>
            </div>

            {/* Recast Trigger selector */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider font-sans">
                  Mortgage Recast Trigger
                </span>
                <span className="text-[10px] font-sans bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                  Strategy Impact
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleInputChange("recastTriggerEvent", "day1")}
                  className={`flex items-start text-left p-2.5 border rounded-lg transition text-xs ${
                    inputs.recastTriggerEvent === "day1"
                      ? "bg-blue-50/80 border-blue-400 shadow-sm"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={inputs.recastTriggerEvent === "day1"}
                    readOnly
                    className="mt-0.5 mr-2 accent-blue-850"
                  />
                  <div>
                    <div className="font-bold text-blue-900 font-serif">Option A: Immediate recast (Day 1)</div>
                    <div className="text-[10px] text-stone-505 font-sans leading-normal mt-0.5">
                      Reduce principal right away using current surplus offsets. Maximizes interest savings but lowers liquid cushion reserves early.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange("recastTriggerEvent", "gfi")}
                  className={`flex items-start text-left p-2.5 border rounded-lg transition text-xs ${
                    inputs.recastTriggerEvent === "gfi"
                      ? "bg-emerald-50/80 border-emerald-400 shadow-sm"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={inputs.recastTriggerEvent === "gfi"}
                    readOnly
                    className="mt-0.5 mr-2 accent-emerald-850"
                  />
                  <div>
                    <div className="font-bold text-emerald-900 font-serif">Option B: Upon Twin Ranges Settlement</div>
                    <div className="text-[10px] text-stone-505 font-sans leading-normal mt-0.5">
                      Trigger recast after Meryl's Twin Ranges sale concludes & flat proceeds are deposited. Keeps buffers wider during pre-sale stress.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange("recastTriggerEvent", "paulan")}
                  className={`flex items-start text-left p-2.5 border rounded-lg transition text-xs ${
                    inputs.recastTriggerEvent === "paulan"
                      ? "bg-rose-50/80 border-rose-400 shadow-sm"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={inputs.recastTriggerEvent === "paulan"}
                    readOnly
                    className="mt-0.5 mr-2 accent-rose-850"
                  />
                  <div>
                    <div className="font-bold text-rose-900 font-serif">Option C: Double Settlement Concluded</div>
                    <div className="text-[10px] text-stone-505 font-sans leading-normal mt-0.5">
                      Recast only after BOTH Meryl & Paulan properties complete. Highly conservative, maintaining maximum liquidity at the expense of interest leakage.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Analytical Metrics Summary and Interactive Warnings */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-sans border-b border-stone-100 pb-1">
              Friction & Interest Leak Analytics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Metric 1: Double Mortgage Span */}
              <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-1 relative overflow-hidden">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold font-sans">
                  Parallel Loan Overlap
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rose-850 font-mono tracking-tight">
                    {finances.transitionDoubleMortgageWeeks}
                  </span>
                  <span className="text-xs text-stone-500 font-serif">Weeks</span>
                </div>
                <p className="text-[10px] text-stone-505 font-sans leading-normal">
                  Duration where both the Forever Home & Paulan Court mortgages are active concurrently.
                </p>
                
                {finances.transitionDoubleMortgageWeeks > 12 && (
                  <div className="absolute right-2 top-2 bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 tracking-tight animate-pulse">
                    ⚠️ Severe Tension
                  </div>
                )}
                {finances.transitionDoubleMortgageWeeks > 0 && finances.transitionDoubleMortgageWeeks <= 12 && (
                  <div className="absolute right-2 top-2 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 tracking-tight">
                    ⚠️ Caution Overlap
                  </div>
                )}
                {finances.transitionDoubleMortgageWeeks === 0 && (
                  <div className="absolute right-2 top-2 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 tracking-tight">
                    🛡️ Safe Path
                  </div>
                )}
              </div>

              {/* Metric 2: Meryl Lodging Rent Total */}
              <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-1">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold font-sans">
                  Total Out-of-pocket Rent
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-800 font-mono tracking-tight">
                    ${Math.round(finances.totalMerylRentInTransition).toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-505 font-serif">Total</span>
                </div>
                <p className="text-[10px] text-stone-505 font-sans leading-normal">
                  Outflow for Meryl over {finances.transitionMerylWeeks} rent weeks at ${inputs.merylRentCostPerWeek}/wk.
                </p>
              </div>

              {/* Metric 3: Peak Weekly Outflow Cashflow Pain */}
              <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-1 relative">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold font-sans">
                  Peak Weekly Transitional Outflow
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-900 font-mono tracking-tight">
                    ${Math.round(finances.maxWeeklyRepaymentInTransition).toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-550 font-sans font-mono text-stone-400">/wk</span>
                </div>
                <p className="text-[10px] text-stone-505 font-sans leading-normal">
                  Highest Combined weekly outflows during bridge. Normal is ${Math.round(finances.recastWeeklyPayment)}/wk.
                </p>
              </div>

              {/* Metric 4: Cumulative Transition Interest paid */}
              <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-1">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold font-sans">
                  Frictional Interest Paid
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-red-700 font-mono tracking-tight">
                    ${Math.round(finances.cumulativeTransitionInterest).toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-505 font-serif">Interest</span>
                </div>
                <p className="text-[10px] text-stone-505 font-sans leading-normal">
                  Total interest drained across all mortgages until transition settles. Minimizing this is critical!
                </p>
              </div>
            </div>

            {/* Dynamic Warning Card */}
            {finances.transitionDoubleMortgageWeeks > 4 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1 text-red-950 font-serif">
                <div className="font-bold flex items-center gap-1">
                  <span>⚠️ Extreme Cashflow Restriction Warning</span>
                </div>
                <p className="text-[11px] font-sans text-red-900 leading-normal">
                  You have <strong className="font-mono">{finances.transitionDoubleMortgageWeeks} weeks</strong> of dual-mortgage parallel liabilities. During this peak period, your family combined mandatory outflows spike to <strong className="font-mono text-rose-800">${Math.round(finances.maxWeeklyRepaymentInTransition)}/wk</strong>. Make sure you maintain a robust cash offset cushion (minimum ${inputs.offsetBuffer.toLocaleString()}) to shield against unexpected delays before Meryl or Paulan Court property settlement injects major liquidity.
                </p>
              </div>
            )}
            {finances.transitionDoubleMortgageWeeks > 0 && finances.transitionDoubleMortgageWeeks <= 4 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950 font-serif">
                <div className="font-bold flex items-center gap-1">
                  <span>⚠️ Manageable Parallel Mortgage Exposure</span>
                </div>
                <p className="text-[11px] font-sans text-amber-900 leading-normal">
                  A short {finances.transitionDoubleMortgageWeeks}-week dual-mortgage period exists. Ensure smooth paperwork alignment to avoid settlement slippage which would further extend this cashflow friction.
                </p>
              </div>
            )}
            {finances.transitionDoubleMortgageWeeks === 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950 font-serif">
                <div className="font-bold flex items-center gap-1 text-emerald-900">
                  <span>🛡️ Optimally Aligned Non-Overlapping Path</span>
                </div>
                <p className="text-[11px] font-sans text-emerald-900 leading-normal">
                  Excellent scheduling! By timing settlements sequence beautifully, you have completely eliminated parallel mortgage liabilities, keeping running outflows strictly neutralized.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TIMELINE WEEKLY DETAIL LOGGER */}
      <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-4 shadow-sm print-card">
        <div>
          <h3 className="text-base font-bold text-stone-800 font-serif">
            Chronological Transition Schedule Detail
          </h3>
          <p className="text-xs text-stone-500 mt-0.5 font-serif leading-relaxed">
            A high-fidelity weekly audit trace illustrating overlapping debt carrying obligations, rent leakage, and interest accrual rates during the crucial physical move phase.
          </p>
        </div>

        <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-stone-100 text-[10px] font-bold text-stone-600 border-b border-stone-200 uppercase tracking-wider py-2.5 px-4 font-serif text-center">
            <div className="col-span-2 text-left">Timeline Point</div>
            <div className="col-span-2">Twin Ranges (Meryl)</div>
            <div className="col-span-2">Forever Home</div>
            <div className="col-span-2">Paulan Court</div>
            <div className="col-span-1">Fern St</div>
            <div className="col-span-3 text-right">Combined State</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto bg-stone-50/40">
            {finances.transitionWeeksData.map((wData: any) => (
              <div
                key={wData.week}
                className={`grid grid-cols-12 text-[11px] py-2.5 px-4 items-center font-sans ${
                  wData.doubleMortgage
                    ? "bg-rose-50/50 hover:bg-rose-50 border-y border-rose-100/60"
                    : "bg-white hover:bg-stone-50"
                }`}
              >
                {/* Point */}
                <div className="col-span-2 font-medium">
                  <div className="text-stone-800 font-semibold">{wData.dateStr}</div>
                  <div className="text-[9px] text-stone-400">Week {wData.week} ({wData.dayOffset} days)</div>
                </div>

                {/* Meryl State */}
                <div className="col-span-2 text-center">
                  {wData.hasRentThisWeek ? (
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-purple-100 text-purple-800 font-mono">
                        Rent: ${wData.merylRentCost}/wk
                      </span>
                    </div>
                  ) : wData.merylSettled ? (
                    <span className="text-emerald-700 font-medium text-[10px] font-serif">Sold & Settled</span>
                  ) : (
                    <span className="text-stone-400 italic text-[10px]">Staging/Selling</span>
                  )}
                </div>

                {/* FH State */}
                <div className="col-span-2 text-center">
                  {wData.fhOpened ? (
                    <div className="space-y-0.5">
                      <div className="text-blue-800 font-bold font-mono">
                        ${Math.round(wData.fhLoan).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-stone-500">
                        Pmt: ${Math.round(wData.fhRepay)}/wk
                      </div>
                      <div className="text-[9px] text-emerald-700 font-mono">
                        Off: ${Math.round(wData.fhOffset).toLocaleString()}
                      </div>
                      {wData.isRecast && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-semibold bg-blue-100 text-blue-850 uppercase font-sans tracking-wide">
                          Recast
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-stone-400 italic text-[10px]">Not Settled Yet</span>
                  )}
                </div>

                {/* Paulan State */}
                <div className="col-span-2 text-center">
                  {wData.paulanSettled ? (
                    <span className="text-rose-800 font-medium text-[10px] font-serif">Sold & Settled</span>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="text-rose-900 font-semibold font-mono">
                        ${Math.round(wData.paulanLoan).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-stone-500">
                        Pmt: $537/wk
                      </div>
                      <div className="text-[9px] text-rose-600 font-mono">
                        Off: ${Math.round(wData.paulanOffset).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fern St */}
                <div className="col-span-1 text-center font-mono text-stone-600">
                  <div className="font-semibold">${Math.round(wData.fernLoan).toLocaleString()}</div>
                  <div className="text-[9px] text-emerald-600 font-mono">Off: ${Math.round(wData.fernOffset).toLocaleString()}</div>
                </div>

                {/* Combined State */}
                <div className="col-span-3 text-right">
                  <div className="text-red-700 font-bold">${Math.round(wData.totalInterest).toLocaleString()}</div>
                  <div className="text-[9px] text-stone-400 font-sans font-normal">Interest cost</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
