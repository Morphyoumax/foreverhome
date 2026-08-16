import { PropertyInputs } from "../types";

export const DECIDED_PROPERTY_ADDRESS = "419 Old Yarragon-Leongatha Road, Yarragon South, VIC";

// Stated Financial Position as of July 6, 2026
export const ACCOUNT_BALANCES = {
  fernLoan: 570016.29,
  paulansLoan: 377965.85,
  fernOffset: 220000.00,
  paulansOffset: 377965.85,
};

export const DEFAULT_INPUTS: PropertyInputs = {
  purchasePrice: 1070000,          // Default Forever Home purchase price
  paulanSalePrice: 690000,         // Paulan Court estimated property value
  merylSalePrice: 720000,          // Twin Ranges gross sale price ($720k)
  merylContribution: 700000,       // Meryl's Granny Flat cash injection ($700k)
  paulanOffsetPulled: 377965.85,    // Programmatic (read-only indicator fallback)
  fernOffsetPulled: 220000.00,      // Programmatic (read-only indicator fallback)
  offsetBuffer: 250000,            // Day 1 target minimum safety cushion buffer
  weeklySavings: 0,                // Extra savings allocated to offset weekly
  interestRate: 6.03,              // Variable loan rate
  
  // Parallel timeline delays
  merylStartDelay: 0,              // Timeline start
  merylPrepDays: 40,               // Default 40 days ending in mid-August (15th of August)
  merylCampaignDays: 45,           // Listed for sale campaign (average time on market)
  merylSettleDays: 60,             // Twin Ranges settlement period
  
  fhStartDelay: 0,                 // Starts from Start
  fhSettleDays: 53,                // Settlement on Forever Home (finishes 28/08/26)
  renoDays: 7,                     // Renovation period (7 days)
  moveDays: 7,                     // Move-in duration (7 days)
  
  paulanStartDelay: 67,            // Shifted to start immediately after the move event in Swimlane B concludes (11/09/26)
  paulanPrepDays: 0,               // Staging & styling duration (0 days)
  paulanCampaignDays: 0,           // Paulan marketing (0 days)
  paulanSettleDays: 21,            // Settlement period on selling Paulan Court (finishes 02/10/26)
  
  internalVariationPct: 100,       // 0% = Keep all post-sale cash in Offset, 100% = Pay down Loan Principal (Recast)
  depletionPriorityToggle: "paulan", // Default priority
  stampDutyRate: 5.5,              // Stamp Duty / purchase cost percent (defaults to Victoria 5.5%)
  
  merylRentCostPerWeek: 150,       // Out of pocket renting cost for Meryl per week
  merylRentingExtraDays: 0,        // Extra rental period extensions
  recastTriggerEvent: "gfi",       // Default recast trigger event
  merylRentStartOffset: 0,
  gfiStartOffset: 1,               // GFI default scheduled offset is 1 day after Twin Ranges settlement finalizes
  merylRenoCost: 0,
  paulanRenoCost: 5000,
  fhRenoMovingCost: 5000,
  paulanStrategy: "sell",
  paulanWeeklyRent: 650,
  paulanWeeklyExpenses: 120,
  weeklyIncome: 5303.35,
  annualInflationRate: 3.0,
  paulanSellLater: false,
  paulanYearsBeforeSale: 10,
  paulanGrowthRate: 5.0,
  useFixedDiscretionary: true,
  fixedDiscretionaryCash: 3000,
  anzSavingsRate: 3.75,
  usePostBuildFixedDiscretionary: true,
  postBuildFixedDiscretionaryCash: 3000,
};

// Helper to consolidate, clamp and adjust financial parameters dynamically in response to slider changes
export const adjustInputs = (newInputs: PropertyInputs): PropertyInputs => {
  const rate = (newInputs.stampDutyRate ?? 5.5) / 100;
  const stampDuty = newInputs.purchasePrice * rate;
  const totalAcquisitionCost = newInputs.purchasePrice + stampDuty + 5000;
  const minCashRequiredForSettlement = Math.max(0, totalAcquisitionCost - 1500000);

  // Dynamic merylNetProceeds clamping
  const merylSale = newInputs.merylSalePrice ?? 720000;
  const merylNet = Math.max(0, merylSale - (merylSale * 0.025) - (newInputs.merylRenoCost ?? 0));
  const merylContribution = Math.min(merylNet, Math.max(0, newInputs.merylContribution ?? 700000));

  // Check if GFI occurs before or on Forever Home Settlement based on schedule inputs
  const merylSettleEnd = (newInputs.merylStartDelay ?? 0) + (newInputs.merylPrepDays ?? 40) + (newInputs.merylCampaignDays ?? 45) + (newInputs.merylSettleDays ?? 60);
  const gfiStart = merylSettleEnd + (newInputs.gfiStartOffset ?? 1);
  const fhSettleEnd = (newInputs.fhStartDelay ?? 0) + (newInputs.fhSettleDays ?? 53);
  const gfiBeforeFHSettle = gfiStart <= fhSettleEnd;

  const startingCashAtFHSettle = 619830 + (gfiBeforeFHSettle ? merylContribution : 0);

  // Dynamic maximum buffer clamp (starting balance minus mandatory settlement outlay)
  const maxRemainingCash = Math.max(0, startingCashAtFHSettle - minCashRequiredForSettlement);
  const buffer = Math.min(maxRemainingCash, Math.max(0, newInputs.offsetBuffer));

  return {
    ...newInputs,
    merylSalePrice: merylSale,
    merylContribution: merylContribution,
    stampDutyRate: newInputs.stampDutyRate ?? 5.5,
    offsetBuffer: buffer,
    merylRentCostPerWeek: newInputs.merylRentCostPerWeek ?? 150,
    merylRentingExtraDays: newInputs.merylRentingExtraDays ?? 0,
    recastTriggerEvent: newInputs.recastTriggerEvent ?? "gfi",
    merylRentStartOffset: newInputs.merylRentStartOffset ?? 0,
    gfiStartOffset: newInputs.gfiStartOffset ?? 1,
    merylRenoCost: newInputs.merylRenoCost ?? 0,
    paulanRenoCost: newInputs.paulanRenoCost ?? 5000,
    fhRenoMovingCost: newInputs.fhRenoMovingCost ?? 5000,
    paulanStrategy: newInputs.paulanStrategy ?? "sell",
    paulanWeeklyRent: newInputs.paulanWeeklyRent ?? 650,
    paulanWeeklyExpenses: newInputs.paulanWeeklyExpenses ?? 120,
    weeklyIncome: newInputs.weeklyIncome !== undefined ? Math.max(0, newInputs.weeklyIncome) : 5303.35,
    annualInflationRate: newInputs.annualInflationRate ?? 3.0,
    paulanSellLater: newInputs.paulanSellLater ?? false,
    paulanYearsBeforeSale: newInputs.paulanYearsBeforeSale ?? 10,
    paulanGrowthRate: newInputs.paulanGrowthRate ?? 5.0,
    useFixedDiscretionary: newInputs.useFixedDiscretionary ?? true,
    fixedDiscretionaryCash: newInputs.fixedDiscretionaryCash ?? 3000,
    anzSavingsRate: newInputs.anzSavingsRate ?? 3.75,
    usePostBuildFixedDiscretionary: newInputs.usePostBuildFixedDiscretionary ?? true,
    postBuildFixedDiscretionaryCash: newInputs.postBuildFixedDiscretionaryCash ?? 3000,
  };
};

export const TIMELINE_KEYS: (keyof PropertyInputs)[] = [
  "merylStartDelay",
  "merylPrepDays",
  "merylCampaignDays",
  "merylSettleDays",
  "fhStartDelay",
  "fhSettleDays",
  "renoDays",
  "moveDays",
  "paulanStartDelay",
  "paulanPrepDays",
  "paulanCampaignDays",
  "paulanSettleDays",
  "merylRentingExtraDays",
  "merylRentStartOffset",
  "gfiStartOffset"
];
