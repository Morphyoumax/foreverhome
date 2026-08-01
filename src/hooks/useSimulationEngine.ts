import { useMemo } from "react";
import { PropertyInputs, SimulationDataPoint, FutureExpense, FutureIncome } from "../types";
import { ACCOUNT_BALANCES } from "../constants/defaults";

const WeeklyNetSalary = 5303.35; // Locked family salary split

// Helper function to calculate a calendar date from a day offset
const getGanttDateStr = (days: number) => {
  const d = new Date(2026, 6, 6); // July 6, 2026
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
};

export interface UseSimulationEngineParams {
  inputs: PropertyInputs;
  timeline: any;
  futureExpenses: FutureExpense[];
  futureIncomes: FutureIncome[];
  newBuildSpend: number;
  newBuildTiming: number;
  newBuildBuffer: number;
  newBuildDrawChoicePct: number;
  newBuildPostWeeklySavingsOverride: number | null;
}

export function useSimulationEngine({
  inputs,
  timeline,
  futureExpenses,
  futureIncomes,
  newBuildSpend,
  newBuildTiming,
  newBuildBuffer,
  newBuildDrawChoicePct,
  newBuildPostWeeklySavingsOverride,
}: UseSimulationEngineParams) {
  return useMemo(() => {
    // Dynamically selected purchase cost calculation, default is Victoria 5.5%
    const rate = (inputs.stampDutyRate ?? 5.5) / 100;
    const stampDuty = inputs.purchasePrice * rate;
    const transactionCosts = 5000;
    const totalAcquisitionCost =
      inputs.purchasePrice + stampDuty + transactionCosts;

    // Check if GFI occurs before or on Forever Home Settlement based on schedule inputs
    const gfiBeforeFHSettle = timeline.gfiStart <= timeline.fhSettleEnd;
    const startingCashAtFHSettle = 619830 + (gfiBeforeFHSettle ? inputs.merylContribution : 0);

    // Absolute physical upper bound limits based on maximum borrowing facility and cash offsets using rate
    const maxAffordablePrice = Math.floor((1500000 - 5000 + startingCashAtFHSettle) / (1 + rate));

    // Mandatory cash gap representing settlement friction above the maximum borrowing capacity
    const minCashRequiredForSettlement = Math.max(
      0,
      totalAcquisitionCost - 1500000
    );

    // Ideal remaining cushion buffer: we want to preserve inputs.offsetBuffer if possible.
    // The cash we can deploy: starting cash minus the buffer.
    const idealPull = Math.max(0, startingCashAtFHSettle - inputs.offsetBuffer);

    // The actual cash we must pull on Day 1 is the larger of the minimum needed to settle and what we choose to pull
    let actualPull = Math.max(minCashRequiredForSettlement, idealPull);

    // If actualPull exceeds our physical starting cash constraint, then the purchase is unaffordable.
    // We clamp actualPull to starting cash.
    actualPull = Math.min(startingCashAtFHSettle, actualPull);

    // Programmatic Waterfall for the starting offsets based on user-selectable priority toggle:
    let paulanOffsetPulled = 0;
    let fernOffsetPulled = 0;

    const maxFernOffsetAvailable = ACCOUNT_BALANCES.fernOffset + (gfiBeforeFHSettle ? inputs.merylContribution : 0);

    if (inputs.depletionPriorityToggle === "paulan") {
      paulanOffsetPulled = Math.min(ACCOUNT_BALANCES.paulansOffset, actualPull);
      fernOffsetPulled = Math.min(maxFernOffsetAvailable, Math.max(0, actualPull - paulanOffsetPulled));
    } else {
      fernOffsetPulled = Math.min(maxFernOffsetAvailable, actualPull);
      paulanOffsetPulled = Math.min(ACCOUNT_BALANCES.paulansOffset, Math.max(0, actualPull - fernOffsetPulled));
    }

    const totalOffsetsPulled = paulanOffsetPulled + fernOffsetPulled;

    // Dynamic cap on loan: Cannot exceed $1,500,000 concurrent lender limit
    const loanRequired = Math.min(
      1500000,
      Math.max(0, totalAcquisitionCost - totalOffsetsPulled)
    );

    // 20% Deposit of Loan Value targeting standard bank constraints
    const targetDeposit20PctOfLoan = loanRequired * 0.2;

    // Remaining Day 1 cash cushion left over (total starting cash is startingCashAtFHSettle minus actual cash paid out)
    const remainingDay1CashCushion = Math.max(
      0,
      startingCashAtFHSettle - (totalAcquisitionCost - loanRequired)
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
    const paulanSale = inputs.paulanSalePrice ?? 690000;
    const sellingCosts = paulanSale * 0.025; // 2.5% fixed commissions & legals
    const paulanNetProceeds = inputs.paulanStrategy === "rent"
      ? 0
      : Math.max(
          0,
          paulanSale - ACCOUNT_BALANCES.paulansLoan - sellingCosts - (inputs.paulanRenoCost ?? 5000)
        );

    // Meryl's Twin Ranges sale details with dynamic sale price
    const merylGrossProceeds = inputs.merylSalePrice ?? 720000;
    const merylSellingFees = merylGrossProceeds * 0.025; // 2.5% standard commissions, marketing, conveyancing, legals
    const merylNetProceeds = Math.max(
      0,
      merylGrossProceeds - merylSellingFees - (inputs.merylRenoCost ?? 0)
    );
    const merylCashSurplus = Math.max(0, merylNetProceeds - inputs.merylContribution);

    // Post-Settlement Liquid Injection Pool: Include both remaining day 1 cash cushion and post-sale cash
    const totalPostSaleCashPool = paulanNetProceeds + (gfiBeforeFHSettle ? 0 : inputs.merylContribution);
    const totalCombinedPool = remainingDay1CashCushion + totalPostSaleCashPool;

    // Internal Variation Split:
    const variationPct = inputs.internalVariationPct / 100;
    const appliedToPrincipalReduction = Math.min(
      loanRequired,
      totalCombinedPool * variationPct
    );
    const paulanPrepPaid = inputs.paulanStrategy === "rent" ? (inputs.paulanRenoCost ?? 5000) : 0;
    const keptInOffsetAccount = Math.max(
      0,
      totalCombinedPool - appliedToPrincipalReduction - (inputs.fhRenoMovingCost ?? 5000) - paulanPrepPaid
    );

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

    // Calculate Fern St variable repayment (base rate 6.13%)
    const rWeeklyFernSim = 0.0613 / 52;
    const nWeeksFern = 30 * 52;
    const fernWeeklyPayment = (ACCOUNT_BALANCES.fernLoan * rWeeklyFernSim * Math.pow(1 + rWeeklyFernSim, nWeeksFern)) / (Math.pow(1 + rWeeklyFernSim, nWeeksFern) - 1);

    // Standard Cash Flow Ratios
    const totalCommittedWeeklyOutlays = recastWeeklyPayment + fernWeeklyPayment;
    const effectiveWeeklySavings = inputs.useFixedDiscretionary
      ? Math.max(0, WeeklyNetSalary - totalCommittedWeeklyOutlays - (inputs.fixedDiscretionaryCash ?? 3000))
      : inputs.weeklySavings;

    const rWeeklySavings = (inputs.anzSavingsRate ?? 3.75) / 100 / 52;

    const mortgageToIncomeRatio =
      (totalCommittedWeeklyOutlays / WeeklyNetSalary) * 100;
    const mortgageWithSavingsStrainRatio =
      ((totalCommittedWeeklyOutlays + effectiveWeeklySavings) / WeeklyNetSalary) * 100;
    const leftoverDiscretionaryCash =
      inputs.useFixedDiscretionary
        ? (inputs.fixedDiscretionaryCash ?? 3000)
        : (WeeklyNetSalary - totalCommittedWeeklyOutlays - inputs.weeklySavings);

    // PART A: Run Baseline Portfolio Simulation (ignoring future expenses and other incomes)
    const w_build = Math.round(newBuildTiming * 52);
    const baselineSimulationData: SimulationDataPoint[] = [];
    let bSimLoanFH = recastForeverHomeLoanPrincipal;
    let bSimOffsetFH = recastOffsetBalance;
    let bSimLoanFern = ACCOUNT_BALANCES.fernLoan;
    let bSimOffsetFern = 0;
    let bSimExtraCashSavings = 0;

    let bSimLoanPaulan = inputs.paulanStrategy === "rent" ? ACCOUNT_BALANCES.paulansLoan : 0;
    let bSimOffsetPaulan = inputs.paulanStrategy === "rent" ? Math.max(0, ACCOUNT_BALANCES.paulansOffset - paulanOffsetPulled) : 0;
    let bPaulanTotalInterestPaid = 0;

    let baselineFhNeutralizedWeek = -1;
    let baselineBothNeutralizedWeek = -1;
    let baselineHalfOffsetWeek = -1;
    let baselineFullyOffsetWeek = -1;

    let bFhTotalInterestPaid = 0;
    let bFernTotalInterestPaid = 0;

    let bMilestoneFHOffset = {
      fhLoan: 0,
      fhOffset: 0,
      fernLoan: 0,
      fernOffset: 0,
      week: -1,
    };

    let bMilestoneFernOffset = {
      fhLoan: 0,
      fhOffset: 0,
      fernLoan: 0,
      fernOffset: 0,
      week: -1,
    };

    const rWeeklyFHSim = rWeekly;
    const w_paulan_sale = Math.round((inputs.paulanYearsBeforeSale ?? 10) * 52);

    for (let w = 0; w <= 30 * 52; w++) {
      if (bSimExtraCashSavings > 0) {
        bSimExtraCashSavings += bSimExtraCashSavings * rWeeklySavings;
      }

      let bPaulanSaleCashRelease = 0;
      if (inputs.paulanStrategy === "rent" && inputs.paulanSellLater && w === w_paulan_sale) {
        const tVal = w / 52;
        const grossProceeds = inputs.paulanSalePrice * Math.pow(1 + (inputs.paulanGrowthRate ?? 5) / 100, tVal);
        const sellingCosts = grossProceeds * 0.025;
        bPaulanSaleCashRelease = Math.max(0, grossProceeds - sellingCosts - bSimLoanPaulan + bSimOffsetPaulan);
        
        bSimLoanPaulan = 0;
        bSimOffsetPaulan = 0;
      }

      const bTotalDebt = bSimLoanFH + bSimLoanFern + (inputs.paulanStrategy === "rent" ? bSimLoanPaulan : 0);
      const bTotalOffsets = bSimOffsetFH + bSimOffsetFern + (inputs.paulanStrategy === "rent" ? bSimOffsetPaulan : 0) + bSimExtraCashSavings;
      if (w >= w_build && bTotalDebt > 0 && bTotalOffsets >= bTotalDebt * 0.5 && baselineHalfOffsetWeek === -1) {
        baselineHalfOffsetWeek = w;
      }
      const isBaselineFullyOffset = bTotalOffsets >= bTotalDebt || bTotalDebt <= 0;
      if (isBaselineFullyOffset && baselineFullyOffsetWeek === -1) {
        baselineFullyOffsetWeek = w;
      }

      if (bSimOffsetFH >= bSimLoanFH && baselineFhNeutralizedWeek === -1) {
        baselineFhNeutralizedWeek = w;
        bMilestoneFHOffset = {
          fhLoan: Math.round(bSimLoanFH),
          fhOffset: Math.round(bSimOffsetFH),
          fernLoan: Math.round(bSimLoanFern),
          fernOffset: Math.round(bSimOffsetFern),
          week: w,
        };
      }
      if (
        bSimOffsetFH >= bSimLoanFH &&
        bSimOffsetFern >= bSimLoanFern &&
        baselineBothNeutralizedWeek === -1
      ) {
        baselineBothNeutralizedWeek = w;
        bMilestoneFernOffset = {
          fhLoan: Math.round(bSimLoanFH),
          fhOffset: Math.round(bSimOffsetFH),
          fernLoan: Math.round(bSimLoanFern),
          fernOffset: Math.round(bSimOffsetFern),
          week: w,
        };
      }

      const fhInterest = Math.max(0, bSimLoanFH - bSimOffsetFH) * rWeeklyFHSim;
      const fernInterest = Math.max(0, bSimLoanFern - bSimOffsetFern) * rWeeklyFernSim;
      const paulanInterest = inputs.paulanStrategy === "rent"
        ? Math.max(0, bSimLoanPaulan - bSimOffsetPaulan) * (0.0618 / 52)
        : 0;

      bFhTotalInterestPaid += fhInterest;
      bFernTotalInterestPaid += fernInterest;
      if (inputs.paulanStrategy === "rent" && bSimLoanPaulan > 0) {
        bPaulanTotalInterestPaid += paulanInterest;
      }

      let actualFhPaymentPaid = 0;
      let fhPrincipalReduction = 0;
      if (bSimLoanFH > 0) {
        fhPrincipalReduction = Math.max(0, recastWeeklyPayment - fhInterest);
        if (bSimLoanFH - fhPrincipalReduction <= 0) {
          actualFhPaymentPaid = fhInterest + bSimLoanFH;
        } else {
          actualFhPaymentPaid = recastWeeklyPayment;
        }
      }
      bSimLoanFH = Math.max(0, bSimLoanFH - fhPrincipalReduction);

      let actualFernPaymentPaid = 0;
      let fernPrincipalReduction = 0;
      if (bSimLoanFern > 0) {
        fernPrincipalReduction = Math.max(0, fernWeeklyPayment - fernInterest);
        if (bSimLoanFern - fernPrincipalReduction <= 0) {
          actualFernPaymentPaid = fernInterest + bSimLoanFern;
        } else {
          actualFernPaymentPaid = fernWeeklyPayment;
        }
      }
      bSimLoanFern = Math.max(0, bSimLoanFern - fernPrincipalReduction);

      let actualPaulanPaymentPaid = 0;
      if (inputs.paulanStrategy === "rent" && bSimLoanPaulan > 0) {
        actualPaulanPaymentPaid = Math.min(bSimLoanPaulan + paulanInterest, 537.36);
        const paulanPrincipalPaid = Math.max(0, 537.36 - paulanInterest);
        bSimLoanPaulan = Math.max(0, bSimLoanPaulan - paulanPrincipalPaid);
      }

      // Freed up payments from loans completely ended
      const fhFreedUp = recastWeeklyPayment - actualFhPaymentPaid;
      const fernFreedUp = fernWeeklyPayment - actualFernPaymentPaid;

      const hasPaulanBeenSold = inputs.paulanStrategy === "rent" && inputs.paulanSellLater && w >= w_paulan_sale;
      const currentRent = (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold)
        ? inputs.paulanWeeklyRent * Math.pow(1 + (inputs.annualInflationRate ?? 3) / 100, Math.floor(w / 52))
        : 0;
      const currentExpenses = (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold)
        ? inputs.paulanWeeklyExpenses * Math.pow(1 + (inputs.annualInflationRate ?? 3) / 100, Math.floor(w / 52))
        : 0;

      let remainingSavings = effectiveWeeklySavings + fhFreedUp + fernFreedUp;
      if (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold) {
        remainingSavings += (currentRent - currentExpenses) - actualPaulanPaymentPaid;
      }

      // Clamping of baseline offsets due to decreasing loan principal
      let bExcessFromClamping = 0;
      if (bSimOffsetFH > bSimLoanFH) {
        bExcessFromClamping += (bSimOffsetFH - bSimLoanFH);
        bSimOffsetFH = bSimLoanFH;
      }
      if (bSimOffsetFern > bSimLoanFern) {
        bExcessFromClamping += (bSimOffsetFern - bSimLoanFern);
        bSimOffsetFern = bSimLoanFern;
      }
      if (inputs.paulanStrategy === "rent" && bSimOffsetPaulan > bSimLoanPaulan) {
        bExcessFromClamping += (bSimOffsetPaulan - bSimLoanPaulan);
        bSimOffsetPaulan = bSimLoanPaulan;
      }

      let bCashPool = remainingSavings + bExcessFromClamping + bPaulanSaleCashRelease;

      // Deposit order: 1. FH Offset, 2. Paulan Offset (if prioritized), 3. Fern Offset, 4. Paulan Offset (if not prioritized), 5. Extra Cash Savings
      if (bCashPool > 0 && bSimOffsetFH < bSimLoanFH) {
        const space = bSimLoanFH - bSimOffsetFH;
        const deposit = Math.min(bCashPool, space);
        bSimOffsetFH += deposit;
        bCashPool -= deposit;
      }

      if (inputs.paulanStrategy === "rent" && inputs.depletionPriorityToggle === "paulan") {
        if (bCashPool > 0 && bSimOffsetPaulan < bSimLoanPaulan) {
          const space = bSimLoanPaulan - bSimOffsetPaulan;
          const deposit = Math.min(bCashPool, space);
          bSimOffsetPaulan += deposit;
          bCashPool -= deposit;
        }
      }

      if (bCashPool > 0 && bSimOffsetFern < bSimLoanFern) {
        const space = bSimLoanFern - bSimOffsetFern;
        const deposit = Math.min(bCashPool, space);
        bSimOffsetFern += deposit;
        bCashPool -= deposit;
      }

      if (inputs.paulanStrategy === "rent" && inputs.depletionPriorityToggle !== "paulan") {
        if (bCashPool > 0 && bSimOffsetPaulan < bSimLoanPaulan) {
          const space = bSimLoanPaulan - bSimOffsetPaulan;
          const deposit = Math.min(bCashPool, space);
          bSimOffsetPaulan += deposit;
          bCashPool -= deposit;
        }
      }

      if (bCashPool > 0) {
        bSimExtraCashSavings += bCashPool;
        bCashPool = 0;
      }

      if (w % 13 === 0 || w === 30 * 52) {
        const tVal = w / 52;
        const fhVal = inputs.purchasePrice * Math.pow(1.05, tVal);
        const fernVal = 850000 * Math.pow(1.05, tVal);
        let paulanVal = 0;
        if (inputs.paulanStrategy === "rent") {
          const isSold = inputs.paulanSellLater && w >= w_paulan_sale;
          if (!isSold) {
            paulanVal = inputs.paulanSalePrice * Math.pow(1 + (inputs.paulanGrowthRate ?? 5) / 100, tVal);
          }
        }
        const totalPropValue = Math.round(fhVal + fernVal + paulanVal);
        const currentNetDebt = (bSimLoanFH - bSimOffsetFH) + 
          (bSimLoanFern - bSimOffsetFern) + 
          (inputs.paulanStrategy === "rent" ? (bSimLoanPaulan - bSimOffsetPaulan) : 0) - 
          bSimExtraCashSavings;
        const netWealthVal = Math.round(totalPropValue - currentNetDebt);

        baselineSimulationData.push({
          week: w,
          year: (w / 52).toFixed(1),
          loanFH: Math.round(bSimLoanFH),
          offsetFH: Math.round(bSimOffsetFH),
          loanFern: Math.round(bSimLoanFern),
          offsetFern: Math.round(bSimOffsetFern),
          extraCashSavings: Math.round(bSimExtraCashSavings),
          netDebt: Math.round(currentNetDebt),
          propertyValue: totalPropValue,
          netWealth: netWealthVal,
        });
      }
    }

    if (baselineFhNeutralizedWeek === -1) {
      bMilestoneFHOffset = {
        fhLoan: Math.round(bSimLoanFH),
        fhOffset: Math.round(bSimOffsetFH),
        fernLoan: Math.round(bSimLoanFern),
        fernOffset: Math.round(bSimOffsetFern),
        week: 30 * 52,
      };
    }
    if (baselineBothNeutralizedWeek === -1) {
      bMilestoneFernOffset = {
        fhLoan: Math.round(bSimLoanFH),
        fhOffset: Math.round(bSimOffsetFH),
        fernLoan: Math.round(bSimLoanFern),
        fernOffset: Math.round(bSimOffsetFern),
        week: 30 * 52,
      };
    }

    // PART B: Run Active Portfolio Simulation (including future expenses and other incomes)
    const simulationData: SimulationDataPoint[] = [];
    let simLoanFH = recastForeverHomeLoanPrincipal;
    let simOffsetFH = recastOffsetBalance;
    let simLoanFern = ACCOUNT_BALANCES.fernLoan;
    let simOffsetFern = 0;
    let simExtraCashSavings = 0;

    let simLoanPaulan = inputs.paulanStrategy === "rent" ? ACCOUNT_BALANCES.paulansLoan : 0;
    let simOffsetPaulan = inputs.paulanStrategy === "rent" ? Math.max(0, ACCOUNT_BALANCES.paulansOffset - paulanOffsetPulled) : 0;
    let paulanTotalInterestPaidSim = 0;
    let paulanTotalPaidSim = 0;

    let fhNeutralizedWeek = -1;
    let bothNeutralizedWeek = -1;
    let fernNeutralizedWeek = -1;
    let nbFullyOffsetWeek = -1;

    let fhPaidOffWeek = -1;
    let fernPaidOffWeek = -1;
    let nbPaidOffWeek = -1;
    let paulanPaidOffWeek = -1;

    let fhTotalInterestPaidSim = 0;
    let fernTotalInterestPaidSim = 0;
    let nbTotalInterestPaidSim = 0;

    let fhTotalPaidSim = 0;
    let fernTotalPaidSim = 0;
    let nbTotalPaidSim = 0;

    let fhInterestAtOffset = 0;
    let fhInterestAtBothOffset = 0;
    let fernInterestAtBothOffset = 0;

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

    // Track active new loans created during simulation with offset attachment
    let activeNewLoans: { id: string; amount: number; principal: number; weeklyPayment: number; weekStarted: number; offset: number }[] = [];
    let activeNewLoansInterestPaid = 0;

    // Track New Build Loan created during simulation
    let simLoanNewBuild = 0;
    let simOffsetNewBuild = 0;
    let newBuildWeeklyPayment = 0;
    let newBuildInterestPaid = 0;
    // w_build is defined above at the start of Part A

    let liquidOffsetAtBuildVal = 0;
    let actualDrawFromOffsetsVal = 0;
    let newBuildLoanAmountVal = 0;
    let postBuildGrossCashSurplusVal = 0;

    let activeHalfOffsetWeek = -1;
    let activeFullyOffsetWeek = -1;

    let fhInterestAtActiveFullyOffset = 0;
    let fernInterestAtActiveFullyOffset = 0;
    let nbInterestAtActiveFullyOffset = 0;
    let newLoansInterestAtActiveFullyOffset = 0;

    let milestoneActiveFullyOffset = {
      fhLoan: 0,
      fhOffset: 0,
      fernLoan: 0,
      fernOffset: 0,
      nbLoan: 0,
      nbOffset: 0,
      otherLoan: 0,
      otherOffset: 0,
      week: -1,
    };

    const historyStateAtWeek = new Map<number, {
      fhLoan: number;
      fhOffset: number;
      fernLoan: number;
      fernOffset: number;
      nbLoan: number;
      nbOffset: number;
      otherLoan: number;
      otherOffset: number;
      extraCash: number;
      loanPaulan?: number;
      offsetPaulan?: number;
    }>();

    for (let w = 0; w <= 30 * 52; w++) {
      if (simExtraCashSavings > 0) {
        simExtraCashSavings += simExtraCashSavings * rWeeklySavings;
      }

      let paulanSaleCashRelease = 0;
      if (inputs.paulanStrategy === "rent" && inputs.paulanSellLater && w === w_paulan_sale) {
        const tVal = w / 52;
        const grossProceeds = inputs.paulanSalePrice * Math.pow(1 + (inputs.paulanGrowthRate ?? 5) / 100, tVal);
        const sellingCosts = grossProceeds * 0.025;
        paulanSaleCashRelease = Math.max(0, grossProceeds - sellingCosts - simLoanPaulan + simOffsetPaulan);
        
        simLoanPaulan = 0;
        simOffsetPaulan = 0;
        paulanPaidOffWeek = w;
      }

      // 1. Process future drawdowns/expenses starting this week
      futureExpenses.forEach((exp) => {
        const triggerWeek = Math.round(exp.timingYears * 52);
        if (w === triggerWeek) {
          if (exp.source === "offset_fh") {
            let needed = exp.amount;
            // 1. Draw from FH offset
            const pullFH = Math.min(simOffsetFH, needed);
            simOffsetFH -= pullFH;
            needed -= pullFH;
            // 2. Draw from extra cash savings
            if (needed > 0) {
              const pullExtra = Math.min(simExtraCashSavings, needed);
              simExtraCashSavings -= pullExtra;
              needed -= pullExtra;
            }
            // 3. Draw from Fern offset
            if (needed > 0) {
              const pullFern = Math.min(simOffsetFern, needed);
              simOffsetFern -= pullFern;
              needed -= pullFern;
            }
            // 4. Draw from New Build offset
            if (needed > 0 && simOffsetNewBuild > 0) {
              const pullNB = Math.min(simOffsetNewBuild, needed);
              simOffsetNewBuild -= pullNB;
              needed -= pullNB;
            }
            // 5. Unfunded balance becomes a new loan
            if (needed > 0) {
              const rLoanWeekly = rWeeklyFHSim;
              const nLoanWeeks = 30 * 52;
              const pmt = rLoanWeekly > 0 
                ? (needed * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
                : 0;
              activeNewLoans.push({
                id: exp.id + "_unfunded",
                amount: needed,
                principal: needed,
                weeklyPayment: pmt,
                weekStarted: w,
                offset: 0,
              });
            }
          } else if (exp.source === "offset_fern") {
            let needed = exp.amount;
            // 1. Draw from Fern offset
            const pullFern = Math.min(simOffsetFern, needed);
            simOffsetFern -= pullFern;
            needed -= pullFern;
            // 2. Draw from extra cash savings
            if (needed > 0) {
              const pullExtra = Math.min(simExtraCashSavings, needed);
              simExtraCashSavings -= pullExtra;
              needed -= pullExtra;
            }
            // 3. Draw from FH offset
            if (needed > 0) {
              const pullFH = Math.min(simOffsetFH, needed);
              simOffsetFH -= pullFH;
              needed -= pullFH;
            }
            // 4. Draw from New Build offset
            if (needed > 0 && simOffsetNewBuild > 0) {
              const pullNB = Math.min(simOffsetNewBuild, needed);
              simOffsetNewBuild -= pullNB;
              needed -= pullNB;
            }
            // 5. Unfunded balance becomes a new loan
            if (needed > 0) {
              const rLoanWeekly = rWeeklyFHSim;
              const nLoanWeeks = 30 * 52;
              const pmt = rLoanWeekly > 0 
                ? (needed * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
                : 0;
              activeNewLoans.push({
                id: exp.id + "_unfunded",
                amount: needed,
                principal: needed,
                weeklyPayment: pmt,
                weekStarted: w,
                offset: 0,
              });
            }
          } else if (exp.source === "new_loan") {
            // New loan P&I over standard 30-year term
            const rLoanWeekly = rWeeklyFHSim;
            const nLoanWeeks = 30 * 52;
            const pmt = rLoanWeekly > 0 
              ? (exp.amount * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
              : 0;
            
            activeNewLoans.push({
              id: exp.id,
              amount: exp.amount,
              principal: exp.amount,
              weeklyPayment: pmt,
              weekStarted: w,
              offset: 0,
            });
          }
        }
      });

      // Process New Build spending drawdown event at exact week
      if (w === w_build) {
        liquidOffsetAtBuildVal = simOffsetFH + simOffsetFern + simExtraCashSavings;
        const availableOffsets = Math.max(0, liquidOffsetAtBuildVal - newBuildBuffer);
        const preferredDraw = availableOffsets * (newBuildDrawChoicePct / 100);
        actualDrawFromOffsetsVal = Math.min(newBuildSpend, preferredDraw);
        newBuildLoanAmountVal = Math.max(0, newBuildSpend - actualDrawFromOffsetsVal);

        // Deduct actualDrawFromOffsetsVal from our offset reserves / savings
        let pullRemaining = actualDrawFromOffsetsVal;
        if (pullRemaining > 0) {
          // First draw from the extra cash savings!
          const pullExtra = Math.min(simExtraCashSavings, pullRemaining);
          simExtraCashSavings -= pullExtra;
          pullRemaining -= pullExtra;

          // If still remaining, draw from actual offset accounts based on toggle
          if (pullRemaining > 0) {
            if (inputs.depletionPriorityToggle === "paulan") {
              const pullFH = Math.min(simOffsetFH, pullRemaining);
              simOffsetFH -= pullFH;
              pullRemaining -= pullFH;
              if (pullRemaining > 0) {
                const pullFern = Math.min(simOffsetFern, pullRemaining);
                simOffsetFern -= pullFern;
                pullRemaining -= pullFern;
              }
            } else {
              const pullFern = Math.min(simOffsetFern, pullRemaining);
              simOffsetFern -= pullFern;
              pullRemaining -= pullFern;
              if (pullRemaining > 0) {
                const pullFH = Math.min(simOffsetFH, pullRemaining);
                simOffsetFH -= pullFH;
                pullRemaining -= pullFH;
              }
            }
          }
        }

        if (newBuildLoanAmountVal > 0) {
          simLoanNewBuild = newBuildLoanAmountVal;
          const rLoanWeekly = rWeeklyFHSim;
          const nLoanWeeks = 30 * 52;
          newBuildWeeklyPayment = rLoanWeekly > 0 
            ? (newBuildLoanAmountVal * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
            : 0;
        }

        // Redistribute ALL remaining cash reserves in order of priority: Forever Home, New Build, Fern St, then Extra Savings
        const totalRemainingReserves = simOffsetFH + simOffsetFern + simOffsetNewBuild + simExtraCashSavings;
        let pool = totalRemainingReserves;

        simOffsetFH = Math.min(pool, simLoanFH);
        pool -= simOffsetFH;

        simOffsetNewBuild = Math.min(pool, simLoanNewBuild);
        pool -= simOffsetNewBuild;

        simOffsetFern = Math.min(pool, simLoanFern);
        pool -= simOffsetFern;

        simExtraCashSavings = pool;

        // Calculate postBuildGrossCashSurplusVal at exact build week
        const activeExtraIncomesAtBuild = futureIncomes.filter(inc => {
          const startWeek = Math.round(inc.timingStartYears * 52);
          const endWeek = inc.timingEndYears !== null ? Math.round(inc.timingEndYears * 52) : (30 * 52);
          return w_build >= startWeek && w_build <= endWeek;
        });
        const totalActiveExtraWeeklyIncomeAtBuild = activeExtraIncomesAtBuild.reduce((sum, inc) => {
          return sum + (inc.annualAmount * 0.85) / 52;
        }, 0);
        const totalWeeklyNetIncomeAtBuild = 5303.35 + totalActiveExtraWeeklyIncomeAtBuild;

        const isFHPaidOffByBuild = fhPaidOffWeek !== -1 && w_build >= fhPaidOffWeek;
        const isFernPaidOffByBuild = fernPaidOffWeek !== -1 && w_build >= fernPaidOffWeek;
        const isNBPaidOffByBuild = nbPaidOffWeek !== -1 && w_build >= nbPaidOffWeek;

        const fhRepaymentAtBuild = isFHPaidOffByBuild ? 0 : recastWeeklyPayment;
        const fernRepaymentAtBuild = isFernPaidOffByBuild ? 0 : fernWeeklyPayment;
        const nbRepaymentAtBuild = isNBPaidOffByBuild ? 0 : newBuildWeeklyPayment;

        const activeExpenseLoansAtBuild = futureExpenses
          .filter(exp => exp.source === "new_loan" && Math.round(exp.timingYears * 52) <= w_build)
          .map(exp => {
            const rLoanWeekly = (inputs.interestRate / 100) / 52;
            const nLoanWeeks = 30 * 52;
            const pmt = rLoanWeekly > 0 
              ? (exp.amount * rLoanWeekly * Math.pow(1 + rLoanWeekly, nLoanWeeks)) / (Math.pow(1 + rLoanWeekly, nLoanWeeks) - 1)
              : 0;
            return pmt;
          });
        const totalExpenseLoansPaymentAtBuild = activeExpenseLoansAtBuild.reduce((sum, pmt) => sum + pmt, 0);

        const totalRepaymentsAtBuild = fhRepaymentAtBuild + fernRepaymentAtBuild + nbRepaymentAtBuild + totalExpenseLoansPaymentAtBuild;
        postBuildGrossCashSurplusVal = totalWeeklyNetIncomeAtBuild - totalRepaymentsAtBuild;
      }

      // 2. Process extra incomes in this week with 15% tax haircut applied
      let extraWeeklyIncomeInThisWeek = 0;
      futureIncomes.forEach((inc) => {
        const startWeek = Math.round(inc.timingStartYears * 52);
        const endWeek = inc.timingEndYears !== null ? Math.round(inc.timingEndYears * 52) : (30 * 52);
        if (w >= startWeek && w <= endWeek) {
          const weeklyAfterTax = (inc.annualAmount * 0.85) / 52;
          extraWeeklyIncomeInThisWeek += weeklyAfterTax;
        }
      });

      // 3. Update active simulation neutralization triggers
      let currNewLoansPrincipal = 0;
      let currNewLoansOffset = 0;
      activeNewLoans.forEach((l) => {
        currNewLoansPrincipal += l.principal;
        currNewLoansOffset += l.offset;
      });

      const activeTotalDebt = simLoanFH + simLoanFern + (inputs.paulanStrategy === "rent" ? simLoanPaulan : 0) + currNewLoansPrincipal + simLoanNewBuild;
      const activeTotalOffsets = simOffsetFH + simOffsetFern + (inputs.paulanStrategy === "rent" ? simOffsetPaulan : 0) + currNewLoansOffset + simOffsetNewBuild + simExtraCashSavings;

      if (w >= w_build && activeTotalDebt > 0 && activeTotalOffsets >= activeTotalDebt * 0.5 && activeHalfOffsetWeek === -1) {
        activeHalfOffsetWeek = w;
      }
      const fhInterest = Math.max(0, simLoanFH - simOffsetFH) * rWeeklyFHSim;
      const fernInterest = Math.max(0, simLoanFern - simOffsetFern) * rWeeklyFernSim;
      const paulanInterest = inputs.paulanStrategy === "rent"
        ? Math.max(0, simLoanPaulan - simOffsetPaulan) * (0.0618 / 52)
        : 0;

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

      // Accumulate interest paid prior to reaching neutralization milestones
      if (fhNeutralizedWeek === -1) {
        fhInterestAtOffset += fhInterest;
      }
      if (bothNeutralizedWeek === -1) {
        fhInterestAtBothOffset += fhInterest;
        fernInterestAtBothOffset += fernInterest;
      }

      fhInterestAtActiveFullyOffset += fhInterest;
      fernInterestAtActiveFullyOffset += fernInterest;
      if (simLoanNewBuild > 0 && w >= w_build) {
        const nbInterest = Math.max(0, simLoanNewBuild - simOffsetNewBuild) * rWeeklyFHSim;
        nbInterestAtActiveFullyOffset += nbInterest;
      }
      activeNewLoans.forEach((loan) => {
        if (loan.principal > 0) {
          const lInterest = Math.max(0, loan.principal - loan.offset) * rWeeklyFHSim;
          newLoansInterestAtActiveFullyOffset += lInterest;
        }
      });

      if (simOffsetFern >= simLoanFern && fernNeutralizedWeek === -1) {
        fernNeutralizedWeek = w;
      }

      let actualFhPaymentPaid = 0;
      if (simLoanFH > 0) {
        fhTotalInterestPaidSim += fhInterest;
        actualFhPaymentPaid = Math.min(simLoanFH + fhInterest, recastWeeklyPayment);
        fhTotalPaidSim += actualFhPaymentPaid;
      }
      let actualFernPaymentPaid = 0;
      if (simLoanFern > 0) {
        fernTotalInterestPaidSim += fernInterest;
        actualFernPaymentPaid = Math.min(simLoanFern + fernInterest, fernWeeklyPayment);
        fernTotalPaidSim += actualFernPaymentPaid;
      }
      let actualPaulanPaymentPaid = 0;
      if (inputs.paulanStrategy === "rent" && simLoanPaulan > 0) {
        paulanTotalInterestPaidSim += paulanInterest;
        actualPaulanPaymentPaid = Math.min(simLoanPaulan + paulanInterest, 537.36);
        paulanTotalPaidSim += actualPaulanPaymentPaid;
      }

      const fhPrincipalReduction = Math.max(0, recastWeeklyPayment - fhInterest);
      if (simLoanFH > 0 && simLoanFH - fhPrincipalReduction <= 0 && fhPaidOffWeek === -1) {
        fhPaidOffWeek = w;
      }
      simLoanFH = Math.max(0, simLoanFH - fhPrincipalReduction);

      const fernPrincipalReduction = Math.max(0, fernWeeklyPayment - fernInterest);
      if (simLoanFern > 0 && simLoanFern - fernPrincipalReduction <= 0 && fernPaidOffWeek === -1) {
        fernPaidOffWeek = w;
      }
      simLoanFern = Math.max(0, simLoanFern - fernPrincipalReduction);

      if (inputs.paulanStrategy === "rent" && simLoanPaulan > 0) {
        const paulanPrincipalReduction = Math.max(0, 537.36 - paulanInterest);
        if (simLoanPaulan - paulanPrincipalReduction <= 0 && paulanPaidOffWeek === -1) {
          paulanPaidOffWeek = w;
        }
        simLoanPaulan = Math.max(0, simLoanPaulan - paulanPrincipalReduction);
      }

      // 4. Model the New Build Loan performance
      let actualNbPaymentPaid = 0;
      if (simLoanNewBuild > 0 && w >= w_build) {
        const nbInterest = Math.max(0, simLoanNewBuild - simOffsetNewBuild) * rWeeklyFHSim;
        newBuildInterestPaid += nbInterest;
        nbTotalInterestPaidSim += nbInterest;
        actualNbPaymentPaid = Math.min(simLoanNewBuild + nbInterest, newBuildWeeklyPayment);
        nbTotalPaidSim += actualNbPaymentPaid;
        const nbPrincipalPaid = Math.max(0, newBuildWeeklyPayment - nbInterest);
        if (simLoanNewBuild - nbPrincipalPaid <= 0 && nbPaidOffWeek === -1) {
          nbPaidOffWeek = w;
        }
        if (simOffsetNewBuild >= simLoanNewBuild && nbFullyOffsetWeek === -1) {
          nbFullyOffsetWeek = w;
        }
        simLoanNewBuild = Math.max(0, simLoanNewBuild - nbPrincipalPaid);
      }

      // Freed up payments from loans completely ended
      const fhFreedUp = recastWeeklyPayment - actualFhPaymentPaid;
      const fernFreedUp = fernWeeklyPayment - actualFernPaymentPaid;

      // Track savings surplus or repayment deficit (repayments redirected to cash/offsets on payoff)
      const currentActiveSavingsRate = (w >= w_build)
        ? (inputs.usePostBuildFixedDiscretionary
            ? Math.max(0, postBuildGrossCashSurplusVal - (inputs.postBuildFixedDiscretionaryCash ?? 3000))
            : (newBuildPostWeeklySavingsOverride !== null ? newBuildPostWeeklySavingsOverride : effectiveWeeklySavings))
        : effectiveWeeklySavings;

      const hasPaulanBeenSold = inputs.paulanStrategy === "rent" && inputs.paulanSellLater && w >= w_paulan_sale;
      const currentRent = (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold)
        ? inputs.paulanWeeklyRent * Math.pow(1 + (inputs.annualInflationRate ?? 3) / 100, Math.floor(w / 52))
        : 0;
      const currentExpenses = (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold)
        ? inputs.paulanWeeklyExpenses * Math.pow(1 + (inputs.annualInflationRate ?? 3) / 100, Math.floor(w / 52))
        : 0;

      let remainingSavings = currentActiveSavingsRate + extraWeeklyIncomeInThisWeek + fhFreedUp + fernFreedUp;
      if (inputs.paulanStrategy === "rent" && !hasPaulanBeenSold) {
        remainingSavings += (currentRent - currentExpenses) - actualPaulanPaymentPaid;
      }

      // Pay off new loans weekly repayments
      let totalNewLoansRepayment = 0;
      let totalNewLoansPrincipal = 0;
      let totalNewLoansOffset = 0;

      activeNewLoans.forEach((loan) => {
        if (loan.principal > 0) {
          // Interest is calculated on principal minus offset
          const lInterest = Math.max(0, loan.principal - loan.offset) * rWeeklyFHSim;
          activeNewLoansInterestPaid += lInterest;
          const lPrincipalPaid = Math.max(0, loan.weeklyPayment - lInterest);
          
          let actualPayment = loan.weeklyPayment;
          if (loan.principal - lPrincipalPaid <= 0) {
            actualPayment = lInterest + loan.principal;
            loan.principal = 0;
          } else {
            loan.principal = loan.principal - lPrincipalPaid;
          }
          
          totalNewLoansRepayment += actualPayment;
          totalNewLoansPrincipal += loan.principal;
          totalNewLoansOffset += loan.offset;
        }
      });

      remainingSavings -= totalNewLoansRepayment;
      remainingSavings -= actualNbPaymentPaid;

      // Deficit handling inside active simulation: pull from extra cash savings first, then offset accounts to cover the loan costs
      if (remainingSavings < 0) {
        let savingsDeficit = -remainingSavings;
        remainingSavings = 0;

        if (simExtraCashSavings > 0) {
          const pullExtra = Math.min(simExtraCashSavings, savingsDeficit);
          simExtraCashSavings -= pullExtra;
          savingsDeficit -= pullExtra;
        }

        if (savingsDeficit > 0) {
          if (inputs.depletionPriorityToggle === "paulan") {
            const pullFern = Math.min(simOffsetFern, savingsDeficit);
            simOffsetFern -= pullFern;
            savingsDeficit -= pullFern;

            if (savingsDeficit > 0) {
              for (let i = 0; i < activeNewLoans.length; i++) {
                const pullN = Math.min(activeNewLoans[i].offset, savingsDeficit);
                activeNewLoans[i].offset -= pullN;
                savingsDeficit -= pullN;
                if (savingsDeficit <= 0) break;
              }
            }
            if (savingsDeficit > 0 && simOffsetNewBuild > 0) {
              const pullNB = Math.min(simOffsetNewBuild, savingsDeficit);
              simOffsetNewBuild -= pullNB;
              savingsDeficit -= pullNB;
            }
            if (savingsDeficit > 0) {
              const pullFH = Math.min(simOffsetFH, savingsDeficit);
              simOffsetFH -= pullFH;
              savingsDeficit -= pullFH;
            }
            if (inputs.paulanStrategy === "rent" && savingsDeficit > 0) {
              const pullP = Math.min(simOffsetPaulan, savingsDeficit);
              simOffsetPaulan -= pullP;
              savingsDeficit -= pullP;
            }
          } else {
            const pullFern = Math.min(simOffsetFern, savingsDeficit);
            simOffsetFern -= pullFern;
            savingsDeficit -= pullFern;

            if (savingsDeficit > 0) {
              for (let i = 0; i < activeNewLoans.length; i++) {
                const pullN = Math.min(activeNewLoans[i].offset, savingsDeficit);
                activeNewLoans[i].offset -= pullN;
                savingsDeficit -= pullN;
                if (savingsDeficit <= 0) break;
              }
            }
            if (inputs.paulanStrategy === "rent" && savingsDeficit > 0) {
              const pullP = Math.min(simOffsetPaulan, savingsDeficit);
              simOffsetPaulan -= pullP;
              savingsDeficit -= pullP;
            }
            if (savingsDeficit > 0 && simOffsetNewBuild > 0) {
              const pullNB = Math.min(simOffsetNewBuild, savingsDeficit);
              simOffsetNewBuild -= pullNB;
              savingsDeficit -= pullNB;
            }
            if (savingsDeficit > 0) {
              const pullFH = Math.min(simOffsetFH, savingsDeficit);
              simOffsetFH -= pullFH;
              savingsDeficit -= pullFH;
            }
          }
        }
      }

      // Clamping: offsets cannot exceed the newly reduced principal
      let excessFromClamping = 0;
      if (simOffsetFH > simLoanFH) {
        excessFromClamping += (simOffsetFH - simLoanFH);
        simOffsetFH = simLoanFH;
      }
      if (simOffsetFern > simLoanFern) {
        excessFromClamping += (simOffsetFern - simLoanFern);
        simOffsetFern = simLoanFern;
      }
      if (inputs.paulanStrategy === "rent" && simOffsetPaulan > simLoanPaulan) {
        excessFromClamping += (simOffsetPaulan - simLoanPaulan);
        simOffsetPaulan = simLoanPaulan;
      }
      activeNewLoans.forEach((loan) => {
        if (loan.offset > loan.principal) {
          excessFromClamping += (loan.offset - loan.principal);
          loan.offset = loan.principal;
        }
      });
      if (simOffsetNewBuild > simLoanNewBuild) {
        excessFromClamping += (simOffsetNewBuild - simLoanNewBuild);
        simOffsetNewBuild = simLoanNewBuild;
      }

      // Total available cash pool to allocate to offsets this week
      let cashPool = remainingSavings + excessFromClamping + paulanSaleCashRelease;

      // 1. Allocate to FH offset
      if (cashPool > 0 && simOffsetFH < simLoanFH) {
        const space = simLoanFH - simOffsetFH;
        const deposit = Math.min(cashPool, space);
        simOffsetFH += deposit;
        cashPool -= deposit;
      }

      // If prioritized, allocate to Paulan offset
      if (inputs.paulanStrategy === "rent" && inputs.depletionPriorityToggle === "paulan") {
        if (cashPool > 0 && simOffsetPaulan < simLoanPaulan) {
          const space = simLoanPaulan - simOffsetPaulan;
          const deposit = Math.min(cashPool, space);
          simOffsetPaulan += deposit;
          cashPool -= deposit;
        }
      }

      // 2. Allocate to New Build offset (if it exists)
      if (cashPool > 0 && w >= w_build && simLoanNewBuild > 0 && simOffsetNewBuild < simLoanNewBuild) {
        const space = simLoanNewBuild - simOffsetNewBuild;
        const deposit = Math.min(cashPool, space);
        simOffsetNewBuild += deposit;
        cashPool -= deposit;
      }

      // 3. Allocate to Fern offset
      if (cashPool > 0 && simOffsetFern < simLoanFern) {
        const space = simLoanFern - simOffsetFern;
        const deposit = Math.min(cashPool, space);
        simOffsetFern += deposit;
        cashPool -= deposit;
      }

      // If not prioritized, allocate to Paulan offset
      if (inputs.paulanStrategy === "rent" && inputs.depletionPriorityToggle !== "paulan") {
        if (cashPool > 0 && simOffsetPaulan < simLoanPaulan) {
          const space = simLoanPaulan - simOffsetPaulan;
          const deposit = Math.min(cashPool, space);
          simOffsetPaulan += deposit;
          cashPool -= deposit;
        }
      }

      // 4. Allocate to active new loan offsets
      if (cashPool > 0) {
        for (let i = 0; i < activeNewLoans.length; i++) {
          const loan = activeNewLoans[i];
          if (loan.principal > 0 && loan.offset < loan.principal) {
            const space = loan.principal - loan.offset;
            const deposit = Math.min(cashPool, space);
            loan.offset += deposit;
            cashPool -= deposit;
          }
          if (cashPool <= 0) break;
        }
      }

      // 5. Finally, put the overflow into Extra Cash Savings
      if (cashPool > 0) {
        simExtraCashSavings += cashPool;
        cashPool = 0;
      }

      // Keep totals up-to-date for records after offset changes
      totalNewLoansOffset = 0;
      activeNewLoans.forEach((l) => {
        totalNewLoansOffset += l.offset;
      });

      historyStateAtWeek.set(w, {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        nbLoan: Math.round(simLoanNewBuild),
        nbOffset: Math.round(simOffsetNewBuild),
        otherLoan: Math.round(totalNewLoansPrincipal),
        otherOffset: Math.round(totalNewLoansOffset),
        extraCash: Math.round(simExtraCashSavings),
        loanPaulan: inputs.paulanStrategy === "rent" ? Math.round(simLoanPaulan) : 0,
        offsetPaulan: inputs.paulanStrategy === "rent" ? Math.round(simOffsetPaulan) : 0,
      });

      if (w % 13 === 0 || w === 30 * 52) {
        const tVal = w / 52;
        const fhVal = inputs.purchasePrice * Math.pow(1.05, tVal);
        const fernVal = 850000 * Math.pow(1.05, tVal);
        let nbVal = 0;
        if (w >= w_build) {
          nbVal = newBuildSpend * Math.pow(1.05, (w - w_build) / 52);
        }
        let paulanVal = 0;
        if (inputs.paulanStrategy === "rent") {
          const isSold = inputs.paulanSellLater && w >= w_paulan_sale;
          if (!isSold) {
            paulanVal = inputs.paulanSalePrice * Math.pow(1 + (inputs.paulanGrowthRate ?? 5) / 100, tVal);
          }
        }
        const totalPropValue = Math.round(fhVal + fernVal + nbVal + paulanVal);
        const currentNetDebt = (simLoanFH - simOffsetFH) + 
          (simLoanFern - simOffsetFern) + 
          (inputs.paulanStrategy === "rent" ? (simLoanPaulan - simOffsetPaulan) : 0) +
          (totalNewLoansPrincipal - totalNewLoansOffset) +
          (simLoanNewBuild - simOffsetNewBuild) -
          simExtraCashSavings;
        const netWealthVal = Math.round(totalPropValue - currentNetDebt);

        simulationData.push({
          week: w,
          year: (w / 52).toFixed(1),
          loanFH: Math.round(simLoanFH),
          offsetFH: Math.round(simOffsetFH),
          loanFern: Math.round(simLoanFern),
          offsetFern: Math.round(simOffsetFern),
          loanPaulan: inputs.paulanStrategy === "rent" ? Math.round(simLoanPaulan) : 0,
          offsetPaulan: inputs.paulanStrategy === "rent" ? Math.round(simOffsetPaulan) : 0,
          newLoansPayable: Math.round(totalNewLoansPrincipal),
          newLoansOffset: Math.round(totalNewLoansOffset),
          newBuildLoan: Math.round(simLoanNewBuild),
          newBuildOffset: Math.round(simOffsetNewBuild),
          extraCashSavings: Math.round(simExtraCashSavings),
          netDebt: Math.round(currentNetDebt),
          propertyValue: totalPropValue,
          netWealth: netWealthVal,
        });
      }
    }

    if (fhNeutralizedWeek === -1) {
      milestoneFHOffset = {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        week: 30 * 52,
      };
    }
    if (bothNeutralizedWeek === -1) {
      milestoneFernOffset = {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        week: 30 * 52,
      };
    }

    let lastNetDebtWeek = -1;
    for (let w = 0; w <= 30 * 52; w++) {
      const state = historyStateAtWeek.get(w);
      if (state) {
        const debt = state.fhLoan + state.fernLoan + state.nbLoan + state.otherLoan;
        const offset = state.fhOffset + state.fernOffset + state.nbOffset + state.otherOffset + state.extraCash;
        if (debt > offset) {
          lastNetDebtWeek = w;
        }
      }
    }

    if (lastNetDebtWeek === -1) {
      activeFullyOffsetWeek = 0;
    } else if (lastNetDebtWeek < 30 * 52) {
      activeFullyOffsetWeek = lastNetDebtWeek + 1;
    } else {
      activeFullyOffsetWeek = -1;
    }

    if (activeFullyOffsetWeek !== -1) {
      const state = historyStateAtWeek.get(activeFullyOffsetWeek);
      if (state) {
        milestoneActiveFullyOffset = {
          fhLoan: state.fhLoan,
          fhOffset: state.fhOffset,
          fernLoan: state.fernLoan,
          fernOffset: state.fernOffset,
          nbLoan: state.nbLoan,
          nbOffset: state.nbOffset,
          otherLoan: state.otherLoan,
          otherOffset: state.otherOffset,
          week: activeFullyOffsetWeek,
        };
      }
    } else {
      let finalOtherLoan = 0;
      let finalOtherOffset = 0;
      activeNewLoans.forEach((l) => {
        finalOtherLoan += l.principal;
        finalOtherOffset += l.offset;
      });

      milestoneActiveFullyOffset = {
        fhLoan: Math.round(simLoanFH),
        fhOffset: Math.round(simOffsetFH),
        fernLoan: Math.round(simLoanFern),
        fernOffset: Math.round(simOffsetFern),
        nbLoan: Math.round(simLoanNewBuild),
        nbOffset: Math.round(simOffsetNewBuild),
        otherLoan: Math.round(finalOtherLoan),
        otherOffset: Math.round(finalOtherOffset),
        week: 30 * 52,
      };
    }

    // High-Fidelity Transition Period Simulation Engine
    const transitionWeeksData: any[] = [];
    let cumulativeTransitionInterest = 0;
    let maxWeeklyRepaymentInTransition = 0;
    let totalMerylRentInTransition = 0;
    let transitionMerylWeeks = 0;
    let transitionDoubleMortgageWeeks = 0;

    const transitionEndDay = Math.max(timeline.merylSettleEnd, timeline.paulanSettleEnd, timeline.moveEnd);
    const transitionWeeksCount = Math.ceil(transitionEndDay / 7);

    for (let w = 0; w <= transitionWeeksCount; w++) {
      const dayOffset = w * 7;
      const dateStr = getGanttDateStr(dayOffset);

      // 1. Meryl's Renting
      const rentStart = timeline.merylRentStart;
      const rentEnd = timeline.merylRentEnd;
      const hasRentThisWeek = dayOffset >= rentStart && dayOffset < rentEnd;
      const rentCostThisWeek = hasRentThisWeek ? inputs.merylRentCostPerWeek : 0;
      totalMerylRentInTransition += rentCostThisWeek;
      if (hasRentThisWeek) {
        transitionMerylWeeks++;
      }

      // 2. Forever Home State
      const fhOpened = dayOffset >= timeline.fhSettleEnd;
      const merylSettled = dayOffset >= timeline.merylSettleEnd;
      const paulanSettled = dayOffset >= timeline.paulanSettleEnd;
      const gfiOccurred = dayOffset >= timeline.gfiStart;

      // Recast active trigger checking
      let isRecast = false;
      if (fhOpened) {
        if (inputs.recastTriggerEvent === "day1") {
          isRecast = true;
        } else if (inputs.recastTriggerEvent === "gfi") {
          isRecast = gfiOccurred;
        } else if (inputs.recastTriggerEvent === "paulan") {
          isRecast = gfiOccurred && paulanSettled;
        }
      }

      const fhLoanBeforeRecast = loanRequired;
      const fhLoanAfterRecast = recastForeverHomeLoanPrincipal;
      const currFHLoan = fhOpened ? (isRecast ? fhLoanAfterRecast : fhLoanBeforeRecast) : 0;
      const currFHRepayment = fhOpened ? (isRecast ? recastWeeklyPayment : initialWeeklyPayment) : 0;

      // Extra savings accumulation since FH Opened
      const weeksFHOpened = fhOpened ? Math.floor((dayOffset - timeline.fhSettleEnd) / 7) : 0;
      const savingsAccumulated = weeksFHOpened * effectiveWeeklySavings;

      // Offset tracking:
      // FH offset starting point
      let fhOffsetRaw = fhOpened ? remainingDay1CashCushion : 0;
      if (fhOpened && gfiOccurred && !gfiBeforeFHSettle) {
        fhOffsetRaw += inputs.merylContribution;
      }
      if (fhOpened && paulanSettled) {
        fhOffsetRaw += paulanNetProceeds;
      }
      if (fhOpened && isRecast) {
        fhOffsetRaw -= appliedToPrincipalReduction;
      }
      if (fhOpened) {
        fhOffsetRaw += savingsAccumulated;
        fhOffsetRaw -= (inputs.fhRenoMovingCost ?? 5000);
      }

      const fhOffsetCurrent = Math.min(currFHLoan, Math.max(0, fhOffsetRaw));
      const excessFHOffset = Math.max(0, fhOffsetRaw - fhOffsetCurrent);

      // Paulan Court Property
      let paulanLoan = 0;
      let paulanOffset = 0;
      let paulanRepay = 0;
      let paulanInterest = 0;

      if (!paulanSettled) {
        paulanLoan = ACCOUNT_BALANCES.paulansLoan;
        paulanRepay = 537.36; // Contractual P&I payment
        // Offset
        const basePaulanOffset = ACCOUNT_BALANCES.paulansOffset;
        const currentPaulanOffset = fhOpened ? (basePaulanOffset - paulanOffsetPulled) : basePaulanOffset;
        paulanOffset = currentPaulanOffset;
        paulanInterest = Math.max(0, paulanLoan - paulanOffset) * (0.0618 / 52);
      }

      if (fhOpened && !paulanSettled) {
        transitionDoubleMortgageWeeks++;
      }

      // Fern St Property
      let fernLoan = ACCOUNT_BALANCES.fernLoan;
      const fernContractualRepay = 783.74;
      let fernOffsetBase = ACCOUNT_BALANCES.fernOffset;
      if (fhOpened) {
        fernOffsetBase = fernOffsetBase - fernOffsetPulled;
      }
      // Add any excess offset from Forever Home
      let fernOffset = fernOffsetBase + excessFHOffset;
      fernOffset = Math.min(fernLoan, fernOffset);

      const fernInterest = Math.max(0, fernLoan - fernOffset) * (0.0615 / 52);

      // Cumulative interest
      const fhInterest = Math.max(0, currFHLoan - fhOffsetCurrent) * rWeekly;
      
      const weeklyInterestPaid = fhInterest + paulanInterest + fernInterest;
      cumulativeTransitionInterest += weeklyInterestPaid;

      const totalWeeklyRepayments = currFHRepayment + paulanRepay + fernContractualRepay;
      maxWeeklyRepaymentInTransition = Math.max(maxWeeklyRepaymentInTransition, totalWeeklyRepayments);

      transitionWeeksData.push({
        week: w,
        dayOffset,
        dateStr,
        merylRentCost: rentCostThisWeek,
        fhLoan: currFHLoan,
        fhOffset: fhOffsetCurrent,
        fhRepay: currFHRepayment,
        fhInterest,
        fhPrincipal: Math.max(0, currFHRepayment - fhInterest),
        paulanLoan,
        paulanOffset,
        paulanRepay,
        paulanInterest,
        paulanPrincipal: Math.max(0, paulanRepay - paulanInterest),
        fernLoan,
        fernOffset,
        fernRepay: fernContractualRepay,
        fernInterest,
        fernPrincipal: Math.max(0, fernContractualRepay - fernInterest),
        totalRepay: totalWeeklyRepayments + rentCostThisWeek,
        totalInterest: weeklyInterestPaid,
        hasRentThisWeek,
        isRecast,
        paulanSettled,
        merylSettled,
        fhOpened,
        doubleMortgage: fhOpened && !paulanSettled,
      });
    }

    // Programmatic Interest Rate vs. Weekly Savings Sensitivity Matrix
    const rateDeltas = [0, 1.0, 2.0, 3.0]; // Current, +1%, +2%, +3%
    const savingsMultipliers = [0.75, 1.0, 1.25]; // -25%, Current, +25%
    const sensitivityMatrix = rateDeltas.map((dRate) => {
      const testRate = inputs.interestRate + dRate;
      const rWeeklyTest = testRate / 100 / 52;
      const nWeeks = 30 * 52;

      // Recalculate initial pre-recast weekly payment for this rate
      const testInitialPayment =
        loanRequired > 0
          ? (loanRequired * rWeeklyTest * Math.pow(1 + rWeeklyTest, nWeeks)) /
            (Math.pow(1 + rWeeklyTest, nWeeks) - 1)
          : 0;

      // Recalculate recast post-recast weekly payment for this rate
      const testRecastPayment =
        recastForeverHomeLoanPrincipal > 0
          ? (recastForeverHomeLoanPrincipal *
              rWeeklyTest *
              Math.pow(1 + rWeeklyTest, nWeeks)) /
            (Math.pow(1 + rWeeklyTest, nWeeks) - 1)
          : 0;

      const cells = savingsMultipliers.map((mSavings) => {
        const testWeeklySavings = effectiveWeeklySavings * mSavings;

        let simFH = recastForeverHomeLoanPrincipal;
        let simOffFH = recastOffsetBalance;
        let simFern = ACCOUNT_BALANCES.fernLoan;
        let simOffFern = 0;

        let testFHNeutralizedWeek = -1;
        let testBothNeutralizedWeek = -1;

        const rWeeklyFHTest = rWeeklyTest;
        const rWeeklyFernTest = 0.0613 / 52;

        for (let w = 0; w <= 30 * 52; w++) {
          if (simOffFH >= simFH && testFHNeutralizedWeek === -1) {
            testFHNeutralizedWeek = w;
          }
          if (
            simOffFH >= simFH &&
            simOffFern >= simFern &&
            testBothNeutralizedWeek === -1
          ) {
            testBothNeutralizedWeek = w;
          }

          const fhInterest = Math.max(0, simFH - simOffFH) * rWeeklyFHTest;
          const fernInterest = Math.max(0, simFern - simOffFern) * rWeeklyFernTest;

          const fhPrincipalReduction = Math.max(0, testRecastPayment - fhInterest);
          simFH = Math.max(0, simFH - fhPrincipalReduction);

          const fernPrincipalReduction = Math.max(0, fernWeeklyPayment - fernInterest);
          simFern = Math.max(0, simFern - fernPrincipalReduction);

          let remainingSavings = testWeeklySavings;

          if (simOffFH < simFH) {
            const space = simFH - simOffFH;
            const deposit = Math.min(remainingSavings, space);
            simOffFH += deposit;
            remainingSavings -= deposit;
          }

          if (remainingSavings > 0) {
            if (simOffFern < simFern) {
              const space = simFern - simOffFern;
              simOffFern += Math.min(remainingSavings, space);
            } else {
              simOffFern = simFern;
            }
          }

          if (simOffFH > simFH) {
            const excessCash = simOffFH - simFH;
            simOffFH = simFH;
            if (simOffFern < simFern) {
              const space = simFern - simOffFern;
              simOffFern += Math.min(excessCash, space);
            } else {
              simOffFern = simFern;
            }
          }
        }

        return {
          rateDelta: dRate,
          savingsMultiplier: mSavings,
          rateLabel: dRate === 0 ? "Current" : `+${dRate.toFixed(1)}%`,
          savingsLabel: mSavings === 1.0 ? "Current" : mSavings === 0.75 ? "-25%" : "+25%",
          fhYears: testFHNeutralizedWeek !== -1 ? (testFHNeutralizedWeek / 52).toFixed(1) : "30+",
          bothYears: testBothNeutralizedWeek !== -1 ? (testBothNeutralizedWeek / 52).toFixed(1) : "30+",
        };
      });

      return {
        rateDelta: dRate,
        testRate,
        testInitialPayment,
        testRecastPayment,
        cells,
      };
    });

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
      effectiveWeeklySavings,
      aggregateTransitionInterest,
      totalCommittedWeeklyOutlays,
      targetDeposit20PctOfLoan,
      totalCashAppliedToEquityAndFees: totalOffsetsPulled,
      remainingDay1CashCushion,
      minCashRequiredForSettlement,
      isBufferCompromised,
      gfiBeforeFHSettle,
      paulanOffsetPulled,
      fernOffsetPulled,
      milestoneRecast,
      milestoneFHOffset,
      milestoneFernOffset,
      milestoneActiveFullyOffset,
      fhInterestAtOffset,
      fernInterestAtBothOffset,
      combinedInterestAtBothOffset: fhInterestAtBothOffset + fernInterestAtBothOffset,
      fhInterestAtActiveFullyOffset,
      fernInterestAtActiveFullyOffset,
      nbInterestAtActiveFullyOffset,
      newLoansInterestAtActiveFullyOffset,
      combinedInterestAtActiveFullyOffset: fhInterestAtActiveFullyOffset + fernInterestAtActiveFullyOffset + nbInterestAtActiveFullyOffset + newLoansInterestAtActiveFullyOffset,
      fhNeutralizedWeek,
      bothNeutralizedWeek,
      fhOffsetYears:
        fhNeutralizedWeek !== -1 ? (fhNeutralizedWeek / 52).toFixed(1) : "30+",
      bothOffsetYears:
        bothNeutralizedWeek !== -1
          ? (bothNeutralizedWeek / 52).toFixed(1)
          : "30+",
      baselineHalfOffsetYears:
        baselineHalfOffsetWeek !== -1 ? (baselineHalfOffsetWeek / 52).toFixed(1) : "30+",
      activeHalfOffsetYears:
        activeHalfOffsetWeek !== -1 ? (activeHalfOffsetWeek / 52).toFixed(1) : "30+",
      baselineFullyOffsetYears:
        baselineFullyOffsetWeek !== -1 ? (baselineFullyOffsetWeek / 52).toFixed(1) : "30+",
      activeFullyOffsetYears:
        activeFullyOffsetWeek !== -1 ? (activeFullyOffsetWeek / 52).toFixed(1) : "30+",
      activeFullyOffsetWeek,
      simulationData,
      baselineSimulationData,
      baselineFhNeutralizedWeek,
      baselineBothNeutralizedWeek,
      baselineFhOffsetYears:
        baselineFhNeutralizedWeek !== -1 ? (baselineFhNeutralizedWeek / 52).toFixed(1) : "30+",
      baselineBothOffsetYears:
        baselineBothNeutralizedWeek !== -1 ? (baselineBothNeutralizedWeek / 52).toFixed(1) : "30+",
      activeNewLoansInterestPaid,
      transitionWeeksData,
      cumulativeTransitionInterest,
      maxWeeklyRepaymentInTransition,
      totalMerylRentInTransition,
      transitionMerylWeeks,
      transitionDoubleMortgageWeeks,
      sensitivityMatrix,
      liquidOffsetAtBuild: liquidOffsetAtBuildVal,
      actualDrawFromOffsets: actualDrawFromOffsetsVal,
      newBuildLoanAmount: newBuildLoanAmountVal,
      newBuildWeeklyPayment,
      newBuildInterestPaid,
      fernNeutralizedWeek,
      nbFullyOffsetWeek,
      fhPaidOffWeek,
      fernPaidOffWeek,
      nbPaidOffWeek,
      paulanPaidOffWeek,
      fhTotalInterestPaidSim,
      fernTotalInterestPaidSim,
      nbTotalInterestPaidSim,
      paulanTotalInterestPaidSim,
      fhTotalPaidSim,
      fernTotalPaidSim,
      nbTotalPaidSim,
      paulanTotalPaidSim,
      baselineFhTotalInterestPaid: bFhTotalInterestPaid,
      baselineFernTotalInterestPaid: bFernTotalInterestPaid,
      baselinePaulanTotalInterestPaid: bPaulanTotalInterestPaid,
      baselineTotalInterestPaid: bFhTotalInterestPaid + bFernTotalInterestPaid + (inputs.paulanStrategy === "rent" ? bPaulanTotalInterestPaid : 0),
      postBuildGrossCashSurplus: postBuildGrossCashSurplusVal,
      postBuildWeeklySavings: (inputs.usePostBuildFixedDiscretionary
        ? Math.max(0, postBuildGrossCashSurplusVal - (inputs.postBuildFixedDiscretionaryCash ?? 3000))
        : (newBuildPostWeeklySavingsOverride !== null ? newBuildPostWeeklySavingsOverride : effectiveWeeklySavings)),
    };
  }, [
    inputs,
    timeline,
    futureExpenses,
    futureIncomes,
    newBuildSpend,
    newBuildTiming,
    newBuildBuffer,
    newBuildDrawChoicePct,
    newBuildPostWeeklySavingsOverride,
  ]);
}
