export interface PropertyInputs {
  purchasePrice: number;
  paulanSalePrice: number;
  merylSalePrice: number;
  merylContribution: number;
  paulanOffsetPulled: number;
  fernOffsetPulled: number;
  offsetBuffer: number;
  weeklySavings: number;
  interestRate: number;
  stampDutyRate: number; // Stamp Duty / purchase cost percent
  
  merylStartDelay: number;
  merylPrepDays: number;
  merylCampaignDays: number;
  merylSettleDays: number;
  
  fhStartDelay: number;
  fhSettleDays: number;
  renoDays: number;
  moveDays: number;
  
  paulanStartDelay: number;
  paulanPrepDays: number;
  paulanCampaignDays: number;
  paulanSettleDays: number;
  
  internalVariationPct: number;
  depletionPriorityToggle: "paulan" | "fern";
  merylRentCostPerWeek: number;
  merylRentingExtraDays: number;
  recastTriggerEvent: "paulan" | "gfi" | "day1";
  merylRentStartOffset: number;
  gfiStartOffset: number;
  merylRenoCost: number;
  paulanRenoCost: number;
  fhRenoMovingCost: number;
  paulanStrategy?: "sell" | "rent";
  paulanWeeklyRent?: number;
  paulanWeeklyExpenses?: number;
  annualInflationRate?: number;
  paulanSellLater?: boolean;
  paulanYearsBeforeSale?: number;
  paulanGrowthRate?: number;
}

export interface PropertyScenario {
  name: string;
  inputs: PropertyInputs;
}

export interface ActiveInteraction {
  type: string;
  field: keyof PropertyInputs;
  startX: number;
  startVals: PropertyInputs;
}

export interface SimulationDataPoint {
  week: number;
  year: string;
  loanFH: number;
  offsetFH: number;
  loanFern: number;
  offsetFern: number;
  loanPaulan?: number;
  offsetPaulan?: number;
  newLoansPayable?: number;
  newLoansOffset?: number;
  newBuildLoan?: number;
  newBuildOffset?: number;
  extraCashSavings?: number;
  netDebt: number;
  propertyValue?: number;
  netWealth?: number;
}

export interface FutureExpense {
  id: string;
  name: string;
  amount: number;
  timingYears: number; // select in 1-month increments (steps of 1/12)
  source: "offset_fh" | "offset_fern" | "new_loan";
}

export interface FutureIncome {
  id: string;
  name: string;
  annualAmount: number;
  timingStartYears: number; // start timing (steps of 1/12)
  timingEndYears: number | null; // null means indefinite
}
