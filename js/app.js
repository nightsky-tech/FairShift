/**
 * FairShift - Core Application Controller
 * UN SDG 8: Decent Work & Economic Growth
 * Connects Worker Mode, Supervisor Command Center, Multi-Industry Engine,
 * Multilingual Speech API, Store-and-Forward Offline Queue, and Climate Guard.
 */

(function () {
  'use strict';

  // State
  let currentLang = 'en';
  let currentIndustryKey = 'construction';
  let isInsideGeofence = true;
  let isHeatwaveSimulated = false;
  let isSimulatedOffline = false;

  // Domain Instances
  let industry = INDUSTRY_PRESETS[currentIndustryKey];
  let climateGuard = null;
  let shiftTracker = null;
  let safetyManager = null;
  let feedbackManager = null;
  let skillPassport = null;
  let attritionPredictor = null;
  let offlineQueue = null;

  // DOM Elements Cache
  const el = {};

  function initDOMElements() {
    el.btnModeWorker = document.getElementById('btn-mode-worker');
    el.btnModeSupervisor = document.getElementById('btn-mode-supervisor');
    el.workerView = document.getElementById('worker-view');
    el.supervisorView = document.getElementById('supervisor-view');

    el.industrySelect = document.getElementById('industry-select');
    el.langSelect = document.getElementById('lang-select');
    el.offlinePill = document.getElementById('offline-pill');
    el.offlinePillText = document.getElementById('offline-pill-text');

    // Demo Bar
    el.simGeoToggle = document.getElementById('sim-geo-toggle');
    el.simHeatToggle = document.getElementById('sim-heat-toggle');
    el.simNetToggle = document.getElementById('sim-net-toggle');
    el.simFf1h = document.getElementById('sim-ff-1h');
    el.simFf4h = document.getElementById('sim-ff-4h');
    el.simFfOt = document.getElementById('sim-ff-ot');

    // Worker Elements
    el.industryIcon = document.getElementById('industry-icon');
    el.siteDisplayName = document.getElementById('site-display-name');
    el.geoStatusBadge = document.getElementById('geo-status-badge');
    el.workerRoleSelect = document.getElementById('worker-role-select');
    el.btnClockMaster = document.getElementById('btn-clock-master');
    el.clockMasterIcon = document.getElementById('clock-master-icon');
    el.clockMasterText = document.getElementById('clock-master-text');

    // Odometer
    el.shiftClockTimer = document.getElementById('shift-clock-timer');
    el.overtimeIndicator = document.getElementById('overtime-indicator');
    el.payStandardVal = document.getElementById('pay-standard-val');
    el.payOvertimeVal = document.getElementById('pay-overtime-val');
    el.payHazardVal = document.getElementById('pay-hazard-val');
    el.payDeductionsVal = document.getElementById('pay-deductions-val');
    el.payNetVal = document.getElementById('pay-net-val');
    el.btnReadPayslip = document.getElementById('btn-read-payslip');

    // Strain & Battery
    el.strainScoreNum = document.getElementById('strain-score-num');
    el.strainBarFill = document.getElementById('strain-bar-fill');
    el.batterySelector = document.getElementById('battery-selector');
    el.btnBreakWater = document.getElementById('btn-break-water');
    el.btnBreakLunch = document.getElementById('btn-break-lunch');
    el.btnBreakRest = document.getElementById('btn-break-rest');

    // Heat Banner
    el.heatAlertBanner = document.getElementById('heat-alert-banner');
    el.btnVoiceHeatAlert = document.getElementById('btn-voice-heat-alert');

    // Hazard Feed
    el.hazardItemsContainer = document.getElementById('hazard-items-container');
    el.hazardCountBadge = document.getElementById('hazard-count-badge');

    // Supervisor Elements
    el.supStatHeadcount = document.getElementById('sup-stat-headcount');
    el.supStatOt = document.getElementById('sup-stat-ot');
    el.supStatHazards = document.getElementById('sup-stat-hazards');
    el.supStatStrain = document.getElementById('sup-stat-strain');
    el.supTriageTbody = document.getElementById('sup-triage-tbody');
    el.supAuditTbody = document.getElementById('sup-audit-tbody');
    el.supFeedbackQuotes = document.getElementById('sup-feedback-quotes');

    // Modals
    el.modalHazard = document.getElementById('modal-hazard');
    el.modalPassport = document.getElementById('modal-passport');
    el.modalFeedback = document.getElementById('modal-feedback');
    el.modalOfflineQueue = document.getElementById('modal-offline-queue');

    // Action Buttons
    el.btnOpenHazardModal = document.getElementById('btn-open-hazard-modal');
    el.btnOpenPassportModal = document.getElementById('btn-open-passport-modal');
    el.btnOpenFeedbackModal = document.getElementById('btn-open-feedback-modal');

    // Forms
    el.formHazard = document.getElementById('form-hazard');
    el.hazardCategorySelect = document.getElementById('hazard-category-select');
    el.hazardLocationInput = document.getElementById('hazard-location-input');
    el.hazardDescInput = document.getElementById('hazard-desc-input');
    el.btnHazardDictate = document.getElementById('btn-hazard-dictate');

    el.formFeedback = document.getElementById('form-feedback');
    el.feedbackCategorySelect = document.getElementById('feedback-category-select');
    el.feedbackRatingSelect = document.getElementById('feedback-rating-select');
    el.feedbackCommentInput = document.getElementById('feedback-comment-input');
    el.btnFeedbackDictate = document.getElementById('btn-feedback-dictate');

    el.passportTotalHours = document.getElementById('passport-total-hours');
    el.passportCertsContainer = document.getElementById('passport-certs-container');

    el.queuePendingList = document.getElementById('queue-pending-list');
    el.queueSyncHistoryList = document.getElementById('queue-sync-history-list');
    el.toastContainer = document.getElementById('toast-container');
  }

  function initApp() {
    initDOMElements();

    // 1. Initialize Domain Modules
    climateGuard = new ClimateGuard(industry, handleClimateAlert);
    safetyManager = new SafetyManager(industry, renderSafetyDesk);
    feedbackManager = new FeedbackManager(industry);
    skillPassport = new SkillPassport();
    attritionPredictor = new AttritionPredictor(industry);
    offlineQueue = new OfflineQueueManager(handleOfflineQueueChange);

    shiftTracker = new ShiftTracker(industry, renderShiftOdometer, climateGuard);
    shiftTracker.onClockOut = handleClockOutCompleted;

    // 2. Setup UI Listeners & Renders
    populateRoles();
    populateHazardCategories();
    renderSafetyDesk();
    renderSupervisorDesk();
    updatePassportUI();
    applyLanguage(currentLang);

    setupEventListeners();

    // 3. Heartbeat Loop (Updates Shift & SLAs every second)
    setInterval(tickHeartbeat, 1000);
  }

  // =========================================================================
  // Core Heartbeat & Event Handlers
  // =========================================================================

  function tickHeartbeat() {
    if (shiftTracker && shiftTracker.state.isClockedIn) {
      shiftTracker.advanceSeconds(1);
    }
  }

  function handleClockOutCompleted(shiftData) {
    if (skillPassport) {
      skillPassport.addVerifiedHours(shiftData.totalHours);
      updatePassportUI();
    }
    renderSupervisorDesk();
    showToast(`Shift completed! Verified net payout: ₹${shiftData.netPay.toFixed(2)}`, 'success');
  }

  function handleClimateAlert(alertData) {
    if (!el.heatAlertBanner) return;
    if (alertData.heatIndex >= 35) {
      el.heatAlertBanner.classList.remove('hidden');
    } else {
      el.heatAlertBanner.classList.add('hidden');
    }
    if (shiftTracker && shiftTracker.state.isClockedIn) {
      shiftTracker.recalculateStrain();
      renderShiftOdometer(shiftTracker.state);
    }
  }

  function handleOfflineQueueChange(queueStatus) {
    if (!el.offlinePill || !el.offlinePillText) return;
    if (queueStatus.isOnline) {
      el.offlinePill.className = 'status-pill online';
      el.offlinePillText.textContent = 'Cloud Synced';
    } else {
      el.offlinePill.className = 'status-pill offline';
      el.offlinePillText.textContent = `Offline (${queueStatus.pendingCount} queued)`;
    }
  }

  // =========================================================================
  // Renderers
  // =========================================================================

  function populateRoles() {
    if (!el.workerRoleSelect) return;
    el.workerRoleSelect.innerHTML = '';
    industry.roles.forEach(role => {
      const opt = document.createElement('option');
      opt.value = role.id;
      opt.textContent = `${role.title} • ₹${role.baseRate}/hr • MET ${role.strainMET} (${role.category})`;
      el.workerRoleSelect.appendChild(opt);
    });

    if (industry.roles.length > 0) {
      shiftTracker.setWorkerRole(industry.roles[0].id);
    }
  }

  function populateHazardCategories() {
    if (!el.hazardCategorySelect) return;
    el.hazardCategorySelect.innerHTML = '';
    industry.hazards.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = `${h.icon} ${h.label} (${h.severity} • SLA: ${h.slaHours}h)`;
      el.hazardCategorySelect.appendChild(opt);
    });
  }

  function renderShiftOdometer(state) {
    if (!el.shiftClockTimer) return;

    el.shiftClockTimer.textContent = FairShiftUtils.formatDuration(state.simulatedElapsedSeconds);

    const math = state.calculatedMath || shiftTracker.calculateShiftMath();

    el.payStandardVal.textContent = `₹${math.basePay.toFixed(2)}`;
    el.payOvertimeVal.textContent = `₹${math.overtimePay.toFixed(2)}`;
    el.payHazardVal.textContent = `₹${math.hazardAllowance.toFixed(2)}`;
    el.payDeductionsVal.textContent = `-₹${math.statutoryDeductions.toFixed(2)}`;
    el.payNetVal.textContent = `₹${math.netPay.toFixed(2)}`;

    // Overtime Badge
    if (math.overtimeHours > 0) {
      el.overtimeIndicator.classList.remove('hidden');
    } else {
      el.overtimeIndicator.classList.add('hidden');
    }

    // Strain Meter
    const strain = state.currentStrainScore || 0;
    el.strainScoreNum.textContent = `${strain} / 100`;
    el.strainBarFill.style.width = `${strain}%`;

    if (strain < 45) {
      el.strainBarFill.style.backgroundColor = '#10B981';
      el.strainScoreNum.className = 'meter-score low num-mono';
    } else if (strain < 75) {
      el.strainBarFill.style.backgroundColor = '#F59E0B';
      el.strainScoreNum.className = 'meter-score med num-mono';
    } else {
      el.strainBarFill.style.backgroundColor = '#EF4444';
      el.strainScoreNum.className = 'meter-score high num-mono';
    }
  }

  function renderSafetyDesk() {
    if (!el.hazardItemsContainer) return;
    const reports = safetyManager.getReportsForCurrentIndustry();

    el.hazardCountBadge.textContent = `${reports.length} Hazards Tracked`;
    el.hazardItemsContainer.innerHTML = '';

    if (reports.length === 0) {
      el.hazardItemsContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem;">No active hazards reported for this zone.</div>';
      return;
    }

    reports.forEach(report => {
      const card = document.createElement('div');
      card.className = `hazard-item-card ${report.severity === 'Warning' ? 'warning' : ''}`;

      const isCritical = report.severity === 'Critical';
      const badgeColor = isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      const textColor = isCritical ? '#F87171' : '#FBBF24';

      card.innerHTML = `
        <div class="hazard-top-row">
          <div class="hazard-category">
            <span>${FairShiftUtils.escapeHTML(report.icon)}</span>
            <span>${FairShiftUtils.escapeHTML(report.category)}</span>
          </div>
          <span class="sla-badge" style="background: ${badgeColor}; color: ${textColor};">
            ⏱️ ${report.slaMinutesRemaining}m SLA
          </span>
        </div>
        <div class="hazard-desc">${FairShiftUtils.escapeHTML(report.description)}</div>
        <div class="hazard-loc">📍 ${FairShiftUtils.escapeHTML(report.location)} • ${FairShiftUtils.escapeHTML(report.reportedAt)}</div>
        <div class="hazard-bottom-row">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">
            👥 <strong>${report.cosigns}</strong> worker${report.cosigns === 1 ? '' : 's'} co-signed
          </span>
          <button class="cosign-btn ${report.cosignedByMe ? 'cosigned' : ''}" data-hazard-id="${report.id}">
            <span>${report.cosignedByMe ? '✓' : '🤝'}</span>
            <span>${report.cosignedByMe ? 'Co-Signed' : 'Also Saw This'}</span>
          </button>
        </div>
      `;

      el.hazardItemsContainer.appendChild(card);
    });

    // Wire co-sign buttons
    el.hazardItemsContainer.querySelectorAll('.cosign-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-hazard-id');
        const res = safetyManager.cosignReport(id);
        if (res.success) {
          showToast(`Co-signed hazard ${id}! SLA prioritized for supervisor triage.`, 'success');
          renderSafetyDesk();
          renderSupervisorDesk();
        } else {
          showToast(res.message || 'Already co-signed or invalid report', 'info');
        }
      });
    });
  }

  function renderSupervisorDesk() {
    if (!el.supTriageTbody) return;

    const reports = safetyManager.getReportsForCurrentIndustry();
    el.supStatHazards.textContent = reports.length;

    // Triage Desk Table
    el.supTriageTbody.innerHTML = '';
    reports.slice(0, 5).forEach(rep => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${FairShiftUtils.escapeHTML(rep.category)}</strong></td>
        <td>${FairShiftUtils.escapeHTML(rep.location)}</td>
        <td><span class="sla-badge num-mono">${rep.slaMinutesRemaining} mins</span></td>
        <td><span class="num-mono">${rep.cosigns} workers</span></td>
        <td>
          <button class="resolve-btn" data-resolve-id="${rep.id}">Resolve</button>
        </td>
      `;
      el.supTriageTbody.appendChild(tr);
    });

    el.supTriageTbody.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-resolve-id');
        safetyManager.resolveReport(id, 'Supervisor On-Site Audit');
        showToast(`Hazard ${id} verified and resolved on-site!`, 'success');
        renderSafetyDesk();
        renderSupervisorDesk();
      });
    });

    // Overtime Audit Trail Ledger
    if (el.supAuditTbody) {
      const history = shiftTracker.getHistory();
      el.supAuditTbody.innerHTML = '';
      if (history.length === 0) {
        el.supAuditTbody.innerHTML = '<tr><td colspan="5" style="color: var(--text-secondary);">No completed shifts recorded yet. Complete a shift to generate audit log.</td></tr>';
      } else {
        history.slice(0, 5).forEach(shift => {
          const tr = document.createElement('tr');
          const ot = shift.calculatedMath ? shift.calculatedMath.overtimeHours : 0;
          tr.innerHTML = `
            <td><span class="num-mono" style="color: #38BDF8;">${shift.id}</span></td>
            <td>${FairShiftUtils.escapeHTML(shift.roleTitle || 'Frontline')}</td>
            <td class="num-mono">${(shift.totalHours || 0).toFixed(1)}h</td>
            <td class="num-mono" style="color: ${ot > 0 ? '#F59E0B' : 'inherit'};">${ot.toFixed(1)}h ${ot > 0 ? '⚠️' : ''}</td>
            <td class="num-mono" style="color: #34D399;">₹${(shift.netPay || 0).toFixed(2)}</td>
          `;
          el.supAuditTbody.appendChild(tr);
        });
      }
    }

    // Feedback Quotes in Supervisor Ledger
    if (el.supFeedbackQuotes) {
      const fbList = feedbackManager.getAggregatedFeedback().reviews;
      el.supFeedbackQuotes.innerHTML = '';
      fbList.slice(0, 3).forEach(fb => {
        const q = document.createElement('div');
        q.style.padding = '0.6rem 0.8rem';
        q.style.background = 'var(--bg-glass-input)';
        q.style.borderRadius = 'var(--radius-sm)';
        q.style.fontSize = '0.78rem';
        q.style.border = '1px solid var(--border-subtle)';
        q.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="font-weight: 600; color: #38BDF8;">[${FairShiftUtils.escapeHTML(fb.category.toUpperCase())}]</span>
            <span style="color: #F59E0B;">${'★'.repeat(fb.rating)}</span>
          </div>
          <div style="color: var(--text-secondary); font-style: italic;">"${FairShiftUtils.escapeHTML(fb.comment)}"</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">Token: ${FairShiftUtils.escapeHTML(fb.blindToken)} • Redacted</div>
        `;
        el.supFeedbackQuotes.appendChild(q);
      });
    }
  }

  function updatePassportUI() {
    if (!el.passportTotalHours || !skillPassport) return;
    const profile = skillPassport.getProfile();
    el.passportTotalHours.textContent = `${profile.totalVerifiedHours.toLocaleString()} hrs`;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    const keys = [
      { id: 'txt-nav-worker', key: 'workerMode' },
      { id: 'txt-nav-supervisor', key: 'supervisorMode' },
      { id: 'txt-lbl-role', key: 'selectRole' },
      { id: 'txt-lbl-shift-dur', key: 'activeShift' },
      { id: 'txt-lbl-std-pay', key: 'standardPay' },
      { id: 'txt-lbl-ot-pay', key: 'overtimeBonus' },
      { id: 'txt-lbl-hazard-pay', key: 'hazardAllowance' },
      { id: 'txt-lbl-deductions', key: 'deductions' },
      { id: 'txt-lbl-net-pay', key: 'netPayout' },
      { id: 'txt-lbl-strain', key: 'strainScore' },
      { id: 'txt-lbl-battery', key: 'batteryCheck' },
      { id: 'txt-bat-green', key: 'energized' },
      { id: 'txt-bat-yellow', key: 'tired' },
      { id: 'txt-bat-red', key: 'exhausted' },
      { id: 'txt-act-hazard', key: 'reportHazard' },
      { id: 'txt-act-passport', key: 'skillPassport' },
      { id: 'txt-act-feedback', key: 'anonymousFeedback' },
      { id: 'txt-btn-read-payslip', key: 'readPayslip' }
    ];

    keys.forEach(({ id, key }) => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.textContent = I18N_ENGINE.t(key, lang);
      }
    });

    // Update Clock Button text depending on state
    if (shiftTracker && shiftTracker.state.isClockedIn) {
      el.clockMasterText.textContent = I18N_ENGINE.t('clockOut', lang);
    } else {
      el.clockMasterText.textContent = I18N_ENGINE.t('clockIn', lang);
    }
  }

  // =========================================================================
  // Toast Notification System
  // =========================================================================

  function showToast(message, type = 'info') {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: '✓',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };

    toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span> <span>${FairShiftUtils.escapeHTML(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  function setupEventListeners() {
    // 1. Persona Switcher
    el.btnModeWorker.addEventListener('click', () => {
      el.btnModeWorker.classList.add('active');
      el.btnModeSupervisor.classList.remove('active');
      el.workerView.classList.remove('hidden');
      el.supervisorView.classList.add('hidden');
    });

    el.btnModeSupervisor.addEventListener('click', () => {
      el.btnModeSupervisor.classList.add('active');
      el.btnModeWorker.classList.remove('active');
      el.supervisorView.classList.remove('hidden');
      el.workerView.classList.add('hidden');
      renderSupervisorDesk();
    });

    // 2. Industry Switcher
    el.industrySelect.addEventListener('change', (e) => {
      currentIndustryKey = e.target.value;
      industry = INDUSTRY_PRESETS[currentIndustryKey];

      el.industryIcon.textContent = industry.icon;
      el.siteDisplayName.textContent = industry.name;

      climateGuard.setIndustry(industry);
      safetyManager.setIndustry(industry);
      feedbackManager.setIndustry(industry);
      attritionPredictor.setIndustry(industry);
      shiftTracker.setIndustry(industry);

      populateRoles();
      populateHazardCategories();
      renderSafetyDesk();
      renderSupervisorDesk();

      showToast(`Switched site environment to ${industry.name}`, 'info');
    });

    // 3. Language Switcher
    el.langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
      showToast(`Interface language updated to ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });

    // 4. Role Selection
    el.workerRoleSelect.addEventListener('change', (e) => {
      shiftTracker.setWorkerRole(e.target.value);
      renderShiftOdometer(shiftTracker.state);
    });

    // 5. Master Clock Button
    el.btnClockMaster.addEventListener('click', () => {
      if (!shiftTracker.state.isClockedIn) {
        // Geofence check
        if (!isInsideGeofence) {
          showToast('GPS Rejected: Worker is 1.5km outside authorized site geofence.', 'error');
          return;
        }

        // Offline intercept
        if (isSimulatedOffline) {
          offlineQueue.enqueueAction('CLOCK_IN', {
            industryId: industry.id,
            roleId: el.workerRoleSelect.value,
            timestamp: Date.now()
          });
          showToast('🟡 Offline: Clock-in cryptographically saved to local storage queue.', 'warning');
        }

        const res = shiftTracker.clockIn();
        if (res.success) {
          el.btnClockMaster.className = 'clock-btn-master btn-out';
          el.clockMasterIcon.textContent = '⏹️';
          el.clockMasterText.textContent = I18N_ENGINE.t('clockOut', currentLang);
          showToast('Clocked in successfully! GPS Geofence verified (Pier 114).', 'success');
        }
      } else {
        // Clock Out
        const res = shiftTracker.clockOut();
        if (res.success) {
          el.btnClockMaster.className = 'clock-btn-master btn-in';
          el.clockMasterIcon.textContent = '⚡';
          el.clockMasterText.textContent = I18N_ENGINE.t('clockIn', currentLang);
        }
      }
    });

    // 6. Read Payslip Aloud
    el.btnReadPayslip.addEventListener('click', () => {
      const spokenText = shiftTracker.generateVoicePayslip(currentLang);
      I18N_ENGINE.speak(spokenText, currentLang);
      showToast(`🔊 Reading payslip aloud in ${currentLang.toUpperCase()}...`, 'info');
    });

    // 7. Heat Alert Voice Button
    el.btnVoiceHeatAlert.addEventListener('click', () => {
      const voiceText = climateGuard.getVoiceBroadcast(currentLang);
      I18N_ENGINE.speak(voiceText, currentLang);
      showToast('🔊 Announcing mandatory heat-stress safety alert...', 'warning');
    });

    // 8. Battery Check Buttons
    el.batterySelector.querySelectorAll('.battery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.batterySelector.querySelectorAll('.battery-btn').forEach(b => b.classList.remove('active', 'tired', 'exhausted'));
        const level = btn.getAttribute('data-battery');
        btn.classList.add('active');
        if (level === 'yellow') btn.classList.add('tired');
        if (level === 'red') btn.classList.add('exhausted');

        shiftTracker.logBatteryStatus(level);
        showToast(`Battery rating logged: ${level.toUpperCase()}. Fatigue calibration adjusted.`, 'info');
      });
    });

    // 9. Quick Break Logger
    el.btnBreakWater.addEventListener('click', () => {
      shiftTracker.logBreak(5);
      showToast('Logged 5-minute hydration break 💧', 'success');
    });
    el.btnBreakLunch.addEventListener('click', () => {
      shiftTracker.logBreak(30);
      showToast('Logged 30-minute meal break 🍱', 'success');
    });
    el.btnBreakRest.addEventListener('click', () => {
      shiftTracker.logBreak(15);
      showToast('Logged 15-minute recovery rest ☕', 'success');
    });

    // 10. Demo Lab Toggles
    el.simGeoToggle.addEventListener('click', () => {
      isInsideGeofence = !isInsideGeofence;
      if (isInsideGeofence) {
        el.simGeoToggle.className = 'sim-btn active';
        el.simGeoToggle.textContent = '📍 Site: Inside Zone';
        el.geoStatusBadge.className = 'geo-status-tag verified';
        el.geoStatusBadge.textContent = '● Inside GPS Geofence (250m)';
      } else {
        el.simGeoToggle.className = 'sim-btn';
        el.simGeoToggle.textContent = '🚫 Site: 1.5km Away';
        el.geoStatusBadge.className = 'geo-status-tag away';
        el.geoStatusBadge.textContent = '● OUTSIDE Geofence (1.5km Away)';
      }
    });

    el.simHeatToggle.addEventListener('click', () => {
      isHeatwaveSimulated = !isHeatwaveSimulated;
      if (isHeatwaveSimulated) {
        el.simHeatToggle.className = 'sim-btn active';
        el.simHeatToggle.textContent = '🔥 Temp: 42°C Heatwave';
        climateGuard.setConditions(42, 65);
      } else {
        el.simHeatToggle.className = 'sim-btn';
        el.simHeatToggle.textContent = '☀️ Temp: 28°C Normal';
        climateGuard.setConditions(28, 50);
      }
    });

    el.simNetToggle.addEventListener('click', () => {
      isSimulatedOffline = !isSimulatedOffline;
      offlineQueue.toggleSimulatedOffline(isSimulatedOffline);
      if (isSimulatedOffline) {
        el.simNetToggle.className = 'sim-btn active';
        el.simNetToggle.textContent = '📴 Reception: Basement Offline';
        showToast('Cell connection dropped. Store-and-Forward queue active.', 'warning');
      } else {
        el.simNetToggle.className = 'sim-btn';
        el.simNetToggle.textContent = '📶 Reception: Online 5G';
        const flushRes = offlineQueue.flushQueue();
        showToast(`🟢 Reconnected to Cloud! Flushed ${flushRes.count} pending items.`, 'success');
      }
    });

    el.simFf1h.addEventListener('click', () => {
      if (shiftTracker.state.isClockedIn) {
        shiftTracker.advanceHours(1);
        showToast('Shift advanced by +1 Hour', 'info');
      } else {
        showToast('Clock in first before fast-forwarding shift time.', 'warning');
      }
    });

    el.simFf4h.addEventListener('click', () => {
      if (shiftTracker.state.isClockedIn) {
        shiftTracker.advanceHours(4);
        showToast('Shift advanced by +4 Hours', 'info');
      } else {
        showToast('Clock in first before fast-forwarding shift time.', 'warning');
      }
    });

    el.simFfOt.addEventListener('click', () => {
      if (shiftTracker.state.isClockedIn) {
        shiftTracker.advanceHours(8.5);
        showToast('🔥 Shift advanced by +8.5 Hours! 1.5x Overtime triggered.', 'warning');
      } else {
        showToast('Clock in first before triggering overtime.', 'warning');
      }
    });

    // 11. Modals Open / Close
    el.btnOpenHazardModal.addEventListener('click', () => openModal(el.modalHazard));
    el.btnOpenPassportModal.addEventListener('click', () => {
      updatePassportUI();
      openModal(el.modalPassport);
    });
    el.btnOpenFeedbackModal.addEventListener('click', () => openModal(el.modalFeedback));
    el.offlinePill.addEventListener('click', () => {
      renderOfflineQueueInspector();
      openModal(el.modalOfflineQueue);
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-close');
        const target = document.getElementById(id);
        if (target) closeModal(target);
      });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // 12. Form Submissions
    el.formHazard.addEventListener('submit', (e) => {
      e.preventDefault();
      const categoryId = el.hazardCategorySelect.value;
      const location = el.hazardLocationInput.value;
      const description = el.hazardDescInput.value;

      if (isSimulatedOffline) {
        offlineQueue.enqueueAction('HAZARD_REPORT', { categoryId, location, description });
        showToast('🟡 Offline: Hazard draft nonced and queued in local storage.', 'warning');
        closeModal(el.modalHazard);
        return;
      }

      const res = safetyManager.submitReport({
        categoryId,
        location,
        description,
        isClockedIn: shiftTracker.state.isClockedIn
      });

      if (res.success) {
        showToast(`Hazard reported! SLA clock started (${res.report.slaMinutesRemaining}m).`, 'success');
        el.formHazard.reset();
        closeModal(el.modalHazard);
        renderSafetyDesk();
        renderSupervisorDesk();
      } else {
        showToast(res.message, 'error');
      }
    });

    el.formFeedback.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = el.feedbackCategorySelect.value;
      const rating = parseInt(el.feedbackRatingSelect.value, 10);
      const comment = el.feedbackCommentInput.value;

      const res = feedbackManager.submitFeedback({ category, rating, comment });
      if (res.success) {
        showToast('Feedback submitted! Protected by Blind Token: ' + res.token, 'success');
        el.formFeedback.reset();
        closeModal(el.modalFeedback);
        renderSupervisorDesk();
      } else {
        showToast(res.reason, 'error');
      }
    });

    // 13. Speech Dictation for Hazard and Feedback
    setupDictation(el.btnHazardDictate, el.hazardDescInput);
    setupDictation(el.btnFeedbackDictate, el.feedbackCommentInput);
  }

  function setupDictation(btn, targetInput) {
    if (!btn || !targetInput) return;
    btn.addEventListener('click', () => {
      btn.classList.add('listening');
      btn.innerHTML = '<span>🔴</span> <span>Listening...</span>';

      I18N_ENGINE.startListening(
        currentLang,
        (transcript) => {
          targetInput.value = (targetInput.value ? targetInput.value + ' ' : '') + transcript;
        },
        () => {
          btn.classList.remove('listening');
          btn.innerHTML = '<span>🎤</span> <span>Speak</span>';
        }
      );
    });
  }

  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  function renderOfflineQueueInspector() {
    if (!el.queuePendingList || !el.queueSyncHistoryList) return;
    const status = offlineQueue.getQueueStatus();

    el.queuePendingList.innerHTML = '';
    if (status.queue.length === 0) {
      el.queuePendingList.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.78rem;">Queue is empty. All items synced with cloud.</div>';
    } else {
      status.queue.forEach(item => {
        const row = document.createElement('div');
        row.style.padding = '0.5rem';
        row.style.background = 'var(--bg-glass-input)';
        row.style.borderRadius = 'var(--radius-sm)';
        row.style.fontSize = '0.75rem';
        row.innerHTML = `<strong>${item.actionType}</strong> • Nonce: <code>${item.offlineNonce}</code>`;
        el.queuePendingList.appendChild(row);
      });
    }

    el.queueSyncHistoryList.innerHTML = '';
    const log = offlineQueue.getSyncLog();
    if (log.length === 0) {
      el.queueSyncHistoryList.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.78rem;">No reconnection events recorded yet.</div>';
    } else {
      log.forEach(entry => {
        const row = document.createElement('div');
        row.style.padding = '0.5rem';
        row.style.background = 'rgba(16, 185, 129, 0.1)';
        row.style.borderRadius = 'var(--radius-sm)';
        row.style.fontSize = '0.75rem';
        row.innerHTML = `🟢 Synced <strong>${entry.flushedCount} actions</strong> at ${new Date(entry.timestamp).toLocaleTimeString()}`;
        el.queueSyncHistoryList.appendChild(row);
      });
    }
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
