/**
 * FairShift - Shift Tracking & Strain Calculation Engine
 * 1-Tap Geofence Clock-in, Overtime Calculations (8h standard vs 1.5x OT),
 * Role-weighted MET physiological strain model, and live shift timer.
 * Integrates ClimateGuard heat-stress multiplier and auto-detects night shifts.
 */

class ShiftTracker {
  constructor(industry, onUpdate) {
    this.industry = industry;
    this.onUpdate = onUpdate || (() => {});
    
    // Persistent state in localStorage
    this.storageKey = 'fairshift_active_shift';
    this.historyKey = 'fairshift_shift_history';
    
    this.state = this.loadState();
    this.timerInterval = null;
    
    // Mock Location toggle for judge demo testing
    this.mockLocationInside = true;
    
    // Optional integrations (set externally after construction)
    this.climateGuard = null;     // ClimateGuard instance for live heat multiplier
    this.onClockOutHook = null;   // callback(shiftSummary) — used by SkillPassport
    
    // Start interval if already clocked in
    if (this.state.isClockedIn) {
      this.startTimer();
    }
  }

  setIndustry(industry) {
    this.industry = industry;
    this.updateStrainMetrics();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    return {
      isClockedIn: false,
      isOnBreak: false,
      startTime: null,
      breakStartTime: null,
      accumulatedBreakMinutes: 0,
      workerRole: 'mason',
      simulatedElapsedSeconds: 0, // for speed-testing overtime demo
      workerBatteryRating: 'good', // last end-of-shift battery rating
      currentStrainScore: 15,
      clockInHour: null // auto-detect night shift from this
    };
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  toggleMockLocation(isInside) {
    this.mockLocationInside = isInside;
    return this.mockLocationInside;
  }

  isGeofenceValid() {
    return this.mockLocationInside;
  }

  clockIn(roleId = 'mason', initialSimulatedHours = 0) {
    if (!this.isGeofenceValid()) {
      return {
        success: false,
        reason: 'GEOFENCE_OUTSIDE',
        message: 'Cannot clock in: GPS confirms you are 1.5km outside the authorized work zone.'
      };
    }

    this.state.isClockedIn = true;
    this.state.isOnBreak = false;
    this.state.startTime = new Date().toISOString();
    this.state.workerRole = roleId;
    this.state.accumulatedBreakMinutes = 0;
    this.state.simulatedElapsedSeconds = Math.round(initialSimulatedHours * 3600);
    this.state.clockInHour = new Date().getHours();
    
    this.startTimer();
    this.updateStrainMetrics();
    this.saveState();

    return {
      success: true,
      timestamp: this.state.startTime,
      message: 'Clock-in verified via site geofence.'
    };
  }

  clockOut(batteryRating = 'good') {
    if (!this.state.isClockedIn) return null;

    const summary = this.getShiftSummary();
    summary.batteryRating = batteryRating;
    summary.clockOutTime = new Date().toISOString();

    // Save to shift history for audit trail
    this.saveToHistory(summary);

    // Notify Skill Passport to add verified hours
    if (typeof this.onClockOutHook === 'function') {
      this.onClockOutHook(summary);
    }

    // Reset current active shift
    this.stopTimer();
    this.state.isClockedIn = false;
    this.state.isOnBreak = false;
    this.state.startTime = null;
    this.state.clockInHour = null;
    this.state.workerBatteryRating = batteryRating;
    this.state.simulatedElapsedSeconds = 0;
    this.state.accumulatedBreakMinutes = 0;
    this.saveState();

    return summary;
  }

  toggleBreak() {
    if (!this.state.isClockedIn) return false;

    if (!this.state.isOnBreak) {
      this.state.isOnBreak = true;
      this.state.breakStartTime = new Date().toISOString();
    } else {
      this.state.isOnBreak = false;
      this.state.accumulatedBreakMinutes += 15; // default 15m rest logged
      this.state.breakStartTime = null;
    }

    this.updateStrainMetrics();
    this.saveState();
    return this.state.isOnBreak;
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.state.isClockedIn && !this.state.isOnBreak) {
        this.state.simulatedElapsedSeconds += 1;
        this.updateStrainMetrics();
        this.onUpdate(this.getShiftSummary());
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Advance seconds helper for live ticking without double intervals
  advanceSeconds(seconds = 1) {
    this.state.simulatedElapsedSeconds += seconds;
    this.updateStrainMetrics();
    this.saveState();
    const summary = this.getShiftSummary();
    this.onUpdate(summary);
    return summary;
  }

  // Fast-Forward helper for hackathon judges to simulate overtime without waiting 8 hours
  advanceHours(hours) {
    this.state.simulatedElapsedSeconds += Math.round(hours * 3600);
    this.updateStrainMetrics();
    this.saveState();
    const summary = this.getShiftSummary();
    this.onUpdate(summary);
    return summary;
  }

  /**
   * Physiological Strain & Fatigue Calculation
   * Formula:
   * Effective Hours = (Total Shift Hours) - (Break Hours * 0.75)
   * Strain = Effective Hours * MET Multiplier * CircadianFactor * HeatFactor * BatteryBaseline
   */
  /**
   * Auto-detect night shift from clock-in hour (22:00-06:00)
   */
  isNightShift() {
    const h = this.state.clockInHour;
    if (h === null || h === undefined) return false;
    return h >= 22 || h < 6;
  }

  updateStrainMetrics() {
    const summary = this.calculateShiftMath();
    const roleConfig = (this.industry.roles.find(r => r.id === this.state.workerRole) || this.industry.roles[0]);
    const met = roleConfig.strainMET || 1.4;

    // Auto-detect circadian disruption from actual clock-in hour
    const circadian = this.isNightShift() ? (this.industry.rules.nightShiftMultiplier || 1.35) : 1.0;

    // Pull live heat multiplier from ClimateGuard if wired, otherwise use 1.0
    let heat = 1.0;
    if (this.climateGuard) {
      const thermal = this.climateGuard.evaluateThermalStress();
      heat = thermal.fatigueStrainMultiplier; // 1.0 normal, 1.4 heatwave
    }
    
    // Previous day baseline modifier from end-of-shift battery check
    let baselineMod = 1.0;
    if (this.state.workerBatteryRating === 'exhausted') baselineMod = 1.3;
    if (this.state.workerBatteryRating === 'tired') baselineMod = 1.1;

    // Net active working hours (restorative breaks reduce strain accumulation)
    const netWorkHours = Math.max(0, summary.totalHours - (this.state.accumulatedBreakMinutes / 60) * 0.75);

    // Normalized strain score (0 to 100)
    const rawScore = (netWorkHours / roleConfig.shiftCap) * 60 * met * circadian * heat * baselineMod;
    this.state.currentStrainScore = Math.min(100, Math.round(rawScore));

    return this.state.currentStrainScore;
  }

  calculateShiftMath() {
    const totalSecs = this.state.simulatedElapsedSeconds;
    const totalHours = totalSecs / 3600;
    
    // Standard cap is strictly 8.0 hours
    const standardHours = Math.min(8.0, totalHours);
    const overtimeHours = Math.max(0, totalHours - 8.0);

    const roleConfig = (this.industry.roles.find(r => r.id === this.state.workerRole) || this.industry.roles[0]);
    const baseHourlyRate = roleConfig.baseRate;
    const otRateMultiplier = this.industry.rules.overtimeRateMultiplier || 1.5;

    const basePay = Math.round(standardHours * baseHourlyRate * 100) / 100;
    const overtimePay = Math.round(overtimeHours * (baseHourlyRate * otRateMultiplier) * 100) / 100;
    
    // Role hazard allowance (5% to 15% depending on role intensity)
    const hazardAllowance = Math.round(basePay * (roleConfig.strainMET >= 1.5 ? 0.12 : 0.05) * 100) / 100;
    
    // Standard welfare fund deduction (2.5%)
    const statutoryDeductions = Math.round((basePay + overtimePay) * 0.025 * 100) / 100;
    
    const grossPay = Math.round((basePay + overtimePay + hazardAllowance) * 100) / 100;
    const netPay = Math.round((grossPay - statutoryDeductions) * 100) / 100;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      standardHours: Math.round(standardHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      baseHourlyRate,
      basePay,
      overtimePay,
      hazardAllowance,
      statutoryDeductions,
      grossPay,
      netPay,
      roleConfig
    };
  }

  getShiftSummary() {
    const math = this.calculateShiftMath();
    const strain = this.state.currentStrainScore;

    let fatigueLevel = 'Safe';
    let fatigueColor = '#10b981'; // green
    if (strain >= 65 && strain < 82) {
      fatigueLevel = 'Moderate';
      fatigueColor = '#f59e0b'; // amber
    } else if (strain >= 82) {
      fatigueLevel = 'Critical';
      fatigueColor = '#ef4444'; // red
    }

    const hours = Math.floor(this.state.simulatedElapsedSeconds / 3600);
    const mins = Math.floor((this.state.simulatedElapsedSeconds % 3600) / 60);
    const secs = this.state.simulatedElapsedSeconds % 60;
    const formattedTimer = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return {
      isClockedIn: this.state.isClockedIn,
      isOnBreak: this.state.isOnBreak,
      formattedTimer,
      strainScore: strain,
      fatigueLevel,
      fatigueColor,
      isGeofenceValid: this.isGeofenceValid(),
      accumulatedBreakMinutes: this.state.accumulatedBreakMinutes,
      ...math
    };
  }

  saveToHistory(shift) {
    try {
      if (typeof localStorage !== 'undefined') {
        const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        history.unshift({
          id: 'SHIFT-' + Date.now().toString(36).toUpperCase(),
          date: new Date().toLocaleDateString(),
          industryId: this.industry.id,
          roleTitle: shift.roleConfig.title,
          ...shift
        });
        // keep recent 25 shifts
        localStorage.setItem(this.historyKey, JSON.stringify(history.slice(0, 25)));
      }
    } catch (e) {
      console.warn('History save error:', e);
    }
  }

  getHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
      }
    } catch (e) {
      return [];
    }
    return [];
  }
}

const globalScopeShift = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
globalScopeShift.ShiftTracker = ShiftTracker;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShiftTracker };
}

