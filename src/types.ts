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
}

export interface PropertyScenario {
  name: string;
  inputs: PropertyInputs;
}

export interface ActiveInteraction {
  type: string;
  field: keyof PropertyInputs;
  startX: number;
  startVal: number;
}

export interface SimulationDataPoint {
  week: number;
  year: string;
  loanFH: number;
  offsetFH: number;
  loanFern: number;
  offsetFern: number;
  netDebt: number;
}
