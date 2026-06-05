import { useState, useMemo, useRef, useEffect } from "react";
import {
  PropertyInputs,
  PropertyScenario,
  ActiveInteraction,
  SimulationDataPoint,
} from "./types";

const Icons = {
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
  DragHandle: () => (
    <div className="flex flex-col gap-0.5 px-1 cursor-ew-resize hover:bg-black/15 h-full justify-center items-center rounded select-none no-print">
      <span className="w-0.5 h-3 bg-slate-700"></span>
      <span className="w-0.5 h-3 bg-slate-700"></span>
    </div>
  ),
};

// Stated Financial Position as of May 27, 2026
const ACCOUNT_BALANCES = {
  fernLoan: 573073,
  paulansLoan: 381446,
  fernOffset: 238374,
  paulansOffset: 381456,
};

const DEFAULT_INPUTS: PropertyInputs = {
  purchasePrice: 1700000,          // Default Forever Home purchase price
  paulanSalePrice: 730000,         // Locked Paulan Court purchase/sale price
  merylSalePrice: 730000,          // Twin Ranges gross sale price
  merylContribution: 600000,       // Meryl's Granny Flat cash injection (post-settlement)
  paulanOffsetPulled: 381456,      // Programmatic (read-only indicator fallback)
  fernOffsetPulled: 238374,        // Programmatic (read-only indicator fallback)
  offsetBuffer: 250000,            // Day 1 target minimum safety cushion buffer
  weeklySavings: 1000,             // Extra savings allocated to offset weekly
  interestRate: 6.15,              // Variable loan rate
  
  // Parallel timeline delays
  merylStartDelay: 0,              // Timeline start
  merylPrepDays: 90,               // Default 90 days ending in mid-August
  merylCampaignDays: 28,           // Listed for sale campaign
  merylSettleDays: 60,             // Twin Ranges settlement period
  
  fhStartDelay: 14,                // Independent contract sign / prep delay
  fhSettleDays: 60,                // Settlement on Forever Home
  renoDays: 21,                    // Renovation period
  moveDays: 7,                     // Move-in duration
  
  paulanStartDelay: 102,           // Starts post-move by default, but completely decoupled
  paulanPrepDays: 7,               // Paulan prep duration
  paulanCampaignDays: 28,          // Paulan marketing
  paulanSettleDays: 60,            // Settlement period on selling Paulan Court
  
  internalVariationPct: 50,        // 0% = Keep all post-sale cash in Offset, 100% = Pay down Loan Principal (Recast)
  depletionPriorityToggle: "paulan", // Default priority
  stampDutyRate: 5.5,              // Stamp Duty / purchase cost percent (defaults to Victoria 5.5%)
};

// Helper to consolidate, clamp and adjust financial parameters dynamically in response to slider changes
const adjustInputs = (newInputs: PropertyInputs): PropertyInputs => {
  const rate = (newInputs.stampDutyRate ?? 5.5) / 100;
  const stampDuty = newInputs.purchasePrice * rate;
  const totalAcquisitionCost = newInputs.purchasePrice + stampDuty + 5000;
  const minCashRequiredForSettlement = Math.max(0, totalAcquisitionCost - 1500000);

  // Dynamic maximum buffer clamp (starting balance minus mandatory settlement outlay)
  const maxRemainingCash = Math.max(0, 619830 - minCashRequiredForSettlement);
  const buffer = Math.min(maxRemainingCash, Math.max(0, newInputs.offsetBuffer));

  // Dynamic merylNetProceeds clamping
  const merylSale = newInputs.merylSalePrice ?? 730000;
  const merylNet = Math.max(0, merylSale - (merylSale * 0.025));
  const merylContribution = Math.min(merylNet, Math.max(0, newInputs.merylContribution ?? 600000));

  return {
    ...newInputs,
    merylSalePrice: merylSale,
    merylContribution: merylContribution,
    stampDutyRate: newInputs.stampDutyRate ?? 5.5,
    offsetBuffer: buffer
  };
};

export default function App() {
  const [inputs, setInputs] = useState<PropertyInputs>(() =>
    adjustInputs(DEFAULT_INPUTS)
  );
  const [scenarios, setScenarios] = useState<PropertyScenario[]>(() => {
    try {
      const saved = localStorage.getItem("property_scenarios_v9");
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
        name: "Default Strategy ($1.7M)",
        inputs: adjustInputs(DEFAULT_INPUTS),
      },
      {
        name: "Conservative Build ($1.4M)",
        inputs: adjustInputs({ ...DEFAULT_INPUTS, purchasePrice: 1400000 }),
      },
      {
        name: "Premium Estate ($1.9M)",
        inputs: adjustInputs({ ...DEFAULT_INPUTS, purchasePrice: 1900000 }),
      },
    ];
  });
  const [newScenarioName, setNewScenarioName] = useState("");
  const [activeInteraction, setActiveInteraction] = useState<ActiveInteraction | null>(null);
  const [isPaulanLinkedHovered, setIsPaulanLinkedHovered] = useState(false);
  const ganttContainerRef = useRef<HTMLDivElement | null>(null);

  const WeeklyNetSalary = 5303.35; // Locked family salary split

  useEffect(() => {
    try {
      localStorage.setItem("property_scenarios_v9", JSON.stringify(scenarios));
    } catch (e) {
      console.warn("Storage exception handled cleanly.", e);
    }
  }, [scenarios]);

  // Helper function to calculate a calendar date from a day offset
  const getGanttDateStr = (days: number) => {
    const d = new Date(2026, 4, 15); // May 15, 2026
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  // Helper to format simulation weeks into clear Month Year calendar blocks
  const getMilestoneDateStr = (weekNum: number) => {
    const startDelayDays = Math.max(timeline.paulanSettleEnd, timeline.merylSettleEnd);
    const d = new Date(2026, 4, 15); // May 15, 2026
    d.setDate(d.getDate() + startDelayDays + weekNum * 7);
    return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  };

  // Timeline Calculation: Decoupled into three parallel swimlanes
  const timeline = useMemo(() => {
    const startDate = new Date(2026, 4, 15); // May 15, 2026

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

    // 3. Paulan Court Track (Red/Pink/Maroon Shades)
    const paulanPrepStart = inputs.paulanStartDelay;
    const paulanPrepEnd = paulanPrepStart + inputs.paulanPrepDays;
    const paulanCampaignStart = paulanPrepEnd;
    const paulanCampaignEnd = paulanCampaignStart + inputs.paulanCampaignDays;
    const paulanSettleStart = paulanCampaignEnd;
    const paulanSettleEnd = paulanSettleStart + inputs.paulanSettleDays;

    const maxDuration = Math.max(
      merylSettleEnd,
      moveEnd,
      paulanSettleEnd,
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
  const finances = useMemo(() => {
    // Dynamically selected purchase cost calculation, default is Victoria 5.5%
    const rate = (inputs.stampDutyRate ?? 5.5) / 100;
    const stampDuty = inputs.purchasePrice * rate;
    const transactionCosts = 5000;
    const totalAcquisitionCost =
      inputs.purchasePrice + stampDuty + transactionCosts;

    // Absolute physical upper bound limits based on maximum borrowing facility and cash offsets using rate
    const maxAffordablePrice = Math.floor((1500000 - 5000 + 619830) / (1 + rate));

    // Mandatory cash gap representing settlement friction above the maximum borrowing capacity
    const minCashRequiredForSettlement = Math.max(
      0,
      totalAcquisitionCost - 1500000
    );

    // Ideal remaining cushion buffer: we want to preserve inputs.offsetBuffer if possible.
    // The cash we can deploy: starting cash ($619,830) minus the buffer.
    const idealPull = Math.max(0, 619830 - inputs.offsetBuffer);

    // The actual cash we must pull on Day 1 is the larger of the minimum needed to settle and what we choose to pull
    let actualPull = Math.max(minCashRequiredForSettlement, idealPull);

    // If actualPull exceeds our physical starting cash constraint, then the purchase is unaffordable.
    // We clamp actualPull to starting cash $619,830.
    actualPull = Math.min(619830, actualPull);

    // Programmatic Waterfall for the starting offsets based on user-selectable priority toggle:
    let paulanOffsetPulled = 0;
    let fernOffsetPulled = 0;

    if (inputs.depletionPriorityToggle === "paulan") {
      paulanOffsetPulled = Math.min(381456, actualPull);
      fernOffsetPulled = Math.min(238374, Math.max(0, actualPull - paulanOffsetPulled));
    } else {
      fernOffsetPulled = Math.min(238374, actualPull);
      paulanOffsetPulled = Math.min(381456, Math.max(0, actualPull - fernOffsetPulled));
    }

    const totalOffsetsPulled = paulanOffsetPulled + fernOffsetPulled;

    // Dynamic cap on loan: Cannot exceed $1,500,000 concurrent lender limit
    const loanRequired = Math.min(
      1500000,
      Math.max(0, totalAcquisitionCost - totalOffsetsPulled)
    );

    // 20% Deposit of Loan Value targeting standard bank constraints
    const targetDeposit20PctOfLoan = loanRequired * 0.2;

    // Remaining Day 1 cash cushion left over (total starting cash is $619,830 minus actual cash paid out)
    const remainingDay1CashCushion = Math.max(
      0,
      619830 - (totalAcquisitionCost - loanRequired)
    );

    // Strategy Validation: Remaining buffer target safety check
    const isBufferCompromised = remainingDay1CashCushion < inputs.offsetBuffer;

    // Model transition interest on existing loans since offsets were pulled:
    const paulanTransitionInterestRateWeekly = 0.0618 / 52;
    const fernTransitionInterestRateWeekly = 0.0615 / 52;

    const paulanWeeksToSale = Math.max(1, Math.round(timeline.paulanSettleEnd / 7));
    const totalTransitionInterestPaulan =
      paulanOffsetPulled *
      paulanTransitionInterestRateWeekly *
      paulanWeeksToSale;
    const totalTransitionInterestFern =
      fernOffsetPulled *
      fernTransitionInterestRateWeekly *
      paulanWeeksToSale;
    const aggregateTransitionInterest =
      totalTransitionInterestPaulan + totalTransitionInterestFern;

    // Paulan Court Net proceeds of sale calculation with dynamic sale price
    const paulanSale = inputs.paulanSalePrice ?? 730000;
    const sellingCosts = paulanSale * 0.025; // 2.5% fixed commissions & legals
    const paulanNetProceeds = Math.max(
      0,
      paulanSale - ACCOUNT_BALANCES.paulansLoan - sellingCosts
    );

    // Meryl's Twin Ranges sale details with dynamic sale price
    const merylGrossProceeds = inputs.merylSalePrice ?? 730000;
    const merylSellingFees = merylGrossProceeds * 0.025; // 2.5% standard commissions, marketing, conveyancing, legals
    const merylNetProceeds = Math.max(0, merylGrossProceeds - merylSellingFees);
    const merylCashSurplus = Math.max(0, merylNetProceeds - inputs.merylContribution);

    // Post-Settlement Liquid Injection Pool: Include both remaining day 1 cash cushion and post-sale cash
    const totalPostSaleCashPool = paulanNetProceeds + inputs.merylContribution;
    const totalCombinedPool = remainingDay1CashCushion + totalPostSaleCashPool;

    // Internal Variation Split:
    const variationPct = inputs.internalVariationPct / 100;
    const appliedToPrincipalReduction = Math.min(
      loanRequired,
      totalCombinedPool * variationPct
    );
    const keptInOffsetAccount = totalCombinedPool - appliedToPrincipalReduction;

    // Post-Variation Stabilized Mortgage State
    const recastForeverHomeLoanPrincipal = Math.max(
      0,
      loanRequired - appliedToPrincipalReduction
    );

    // Total cash remaining in Offset = kept inside Offset Account (which includes the Day 1 cushion)
    const recastOffsetBalance = keptInOffsetAccount;
    const surplusCashRedirectedToFern = Math.max(
      0,
      recastOffsetBalance - recastForeverHomeLoanPrincipal
    );

    // Calculate Recast Weekly P&I Repayments on the lower principal
    const rWeekly = inputs.interestRate / 100 / 52;
    const nWeeks = 30 * 52;

    const recastWeeklyPayment =
      recastForeverHomeLoanPrincipal > 0
        ? (recastForeverHomeLoanPrincipal *
            rWeekly *
            Math.pow(1 + rWeekly, nWeeks)) /
          (Math.pow(1 + rWeekly, nWeeks) - 1)
        : 0;

    const initialWeeklyPayment =
      loanRequired > 0
        ? (loanRequired * rWeekly * Math.pow(1 + rWeekly, nWeeks)) /
          (Math.pow(1 + rWeekly, nWeeks) - 1)
        : 0;

    // Calculate Fern St variable repayment (base rate 5.95%)
    const fernWeeklyPayment = 783.74;

    // Standard Cash Flow Ratios
    const totalCommittedWeeklyOutlays = recastWeeklyPayment + fernWeeklyPayment;
    const mortgageToIncomeRatio =
      (totalCommittedWeeklyOutlays / WeeklyNetSalary) * 100;
    const mortgageWithSavingsStrainRatio =
      ((totalCommittedWeeklyOutlays + inputs.weeklySavings) / WeeklyNetSalary) * 100;
    const leftoverDiscretionaryCash =
      WeeklyNetSalary - totalCommittedWeeklyOutlays - inputs.weeklySavings;

    // Run 15-Year Portfolio Simulation
    const simulationData: SimulationDataPoint[] = [];
    let simLoanFH = recastForeverHomeLoanPrincipal;
    
    // Move Fern St offset money into the Forever Home offset account as requested (cleanly without double-counting)
    let simOffsetFH = recastOffsetBalance; // Consolidated offset balance after recast split
    let simLoanFern = ACCOUNT_BALANCES.fernLoan;
    let simOffsetFern = 0; // Starts at $0 as it has been moved into Forever Home offset account

    let fhNeutralizedWeek = -1;
    let bothNeutralizedWeek = -1;

    // Initialize interest tracking variables
    let fhInterestAtOffset = 0;
    let fhInterestAtBothOffset = 0;
    let fernInterestAtBothOffset = 0;

    // Initialize milestone tracking for row of 3 boards under graph
    let milestoneRecast = {
      fhLoan: Math.round(simLoanFH),
      fhOffset: Math.round(simOffsetFH),
      fernLoan: Math.round(simLoanFern),
      fernOffset: Math.round(simOffsetFern),
      week: 0,
    };

    let milestoneFHOffset = {
      fhLoan: 0,
      fhOffset: 0,
      fernLoan: 0,
      fernOffset: 0,
      week: -1,
    };

    let milestoneFernOffset = {
      fhLoan: 0,
      fhOffset: 0,
      fernLoan: 0,
      fernOffset: 0,
      week: -1,
    };

    const rWeeklyFHSim = rWeekly;
    const rWeeklyFernSim = 0.0595 / 52;

    for (let w = 0; w <= 15 * 52; w++) {
      if (simOffsetFH >= simLoanFH && fhNeutralizedWeek === -1) {
        fhNeutralizedWeek = w;
        milestoneFHOffset = {
          fhLoan: Math.round(simLoanFH),
          fhOffset: Math.round(simOffsetFH),
          fernLoan: Math.round(simLoanFern),
          fernOffset: Math.round(simOffsetFern),
          week: w,
        };
      }
      if (
        simOffsetFH >= simLoanFH &&
        simOffsetFern >= simLoanFern &&
        bothNeutralizedWeek === -1
      ) {
        bothNeutralizedWeek = w;
        milestoneFernOffset = {
          fhLoan: Math.round(simLoanFH),
          fhOffset: Math.round(simOffsetFH),
          fernLoan: Math.round(simLoanFern),
          fernOffset: Math.round(simOffsetFern),
          week: w,
        };
      }

      const fhInterest = Math.max(0, simLoanFH - simOffsetFH) * rWeeklyFHSim;
      const fernInterest = Math.max(0, simLoanFern - simOffsetFern) * rWeeklyFernSim;

      // Accumulate interest paid prior to reaching neutralization milestones
      if (fhNeutralizedWeek === -1) {
        fhInterestAtOffset += fhInterest;
      }
      if (bothNeutralizedWeek === -1) {
        fhInterestAtBothOffset += fhInterest;
        fernInterestAtBothOffset += fernInterest;
      }

      const fhPrincipalReduction = Math.max(0, recastWeeklyPayment - fhInterest);
      simLoanFH = Math.max(0, simLoanFH - fhPrincipalReduction);

      const fernPrincipalReduction = Math.max(0, fernWeeklyPayment - fernInterest);
      simLoanFern = Math.max(0, simLoanFern - fernPrincipalReduction);

      let remainingSavings = inputs.weeklySavings;

      // 1. Fill Forever Home offset account first using weekly savings
      if (simOffsetFH < simLoanFH) {
        const space = simLoanFH - simOffsetFH;
        const deposit = Math.min(remainingSavings, space);
        simOffsetFH += deposit;
        remainingSavings -= deposit;
      }

      // 2. If Forever Home is fully offset, any leftover weekly savings from this week goes to Fern offset
      if (remainingSavings > 0) {
        if (simOffsetFern < simLoanFern) {
          const space = simLoanFern - simOffsetFern;
          simOffsetFern += Math.min(remainingSavings, space);
        } else {
          simOffsetFern = simLoanFern;
        }
      }

      // 3. Since interest is $0, the bank takes recastWeeklyPayment, which reduces simLoanFH.
      // That means simOffsetFH now exceeds simLoanFH. Or it might have exceeded it from Day 1!
      // We sweep any excess cash beyond the loan balance to the Fern St offset!
      if (simOffsetFH > simLoanFH) {
        const excessCash = simOffsetFH - simLoanFH;
        simOffsetFH = simLoanFH; // cap FH offset at the loan balance
        if (simOffsetFern < simLoanFern) {
          const space = simLoanFern - simOffsetFern;
          simOffsetFern += Math.min(excessCash, space);
        } else {
          simOffsetFern = simLoanFern;
        }
      }

      if (w % 13 === 0 || w === 15 * 52) {
        simulationData.push({
          week: w,
          year: (w / 52).toFixed(1),
          loanFH: Math.round(simLoanFH),
          offsetFH: Math.round(simOffsetFH),
          loanFern: Math.round(simLoanFern),
          offsetFern: Math.round(simOffsetFern),
          netDebt: Math.round(
            simLoanFH - simOffsetFH + (simLoanFern - simOffsetFern)
          ),
        });
      }
    }

    // Set fallback if offset conditions are not fully met within 15 years
    if (fhNeutralizedWeek === -1) {
      milestoneFHOffset = {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        week: 15 * 52,
      };
    }
    if (bothNeutralizedWeek === -1) {
      milestoneFernOffset = {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        week: 15 * 52,
      };
    }

    return {
      stampDuty,
      transactionCosts,
      totalAcquisitionCost,
      loanRequired,
      maxAffordablePrice,
      paulanNetProceeds,
      sellingCosts,
      merylGrossProceeds,
      merylSellingFees,
      merylNetProceeds,
      merylCashSurplus,
      totalPostSaleCashPool,
      appliedToPrincipalReduction,
      keptInOffsetAccount,
      recastForeverHomeLoanPrincipal,
      recastOffsetBalance,
      recastWeeklyPayment,
      initialWeeklyPayment,
      fernWeeklyPayment,
      surplusCashRedirectedToFern,
      mortgageToIncomeRatio,
      mortgageWithSavingsStrainRatio,
      leftoverDiscretionaryCash,
      aggregateTransitionInterest,
      totalCommittedWeeklyOutlays,
      targetDeposit20PctOfLoan,
      totalCashAppliedToEquityAndFees: totalOffsetsPulled,
      remainingDay1CashCushion,
      minCashRequiredForSettlement,
      isBufferCompromised,
      paulanOffsetPulled,
      fernOffsetPulled,
      milestoneRecast,
      milestoneFHOffset,
      milestoneFernOffset,
      fhInterestAtOffset,
      fernInterestAtBothOffset,
      combinedInterestAtBothOffset: fhInterestAtBothOffset + fernInterestAtBothOffset,
      fhOffsetYears:
        fhNeutralizedWeek !== -1 ? (fhNeutralizedWeek / 52).toFixed(1) : "15+",
      bothOffsetYears:
        bothNeutralizedWeek !== -1
          ? (bothNeutralizedWeek / 52).toFixed(1)
          : "15+",
      simulationData,
    };
  }, [inputs, timeline]);

  const handleInputChange = (field: keyof PropertyInputs, value: number) => {
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
      startVal: inputs[field],
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

      let newVal = Math.max(0, activeInteraction.startVal + deltaDays);

      // Specific limits on resizes and shifts
      if (activeInteraction.type === "resize") {
        if (activeInteraction.field === "merylPrepDays")
          newVal = Math.max(14, Math.min(180, newVal));
        if (activeInteraction.field === "merylCampaignDays")
          newVal = Math.max(7, Math.min(90, newVal));
        if (activeInteraction.field === "merylSettleDays")
          newVal = Math.max(14, Math.min(120, newVal));
        if (activeInteraction.field === "fhSettleDays")
          newVal = Math.max(14, Math.min(120, newVal));
        if (activeInteraction.field === "renoDays")
          newVal = Math.max(0, Math.min(90, newVal));
        if (activeInteraction.field === "moveDays")
          newVal = Math.max(1, Math.min(30, newVal));
        if (activeInteraction.field === "paulanPrepDays")
          newVal = Math.max(1, Math.min(60, newVal));
        if (activeInteraction.field === "paulanCampaignDays")
          newVal = Math.max(7, Math.min(90, newVal));
        if (activeInteraction.field === "paulanSettleDays")
          newVal = Math.max(14, Math.min(120, newVal));
      } else {
        newVal = Math.max(0, Math.min(250, newVal));
      }

      setInputs((prev) =>
        adjustInputs({
          ...prev,
          [activeInteraction.field]: newVal,
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
  }, [activeInteraction, timeline.totalDurationDays]);

  const handleSaveScenario = () => {
    if (!newScenarioName.trim()) return;
    const name = newScenarioName.trim();
    const updated = [
      ...scenarios.filter((s) => s.name !== name),
      { name, inputs },
    ];
    setScenarios(updated);
    setNewScenarioName("");
  };

  const handleLoadScenario = (scenario: PropertyScenario) => {
    setInputs(adjustInputs(scenario.inputs));
  };

  const handleDeleteScenario = (name: string) => {
    setScenarios((prev) => prev.filter((s) => s.name !== name));
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
  <title>Warragul Scenario Snapshot - Property Purchase Strategist</title>
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
      <h1>Warragul Scenario Snapshot</h1>
      <div class="subtitle">Multigenerational Transition & Cashflow Portfolio Modeler</div>
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
          <div class="kpi">${finances.bothOffsetYears} <span class="kpi-unit">Years</span></div>
          <div class="kpi-interest" style="background:#f0fdfa; border-color:#ccfbf1; color:#0f766e; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between;">
              <span>Fern St Interest Paid:</span>
              <span class="mono">$${Math.round(finances.fernInterestAtBothOffset).toLocaleString()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-t: 1px solid #ccfbf1; pt: 4px; margin-top:2px;">
              <span>Combined Total Paid:</span>
              <span class="mono">$${Math.round(finances.combinedInterestAtBothOffset).toLocaleString()}</span>
            </div>
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:12px;">
            Both properties fully neutralized and isolated globally.
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
              <td class="mono font-bold">$${inputs.weeklySavings}/wk</td>
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
        Warragul Multigenerational Transition & Cashflow Portfolio Modeler tool. Any alteration to sale parameters, 
        settlement dates, or internal recasting allocation offsets impacts overall simulation schedules and total combined 
        interest paid. Keep this report snapshot for your strategic records.
      </p>
    </div>
    
    <div class="footer">
      Warragul Multigenerational Transition & Cashflow Portfolio Modeler • Buln Buln & District • Baseline May 2026
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Warragul_Scenario_${inputs.internalVariationPct}pctRecast_${Date.now()}.html`;
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
              <span className="p-1.5 bg-blue-50 text-blue-900 rounded border border-blue-200">
                <Icons.Home className="w-6 h-6 text-blue-900" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight font-serif text-blue-900">
                Concurrent Property Purchase Strategist
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1 font-serif italic">
              Warragul Multigenerational Transition & Cashflow Portfolio Modeler
              • Buln Buln & District • Baseline May 2026
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

        {/* SECTION 1: GANTT CHART SWIMLANES */}
        <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900 font-serif">
                Decoupled Chronological Transition (Parallel Swimlanes)
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

          {/* MONTH MATRIX */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative select-none">
            {/* MONTH HEADINGS */}
            <div className="flex w-full text-center border-b border-stone-300 pb-2 mb-4 font-serif text-[11px] font-bold text-blue-900">
              {timeline.monthAxis.map((m, idx) => (
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
              {timeline.monthAxis.map((m, idx) => (
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
                      <span>{inputs.merylPrepDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        onMouseDown={(e) =>
                          startGanttDrag(e, "merylStartDelay", "shift")
                        }
                        onTouchStart={(e) =>
                          startGanttDrag(e, "merylStartDelay", "shift")
                        }
                        className="bg-emerald-100 border-r-4 border-emerald-500 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-emerald-850 transition-all duration-75 relative cursor-grab active:cursor-grabbing"
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
                          <Icons.DragHandle />
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
                      <span>{inputs.merylCampaignDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-emerald-350 border-r-4 border-emerald-600 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
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
                          <Icons.DragHandle />
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
                      <span>{inputs.merylSettleDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-emerald-800 border-r-4 border-emerald-950 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
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
                          <Icons.DragHandle />
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
                      <span>{inputs.fhSettleDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        onMouseDown={(e) =>
                          startGanttDrag(e, "fhStartDelay", "shift")
                        }
                        onTouchStart={(e) =>
                          startGanttDrag(e, "fhStartDelay", "shift")
                        }
                        className="bg-blue-100 border-r-4 border-blue-500 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-blue-900 transition-all duration-75 relative cursor-grab active:cursor-grabbing"
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
                          <Icons.DragHandle />
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
                      <span>{inputs.renoDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-blue-450 border-r-4 border-blue-600 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
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
                          <Icons.DragHandle />
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
                      <span>{inputs.moveDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-blue-900 border-r-4 border-blue-950 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
                        style={{
                          backgroundColor: "#1e3a8a",
                          marginLeft: `${
                            (timeline.moveStart / timeline.totalDurationDays) *
                            100
                          }%`,
                          width: `${
                            (inputs.moveDays / timeline.totalDurationDays) * 100
                          }%`,
                        }}
                      >
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
                          <Icons.DragHandle />
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
                  <span className="text-rose-905 font-bold flex items-center gap-1.5 font-serif">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-700 animate-pulse"></span>
                    <span className={isPaulanLinkedHovered ? "text-rose-900 font-extrabold" : "text-rose-900"}>
                      Swimlane C: Paulan Court Prep & Sale (Concludes: {timeline.dates.paulanSettle})
                    </span>
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[10px] text-stone-400">
                      Shift Delay:
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="250"
                      value={inputs.paulanStartDelay}
                      onChange={(e) =>
                        handleInputChange(
                          "paulanStartDelay",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-10 text-center font-bold text-rose-800 border border-stone-200 rounded bg-white py-0.5"
                    />
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
                      <span>{inputs.paulanPrepDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        onMouseDown={(e) =>
                          startGanttDrag(e, "paulanStartDelay", "shift")
                        }
                        onTouchStart={(e) =>
                          startGanttDrag(e, "paulanStartDelay", "shift")
                        }
                        className="bg-pink-100 border-r-4 border-pink-400 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-pink-900 transition-all duration-75 relative cursor-grab active:cursor-grabbing"
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
                        <span className="truncate pr-1">Prep Paulan</span>
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
                          <Icons.DragHandle />
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
                      <span>{inputs.paulanCampaignDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-rose-450 border-r-4 border-rose-600 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
                        style={{
                          backgroundColor: "#fb7185",
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
                        <span className="truncate pr-1">
                          Marketing Campaign (Contract:{" "}
                          {timeline.dates.paulanContract})
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
                          <Icons.DragHandle />
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
                      <span>{inputs.paulanSettleDays} Days</span>
                    </div>
                    <div className="w-full bg-stone-200/40 h-7 rounded-md border border-stone-250 relative flex items-center overflow-hidden">
                      <div
                        className="bg-rose-900 border-r-4 border-rose-950 h-full flex items-center justify-between pl-3 pr-1 text-[9px] font-bold text-white transition-all duration-75 relative"
                        style={{
                          backgroundColor: "#881337",
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
                        <span className="truncate pr-1">
                          Proceeds Cash Released ({timeline.dates.paulanSettle})
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
                          <Icons.DragHandle />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                onClick={handleSaveScenario}
                className="bg-blue-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs px-4 py-1.5 rounded transition shadow-sm"
              >
                Save Scenario
              </button>
              <button
                onClick={handleExportHtmlReport}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-serif font-semibold text-xs px-4 py-1.5 rounded transition shadow-sm flex items-center gap-1.5"
                title="Download this exact modeling configuration as a self-contained HTML document"
              >
                <Icons.TrendUp className="w-3.5 h-3.5" />
                Export HTML Report
              </button>
            </div>
          </div>

          {/* Saved Configuration Badges */}
          {scenarios.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center text-xs border-b border-stone-100 pb-4 no-print">
              <span className="text-stone-500 font-serif italic">
                Saved Configurations:
              </span>
              {scenarios.map((sc, sIdx) => (
                <div
                  key={sIdx}
                  className="inline-flex items-center bg-stone-100 border border-stone-200 rounded px-2 py-1 gap-1"
                >
                  <button
                    onClick={() => handleLoadScenario(sc)}
                    className="hover:text-blue-900 font-medium transition text-[11px]"
                  >
                    {sc.name}
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(sc.name)}
                    className="text-stone-400 hover:text-red-600 font-bold ml-1 text-xs"
                  >
                    &times;
                  </button>
                </div>
              ))}
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
                  <span className="font-mono font-bold text-stone-700 font-mono">
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
                  <span className="font-mono font-bold text-stone-700 font-mono">
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
              <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 font-serif">
                    Variable Interest Rate
                  </span>
                  <span className="text-blue-900 font-bold font-mono">
                    {inputs.interestRate}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={12.15}
                  step={0.05}
                  value={inputs.interestRate}
                  onChange={(e) =>
                    handleInputChange(
                      "interestRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full accent-blue-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>4.0%</span>
                  <span>12.15% p.a.</span>
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
                        ? "bg-blue-900 text-white border-blue-950 shadow-sm"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    Empty Paulan First
                  </button>
                  <button
                    onClick={() => setInputs(prev => adjustInputs({ ...prev, depletionPriorityToggle: "fern" }))}
                    className={`px-2 py-1.5 rounded border text-center font-serif text-[10.5px] font-medium transition-all ${
                      inputs.depletionPriorityToggle === "fern"
                        ? "bg-blue-900 text-white border-blue-950 shadow-sm"
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
                        style={{ width: `${(finances.paulanOffsetPulled / 381456) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] text-stone-500 text-right">Drawing {Math.round((finances.paulanOffsetPulled / 381456) * 100)}% of $381k</div>
                  </div>

                  {/* Fern Offset */}
                  <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-1">
                    <div className="flex justify-between text-[11px] font-serif">
                      <span className="text-stone-300">Fern St Offset Cash</span>
                      <span className="font-mono font-semibold text-emerald-400">${Math.round(finances.fernOffsetPulled).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-stone-950 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${(finances.fernOffsetPulled / 238374) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] text-stone-500 text-right">Drawing {Math.round((finances.fernOffsetPulled / 238374) * 100)}% of $238k</div>
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
                      <div>Loan: $381,446</div>
                      <div className="text-stone-500 text-[10px]">Offset Remaining: ${(381456 - finances.paulanOffsetPulled).toLocaleString()}</div>
                      {finances.paulanOffsetPulled > 10 && (
                        <div className="text-rose-700 text-[9px] font-bold font-serif italic leading-none mt-1">
                          ⚠️ Uninsulated: ${(381446 - (381456 - finances.paulanOffsetPulled)).toLocaleString()} is charging 6.18%!
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
                      <div>Loan: $573,073</div>
                      <div className="text-stone-500 text-[10px]">Offset Remaining: ${(238374 - finances.fernOffsetPulled).toLocaleString()}</div>
                      {(238374 - finances.fernOffsetPulled < 573073) && (
                        <div className="text-rose-700 text-[9px] font-bold font-serif italic leading-none mt-1">
                          ⚠️ Uninsulated: ${(573073 - (238374 - finances.fernOffsetPulled)).toLocaleString()} is charging 6.15%!
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
                        (381446 + 573073 + finances.loanRequired) - 
                        ((381456 - finances.paulanOffsetPulled) + (238374 - finances.fernOffsetPulled))
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
                  Meryl's Granny Flat Right-to-Reside Cash Injection
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
                <div className="flex justify-between text-[11px] text-emerald-950 font-bold font-serif">
                  <span>Net Sales Cash Released:</span>
                  <span className="font-mono text-emerald-805 text-emerald-800">${finances.merylNetProceeds.toLocaleString()}</span>
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

          {/* COLUMN 2: PAULAN COURT SALE COMPONENT WITH HOVER GANTT LINKAGE */}
          <div 
            id="paulan-sale-box"
            onMouseEnter={() => setIsPaulanLinkedHovered(true)}
            onMouseLeave={() => setIsPaulanLinkedHovered(false)}
            className={`p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between shadow-sm print-card ${
              isPaulanLinkedHovered
                ? "border-rose-500 bg-rose-50/75 shadow-[0_0_15px_rgba(244,63,94,0.15)] scale-[1.01]"
                : "bg-rose-50/50 border-rose-150"
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex justify-between items-center border-b border-rose-150 pb-1.5">
                <span className="text-xs font-bold text-rose-900 font-serif block uppercase tracking-wider">
                  Paulan Court Sale
                </span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans">
                  Adjustable Contract
                </span>
              </div>
              <p className="text-xs text-rose-900 font-serif leading-relaxed">
                Paulan Court is modelable via the sale price slider. Upon timeline settlement, the outstanding $381,446 mortgage is cleared and commissions are handled, releasing substantial liquid equity. Hovering over this details box highlights its exact timeline duration inside Swimlane C of the Gantt chart.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 mt-3 space-y-3.5">
              {/* PAULAN COURT SALE PRICE SLIDER */}
              <div className="space-y-1.5 pb-2 border-b border-rose-100/60">
                <div className="flex justify-between text-xs font-bold text-rose-950">
                  <span>Paulan Court Sale Price</span>
                  <span className="font-mono text-rose-700 text-sm font-bold">
                    ${inputs.paulanSalePrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={1200000}
                  step={5000}
                  value={inputs.paulanSalePrice}
                  onChange={(e) =>
                    handleInputChange(
                      "paulanSalePrice",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-normal mt-1 leading-none">
                  <span>Min: $500k</span>
                  <span>Max: $1.2M</span>
                </div>
              </div>

              {/* REAL ESTATE DEAL BREAKDOWN */}
              <div className="text-xs space-y-1 font-serif text-rose-950">
                <div className="flex justify-between text-[11px] pb-1">
                  <span>Contract price:</span>
                  <span className="font-mono font-bold text-slate-800">${inputs.paulanSalePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] pb-1 border-t border-rose-100/50 pt-1">
                  <span>Outstanding Mortgage Paid Out:</span>
                  <span className="font-mono text-rose-700">-$381,446</span>
                </div>
                <div className="flex justify-between text-[11px] border-b border-rose-100 pb-1.5 pt-1 border-t border-rose-100/50">
                  <span>Agent Commission & Conveyancing (2.5%):</span>
                  <span className="font-mono text-rose-700">-${Math.round(finances.sellingCosts).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-950 pt-1.5 font-sans">
                  <span className="text-slate-900">Net Settle Cash Released:</span>
                  <span className="font-mono text-emerald-700 text-sm font-extrabold">
                    +${Math.round(finances.paulanNetProceeds).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE NEW INTERNAL VARIATION MODELER */}
        <section className="bg-blue-50/50 border border-blue-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
          <div className="border-b border-blue-200 pb-3">
            <h3 className="text-xl font-bold text-blue-900 font-serif">
              Internal Variation & Mortgage Recasting Modeler
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-serif leading-relaxed">
              Australian lenders contractually recalculate (recast) your minimum
              mandatory weekly payments when previous property sale proceeds are
              directly paid down onto the loan principal. Move the slider below
              to divide your post-sale cash pool of{" "}
              <span className="font-bold text-blue-950">
                ${Math.round(finances.totalPostSaleCashPool).toLocaleString()}
              </span>{" "}
              between pure **Interest Offset (maximum liquidity)** and
              **Principal reduction (lowest repayment cash-outflow)**.
            </p>
          </div>

          {/* THE INTERNAL VARIATION SLIDER */}
          <div className="bg-white p-6 rounded-xl border border-blue-150/80 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.55">
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
                <div className="flex justify-between items-center text-stone-600 border-b border-stone-100 pb-1.5">
                  <span>Gross Weekly Income Inflow:</span>
                  <span className="font-semibold text-emerald-700 font-mono text-sm border-0 bg-transparent text-right">
                    +$
                    {WeeklyNetSalary.toLocaleString("en-AU", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
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

                {/* RELOCATED WEEKLY SAVINGS RATE SLIDER & STRAIN BADGE */}
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
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
                    className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                  />
                  
                  <div className="flex justify-between text-[9px] text-stone-400">
                    <span>$0 min</span>
                    <span>$3,000/wk cap</span>
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
                    Includes both mandatory repayments and your custom weekly extra savings rate of <strong className="font-mono">${inputs.weeklySavings}/wk</strong> on the mortgage/offset side.
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
                  based on your ${inputs.weeklySavings}/wk contributions.
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
                <div className="absolute top-0 right-0 p-3 text-stone-100">
                  <Icons.Shield className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider font-serif">
                    Years to Complete Portfolio Freedom
                  </p>
                  <p className="text-3xl font-bold text-teal-700 mt-3 font-serif">
                    {finances.bothOffsetYears}{" "}
                    <span className="text-xs font-sans font-normal text-stone-500">
                      Years
                    </span>
                  </p>
                  <div className="text-[11px] text-stone-600 mt-2 font-serif font-medium bg-teal-50/40 border border-teal-100 rounded-lg px-2.5 py-1.5 space-y-1">
                    <div className="flex justify-between gap-4">
                      <span>Fern St Interest:</span>
                      <span className="font-bold font-mono text-teal-800">
                        ${Math.round(finances.fernInterestAtBothOffset).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 pt-1 border-t border-teal-100/50">
                      <span>Combined Total:</span>
                      <span className="font-bold font-mono text-slate-800">
                        ${Math.round(finances.combinedInterestAtBothOffset).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-3 mt-3 font-serif leading-relaxed">
                  Both properties completely isolated and net debt-free globally
                  across your entire life footprint.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: 15-YEAR TRAJECTORY PROJECTION CHART */}
        <section className="bg-white border border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
          <div>
            <h3 className="text-lg font-bold text-blue-900 font-serif">
              15-Year Financial Projection Trajectory
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-serif">
              Models the compounding impact of weekly extra offset accumulations
              and the Paulan proceeds release.
            </p>
          </div>

          {/* TRAJECTORY GRAPH */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative">
            <div className="absolute top-4 right-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-serif font-bold text-blue-950">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-purple-705 bg-purple-700 inline-block"></span>
                <span>Primary Home Loan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span>
                <span>Primary Offsets</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-cyan-600 inline-block"></span>
                <span>Fern St Holiday Loan</span>
              </div>
            </div>

            <svg
              viewBox="0 0 800 280"
              className="w-full h-auto overflow-visible select-none"
            >
              {(() => {
                const data = finances.simulationData;
                if (!data || data.length === 0) return null;

                const maxDataVal =
                  Math.max(
                    ...data.map((d) =>
                      Math.max(d.loanFH, d.offsetFH, d.loanFern, d.offsetFern)
                    )
                  ) || 1200000;

                const yMax = Math.ceil(maxDataVal / 250000) * 250000;

                const yTicks = [];
                for (let val = 0; val <= yMax; val += 250000) {
                  yTicks.push(val);
                }

                const getX = (index: number) =>
                  60 + (index / (data.length - 1)) * 700;
                const getY = (val: number) => 240 - (val / yMax) * 200;

                let primaryLoanPoints = "";
                let primaryOffsetPoints = "";
                let fernLoanPoints = "";
                let fernOffsetPoints = "";

                data.forEach((d, idx) => {
                  const x = getX(idx);
                  primaryLoanPoints += `${x},${getY(d.loanFH)} `;
                  primaryOffsetPoints += `${x},${getY(d.offsetFH)} `;
                  fernLoanPoints += `${x},${getY(d.loanFern)} `;
                  fernOffsetPoints += `${x},${getY(d.offsetFern)} `;
                });

                return (
                  <g>
                    {/* Y-Axis lines at 250k intervals */}
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

                    {/* X-Axis increments (5 year ticks with Year labels) */}
                    {[0, 5, 10, 15].map((yr) => {
                      const x = 60 + (yr / 15) * 700;
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

                    {/* Simulation trajectories */}
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
                      strokeDasharray="2 2"
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
                {finances.fhOffsetYears !== "15+" ? `Forever Offset — ${getMilestoneDateStr(finances.milestoneFHOffset.week)}` : `Forever Offset — 15+ Years`}
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

            {/* CARD 3: FERN ST OFFSET */}
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-150 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-teal-950 block font-serif border-b border-teal-205 border-teal-200 pb-1.5">
                {finances.bothOffsetYears !== "15+" ? `Fern Offset — ${getMilestoneDateStr(finances.milestoneFernOffset.week)}` : `Fern Offset — 15+ Years`}
              </span>
              <div className="space-y-2 text-xs font-serif flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded border border-teal-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-teal-950">Forever Home Residence</span>
                      <span className="text-[9px] text-teal-600 font-medium font-semibold">Fully Neutralized ✓</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-400 line-through">Loan: ${finances.milestoneFernOffset.fhLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-bold">Offset: ${finances.milestoneFernOffset.fhOffset.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-teal-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-teal-950 font-bold">Fern St Property</span>
                      <span className="text-[9px] text-teal-600 font-medium font-semibold">Fully Neutralized ✓</span>
                    </div>
                    <div className="text-right font-mono text-[10.5px]">
                      <div className="text-stone-400 line-through">Loan: ${finances.milestoneFernOffset.fernLoan.toLocaleString()}</div>
                      <div className="text-emerald-700 font-bold">Offset: ${finances.milestoneFernOffset.fernOffset.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-100/50 p-2 rounded text-[10px] font-sans font-bold text-teal-950 flex justify-between items-center">
                  <span>Net Portfolio Debt:</span>
                  <span className="font-mono text-xs">
                    ${(finances.milestoneFernOffset.fhLoan - finances.milestoneFernOffset.fhOffset + (finances.milestoneFernOffset.fernLoan - finances.milestoneFernOffset.fernOffset)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE TRAJECTORY INDEX */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            <div className="lg:col-span-4 overflow-hidden rounded-xl border border-stone-200 shadow-sm bg-white flex flex-col justify-between">
              <table className="w-full text-left text-xs text-stone-600 h-full">
                <thead className="bg-stone-50 text-[10px] uppercase text-stone-505 text-stone-500 font-bold tracking-wider font-serif border-b border-stone-200">
                  <tr>
                    <th className="p-3">Simulation Epoch</th>
                    <th className="p-3">Primary Offset</th>
                    <th className="p-3">Portfolio Net Debt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px] flex-1">
                  {finances.simulationData
                    .filter(
                      (_, idx) =>
                        idx === 0 || idx === 8 || idx === 20 || idx === 40 || idx === 59
                    )
                    .map((d, i) => (
                      <tr
                        key={i}
                        className="hover:bg-stone-50 transition-colors"
                      >
                        <td className="p-3 font-semibold text-slate-900 font-sans">
                          {i === 0 ? "Post-Recast Settle" : `Year ${d.year}`}
                        </td>
                        <td className="p-3 text-emerald-800 font-bold">
                          ${d.offsetFH.toLocaleString()}
                        </td>
                        <td
                          className={`p-3 font-semibold ${
                            d.netDebt <= 0 ? "text-emerald-700" : "text-rose-800"
                          }`}
                        >
                          ${d.netDebt.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* STRATEGIC ANALYSIS */}
            <div className="lg:col-span-8 bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-xs text-blue-900 leading-relaxed font-serif space-y-3">
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
                cash velocity instantly redirects into the **Fern Street Holiday
                House Offset**, wiping out your remaining debt exposure globally
                to achieve **complete portfolio freedom in Year{" "}
                {finances.bothOffsetYears}**.
              </p>
            </div>
          </div>
        </section>

        {/* EXPLICITLY REQUESTED OVERVIEW SECTION */}
        <section className="bg-gradient-to-br from-stone-50 to-stone-100/30 border border-stone-250 border-stone-200 p-6 rounded-xl space-y-6 shadow-sm print-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Icons.Eye className="w-5 h-5 text-slate-850" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                Overview & Quick Control Center
              </h3>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Adjust major variables and visualize outcomes instantly
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* VARIABLES SUBSECTION */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200 inline-block">
                <h4 className="text-[10px] font-bold text-stone-700 font-serif uppercase tracking-wider">
                  Major Active Variables
                </h4>
              </div>
              
              <div className="space-y-4.5 bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
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

                {/* 4. Weekly Extra Savings Rate */}
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
                    <span>0% (Full Liquid Offset)</span>
                    <span>100% (Full Recast Principal)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS SUBSECTION */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200 inline-block">
                <h4 className="text-[10px] font-bold text-stone-700 font-serif uppercase tracking-wider">
                  Major Simulated Outcomes
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Years to Offset Forever Home */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-serif">
                      Forever Home Offset Time
                    </span>
                    <p className="text-lg font-bold text-emerald-800 mt-2 font-serif leading-tight">
                      {finances.fhOffsetYears !== "15+" ? (
                        <>
                          {finances.fhOffsetYears} <span className="text-xs font-sans font-normal text-stone-500">Years</span>
                          <span className="block text-xs font-sans font-semibold text-stone-700 mt-1">
                            {getMilestoneDateStr(finances.milestoneFHOffset.week)}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-800">15+ Years (Not Offset)</span>
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
                      {finances.bothOffsetYears !== "15+" ? (
                        <>
                          {finances.bothOffsetYears} <span className="text-xs font-sans font-normal text-stone-500">Years</span>
                          <span className="block text-xs font-sans font-semibold text-stone-700 mt-1">
                            {getMilestoneDateStr(finances.milestoneFernOffset.week)}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-800">15+ Years (Not Fully Offset)</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[10px] font-serif text-stone-500">
                    <div className="flex justify-between items-center text-[9.5px]">
                      <span>Fern St Interest:</span>
                      <span className="font-mono text-teal-700">
                        ${Math.round(finances.fernInterestAtBothOffset).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-stone-600 border-t border-stone-100/60 pt-0.5">
                      <span>Total Interest Paid:</span>
                      <span className="font-mono text-slate-800">
                        ${Math.round(finances.combinedInterestAtBothOffset).toLocaleString()}
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
          </div>
        </section>

        {/* SECTION 7: MULTIGENERATIONAL STUDY & INTEL NOTEBOOK */}
        <section className="bg-stone-100/70 border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 print-card">
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
            © 2026 Warragul Multigenerational Estate Strategy Modeler. Prepared
            for your property transition.
          </p>
        </div>
      </footer>
    </div>
  );
}
