import React from "react";
import { PropertyInputs, PropertyScenario } from "../types";
import { ACCOUNT_BALANCES, TIMELINE_KEYS, adjustInputs } from "../constants/defaults";

interface ScenarioControlsProps {
  inputs: PropertyInputs;
  setInputs: React.Dispatch<React.SetStateAction<PropertyInputs>>;
  handleInputChange: (field: keyof PropertyInputs, value: any) => void;
  finances: any;
  newScenarioName: string;
  setNewScenarioName: (val: string) => void;
  financialScenarios: PropertyScenario[];
  handleSaveFinancialScenario: () => void;
  handleLoadFinancialScenario: (scenario: PropertyScenario) => void;
  handleDeleteFinancialScenario: (name: string) => void;
  isPaulanLinkedHovered: boolean;
  setIsPaulanLinkedHovered: (val: boolean) => void;
  handleExportHtmlReport: () => void;
}

const Icons = {
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
};

export function ScenarioControls({
  inputs,
  setInputs,
  handleInputChange,
  finances,
  newScenarioName,
  setNewScenarioName,
  financialScenarios,
  handleSaveFinancialScenario,
  handleLoadFinancialScenario,
  handleDeleteFinancialScenario,
  isPaulanLinkedHovered,
  setIsPaulanLinkedHovered,
  handleExportHtmlReport,
}: ScenarioControlsProps) {
  return (
    <div className="space-y-6">
      {/* SECTION 2: INPUT CENTER & AFFORDABILITY ENGINE */}
      <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Icons.Settings className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-blue-900 text-lg font-serif">
              Capital Sourcing & Price Parameters
            </h3>
          </div>

          {/* Save Scenario UI */}
          <div className="flex items-center gap-2 no-print flex-wrap">
            <input
              type="text"
              placeholder="Scenario Title (e.g. Dream Block)"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="border border-stone-300 rounded px-3 py-1.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
            <button
              onClick={handleSaveFinancialScenario}
              className="bg-blue-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs px-4 py-1.5 rounded transition shadow-sm cursor-pointer"
            >
              Save Scenario
            </button>
            <button
              onClick={handleExportHtmlReport}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-serif font-semibold text-xs px-4 py-1.5 rounded transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Download this exact modeling configuration as a self-contained HTML document"
            >
              <Icons.TrendUp className="w-3.5 h-3.5" />
              Export HTML Report
            </button>
          </div>
        </div>

        {/* Saved Configuration Badges */}
        {financialScenarios.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center text-xs border-b border-stone-100 pb-4 no-print">
            <span className="text-stone-500 font-serif italic text-[11px]">
              Saved Configurations:
            </span>
            {financialScenarios.map((sc, sIdx) => {
              const isActive = (Object.keys(inputs) as (keyof PropertyInputs)[]).every(
                (key) => TIMELINE_KEYS.includes(key) || sc.inputs[key] === inputs[key]
              );

              return (
                <div
                  key={sIdx}
                  className={`inline-flex items-center border rounded px-2.5 py-1 gap-1.5 transition-all ${
                    isActive
                      ? "bg-blue-900 border-blue-900 text-white shadow-sm font-semibold"
                      : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <button
                    onClick={() => handleLoadFinancialScenario(sc)}
                    className="transition text-[11px] cursor-pointer text-left"
                  >
                    {sc.name}
                  </button>
                  <button
                    onClick={() => handleDeleteFinancialScenario(sc.name)}
                    className={`font-semibold ml-1.5 text-xs cursor-pointer ${
                      isActive ? "text-blue-200 hover:text-white" : "text-stone-400 hover:text-red-600"
                    }`}
                    title="Delete this scenario"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* INPUT SLIDERS & PROGRAMMATIC WATERFALL PRIORITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMN 1: Forever Home Price & Paulan Sourcing Info */}
          <div className="space-y-4">
            <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700 font-serif">
                  New Residence Purchase Price
                </span>
                <span className="text-blue-900 font-bold font-mono">
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
              <div className="flex justify-between text-[10px] text-stone-400 font-serif">
                <span>Min: $1.0M</span>
                <span className="font-semibold text-amber-700 font-mono">
                  Max: ${(finances.maxAffordablePrice / 1000000).toFixed(3)}M
                </span>
              </div>
            </div>

            {/* READ-ONLY PROGRAMMATIC OUTPUT: PAULAN PULLED */}
            <div className="p-3.5 bg-stone-50/40 rounded-xl border border-stone-200 text-xs font-serif space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Paulan Offset Sourced (Day 1)</span>
                <span className="font-mono font-bold text-stone-700">
                  ${Math.round(finances.paulanOffsetPulled).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Automated pull derived via the waterfall algorithm to satisfy settlement equity gap.
              </p>
              {finances.paulanOffsetPulled > 0 && (
                <p className="text-[9.5px] text-rose-700 bg-rose-50/50 p-1.5 rounded border border-rose-100 italic leading-snug">
                  ⚠️ Triggers 6.18% interest on the remaining uninsulated{" "}
                  <strong>
                    ${Math.round(
                      ACCOUNT_BALANCES.paulansLoan - (ACCOUNT_BALANCES.paulansOffset - finances.paulanOffsetPulled)
                    ).toLocaleString()}
                  </strong>{" "}
                  of Paulan Court Loan until its contract of sale settles.
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 2: Target Cushion & Fern Sourcing Info */}
          <div className="space-y-4">
            <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700 font-serif">
                  Cash Cushion Buffer Target
                </span>
                <span className="text-amber-700 font-bold font-mono">
                  ${inputs.offsetBuffer.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(
                  0,
                  619830 - finances.minCashRequiredForSettlement
                )}
                step={5000}
                value={inputs.offsetBuffer}
                onChange={(e) =>
                  handleInputChange(
                    "offsetBuffer",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Min: $0</span>
                <span>
                  Limit: $
                  {Math.round(
                    Math.max(0, 619830 - finances.minCashRequiredForSettlement)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* READ-ONLY PROGRAMMATIC OUTPUT: FERN PULLED */}
            <div className="p-3.5 bg-stone-50/40 rounded-xl border border-stone-200 text-xs font-serif space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Fern St Offset Sourced (Day 1)</span>
                <span className="font-mono font-bold text-stone-700">
                  ${Math.round(finances.fernOffsetPulled).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Automated pull derived via the waterfall algorithm to satisfy settlement equity gap.
              </p>
              {finances.fernOffsetPulled > 0 && (
                <p className="text-[9.5px] text-rose-700 bg-rose-50/50 p-1.5 rounded border border-rose-100 italic leading-snug">
                  ⚠️ Triggers 6.15% interest on the remaining uninsulated{" "}
                  <strong>
                    ${Math.round(
                      ACCOUNT_BALANCES.fernLoan - (ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled)
                    ).toLocaleString()}
                  </strong>{" "}
                  of Fern St Loan post-Day 1.
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 3: Variable Interest Rate & Sourcing Waterfall Priority */}
          <div className="space-y-4">
            <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-stone-700 font-serif">
                  Variable Interest Rate
                </span>
                <span className="text-blue-900 font-bold font-mono text-[11px]">
                  p.a.
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="30"
                  value={inputs.interestRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleInputChange("interestRate", isNaN(val) ? 0 : val);
                  }}
                  className="w-full px-3 py-2 pr-12 text-sm font-mono font-bold text-blue-900 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
                <span className="absolute right-3 text-xs font-serif font-semibold text-stone-500 pointer-events-none">
                  % p.a.
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-serif">
                Applied across variable loan facilities and interest calculations.
              </p>
            </div>

            <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-700 font-serif">
                  ANZ Savings Rate of Return
                </span>
                <span className="text-blue-900 font-bold font-mono">
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
                  handleInputChange(
                    "anzSavingsRate",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full accent-blue-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>0.0% min</span>
                <span>8.0% p.a. cap</span>
              </div>
            </div>

            {/* USER-SELECTABLE PRIORITY DEPLETER TOGGLE */}
            <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200 text-xs font-serif space-y-2">
              <span className="text-stone-700 font-semibold block text-[11px]">
                Deposit Sourcing Priority Toggle
              </span>
              <div className="grid grid-cols-2 gap-2 no-print">
                <button
                  onClick={() => setInputs(prev => adjustInputs({ ...prev, depletionPriorityToggle: "paulan" }))}
                  className={`px-2 py-1.5 rounded border text-center font-serif text-[10.5px] font-medium transition-all ${
                    inputs.depletionPriorityToggle === "paulan"
                      ? "bg-blue-900 text-white border-blue-950 shadow-sm font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  Empty Paulan First
                </button>
                <button
                  onClick={() => setInputs(prev => adjustInputs({ ...prev, depletionPriorityToggle: "fern" }))}
                  className={`px-2 py-1.5 rounded border text-center font-serif text-[10.5px] font-medium transition-all ${
                    inputs.depletionPriorityToggle === "fern"
                      ? "bg-blue-900 text-white border-blue-950 shadow-sm font-bold"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  Empty Fern First
                </button>
              </div>
              <div className="text-[9.5px] text-stone-400 leading-normal">
                Sets which offset is drawn down first to cover settlement outlays, maximizing isolation on other loans.
              </div>
            </div>
          </div>
        </div>

        {/* CONCURRENT DEPOSIT AND DEBT METRICS CARD (RE-DESIGNED DAY 1 CAPITAL FLOW & BALANCE LEDGER) */}
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider font-serif block">
              Day 1 Capital Flow & Balance Ledger
            </span>
            <p className="text-xs text-stone-500 font-serif leading-relaxed">
              Prior to selling Paulan Court and receiving Meryl's contribution, you utilize your starting cash reserves to settle the Forever Home purchase on Day 1. This settlement draws down your starting offset balances and establishes initial mortgage debt.
            </p>
          </div>

          {/* Dynamic Alert Banner for Target Buffer Compromise */}
          {finances.gfiBeforeFHSettle && (
            <div className="bg-[#0c2a18] border-l-4 border-emerald-600 text-emerald-50 p-4 rounded-r-lg text-xs font-serif leading-relaxed space-y-1 shadow-sm mb-4">
              <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span>GFI Early Settlement Advantage Active</span>
              </div>
              <p className="opacity-90">
                Because the <strong>GFI Event (Meryl's Contribution Transfer)</strong> settles before the Forever Home transaction, her capital contribution of <strong className="font-mono text-emerald-300">${inputs.merylContribution.toLocaleString()}</strong> is received early and counted towards your Day 1 offset buffer reserves. This secures your available cash buffer during the purchase transaction!
              </p>
            </div>
          )}

          {finances.isBufferCompromised && (
            <div className="bg-[#590d0d] border-l-4 border-red-600 text-red-50 p-4 rounded-r-lg text-xs font-serif leading-relaxed space-y-1 shadow-md animate-pulse">
              <div className="flex items-center gap-1.5 font-bold text-red-100">
                <Icons.Warning className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                <span>
                  Strategy Alert: Settlement requirements compromise your targeted ${inputs.offsetBuffer.toLocaleString()} cash margin buffer.
                </span>
              </div>
              <p className="opacity-90">
                Your actual remaining Day 1 Cash Cushion drops to{" "}
                <strong className="font-mono text-red-200">
                  ${Math.round(finances.remainingDay1CashCushion).toLocaleString()}
                </strong>{" "}
                because of mandatory state acquisition stamp duty fees of{" "}
                <strong className="font-mono">${Math.round(finances.stampDuty).toLocaleString()}</strong>{" "}
                and standard concurrent lending limits. Consider lowering the price slider or adjusting your safety cushion targets to align this strategy.
              </p>
            </div>
          )}

          {/* PREMIUM VISUAL SANKEY-STYLE CAPITAL FLOW MAP */}
          <div className="bg-[#141517] p-6 rounded-xl border border-stone-800 text-white shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center font-serif">
              Day 1 Capital Flow Routing (Sankey Conceptual Map)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* 1. SOURCES */}
              <div className="space-y-3">
                <div className="text-center pb-1 text-[11px] font-bold uppercase tracking-wide text-blue-400 border-b border-stone-800 font-sans">
                  Capital Sources
                </div>
                {/* Paulan Offset */}
                <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] font-serif">
                    <span className="text-stone-300">Paulan Offset Cash</span>
                    <span className="font-mono font-semibold text-emerald-400">${Math.round(finances.paulanOffsetPulled).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-stone-950 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${(finances.paulanOffsetPulled / ACCOUNT_BALANCES.paulansOffset) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-stone-500 text-right">Drawing {Math.round((finances.paulanOffsetPulled / ACCOUNT_BALANCES.paulansOffset) * 100)}% of ${(ACCOUNT_BALANCES.paulansOffset / 1000).toFixed(0)}k</div>
                </div>

                {/* Fern Offset */}
                <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] font-serif">
                    <span className="text-stone-300">Fern St Offset Cash</span>
                    <span className="font-mono font-semibold text-emerald-400">${Math.round(finances.fernOffsetPulled).toLocaleString()}</span>
                  </div>
                  {(() => {
                    const maxFernOffset = ACCOUNT_BALANCES.fernOffset + (finances.gfiBeforeFHSettle ? inputs.merylContribution : 0);
                    const pct = maxFernOffset > 0 ? Math.round((finances.fernOffsetPulled / maxFernOffset) * 100) : 0;
                    return (
                      <>
                        <div className="w-full bg-stone-950 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <div className="text-[9px] text-stone-500 text-right">Drawing {pct}% of ${(maxFernOffset / 1000).toFixed(0)}k</div>
                      </>
                    );
                  })()}
                </div>

                {/* New Primary Mortgage */}
                <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] font-serif">
                    <span className="text-stone-300">Concurrent Loan</span>
                    <span className="font-mono font-semibold text-blue-400">${Math.round(finances.loanRequired).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-stone-950 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${(finances.loanRequired / 1500000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-stone-500 text-right">Leverage: {Math.round((finances.loanRequired / 1500000) * 100)}% of $1.5M Cap</div>
                </div>
              </div>

              {/* 2. CHANNELS (PURE SVG CONNECTORS) */}
              <div className="hidden md:flex flex-col justify-center items-center h-full relative px-2">
                <svg className="w-full h-40" viewBox="0 0 200 160" fill="none">
                  <defs>
                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  {/* Top Sourced flow to Outlay */}
                  <path d="M 10 30 C 80 30, 80 80, 190 80" stroke="url(#g1)" strokeWidth="6" />
                  {/* Mid Sourced flow to Outlay */}
                  <path d="M 10 75 C 80 75, 80 80, 190 80" stroke="url(#g1)" strokeWidth="4" />
                  {/* Bottom Sourced flow to Outlay */}
                  <path d="M 10 120 C 80 120, 80 80, 190 80" stroke="url(#g2)" strokeWidth="10" />

                  {/* Sourced flow to Cushions */}
                  <path d="M 10 30 C 100 30, 100 135, 190 135" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" opacity="0.6"/>
                  <path d="M 10 75 C 100 75, 100 135, 190 135" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" opacity="0.6"/>
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-stone-950 border border-stone-800 text-[10px] font-bold font-mono px-2 py-1 rounded-full shadow z-10 text-stone-300">
                  CONCURRENT SETTLEMENT
                </div>
              </div>

              {/* 3. DESTINATIONS */}
              <div className="space-y-3">
                <div className="text-center pb-1 text-[11px] font-bold uppercase tracking-wide text-amber-400 border-b border-stone-800 font-sans">
                  Capital Destinations
                </div>
                {/* Outlays (Total Acquisition) */}
                <div className="bg-stone-900/90 p-3.5 rounded-lg border border-stone-800 text-left">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block font-sans">
                    Mandatory Day 1 Outlay
                  </span>
                  <span className="text-sm font-bold text-blue-300 font-mono block">
                    ${Math.round(finances.totalAcquisitionCost).toLocaleString()}
                  </span>
                  <div className="text-[10px] text-stone-400 mt-1.5 font-serif space-y-0.5 leading-tight">
                    <div>• Forever Home: ${inputs.purchasePrice.toLocaleString()}</div>
                    <div>• Stamp Duty (Vic): ${Math.round(finances.stampDuty).toLocaleString()}</div>
                    <div>• Legal / Transfer Fees: $5,000</div>
                  </div>
                </div>

                {/* Day 1 Safety Cushion Left Behind */}
                <div className="bg-emerald-950/45 p-3.5 rounded-lg border border-emerald-900/70 text-left">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block font-sans">
                    Retained Day 1 Cash Cushion
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono block">
                    ${Math.round(finances.remainingDay1CashCushion).toLocaleString()}
                  </span>
                  <div className="text-[10px] text-emerald-200 mt-1 font-serif leading-snug">
                    Held fluidly in remaining offsets to insulate family expenses compared to target buffer of <strong>${inputs.offsetBuffer.toLocaleString()}</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DUAL-ENTRY COMPARATIVE LEDGER GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEDGER STATE A: BEFORE DAY 1 */}
            <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-3">
              <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-stone-500 block font-sans border-b border-stone-200 pb-1">
                1. Before Day 1 (Portfolio Baseline State)
              </span>
              <div className="space-y-2 text-xs font-serif">
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-stone-200">
                  <div>
                    <span className="font-bold block text-stone-800">Paulan Court Property</span>
                    <span className="text-[10px] text-stone-400 font-normal">Standard 100% offset level</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>Loan: $381,446</div>
                    <div className="text-emerald-700 text-[10px]">✓ Offset: $381,456 (Interest: $0)</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-stone-200">
                  <div>
                    <span className="font-bold block text-stone-800">Fern St Property</span>
                    <span className="text-[10px] text-stone-400 font-normal">Partially uninsulated mortgage</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>Loan: $573,073</div>
                    <div className="text-amber-700 text-[10px]">Offset: $238,374</div>
                    <div className="text-rose-700 text-[9px] font-bold font-serif italic">⚠️ Uninsulated: $334,699 (charging 6.15%)</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-stone-200 opacity-60">
                  <div>
                    <span className="font-bold block text-stone-800">Forever Home Residence</span>
                    <span className="text-[10px] text-stone-400 font-normal">Pending transaction</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>N/A</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-stone-200/55 p-2.5 rounded font-sans font-bold text-stone-850 mt-1 border-stone-300">
                  <span>Portfolio Net External Debt</span>
                  <span className="font-mono text-stone-900">$334,689</span>
                </div>
              </div>
            </div>

            {/* LEDGER STATE B: AFTER DAY 1 SETTLEMENT */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-150 space-y-3">
              <span className="text-[10.5px] uppercase font-extrabold tracking-wider text-indigo-900 block font-sans border-b border-indigo-200 pb-1">
                2. After Day 1 Settlement (Peak Transaction Leverage)
              </span>
              <div className="space-y-2 text-xs font-serif">
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-indigo-100">
                  <div>
                    <span className="font-bold block text-indigo-950">Paulan Court Property</span>
                    <span className="text-[10px] text-stone-400 font-normal">Current mortgage state</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>Loan: ${ACCOUNT_BALANCES.paulansLoan.toLocaleString()}</div>
                    <div className="text-stone-500 text-[10px]">Offset Remaining: ${(ACCOUNT_BALANCES.paulansOffset - finances.paulanOffsetPulled).toLocaleString()}</div>
                    {finances.paulanOffsetPulled > 10 && (
                      <div className="text-rose-700 text-[9px] font-bold font-serif italic leading-none mt-1">
                        ⚠️ Uninsulated: ${(ACCOUNT_BALANCES.paulansLoan - (ACCOUNT_BALANCES.paulansOffset - finances.paulanOffsetPulled)).toLocaleString()} is charging 6.18%!
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-indigo-100">
                  <div>
                    <span className="font-bold block text-indigo-950">Fern St Property</span>
                    <span className="text-[10px] text-stone-400 font-normal">Current mortgage state</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>Loan: ${ACCOUNT_BALANCES.fernLoan.toLocaleString()}</div>
                    <div className="text-stone-500 text-[10px]">Offset Remaining: ${(ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled).toLocaleString()}</div>
                    {(ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled < ACCOUNT_BALANCES.fernLoan) && (
                      <div className="text-rose-700 text-[9px] font-bold font-serif italic leading-none mt-1">
                        ⚠️ Uninsulated: ${(ACCOUNT_BALANCES.fernLoan - (ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled)).toLocaleString()} is charging 6.13%!
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-indigo-100">
                  <div>
                    <span className="font-bold block text-indigo-950 font-sans tracking-tight">Forever Home Residence</span>
                    <span className="text-[10px] text-stone-400 font-normal">Fully established Day 1 debt</span>
                  </div>
                  <div className="text-right font-mono text-stone-700">
                    <div>Loan Principal: ${Math.round(finances.loanRequired).toLocaleString()}</div>
                    <div className="text-rose-700 text-[9px] font-bold font-serif italic leading-none mt-1">
                      ⚠️ Uninsulated: ${Math.round(finances.loanRequired).toLocaleString()} is charging {inputs.interestRate}%!
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-indigo-200/50 p-2.5 rounded font-sans font-bold text-indigo-950 mt-1 border-indigo-200">
                  <span>Peak Portfolio Net External Debt</span>
                  <span className="font-mono text-indigo-900">
                    ${Math.round(
                      (ACCOUNT_BALANCES.paulansLoan + ACCOUNT_BALANCES.fernLoan + finances.loanRequired) -
                      ((ACCOUNT_BALANCES.paulansOffset - finances.paulanOffsetPulled) + (ACCOUNT_BALANCES.fernOffset - finances.fernOffsetPulled))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RE-REALIGNED 2-COLUMN MID-ROW GRID (MERYL'S CONTRIBUTION & PAULAN CONTRACT DETAILS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMN 1: MERY'S GRANNY FLAT INJECTION PANEL (DE-CLUTTERED) */}
        <div className="bg-emerald-50/50 border border-emerald-150 p-6 rounded-xl space-y-4 shadow-sm print-card flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-950">
              <span className="w-3 h-3 rounded-full bg-emerald-600 block"></span>
              <h3 className="font-bold text-lg font-serif">
                Meryl: Sell Twin Ranges and GFI Payment
              </h3>
            </div>
            <p className="text-xs text-emerald-850 font-serif leading-relaxed">
              Meryl resides in her co-located granny flat. Under formal Granny Flat Interest rules, her cash proceeds are fully exempt from Centrelink's deprivation parameters, protecting her pension. Her proceeds are injected into offset post-settlement to secure her legal lifetime tenure.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-emerald-200 text-xs font-serif space-y-4">
            {/* SLIDER 1: TWIN RANGES GROSS SALE PRICE */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-emerald-900">
                <span>Twin Ranges Gross Sale Price</span>
                <span className="font-mono text-emerald-700 text-sm">
                  ${inputs.merylSalePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={1200000}
                step={5000}
                value={inputs.merylSalePrice}
                onChange={(e) =>
                  handleInputChange(
                    "merylSalePrice",
                    parseInt(e.target.value)
                  )
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-normal mt-1 leading-none">
                <span>Min: $500k</span>
                <span>Max: $1.2M</span>
              </div>
            </div>

            {/* SLIDER 2: MERYL'S CAPITAL CONTRIBUTION */}
            <div className="space-y-1.5 pt-3 border-t border-emerald-100/60">
              <div className="flex justify-between text-xs font-bold text-emerald-950">
                <span>Meryl's Capital Contribution</span>
                <span className="font-mono text-emerald-700 text-sm">
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
                  handleInputChange(
                    "merylContribution",
                    parseInt(e.target.value)
                  )
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-normal mt-1 leading-none">
                <span>Min: $0</span>
                <span>Max Net Capacity: ${Math.round(finances.merylNetProceeds).toLocaleString()}</span>
              </div>
            </div>

            {/* SLIDER 3: TWIN RANGES RENO COST */}
            <div className="space-y-1.5 pt-3 border-t border-emerald-100/60">
              <div className="flex justify-between text-xs font-bold text-emerald-900">
                <span>Twin Ranges Reno Cost</span>
                <span className="font-mono text-emerald-700 text-sm">
                  ${inputs.merylRenoCost.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={inputs.merylRenoCost}
                onChange={(e) =>
                  handleInputChange(
                    "merylRenoCost",
                    parseInt(e.target.value)
                  )
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-normal mt-1 leading-none">
                <span>Min: $0</span>
                <span>Max: $50k</span>
              </div>
            </div>

            {/* MERYL'S SELLING FEES DEDUCTION & SURPLUS AREA */}
            <div className="space-y-1.5 pt-3 border-t border-emerald-100/60">
              <div className="flex justify-between text-[11px] text-stone-500 font-serif">
                <span>Gross Sale Proceeds:</span>
                <span className="font-mono">${finances.merylGrossProceeds.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 font-serif">
                <span>Agent Sell Fees & Legals (2.5%):</span>
                <span className="font-mono text-rose-700">-${finances.merylSellingFees.toLocaleString()}</span>
              </div>
              {inputs.merylRenoCost > 0 && (
                <div className="flex justify-between text-[11px] text-stone-500 font-serif">
                  <span>Twin Ranges Reno Cost:</span>
                  <span className="font-mono text-rose-700">-${inputs.merylRenoCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-emerald-950 font-bold font-serif border-t border-emerald-100/60 pt-1">
                <span>Net Sales Cash Released:</span>
                <span className="font-mono text-emerald-800">${finances.merylNetProceeds.toLocaleString()}</span>
              </div>
              <div className="bg-emerald-50/75 p-2.5 rounded border border-emerald-100 text-xs mt-2 flex justify-between items-center">
                <div>
                  <span className="text-emerald-950 font-serif font-bold block">Meryl's Cash Surplus (residual)</span>
                  <span className="text-[9.5px] text-stone-400 font-normal leading-normal">
                    Retained for personal usage / external reserves
                  </span>
                </div>
                <span className="font-mono text-emerald-900 font-bold text-sm ms-2">
                  ${finances.merylCashSurplus.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: FOREVER HOME RENOVATION & MOVING COSTS */}
        <div className="bg-blue-50/50 border border-blue-150 p-6 rounded-xl space-y-4 shadow-sm print-card flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-950">
              <span className="w-3 h-3 rounded-full bg-blue-600 block"></span>
              <h3 className="font-bold text-lg font-serif">
                Forever Home: Reno & Moving Costs
              </h3>
            </div>
            <p className="text-xs text-blue-850 font-serif leading-relaxed">
              These are upfront capital expenditure outlays required upon settlement or move-in. They are deducted directly from your available offset cash cushion, reducing the starting cash reserves of the active simulation.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200 text-xs font-serif mt-3 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-blue-900">
                <span>Reno & Moving Outlay</span>
                <span className="font-mono text-blue-700 text-sm font-bold">
                  ${inputs.fhRenoMovingCost.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={inputs.fhRenoMovingCost}
                onChange={(e) =>
                  handleInputChange(
                    "fhRenoMovingCost",
                    parseInt(e.target.value)
                  )
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-normal mt-1 leading-none">
                <span>Min: $0</span>
                <span>Max: $100k</span>
              </div>
            </div>

            <div className="text-xs space-y-1 font-serif text-blue-950 border-t border-blue-100/60 pt-2.5">
              <div className="flex justify-between text-[11px] pb-1">
                <span>Estimated moving costs:</span>
                <span className="font-mono font-bold text-slate-800">$10,000</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-blue-100/50">
                <span>Configured renovation budget:</span>
                <span className="font-mono text-blue-700">${Math.max(0, inputs.fhRenoMovingCost - 10000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE NEW INTERNAL VARIATION MODELER */}
      <section className="bg-blue-50/50 border border-blue-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
        <div className="border-b border-blue-200 pb-3">
          <h3 className="text-xl font-bold text-blue-900 font-serif">
            Mortgage Recasting
          </h3>
          <p className="text-xs text-stone-500 mt-1 font-serif leading-relaxed">
            Australian lenders contractually recalculate (recast) your minimum
            mandatory weekly payments when previous property sale proceeds are
            directly paid down onto the loan principal. Move the slider below
            to divide your post-sale cash pool of{" "}
            <span className="font-bold text-blue-950">
              ${Math.round(finances.totalCombinedPool).toLocaleString()}
            </span>{" "}
            between pure **Interest Offset (maximum liquidity)** and
            **Principal reduction (lowest repayment cash-outflow)**.
          </p>
          <div className="mt-4 p-3.5 bg-blue-100/40 border border-blue-200/60 rounded-lg text-xs space-y-2 text-blue-950 font-serif leading-relaxed">
            <strong className="text-blue-900 block font-serif">💡 Calculation Context & Offset Balance Composition:</strong>
            <p>
              This calculation takes place <strong>at the Recasting Event Moment</strong>, which occurs after both
              Meryl's property and Paulan Court have settled and all cash surplus is available.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-blue-200/40 font-mono text-[11px]">
              <div className="bg-white/60 p-2 rounded border border-blue-100">
                <span className="text-stone-500 block text-[9px] font-sans font-bold">1. DAY 1 CASH CUSHION</span>
                <span className="font-bold text-blue-900">${Math.round(finances.remainingDay1CashCushion).toLocaleString()}</span>
                <span className="block text-[8px] text-stone-400 font-sans mt-0.5">Offset liquid reserve from Day 1</span>
              </div>
              <div className="bg-white/60 p-2 rounded border border-blue-100">
                <span className="text-stone-500 block text-[9px] font-sans font-bold">2. MERYL CONTRIBUTION</span>
                <span className="font-bold text-blue-900">${Math.round(inputs.merylContribution).toLocaleString()}</span>
                <span className="block text-[8px] text-stone-400 font-sans mt-0.5">Granny Flat cash contribution</span>
              </div>
              <div className="bg-white/60 p-2 rounded border border-blue-100">
                <span className="text-stone-500 block text-[9px] font-sans font-bold">3. PAULAN COURT NET SALE</span>
                <span className="font-bold text-blue-900">${Math.round(finances.paulanNetProceeds).toLocaleString()}</span>
                <span className="block text-[8px] text-stone-400 font-sans mt-0.5">Proceeds after paying loan & fees</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 italic mt-1 font-sans">
              Total combined pool at the time of calculation: <strong>${Math.round(finances.totalCombinedPool).toLocaleString()}</strong>. Depending on your choice below, a percentage of this pool is applied as a principal pay-down to recast payments, and the remainder is held in your offset account.
            </p>
          </div>
        </div>

        {/* MINI TRIGGER SELECTOR CONTAINER */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-2">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest font-sans flex items-center gap-1.5">
              <Icons.Settings className="w-3.5 h-3.5" />
              Select Mortgage Recast Trigger Occasion
            </span>
            <span className="text-[10px] text-stone-400 font-serif italic">
              Controls when lower weekly P&I payments take effect
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleInputChange("recastTriggerEvent", "day1")}
              className={`flex flex-col text-left p-2.5 border rounded-lg transition text-xs cursor-pointer ${
                inputs.recastTriggerEvent === "day1"
                  ? "bg-blue-50/80 border-blue-400 font-medium shadow-sm text-blue-950"
                  : "bg-stone-50/50 border-stone-200 hover:bg-stone-50 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold font-serif text-[11px] text-blue-900">
                <input
                  type="radio"
                  checked={inputs.recastTriggerEvent === "day1"}
                  onChange={() => {}}
                  className="accent-blue-800 scale-90"
                />
                <span>Option A: Day 1 Immediate</span>
              </div>
              <p className="text-[9.5px] text-stone-500 mt-1 font-sans leading-normal">
                Pay down loan right away using initial cash reserves.
              </p>
            </button>

            <button
              onClick={() => handleInputChange("recastTriggerEvent", "gfi")}
              className={`flex flex-col text-left p-2.5 border rounded-lg transition text-xs cursor-pointer ${
                inputs.recastTriggerEvent === "gfi"
                  ? "bg-emerald-50/80 border-emerald-400 font-medium shadow-sm text-emerald-950"
                  : "bg-stone-50/50 border-stone-200 hover:bg-stone-50 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold font-serif text-[11px] text-emerald-900">
                <input
                  type="radio"
                  checked={inputs.recastTriggerEvent === "gfi"}
                  onChange={() => {}}
                  className="accent-emerald-800 scale-90"
                />
                <span>Option B: Twin Ranges Sale</span>
              </div>
              <p className="text-[9.5px] text-stone-500 mt-1 font-sans leading-normal">
                Recast when Meryl's property sale proceeds are deposited.
              </p>
            </button>

            <button
              onClick={() => handleInputChange("recastTriggerEvent", "paulan")}
              className={`flex flex-col text-left p-2.5 border rounded-lg transition text-xs cursor-pointer ${
                inputs.recastTriggerEvent === "paulan"
                  ? "bg-rose-50/80 border-rose-400 font-medium shadow-sm text-rose-950"
                  : "bg-stone-50/50 border-stone-200 hover:bg-stone-50 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold font-serif text-[11px] text-rose-900 font-semibold">
                <input
                  type="radio"
                  checked={inputs.recastTriggerEvent === "paulan"}
                  onChange={() => {}}
                  className="accent-rose-800 scale-90"
                />
                <span>Option C: Double Settle</span>
              </div>
              <p className="text-[9.5px] text-stone-500 mt-1 font-sans leading-normal">
                Delay recast until BOTH properties are fully settled.
              </p>
            </button>
          </div>
        </div>

        {/* THE INTERNAL VARIATION SLIDER */}
        <div className="bg-white p-6 rounded-xl border border-blue-150/80 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="p-1.5 bg-blue-100 rounded text-blue-800 font-bold">
                A
              </span>
              <div>
                <span className="block font-serif text-slate-900 font-bold">
                  100% Offset (Liquidity Focus)
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  Cash stays withdrawable in offset
                </span>
              </div>
            </div>

            <div className="flex-1 px-4 w-full">
              <input
                type="range"
                min={0}
                max={100}
                step={2.5}
                value={inputs.internalVariationPct}
                onChange={(e) =>
                  handleInputChange(
                    "internalVariationPct",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full accent-blue-900 h-2.5 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="text-center mt-2">
                <span className="bg-blue-900 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-full">
                  {inputs.internalVariationPct}% Applied to Principal Reduction
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-right md:text-left">
              <div className="text-right">
                <span className="block font-serif text-slate-900 font-bold">
                  100% Principal Reduction
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  Slashes contractual weekly P&I
                </span>
              </div>
              <span className="p-1.5 bg-blue-100 rounded text-blue-800 font-bold">
                B
              </span>
            </div>
          </div>

          {/* VISUAL DIVISIONS CHART FOR APPLIED CASH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div className="bg-blue-50/65 p-4 rounded-lg border border-blue-100 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                Applied to Principal Reduction (Recast)
              </span>
              <span className="text-2xl font-bold font-mono text-blue-900">
                $
                {Math.round(
                  finances.appliedToPrincipalReduction
                ).toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400 block">
                Lowers outstanding Forever Home Loan limit to:{" "}
                <strong className="font-mono">
                  $
                  {Math.round(
                    finances.recastForeverHomeLoanPrincipal
                  ).toLocaleString()}
                </strong>
              </span>
            </div>

            <div className="bg-emerald-50/65 p-4 rounded-lg border border-emerald-100 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                Kept inside Offset Account (Liquid)
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-800">
                ${Math.round(finances.keptInOffsetAccount).toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400 block">
                Total Forever Home offset cash balance:{" "}
                <strong className="font-mono">
                  ${Math.round(finances.recastOffsetBalance).toLocaleString()}
                </strong>
              </span>
            </div>
          </div>

          {/* CASH CUSHION BUFFER PRESERVATION MONITOR */}
          <div className={`p-4 rounded-lg border leading-relaxed flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${
            finances.recastOffsetBalance < inputs.offsetBuffer
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-stone-50 border-stone-200 text-stone-800"
          }`}>
            <div className="text-xs space-y-0.5 flex-1">
              <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-sans">
                {finances.recastOffsetBalance < inputs.offsetBuffer ? "⚠️ Safety Cushion Target Compromised" : "🛡️ Safety Cushion Target Safeguarded"}
              </span>
              <p className="text-[10.5px] text-stone-500 font-serif leading-normal">
                Your day-1 emergency cash cushion buffer target is <strong className="font-mono text-blue-900">${inputs.offsetBuffer.toLocaleString()}</strong>.
                With the current slider choice, your post-recast liquid offset cash balance is <strong className="font-mono text-emerald-800">${Math.round(finances.recastOffsetBalance).toLocaleString()}</strong>.
              </p>
            </div>
            {finances.recastOffsetBalance < inputs.offsetBuffer && (
              <div className="bg-amber-100/50 p-2.5 rounded text-[10.5px] md:text-right font-serif leading-tight max-w-[280px] border border-amber-200">
                <span className="font-bold block text-amber-950 text-[11px]">Cushion Deficit: -${Math.round(inputs.offsetBuffer - finances.recastOffsetBalance).toLocaleString()}</span>
                Please reduce the principal reduction slider to restore emergency liquid cash above your target buffer limit.
              </div>
            )}
          </div>

          {/* THE REALTIME IMPACT ALERT */}
          <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-lg text-amber-950 text-xs font-serif leading-relaxed">
            <p className="font-bold">💡 Dynamic Structural Impact Trade-Off:</p>
            <p className="mt-0.5 opacity-95">
              By choosing to direct{" "}
              <span className="font-semibold">
                {inputs.internalVariationPct}%
              </span>{" "}
              to pay down principal: Your mandatory minimum Forever Home loan
              payment drops contractually from{" "}
              <span className="font-semibold font-mono">
                ${Math.round(finances.initialWeeklyPayment)}/wk
              </span>{" "}
              down to{" "}
              <span className="font-semibold font-mono text-blue-900">
                ${Math.round(finances.recastWeeklyPayment)}/wk
              </span>
              , freeing up vital discretionary cash flow. However, you retain{" "}
              <span className="font-semibold font-mono text-emerald-800">
                ${Math.round(finances.keptInOffsetAccount).toLocaleString()}
              </span>{" "}
              as withdrawable liquidity in your offset account to safeguard the
              family estate against emergency overheads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
