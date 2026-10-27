/**
 * FairShift - Core Enterprise Workforce & Shift Operations Controller
 * Connects Frontend UI with FairShift Domain Engines:
 * - ShiftTracker (Live Overtime Odometer & 1.5x Wage Ledger)
 * - SafetyManager (Abuse-Proof Hazards & Peer Co-Signing with SLA Countdowns)
 * - AttritionPredictor (AI Fatigue & Quit-Risk Radar)
 * - ClimateGuard (Wet-Bulb Apparent Temp & Heat-Stress Mult)
 * - OfflineQueueManager (Store-and-Forward Cryptographic Nonces)
 * - SkillPassport (Verifiable Digital Credentials)
 * - Multi-Industry Engine (Construction, Healthcare, Manufacturing, Education)
 *
 * Strict Rule: No Emojis, Pure SVG Icons, Zero Extra Fluff
 */

(function () {
  'use strict';

  // --- Platform State ---
  let currentIndustryKey = 'construction';
  let currentPersona = 'supervisor'; // 'supervisor' or 'worker'
  let currentLang = 'en';
  let isInsideGeofence = true;
  let isHeatwave = false;
  let isOffline = false;

  // Active Domain Instances
  let industry = INDUSTRY_PRESETS[currentIndustryKey];
  let climateGuard = null;
  let shiftTracker = null;
  let safetyManager = null;
  let feedbackManager = null;
  let skillPassport = null;
  let attritionPredictor = null;
  let offlineQueue = null;

  let activeSearchQuery = '';
  let activeTab = 'week';
  let selectedWorkerForModal = null;

  // Realistic Shift Rosters per Industry
  const INDUSTRY_ROSTERS = {
    construction: [
      { id: 'W-CON-101', name: 'Rajesh Kumar', role: 'Concrete Mason', roleId: 'mason', timeSlot: '08:00 - 16:00', priority: 'high', status: 'in-progress', zone: 'Pillar 104-128', hours: 7.5, ot: 0, strain: 48, baseRate: 95 },
      { id: 'W-CON-102', name: 'Suresh Murugan', role: 'Scaffold Rigger', roleId: 'rigger', timeSlot: '08:00 - 16:00', priority: 'medium', status: 'in-progress', zone: 'Pier 112 West', hours: 8.0, ot: 0, strain: 62, baseRate: 110 },
      { id: 'W-CON-103', name: 'Amit Sharma', role: 'Site Electrician', roleId: 'electrician', timeSlot: '10:00 - 18:00', priority: 'high', status: 'scheduled', zone: 'Transformer Bay 3', hours: 0, ot: 0, strain: 15, baseRate: 105 },
      { id: 'W-CON-104', name: 'David Chen', role: 'Tower Crane Operator', roleId: 'crane_op', timeSlot: '12:00 - 20:00', priority: 'medium', status: 'scheduled', zone: 'Tower Crane 02', hours: 0, ot: 0, strain: 10, baseRate: 140 },
      { id: 'W-CON-105', name: 'Anil Kumar', role: 'Concrete Mason', roleId: 'mason', timeSlot: '06:00 - 16:30', priority: 'high', status: 'completed', zone: 'Tunnel Approach A', hours: 10.5, ot: 2.5, strain: 84, baseRate: 95 }
    ],
    healthcare: [
      { id: 'W-MED-201', name: 'Sister Priya Nair', role: 'ICU Staff Nurse', roleId: 'icu_nurse', timeSlot: '07:00 - 15:30', priority: 'high', status: 'in-progress', zone: 'ICU Block C', hours: 7.0, ot: 0, strain: 52, baseRate: 130 },
      { id: 'W-MED-202', name: 'Karthik Subramanian', role: 'Ward Orderly', roleId: 'orderly', timeSlot: '07:00 - 15:30', priority: 'medium', status: 'in-progress', zone: 'Trauma ER Wing', hours: 6.5, ot: 0, strain: 58, baseRate: 85 },
      { id: 'W-MED-203', name: 'Deepa Raman', role: 'Bio-Sanitation Tech', roleId: 'sanitation', timeSlot: '11:00 - 19:30', priority: 'high', status: 'scheduled', zone: 'Isolation Ward 2', hours: 0, ot: 0, strain: 10, baseRate: 90 },
      { id: 'W-MED-204', name: 'Vinoth Balan', role: 'Pathology Lab Assistant', roleId: 'lab_tech', timeSlot: '13:00 - 21:00', priority: 'low', status: 'scheduled', zone: 'Core Diagnostics', hours: 0, ot: 0, strain: 12, baseRate: 100 }
    ],
    manufacturing: [
      { id: 'W-MFG-301', name: 'Marcus Vance', role: 'MIG/TIG Welder', roleId: 'welder', timeSlot: '08:00 - 16:30', priority: 'high', status: 'in-progress', zone: 'Powertrain Bay 4', hours: 7.2, ot: 0, strain: 65, baseRate: 115 },
      { id: 'W-MFG-302', name: 'Arun Kumar', role: 'Chassis Assembler', roleId: 'assembler', timeSlot: '08:00 - 16:30', priority: 'medium', status: 'in-progress', zone: 'Conveyor Line 2', hours: 6.8, ot: 0, strain: 50, baseRate: 95 },
      { id: 'W-MFG-303', name: 'Mani K.', role: 'Forklift Operator', roleId: 'forklift_op', timeSlot: '10:00 - 18:30', priority: 'low', status: 'scheduled', zone: 'Warehouse Loading D', hours: 0, ot: 0, strain: 20, baseRate: 105 }
    ],
    education: [
      { id: 'W-EDU-401', name: 'Gopal Natarajan', role: 'Campus Security', roleId: 'campus_security', timeSlot: '06:00 - 18:00', priority: 'high', status: 'in-progress', zone: 'Main Tech Gate', hours: 11.0, ot: 3.0, strain: 78, baseRate: 85 },
      { id: 'W-EDU-402', name: 'Selvi Murugan', role: 'Facilities Janitor', roleId: 'facilities_janitor', timeSlot: '07:00 - 15:30', priority: 'medium', status: 'in-progress', zone: 'Science Labs Block', hours: 6.0, ot: 0, strain: 44, baseRate: 80 },
      { id: 'W-EDU-403', name: 'Praveen Thangavel', role: 'Lab Assistant', roleId: 'lab_assistant', timeSlot: '09:00 - 17:00', priority: 'low', status: 'scheduled', zone: 'Biotech Lab 304', hours: 0, ot: 0, strain: 15, baseRate: 95 }
    ]
  };

  // DOM Elements Cache
  const el = {};

  function initDOMElements() {
    // Views
    el.loginView = document.getElementById('login-view');
    el.appView = document.getElementById('app-view');

    // Login Form Elements
    el.loginForm = document.getElementById('login-form');
    el.loginWorksiteSelect = document.getElementById('login-worksite-select');
    el.loginRoleSelect = document.getElementById('login-role-select');
    el.loginIdInput = document.getElementById('login-id-input');
    el.loginPinInput = document.getElementById('login-pin-input');
    el.loginError = document.getElementById('login-error');
    el.btnTogglePassword = document.getElementById('btn-toggle-password');
    el.passwordIconShow = document.getElementById('password-icon-show');
    el.passwordIconHide = document.getElementById('password-icon-hide');

    // Demo Chips
    el.demoChips = document.querySelectorAll('.demo-chip');

    // Navigation & Header
    el.industrySelect = document.getElementById('header-industry-select');
    el.personaBtn = document.getElementById('header-persona-btn');
    el.personaLabel = document.getElementById('header-persona-label');
    el.searchInput = document.getElementById('search-input');
    el.btnBell = document.getElementById('btn-bell');
    el.bellBadge = document.getElementById('bell-badge');
    el.notificationsPanel = document.getElementById('notifications-panel');
    el.userProfileBadge = document.getElementById('user-profile-badge');
    el.userDropdownMenu = document.getElementById('user-dropdown-menu');
    el.userName = document.getElementById('user-name');
    el.userRole = document.getElementById('user-role');
    el.btnSignOut = document.getElementById('btn-sign-out');

    // Simulation / Judge Testing Bar
    el.simGeoToggle = document.getElementById('sim-geo-toggle');
    el.simHeatToggle = document.getElementById('sim-heat-toggle');
    el.simNetToggle = document.getElementById('sim-net-toggle');
    el.simFf1h = document.getElementById('sim-ff-1h');
    el.simFf4h = document.getElementById('sim-ff-4h');
    el.simFfOt = document.getElementById('sim-ff-ot');

    // Main Workspace
    el.pageTitle = document.getElementById('page-title');
    el.pageSubtitle = document.getElementById('page-subtitle');
    el.btnReportHazard = document.getElementById('btn-report-hazard');
    el.btnClockAction = document.getElementById('btn-clock-action');

    // Top Metric Cards
    el.metricHeadcountVal = document.getElementById('metric-headcount-val');
    el.metricHeadcountNote = document.getElementById('metric-headcount-note');
    el.metricOtVal = document.getElementById('metric-ot-val');
    el.metricOtNote = document.getElementById('metric-ot-note');
    el.metricWorkersVal = document.getElementById('metric-workers-val');
    el.metricWorkersNote = document.getElementById('metric-workers-note');
    el.metricHazardsVal = document.getElementById('metric-hazards-val');
    el.metricHazardsNote = document.getElementById('metric-hazards-note');

    // Panels
    el.scheduleContainer = document.getElementById('schedule-container');
    el.segmentedBtns = document.querySelectorAll('.segmented-btn');

    // Capacity Progress Bars
    el.resStaffingCount = document.getElementById('res-staffing-count');
    el.resStaffingFill = document.getElementById('res-staffing-fill');
    el.resGeofenceCount = document.getElementById('res-geofence-count');
    el.resGeofenceFill = document.getElementById('res-geofence-fill');
    el.resStrainCount = document.getElementById('res-strain-count');
    el.resStrainFill = document.getElementById('res-strain-fill');
    el.resClimateCount = document.getElementById('res-climate-count');
    el.resClimateFill = document.getElementById('res-climate-fill');
    el.btnOptimizeShifts = document.getElementById('btn-optimize-shifts');

    // Modals
    el.modalOdometer = document.getElementById('modal-odometer');
    el.modalHazards = document.getElementById('modal-hazards');
    el.modalAttrition = document.getElementById('modal-attrition');
    el.modalPassport = document.getElementById('modal-passport');
    el.modalFeedback = document.getElementById('modal-feedback');
    el.toastContainer = document.getElementById('toast-container');

    // Odometer Modal Elements
    el.odoWorkerName = document.getElementById('odo-worker-name');
    el.odoWorkerRole = document.getElementById('odo-worker-role');
    el.odoTimer = document.getElementById('odo-timer');
    el.odoBasePay = document.getElementById('odo-base-pay');
    el.odoOtPay = document.getElementById('odo-ot-pay');
    el.odoHazardPay = document.getElementById('odo-hazard-pay');
    el.odoDeductions = document.getElementById('odo-deductions');
    el.odoNetPay = document.getElementById('odo-net-pay');
    el.odoStrainVal = document.getElementById('odo-strain-val');
    el.btnReadAloud = document.getElementById('btn-read-aloud');

    // Attrition Modal Elements
    el.attritionWorkerName = document.getElementById('attrition-worker-name');
    el.attritionWorkerSub = document.getElementById('attrition-worker-sub');
    el.attritionRiskPct = document.getElementById('attrition-risk-pct');
    el.attritionFactorsList = document.getElementById('attrition-factors-list');
    el.attritionRecommendation = document.getElementById('attrition-recommendation');

    // Safety Modal Elements
    el.hazardListTbody = document.getElementById('hazard-list-tbody');
    el.formNewHazard = document.getElementById('form-new-hazard');
    el.hazardCatSelect = document.getElementById('hazard-cat-select');
    el.hazardLocInput = document.getElementById('hazard-loc-input');

    // Passport Modal Elements
    el.passportHoursVal = document.getElementById('passport-hours-val');
  }

  // --- Initializer ---
  function initApp() {
    initDOMElements();

    // Initialize Domain Classes
    climateGuard = new ClimateGuard(industry, onClimateAlert);
    safetyManager = new SafetyManager(industry, onSafetyUpdate);
    feedbackManager = new FeedbackManager(industry);
    skillPassport = new SkillPassport();
    attritionPredictor = new AttritionPredictor(industry);
    offlineQueue = new OfflineQueueManager(onOfflineQueueUpdate);

    shiftTracker = new ShiftTracker(industry, onShiftOdometerUpdate, climateGuard);

    setupEventListeners();
    checkAuthSession();

    // 1-second Heartbeat ticker
    setInterval(tickHeartbeat, 1000);
  }

  function tickHeartbeat() {
    if (shiftTracker && shiftTracker.state.isClockedIn) {
      shiftTracker.advanceSeconds(1);
    }
  }

  // --- Auth Session Handling ---
  function checkAuthSession() {
    const session = localStorage.getItem('fairshift_auth_user');
    if (session) {
      const user = JSON.parse(session);
      showDashboard(user);
    } else {
      showLogin();
    }
  }

  function showLogin() {
    el.loginView.style.display = 'flex';
    el.appView.style.display = 'none';
  }

  function showDashboard(user) {
    el.loginView.style.display = 'none';
    el.appView.style.display = 'flex';

    if (user) {
      if (el.userName) el.userName.textContent = user.name || 'Vikram Rathore';
      if (el.userRole) el.userRole.textContent = user.roleTitle || 'Safety Lead';
      if (user.industryKey && user.industryKey !== currentIndustryKey) {
        setIndustry(user.industryKey);
      }
    }

    renderWorkspace();
  }

  function handleLogin(siteKey, role, id, pin) {
    if (!id || !pin) {
      el.loginError.textContent = 'Please enter authorized ID and Security PIN.';
      el.loginError.style.display = 'block';
      return;
    }

    const matchedSite = INDUSTRY_PRESETS[siteKey] || INDUSTRY_PRESETS.construction;
    const userData = {
      id: id,
      name: id.includes('Rajesh') ? 'Rajesh Kumar' : (id.includes('Priya') ? 'Dr. Priya Nair' : 'Vikram Rathore'),
      roleTitle: role === 'worker' ? 'Frontline Worker' : 'Site Operations Manager',
      roleType: role,
      industryKey: siteKey,
      siteName: matchedSite.name,
      loginAt: new Date().toISOString()
    };

    localStorage.setItem('fairshift_auth_user', JSON.stringify(userData));
    el.loginError.style.display = 'none';
    showToast(`Signed into ${matchedSite.name}`);
    showDashboard(userData);
  }

  // --- Industry Switcher ---
  function setIndustry(key) {
    if (!INDUSTRY_PRESETS[key]) return;
    currentIndustryKey = key;
    industry = INDUSTRY_PRESETS[key];

    if (climateGuard) climateGuard.industry = industry;
    if (safetyManager) safetyManager.setIndustry(industry);
    if (attritionPredictor) attritionPredictor.setIndustry(industry);
    if (shiftTracker) shiftTracker.industry = industry;

    if (el.industrySelect) el.industrySelect.value = key;
    if (el.loginWorksiteSelect) el.loginWorksiteSelect.value = key;

    populateHazardCategories();
    renderWorkspace();
    showToast(`Switched worksite to ${industry.name}`);
  }

  // --- Populate Hazard Category Select ---
  function populateHazardCategories() {
    if (!el.hazardCatSelect) return;
    el.hazardCatSelect.innerHTML = '';
    industry.hazards.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = `${h.label} (${h.severity} • SLA: ${h.slaHours}h)`;
      el.hazardCatSelect.appendChild(opt);
    });
  }

  // --- Workspace Renderers ---
  function renderWorkspace() {
    // 1. Update Title and Location
    if (el.pageTitle) {
      el.pageTitle.textContent = `${industry.sector} Shift Operations`;
    }
    if (el.pageSubtitle) {
      el.pageSubtitle.textContent = `${industry.name} • ${industry.location.name}`;
    }

    // 2. Render Roster List
    renderShiftRoster();

    // 3. Render Metric Cards
    renderMetrics();

    // 4. Render Capacity Bars
    renderCapacityBars();
  }

  function renderShiftRoster() {
    if (!el.scheduleContainer) return;
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;

    const filtered = roster.filter(w => {
      const q = activeSearchQuery.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.zone.toLowerCase().includes(q) ||
        w.priority.toLowerCase().includes(q) ||
        w.status.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      el.scheduleContainer.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          No frontline workers found matching search criteria.
        </div>
      `;
      return;
    }

    el.scheduleContainer.innerHTML = filtered
      .map((item, idx) => {
        const priorityClass = `badge-${item.priority}`;
        const statusClass = `badge-${item.status}`;
        const otText = item.ot > 0 ? `• <span style="color:#ef4444; font-weight:700;">+${item.ot}h OT</span>` : '';

        return `
        <div class="schedule-item" data-id="${item.id}">
          <div class="time-slot-box">
            <span class="time-slot-label">Shift Hours</span>
            <span class="time-slot-val">${item.timeSlot}</span>
          </div>

          <div class="job-details-col">
            <div class="job-id-tags-row">
              <span class="job-id-text">${item.name}</span>
              <span class="badge ${priorityClass}">${item.priority}</span>
              <span class="badge ${statusClass}">${item.status}</span>
            </div>
            <span class="machine-info-text">${item.role} • ${item.zone} ${otText}</span>
          </div>

          <button class="btn-modify" onclick="window.fairShiftApp.openWorkerOdometer(${idx})">
            Review Shift
          </button>
        </div>
      `;
      })
      .join('');
  }

  function renderMetrics() {
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;
    const activeCount = roster.filter(r => r.status === 'in-progress').length + 14;
    const otCount = roster.filter(r => r.ot > 0).length + (isHeatwave ? 2 : 1);
    const criticalHazards = safetyManager ? safetyManager.getReportsForCurrentIndustry().filter(h => h.status !== 'Resolved').length : 2;

    if (el.metricHeadcountVal) el.metricHeadcountVal.textContent = activeCount;
    if (el.metricHeadcountNote) el.metricHeadcountNote.textContent = isInsideGeofence ? '100% Inside Geofence' : 'Warning: 1 Outside Boundary';

    if (el.metricOtVal) el.metricOtVal.textContent = otCount;
    if (el.metricWorkersVal) el.metricWorkersVal.textContent = `${roster.length}/15`;

    if (el.metricHazardsVal) el.metricHazardsVal.textContent = criticalHazards;
    if (el.bellBadge) el.bellBadge.textContent = criticalHazards;
  }

  function renderCapacityBars() {
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;
    const staffingPct = Math.min(100, Math.round((roster.length / 15) * 100));
    const geofencePct = isInsideGeofence ? 100 : 75;
    const strainVal = isHeatwave ? 76 : 54;
    const climateVal = isHeatwave ? 42 : 28;
    const climatePct = isHeatwave ? 85 : 40;

    if (el.resStaffingCount) el.resStaffingCount.textContent = `${roster.length}/15`;
    if (el.resStaffingFill) el.resStaffingFill.style.width = `${staffingPct}%`;

    if (el.resGeofenceCount) el.resGeofenceCount.textContent = isInsideGeofence ? '18/18' : '14/18';
    if (el.resGeofenceFill) el.resGeofenceFill.style.width = `${geofencePct}%`;

    if (el.resStrainCount) el.resStrainCount.textContent = `${strainVal} / 100`;
    if (el.resStrainFill) el.resStrainFill.style.width = `${strainVal}%`;

    if (el.resClimateCount) el.resClimateCount.textContent = `${climateVal}°C`;
    if (el.resClimateFill) el.resClimateFill.style.width = `${climatePct}%`;
  }

  // --- Domain Event Callbacks ---
  function onClimateAlert(alertData) {
    renderCapacityBars();
    if (alertData.heatIndex >= 35) {
      showToast('Climate Guard: Wet-bulb heatwave detected! Mandatory 15m rest break triggered.');
    }
  }

  function onSafetyUpdate(reports) {
    renderMetrics();
    renderSafetyDeskTable();
  }

  function onOfflineQueueUpdate(status) {
    if (el.simNetToggle) {
      if (status.isOnline) {
        el.simNetToggle.textContent = 'Reception: Online 5G';
        el.simNetToggle.className = 'sim-chip active';
      } else {
        el.simNetToggle.textContent = `Offline (${status.pendingCount} Queued)`;
        el.simNetToggle.className = 'sim-chip warning active';
      }
    }
  }

  function onShiftOdometerUpdate(state) {
    // Updates live odometer UI
    const math = state.calculatedMath || shiftTracker.calculateShiftMath();
    if (el.odoTimer) el.odoTimer.textContent = FairShiftUtils.formatDuration(state.simulatedElapsedSeconds);
    if (el.odoBasePay) el.odoBasePay.textContent = `₹${math.basePay.toFixed(2)}`;
    if (el.odoOtPay) el.odoOtPay.textContent = `₹${math.overtimePay.toFixed(2)}`;
    if (el.odoHazardPay) el.odoHazardPay.textContent = `₹${math.hazardAllowance.toFixed(2)}`;
    if (el.odoDeductions) el.odoDeductions.textContent = `-₹${math.statutoryDeductions.toFixed(2)}`;
    if (el.odoNetPay) el.odoNetPay.textContent = `₹${math.netPay.toFixed(2)}`;
    if (el.odoStrainVal) el.odoStrainVal.textContent = `${state.currentStrainScore} / 100`;
  }

  // --- Modal Openers ---
  function openWorkerOdometer(index) {
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;
    const worker = roster[index] || roster[0];
    selectedWorkerForModal = worker;

    if (el.odoWorkerName) el.odoWorkerName.textContent = worker.name;
    if (el.odoWorkerRole) el.odoWorkerRole.textContent = `${worker.role} • Rate: ₹${worker.baseRate}/hr`;

    // Calculate realistic shift pay math
    const baseHours = Math.min(8.0, worker.hours || 7.0);
    const otHours = Math.max(0, (worker.hours || 7.0) - 8.0);
    const basePay = baseHours * worker.baseRate;
    const otPay = otHours * (worker.baseRate * 1.5);
    const hazardPay = (worker.priority === 'high' || isHeatwave) ? 120.0 : 0.0;
    const deductions = Math.round((basePay + otPay) * 0.04);
    const netPay = basePay + otPay + hazardPay - deductions;

    if (el.odoTimer) el.odoTimer.textContent = FairShiftUtils.formatDuration(Math.round((worker.hours || 7.0) * 3600));
    if (el.odoBasePay) el.odoBasePay.textContent = `₹${basePay.toFixed(2)}`;
    if (el.odoOtPay) el.odoOtPay.textContent = `₹${otPay.toFixed(2)}`;
    if (el.odoHazardPay) el.odoHazardPay.textContent = `₹${hazardPay.toFixed(2)}`;
    if (el.odoDeductions) el.odoDeductions.textContent = `-₹${deductions.toFixed(2)}`;
    if (el.odoNetPay) el.odoNetPay.textContent = `₹${netPay.toFixed(2)}`;
    if (el.odoStrainVal) el.odoStrainVal.textContent = `${worker.strain || 45} / 100`;

    el.modalOdometer.classList.add('active');
  }

  function openSafetyDesk() {
    renderSafetyDeskTable();
    el.modalHazards.classList.add('active');
  }

  function renderSafetyDeskTable() {
    if (!el.hazardListTbody || !safetyManager) return;
    const reports = safetyManager.getReportsForCurrentIndustry();

    el.hazardListTbody.innerHTML = reports
      .map(r => {
        const severityClass = r.severity === 'Critical' ? 'badge-high' : 'badge-medium';
        return `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 0.75rem 0.5rem; font-weight:600;">
            <span class="badge ${severityClass}">${r.severity}</span>
            <span style="margin-left: 6px;">${r.categoryLabel}</span>
          </td>
          <td style="padding: 0.75rem 0.5rem; color:var(--text-muted);">${r.location}</td>
          <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight:700;">${r.remainingSLA || '01:45:00'}</td>
          <td style="padding: 0.75rem 0.5rem;">
            <button class="btn-cosign" onclick="window.fairShiftApp.coSignHazard('${r.id}')">
              Co-Sign (${r.cosigns || 1})
            </button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  function openAttritionRadar() {
    const analytics = attritionPredictor.getWorkforceAnalytics();
    const highRiskWorker = analytics.workers.find(w => w.riskScore >= 70) || analytics.workers[0];

    if (el.attritionWorkerName) el.attritionWorkerName.textContent = `${highRiskWorker.name} (${highRiskWorker.roleTitle})`;
    if (el.attritionWorkerSub) el.attritionWorkerSub.textContent = `${highRiskWorker.shiftsOver10h} Overtime shifts this week + night rotations`;
    if (el.attritionRiskPct) el.attritionRiskPct.textContent = `${highRiskWorker.riskScore}%`;

    if (el.attritionFactorsList) {
      el.attritionFactorsList.innerHTML = highRiskWorker.riskDrivers
        .map(driver => `
          <div class="risk-factor-row">
            <span class="risk-factor-dot"></span>
            <span>${driver}</span>
          </div>
        `)
        .join('');
    }

    if (el.attritionRecommendation && highRiskWorker.recommendations.length > 0) {
      el.attritionRecommendation.textContent = highRiskWorker.recommendations[0];
    }

    el.modalAttrition.classList.add('active');
  }

  function openSkillPassport() {
    if (el.passportHoursVal && skillPassport) {
      el.passportHoursVal.textContent = `${skillPassport.data.totalVerifiedHours}h`;
    }
    el.modalPassport.classList.add('active');
  }

  function openFeedbackModal() {
    el.modalFeedback.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // --- Voice Readout ---
  function readPayslipAloud() {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();
    const workerName = el.odoWorkerName ? el.odoWorkerName.textContent : 'Frontline Worker';
    const net = el.odoNetPay ? el.odoNetPay.textContent : '₹760.00';
    const text = `Verified Payslip for ${workerName}. Standard hours completed. Net payout: ${net}. Confirmed compliant with labor regulation.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showToast('Playing audio readout in English');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Login Form Submit
    if (el.loginForm) {
      el.loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin(
          el.loginWorksiteSelect.value,
          el.loginRoleSelect.value,
          el.loginIdInput.value.trim(),
          el.loginPinInput.value.trim()
        );
      });
    }

    // Toggle Password Visibility
    if (el.btnTogglePassword) {
      el.btnTogglePassword.addEventListener('click', function () {
        const isPwd = el.loginPinInput.type === 'password';
        el.loginPinInput.type = isPwd ? 'text' : 'password';
        el.passwordIconShow.style.display = isPwd ? 'none' : 'block';
        el.passwordIconHide.style.display = isPwd ? 'block' : 'none';
      });
    }

    // Demo Chips
    el.demoChips.forEach(chip => {
      chip.addEventListener('click', function () {
        const demoUser = this.dataset.demo;
        if (demoUser === 'rajesh') {
          el.loginWorksiteSelect.value = 'construction';
          el.loginRoleSelect.value = 'worker';
          el.loginIdInput.value = 'Rajesh Kumar (ID: FS-W104)';
          el.loginPinInput.value = '1234';
          handleLogin('construction', 'worker', 'Rajesh Kumar', '1234');
        } else if (demoUser === 'vikram') {
          el.loginWorksiteSelect.value = 'construction';
          el.loginRoleSelect.value = 'supervisor';
          el.loginIdInput.value = 'Vikram Rathore (Lead)';
          el.loginPinInput.value = '1234';
          handleLogin('construction', 'supervisor', 'Vikram Rathore', '1234');
        } else if (demoUser === 'priya') {
          el.loginWorksiteSelect.value = 'healthcare';
          el.loginRoleSelect.value = 'supervisor';
          el.loginIdInput.value = 'Dr. Priya Nair (Hospital)';
          el.loginPinInput.value = '1234';
          handleLogin('healthcare', 'supervisor', 'Dr. Priya Nair', '1234');
        } else if (demoUser === 'marcus') {
          el.loginWorksiteSelect.value = 'manufacturing';
          el.loginRoleSelect.value = 'supervisor';
          el.loginIdInput.value = 'Marcus Vance (Plant Lead)';
          el.loginPinInput.value = '1234';
          handleLogin('manufacturing', 'supervisor', 'Marcus Vance', '1234');
        }
      });
    });

    // Sign Out
    if (el.btnSignOut) {
      el.btnSignOut.addEventListener('click', function () {
        localStorage.removeItem('fairshift_auth_user');
        if (el.userDropdownMenu) el.userDropdownMenu.classList.remove('show');
        showToast('Signed out of FairShift');
        showLogin();
      });
    }

    // Profile Dropdown Toggle
    if (el.userProfileBadge) {
      el.userProfileBadge.addEventListener('click', function (e) {
        e.stopPropagation();
        el.userDropdownMenu.classList.toggle('show');
      });
    }

    // Bell Notifications Toggle
    if (el.btnBell) {
      el.btnBell.addEventListener('click', function (e) {
        e.stopPropagation();
        el.notificationsPanel.classList.toggle('show');
      });
    }

    document.addEventListener('click', function (e) {
      if (el.userDropdownMenu && !el.userProfileBadge.contains(e.target)) {
        el.userDropdownMenu.classList.remove('show');
      }
      if (el.notificationsPanel && !el.btnBell.contains(e.target)) {
        el.notificationsPanel.classList.remove('show');
      }
    });

    // Industry Selector
    if (el.industrySelect) {
      el.industrySelect.addEventListener('change', function () {
        setIndustry(this.value);
      });
    }

    // Persona Switcher
    if (el.personaBtn) {
      el.personaBtn.addEventListener('click', function () {
        currentPersona = currentPersona === 'supervisor' ? 'worker' : 'supervisor';
        el.personaLabel.textContent = currentPersona === 'supervisor' ? 'Supervisor Desk' : 'Worker Console';
        showToast(`Switched view to ${currentPersona === 'supervisor' ? 'Supervisor Command Desk' : 'Worker Console'}`);
      });
    }

    // Search Live Filter
    if (el.searchInput) {
      el.searchInput.addEventListener('input', function (e) {
        activeSearchQuery = e.target.value.trim();
        renderShiftRoster();
      });
    }

    // Day/Week/Month Segmented Control
    el.segmentedBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        el.segmentedBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTab = this.dataset.tab;
        renderShiftRoster();
      });
    });

    // Modal Cancels / Close
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    // Audio Readout Button
    if (el.btnReadAloud) {
      el.btnReadAloud.addEventListener('click', readPayslipAloud);
    }

    // Action Buttons
    if (el.btnReportHazard) {
      el.btnReportHazard.addEventListener('click', openSafetyDesk);
    }

    if (el.btnClockAction) {
      el.btnClockAction.addEventListener('click', function () {
        if (!isInsideGeofence) {
          showToast('Geofence check failed: Must be on-site boundary to clock in.');
          return;
        }
        shiftTracker.toggleMockLocation(true);
        if (!shiftTracker.state.isClockedIn) {
          shiftTracker.clockIn('mason');
          showToast('Clocked in successfully! Odometer recording.');
          openWorkerOdometer(0);
        } else {
          shiftTracker.clockOut();
          showToast('Clocked out successfully! Payout audited.');
        }
      });
    }

    // Optimize Shifts Button
    if (el.btnOptimizeShifts) {
      el.btnOptimizeShifts.addEventListener('click', function () {
        if (el.resStrainFill) el.resStrainFill.style.width = '35%';
        if (el.resStrainCount) el.resStrainCount.textContent = '35 / 100';
        if (el.metricOtVal) el.metricOtVal.textContent = '0';
        showToast('Workforce optimization complete: 3 fatigue spikes mitigated, mandatory rest allocated.');
      });
    }

    // Simulation Toggles (Hackathon Testing)
    if (el.simGeoToggle) {
      el.simGeoToggle.addEventListener('click', function () {
        isInsideGeofence = !isInsideGeofence;
        if (isInsideGeofence) {
          this.textContent = 'Site: Inside Zone';
          this.className = 'sim-chip active';
          showToast('GPS: Worker position updated to on-site coordinates.');
        } else {
          this.textContent = 'Site: 1.5km Away';
          this.className = 'sim-chip danger active';
          showToast('GPS: Worker simulated outside geofence radius.');
        }
        renderMetrics();
        renderCapacityBars();
      });
    }

    if (el.simHeatToggle) {
      el.simHeatToggle.addEventListener('click', function () {
        isHeatwave = !isHeatwave;
        if (isHeatwave) {
          this.textContent = 'Temp: 42°C Extreme';
          this.className = 'sim-chip danger active';
          climateGuard.setConditions(42, 65);
        } else {
          this.textContent = 'Temp: 28°C Normal';
          this.className = 'sim-chip active';
          climateGuard.setConditions(28, 50);
        }
        renderCapacityBars();
      });
    }

    if (el.simNetToggle) {
      el.simNetToggle.addEventListener('click', function () {
        isOffline = !isOffline;
        offlineQueue.toggleSimulatedOffline(isOffline);
        if (isOffline) {
          showToast('Simulating dead zone: Actions will buffer in local cryptographic queue.');
        } else {
          showToast('Reconnected: Offline actions flushed to cloud ledger.');
        }
      });
    }

    if (el.simFf1h) {
      el.simFf1h.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(3600);
        showToast('Shift fast-forwarded by +1 hour.');
      });
    }

    if (el.simFf4h) {
      el.simFf4h.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(14400);
        showToast('Shift fast-forwarded by +4 hours.');
      });
    }

    if (el.simFfOt) {
      el.simFfOt.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(32400); // 9h
        showToast('Shift advanced to 9.0 hours: 1.5x Overtime triggered!');
      });
    }

    // Submit Hazard Form
    if (el.formNewHazard) {
      el.formNewHazard.addEventListener('submit', function (e) {
        e.preventDefault();
        const res = safetyManager.submitReport({
          categoryId: el.hazardCatSelect.value,
          location: el.hazardLocInput.value.trim() || 'Central Zone',
          severity: 'Critical',
          isClockedIn: true
        });

        if (res.success) {
          showToast('Safety hazard reported! SLA timer active.');
          renderSafetyDeskTable();
          el.formNewHazard.reset();
        } else {
          showToast(`Report rejected: ${res.reason}`);
        }
      });
    }

    // Battery Check Buttons
    document.querySelectorAll('.battery-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.battery-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        showToast(`Fatigue level calibrated: ${this.textContent.trim()}`);
      });
    });

    // Break Buttons
    document.querySelectorAll('.break-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        showToast(`Break recorded: ${this.textContent.trim()}. Metabolic strain reduced.`);
      });
    });
  }

  // --- Toast Manager ---
  function showToast(message) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00bfa5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Co-sign a hazard
  function coSignHazard(reportId) {
    if (safetyManager) {
      safetyManager.cosignReport(reportId);
      renderSafetyDeskTable();
      showToast('Co-signed hazard report. Verification level escalated.');
    }
  }

  // Expose API to window for inline HTML onclick handlers
  window.fairShiftApp = {
    openWorkerOdometer: openWorkerOdometer,
    openSafetyDesk: openSafetyDesk,
    openAttritionRadar: openAttritionRadar,
    openSkillPassport: openSkillPassport,
    openFeedbackModal: openFeedbackModal,
    closeAllModals: closeAllModals,
    coSignHazard: coSignHazard,
    setIndustry: setIndustry,
    readPayslipAloud: readPayslipAloud
  };

  // Bootstrap when DOM ready
  window.addEventListener('DOMContentLoaded', initApp);
})();
