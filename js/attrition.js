/**
 * FairShift - AI Attrition & Burnout Risk Predictor Engine
 * Evaluates physiological fatigue, consecutive shift overtime, unresolved hazard proximity,
 * and anonymous worker sentiment to calculate explainable quit/burnout probability (0-100%).
 */

class AttritionPredictor {
  constructor(industry) {
    this.industry = industry;
    this.syntheticWorkforce = this.generateSyntheticWorkforce();
  }

  setIndustry(industry) {
    this.industry = industry;
    this.syntheticWorkforce = this.generateSyntheticWorkforce();
  }

  generateSyntheticWorkforce() {
    const roles = this.industry.roles;
    const baseNames = {
      construction: [
        { name: 'Ramesh K.', roleId: 'rigger', shiftsOver10h: 4, nightShiftsThisWeek: 3, lastBattery: 'exhausted', zoneHazards: 2, sentimentScore: 2.1 },
        { name: 'Murugan P.', roleId: 'mason', shiftsOver10h: 1, nightShiftsThisWeek: 0, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.4 },
        { name: 'Suresh V.', roleId: 'electrician', shiftsOver10h: 3, nightShiftsThisWeek: 2, lastBattery: 'tired', zoneHazards: 1, sentimentScore: 3.2 },
        { name: 'David Raj', roleId: 'crane_op', shiftsOver10h: 0, nightShiftsThisWeek: 1, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.8 },
        { name: 'Anil Kumar', roleId: 'mason', shiftsOver10h: 5, nightShiftsThisWeek: 2, lastBattery: 'exhausted', zoneHazards: 3, sentimentScore: 1.8 }
      ],
      healthcare: [
        { name: 'Sister Priya M.', roleId: 'icu_nurse', shiftsOver10h: 4, nightShiftsThisWeek: 4, lastBattery: 'exhausted', zoneHazards: 2, sentimentScore: 2.3 },
        { name: 'Karthik S.', roleId: 'orderly', shiftsOver10h: 3, nightShiftsThisWeek: 1, lastBattery: 'exhausted', zoneHazards: 1, sentimentScore: 2.9 },
        { name: 'Deepa R.', roleId: 'sanitation', shiftsOver10h: 1, nightShiftsThisWeek: 0, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.2 },
        { name: 'Vinoth B.', roleId: 'lab_tech', shiftsOver10h: 0, nightShiftsThisWeek: 1, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.6 }
      ],
      manufacturing: [
        { name: 'Rajesh G.', roleId: 'welder', shiftsOver10h: 4, nightShiftsThisWeek: 3, lastBattery: 'exhausted', zoneHazards: 2, sentimentScore: 2.0 },
        { name: 'Arun Kumar', roleId: 'assembler', shiftsOver10h: 2, nightShiftsThisWeek: 1, lastBattery: 'tired', zoneHazards: 1, sentimentScore: 3.5 },
        { name: 'Mani K.', roleId: 'forklift_op', shiftsOver10h: 0, nightShiftsThisWeek: 0, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.5 }
      ],
      education: [
        { name: 'Gopal N.', roleId: 'campus_security', shiftsOver10h: 3, nightShiftsThisWeek: 5, lastBattery: 'exhausted', zoneHazards: 1, sentimentScore: 2.7 },
        { name: 'Selvi M.', roleId: 'facilities_janitor', shiftsOver10h: 2, nightShiftsThisWeek: 0, lastBattery: 'tired', zoneHazards: 0, sentimentScore: 3.8 },
        { name: 'Praveen T.', roleId: 'lab_assistant', shiftsOver10h: 0, nightShiftsThisWeek: 0, lastBattery: 'good', zoneHazards: 0, sentimentScore: 4.7 }
      ]
    };

    const dataset = baseNames[this.industry.id] || baseNames.construction;
    return dataset.map((worker, index) => {
      const roleConfig = roles.find(r => r.id === worker.roleId) || roles[0];
      const riskAnalysis = this.computeWorkerAttritionRisk(worker, roleConfig);
      return {
        id: `EMP-${this.industry.id.substring(0, 3).toUpperCase()}-${101 + index}`,
        ...worker,
        roleTitle: roleConfig.title,
        strainMET: roleConfig.strainMET,
        ...riskAnalysis
      };
    });
  }

  /**
   * Explainable Predictive Attrition Model
   * Score = (OvertimeDebt * 25) + (NightRotations * 15) + (ZoneHazards * 12) + (BatteryFactor * 20) + (SentimentPenalty * 28)
   */
  computeWorkerAttritionRisk(worker, roleConfig) {
    // 1. Overtime Debt Factor (0 to 1)
    const otDebt = Math.min(1.0, (worker.shiftsOver10h / 5));

    // 2. Circadian Night Shift Disruption (0 to 1)
    const nightShiftDebt = Math.min(1.0, (worker.nightShiftsThisWeek / 4));

    // 3. Unresolved Zone Hazard Proximity (0 to 1)
    const hazardRisk = Math.min(1.0, (worker.zoneHazards / 3));

    // 4. Physical Strain & Battery Check Factor
    let batteryFactor = 0.1;
    if (worker.lastBattery === 'tired') batteryFactor = 0.55;
    if (worker.lastBattery === 'exhausted') batteryFactor = 0.95;

    // 5. Morale / Sentiment Penalty (low rating = high risk)
    const sentimentPenalty = Math.max(0, (5.0 - worker.sentimentScore) / 4.0);

    // Weighted formula
    const rawScore = (
      otDebt * 28 +
      nightShiftDebt * 18 +
      hazardRisk * 14 +
      batteryFactor * 20 +
      sentimentPenalty * 20
    ) * (roleConfig.strainMET >= 1.5 ? 1.15 : 1.0);

    const riskScore = Math.min(96, Math.max(8, Math.round(rawScore)));

    // Risk Classification & Actionable Recommendations
    let tier = 'Low Risk';
    let color = '#10b981';
    let recommendations = ['Workload balanced; continue standard shift scheduling.'];
    const riskDrivers = [];

    if (worker.shiftsOver10h >= 3) {
      riskDrivers.push(`${worker.shiftsOver10h} consecutive shifts exceeding 10 hours`);
    }
    if (worker.nightShiftsThisWeek >= 3) {
      riskDrivers.push(`${worker.nightShiftsThisWeek} circadian-disrupting night shifts`);
    }
    if (worker.zoneHazards >= 2) {
      riskDrivers.push(`${worker.zoneHazards} open safety hazards in active work zone`);
    }
    if (worker.lastBattery === 'exhausted') {
      riskDrivers.push(`Logged end-of-shift battery as Exhausted/In Pain`);
    }
    if (worker.sentimentScore <= 2.5) {
      riskDrivers.push(`Low anonymous site sentiment rating (${worker.sentimentScore}/5.0)`);
    }

    if (riskScore >= 75) {
      tier = 'High Quit Risk';
      color = '#ef4444';
      recommendations = [
        'Enforce mandatory 24-hour statutory rest period before next shift assignment.',
        'Immediate supervisor audit of accumulated overtime compensation.',
        'Prioritize resolution of open safety hazards in worker assigned zone.'
      ];
    } else if (riskScore >= 40) {
      tier = 'Moderate Risk';
      color = '#f59e0b';
      recommendations = [
        'Rotate worker from high MET physical role to lighter duties.',
        'Ensure mandatory 15-minute shaded/cooled breaks are observed.'
      ];
    }

    return {
      riskScore,
      tier,
      color,
      riskDrivers,
      recommendations
    };
  }

  getWorkforceAnalytics() {
    const list = this.syntheticWorkforce;
    const totalWorkers = list.length;
    const highRiskCount = list.filter(w => w.riskScore >= 75).length;
    const moderateRiskCount = list.filter(w => w.riskScore >= 40 && w.riskScore < 75).length;
    const lowRiskCount = list.filter(w => w.riskScore < 40).length;
    const avgRisk = Math.round(list.reduce((acc, w) => acc + w.riskScore, 0) / totalWorkers);

    return {
      totalWorkers,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      avgRisk,
      workers: list
    };
  }
}

const globalScopeAttrition = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
globalScopeAttrition.AttritionPredictor = AttritionPredictor;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AttritionPredictor };
}

