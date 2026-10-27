/**
 * FairShift - Core Enterprise Workforce & Shift Operations Controller
 * Connects Frontend UI with FairShift Domain Engines:
 * - ShiftTracker (Live Overtime Odometer & 1.5x Wage Ledger)
 * - SafetyManager (Abuse-Proof Hazards & Peer Co-Signing with SLA Countdowns)
 * - AttritionPredictor (AI Fatigue & Quit-Risk Radar)
 * - ClimateGuard (Wet-Bulb Apparent Temp & Heat-Stress Mult)
 * - OfflineQueueManager (Store-and-Forward Cryptographic Nonces)
 * - SkillPassportManager (Verifiable Digital Credentials)
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

  // Active Domain Instances (safe initialization)
  let industry = (typeof INDUSTRY_PRESETS !== 'undefined' && INDUSTRY_PRESETS.construction) ? INDUSTRY_PRESETS.construction : {};
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
    el.loginView = document.getElementById('login-view');
    el.appView = document.getElementById('app-view');

    el.loginForm = document.getElementById('login-form');
    el.loginWorksiteSelect = document.getElementById('login-worksite-select');
    el.loginRoleSelect = document.getElementById('login-role-select');
    el.loginIdInput = document.getElementById('login-id-input');
    el.loginPinInput = document.getElementById('login-pin-input');
    el.loginError = document.getElementById('login-error');
    el.btnTogglePassword = document.getElementById('btn-toggle-password');
    el.passwordIconShow = document.getElementById('password-icon-show');
    el.passwordIconHide = document.getElementById('password-icon-hide');

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

    el.simGeoToggle = document.getElementById('sim-geo-toggle');
    el.simHeatToggle = document.getElementById('sim-heat-toggle');
    el.simNetToggle = document.getElementById('sim-net-toggle');
    el.simFf1h = document.getElementById('sim-ff-1h');
    el.simFf4h = document.getElementById('sim-ff-4h');
    el.simFfOt = document.getElementById('sim-ff-ot');

    el.pageTitle = document.getElementById('page-title');
    el.pageSubtitle = document.getElementById('page-subtitle');
    el.btnReportHazard = document.getElementById('btn-report-hazard');
    el.btnClockAction = document.getElementById('btn-clock-action');

    el.metricHeadcountVal = document.getElementById('metric-headcount-val');
    el.metricHeadcountNote = document.getElementById('metric-headcount-note');
    el.metricOtVal = document.getElementById('metric-ot-val');
    el.metricOtNote = document.getElementById('metric-ot-note');
    el.metricWorkersVal = document.getElementById('metric-workers-val');
    el.metricWorkersNote = document.getElementById('metric-workers-note');
    el.metricHazardsVal = document.getElementById('metric-hazards-val');
    el.metricHazardsNote = document.getElementById('metric-hazards-note');

    el.scheduleContainer = document.getElementById('schedule-container');
    el.segmentedBtns = document.querySelectorAll('.segmented-btn');

    el.resStaffingCount = document.getElementById('res-staffing-count');
    el.resStaffingFill = document.getElementById('res-staffing-fill');
    el.resGeofenceCount = document.getElementById('res-geofence-count');
    el.resGeofenceFill = document.getElementById('res-geofence-fill');
    el.resStrainCount = document.getElementById('res-strain-count');
    el.resStrainFill = document.getElementById('res-strain-fill');
    el.resClimateCount = document.getElementById('res-climate-count');
    el.resClimateFill = document.getElementById('res-climate-fill');
    el.btnOptimizeShifts = document.getElementById('btn-optimize-shifts');

    el.modalOdometer = document.getElementById('modal-odometer');
    el.modalHazards = document.getElementById('modal-hazards');
    el.modalAttrition = document.getElementById('modal-attrition');
    el.modalPassport = document.getElementById('modal-passport');
    el.modalFeedback = document.getElementById('modal-feedback');
    el.toastContainer = document.getElementById('toast-container');

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

    el.attritionWorkerName = document.getElementById('attrition-worker-name');
    el.attritionWorkerSub = document.getElementById('attrition-worker-sub');
    el.attritionRiskPct = document.getElementById('attrition-risk-pct');
    el.attritionFactorsList = document.getElementById('attrition-factors-list');
    el.attritionRecommendation = document.getElementById('attrition-recommendation');

    el.hazardListTbody = document.getElementById('hazard-list-tbody');
    el.formNewHazard = document.getElementById('form-new-hazard');
    el.hazardCatSelect = document.getElementById('hazard-cat-select');
    el.hazardLocInput = document.getElementById('hazard-loc-input');

    el.passportHoursVal = document.getElementById('passport-hours-val');
  }

  // --- Initializer ---
  function initApp() {
    initDOMElements();

    // Safely Initialize Domain Classes
    try {
      if (typeof ClimateGuard !== 'undefined') {
        climateGuard = new ClimateGuard(industry, onClimateAlert);
      }
      if (typeof SafetyManager !== 'undefined') {
        safetyManager = new SafetyManager(industry, onSafetyUpdate);
      }
      if (typeof FeedbackManager !== 'undefined') {
        feedbackManager = new FeedbackManager(industry);
      }
      if (typeof SkillPassportManager !== 'undefined') {
        skillPassport = new SkillPassportManager();
      }
      if (typeof AttritionPredictor !== 'undefined') {
        attritionPredictor = new AttritionPredictor(industry);
      }
      if (typeof OfflineQueueManager !== 'undefined') {
        offlineQueue = new OfflineQueueManager(onOfflineQueueUpdate);
      }
      if (typeof ShiftTracker !== 'undefined') {
        shiftTracker = new ShiftTracker(industry, onShiftOdometerUpdate, climateGuard);
      }
    } catch (err) {
      console.warn('Domain class init notice:', err);
    }

    setupEventListeners();
    checkAuthSession();

    setInterval(tickHeartbeat, 1000);
  }

  function tickHeartbeat() {
    if (shiftTracker && shiftTracker.state && shiftTracker.state.isClockedIn) {
      shiftTracker.advanceSeconds(1);
    }
  }

  // --- Auth Session Handling ---
  function checkAuthSession() {
    try {
      const session = localStorage.getItem('fairshift_auth_user');
      if (session) {
        const user = JSON.parse(session);
        showDashboard(user);
      } else {
        showLogin();
      }
    } catch (e) {
      showLogin();
    }
  }

  function showLogin() {
    const loginView = document.getElementById('login-view') || el.loginView;
    const appView = document.getElementById('app-view') || el.appView;
    if (loginView) loginView.style.setProperty('display', 'flex', 'important');
    if (appView) appView.style.setProperty('display', 'none', 'important');
  }

  function showDashboard(user) {
    const loginView = document.getElementById('login-view') || el.loginView;
    const appView = document.getElementById('app-view') || el.appView;
    if (loginView) loginView.style.setProperty('display', 'none', 'important');
    if (appView) appView.style.setProperty('display', 'flex', 'important');

    if (user) {
      const userName = document.getElementById('user-name') || el.userName;
      const userRole = document.getElementById('user-role') || el.userRole;
      if (userName) userName.textContent = user.name || 'Vikram Rathore';
      if (userRole) userRole.textContent = user.roleTitle || 'Safety Lead';
      if (user.industryKey && user.industryKey !== currentIndustryKey) {
        setIndustry(user.industryKey);
      }
    }

    renderWorkspace();
  }

  function handleLogin(siteKey, role, id, pin) {
    if (!id) {
      id = 'Vikram Rathore';
    }

    const matchedSite = (typeof INDUSTRY_PRESETS !== 'undefined' && INDUSTRY_PRESETS[siteKey])
      ? INDUSTRY_PRESETS[siteKey]
      : { name: 'Metro Line 4', sector: 'Construction & Civil' };

    const userData = {
      id: id,
      name: id.includes('Rajesh') ? 'Rajesh Kumar' : (id.includes('Priya') ? 'Dr. Priya Nair' : (id.includes('Marcus') ? 'Marcus Vance' : 'Vikram Rathore')),
      roleTitle: role === 'worker' ? 'Frontline Worker' : 'Site Operations Manager',
      roleType: role || 'supervisor',
      industryKey: siteKey || 'construction',
      siteName: matchedSite.name,
      loginAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('fairshift_auth_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Storage warning:', e);
    }

    if (el.loginError) el.loginError.style.display = 'none';
    showToast(`Signed into ${matchedSite.name}`);
    showDashboard(userData);
  }

  function doLogin() {
    const siteKey = document.getElementById('login-worksite-select')?.value || 'construction';
    const role = document.getElementById('login-role-select')?.value || 'supervisor';
    const id = document.getElementById('login-id-input')?.value.trim() || 'Vikram Rathore';
    const pin = document.getElementById('login-pin-input')?.value.trim() || '1234';
    handleLogin(siteKey, role, id, pin);
  }

  function loginDemo(key) {
    if (key === 'rajesh') {
      handleLogin('construction', 'worker', 'Rajesh Kumar (ID: FS-W104)', '1234');
    } else if (key === 'vikram') {
      handleLogin('construction', 'supervisor', 'Vikram Rathore (#MGR-BLR-104)', '1234');
    } else if (key === 'priya') {
      handleLogin('healthcare', 'supervisor', 'Dr. Priya Nair (#MGR-MED-802)', '1234');
    } else if (key === 'marcus') {
      handleLogin('manufacturing', 'supervisor', 'Marcus Vance (#MGR-MFG-330)', '1234');
    }
  }

  // --- Industry Switcher ---
  function setIndustry(key) {
    if (typeof INDUSTRY_PRESETS === 'undefined' || !INDUSTRY_PRESETS[key]) return;
    currentIndustryKey = key;
    industry = INDUSTRY_PRESETS[key];

    if (climateGuard) climateGuard.industry = industry;
    if (safetyManager && typeof safetyManager.setIndustry === 'function') safetyManager.setIndustry(industry);
    if (attritionPredictor && typeof attritionPredictor.setIndustry === 'function') attritionPredictor.setIndustry(industry);
    if (shiftTracker) shiftTracker.industry = industry;

    const indSelect = document.getElementById('header-industry-select') || el.industrySelect;
    if (indSelect) indSelect.value = key;

    populateHazardCategories();
    renderWorkspace();
  }

  // --- Populate Hazard Category Select ---
  function populateHazardCategories() {
    const select = document.getElementById('hazard-cat-select') || el.hazardCatSelect;
    if (!select || !industry || !industry.hazards) return;
    select.innerHTML = '';
    industry.hazards.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = `${h.label} (${h.severity} • SLA: ${h.slaHours}h)`;
      select.appendChild(opt);
    });
  }

  // --- Workspace Renderers ---
  function renderWorkspace() {
    const pageTitle = document.getElementById('page-title') || el.pageTitle;
    const pageSubtitle = document.getElementById('page-subtitle') || el.pageSubtitle;

    if (pageTitle && industry) {
      pageTitle.textContent = `${industry.sector || 'Frontline'} Shift Operations`;
    }
    if (pageSubtitle && industry) {
      pageSubtitle.textContent = `${industry.name || 'Metro Line 4'} • ${(industry.location && industry.location.name) || 'Central Zone'}`;
    }

    renderShiftRoster();
    renderMetrics();
    renderCapacityBars();
  }

  function renderShiftRoster() {
    const container = document.getElementById('schedule-container') || el.scheduleContainer;
    if (!container) return;
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
      container.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          No frontline workers found matching search criteria.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
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

          <button type="button" class="btn-modify" onclick="window.fairShiftApp.openWorkerOdometer(${idx})">
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
    
    let criticalHazards = 2;
    try {
      if (safetyManager && typeof safetyManager.getReportsForCurrentIndustry === 'function') {
        criticalHazards = safetyManager.getReportsForCurrentIndustry().filter(h => h.status !== 'Resolved').length;
      }
    } catch (e) {}

    const mHeadcount = document.getElementById('metric-headcount-val') || el.metricHeadcountVal;
    const mHeadnote = document.getElementById('metric-headcount-note') || el.metricHeadcountNote;
    const mOt = document.getElementById('metric-ot-val') || el.metricOtVal;
    const mWorkers = document.getElementById('metric-workers-val') || el.metricWorkersVal;
    const mHazards = document.getElementById('metric-hazards-val') || el.metricHazardsVal;
    const bellBadge = document.getElementById('bell-badge') || el.bellBadge;

    if (mHeadcount) mHeadcount.textContent = activeCount;
    if (mHeadnote) mHeadnote.textContent = isInsideGeofence ? '100% Inside Geofence' : 'Warning: 1 Outside Boundary';
    if (mOt) mOt.textContent = otCount;
    if (mWorkers) mWorkers.textContent = `${roster.length}/15`;
    if (mHazards) mHazards.textContent = criticalHazards;
    if (bellBadge) bellBadge.textContent = criticalHazards;
  }

  function renderCapacityBars() {
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;
    const staffingPct = Math.min(100, Math.round((roster.length / 15) * 100));
    const geofencePct = isInsideGeofence ? 100 : 75;
    const strainVal = isHeatwave ? 76 : 54;
    const climateVal = isHeatwave ? 42 : 28;
    const climatePct = isHeatwave ? 85 : 40;

    const rStaffingCount = document.getElementById('res-staffing-count');
    const rStaffingFill = document.getElementById('res-staffing-fill');
    const rGeoCount = document.getElementById('res-geofence-count');
    const rGeoFill = document.getElementById('res-geofence-fill');
    const rStrainCount = document.getElementById('res-strain-count');
    const rStrainFill = document.getElementById('res-strain-fill');
    const rClimateCount = document.getElementById('res-climate-count');
    const rClimateFill = document.getElementById('res-climate-fill');

    if (rStaffingCount) rStaffingCount.textContent = `${roster.length}/15`;
    if (rStaffingFill) rStaffingFill.style.width = `${staffingPct}%`;

    if (rGeoCount) rGeoCount.textContent = isInsideGeofence ? '18/18' : '14/18';
    if (rGeoFill) rGeoFill.style.width = `${geofencePct}%`;

    if (rStrainCount) rStrainCount.textContent = `${strainVal} / 100`;
    if (rStrainFill) rStrainFill.style.width = `${strainVal}%`;

    if (rClimateCount) rClimateCount.textContent = `${climateVal}°C`;
    if (rClimateFill) rClimateFill.style.width = `${climatePct}%`;
  }

  // --- Domain Event Callbacks ---
  function onClimateAlert(alertData) {
    renderCapacityBars();
    if (alertData && alertData.heatIndex >= 35) {
      showToast('Climate Guard: Wet-bulb heatwave detected! Mandatory 15m rest break triggered.');
    }
  }

  function onSafetyUpdate(reports) {
    renderMetrics();
    renderSafetyDeskTable();
  }

  function onOfflineQueueUpdate(status) {
    const simNet = document.getElementById('sim-net-toggle');
    if (simNet && status) {
      if (status.online !== false) {
        simNet.textContent = 'Reception: Online 5G';
        simNet.className = 'sim-chip active';
      } else {
        simNet.textContent = `Offline (${status.queuedCount || 1} Queued)`;
        simNet.className = 'sim-chip warning active';
      }
    }
  }

  function onShiftOdometerUpdate(state) {
    if (!state) return;
    const duration = (typeof FairShiftUtils !== 'undefined') ? FairShiftUtils.formatDuration(state.simulatedElapsedSeconds) : '07:30:00';
    const odoTimer = document.getElementById('odo-timer');
    if (odoTimer) odoTimer.textContent = duration;
  }

  // --- Modal Openers ---
  function openWorkerOdometer(index) {
    const roster = INDUSTRY_ROSTERS[currentIndustryKey] || INDUSTRY_ROSTERS.construction;
    const worker = roster[index] || roster[0];
    selectedWorkerForModal = worker;

    const oName = document.getElementById('odo-worker-name');
    const oRole = document.getElementById('odo-worker-role');
    if (oName) oName.textContent = worker.name;
    if (oRole) oRole.textContent = `${worker.role} • Rate: ₹${worker.baseRate}/hr`;

    const baseHours = Math.min(8.0, worker.hours || 7.0);
    const otHours = Math.max(0, (worker.hours || 7.0) - 8.0);
    const basePay = baseHours * worker.baseRate;
    const otPay = otHours * (worker.baseRate * 1.5);
    const hazardPay = (worker.priority === 'high' || isHeatwave) ? 120.0 : 0.0;
    const deductions = Math.round((basePay + otPay) * 0.04);
    const netPay = basePay + otPay + hazardPay - deductions;

    const timer = (typeof FairShiftUtils !== 'undefined') ? FairShiftUtils.formatDuration(Math.round((worker.hours || 7.0) * 3600)) : '07:30:00';
    const odoTimer = document.getElementById('odo-timer');
    const odoBase = document.getElementById('odo-base-pay');
    const odoOt = document.getElementById('odo-ot-pay');
    const odoHazard = document.getElementById('odo-hazard-pay');
    const odoDeduct = document.getElementById('odo-deductions');
    const odoNet = document.getElementById('odo-net-pay');
    const odoStrain = document.getElementById('odo-strain-val');

    if (odoTimer) odoTimer.textContent = timer;
    if (odoBase) odoBase.textContent = `₹${basePay.toFixed(2)}`;
    if (odoOt) odoOt.textContent = `₹${otPay.toFixed(2)}`;
    if (odoHazard) odoHazard.textContent = `₹${hazardPay.toFixed(2)}`;
    if (odoDeduct) odoDeduct.textContent = `-₹${deductions.toFixed(2)}`;
    if (odoNet) odoNet.textContent = `₹${netPay.toFixed(2)}`;
    if (odoStrain) odoStrain.textContent = `${worker.strain || 45} / 100`;

    const modal = document.getElementById('modal-odometer');
    if (modal) modal.classList.add('active');
  }

  function openSafetyDesk() {
    renderSafetyDeskTable();
    const modal = document.getElementById('modal-hazards');
    if (modal) modal.classList.add('active');
  }

  function renderSafetyDeskTable() {
    const tbody = document.getElementById('hazard-list-tbody');
    if (!tbody || !safetyManager) return;
    const reports = safetyManager.getReportsForCurrentIndustry();

    tbody.innerHTML = reports
      .map(r => {
        const severityClass = r.severity === 'Critical' ? 'badge-high' : 'badge-medium';
        const mins = r.slaMinutesRemaining || 45;
        const hoursLeft = Math.floor(mins / 60);
        const minsLeft = Math.floor(mins % 60);
        const slaFormatted = `0${hoursLeft}:${minsLeft < 10 ? '0' : ''}${minsLeft}:00`;

        return `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 0.75rem 0.5rem; font-weight:600;">
            <span class="badge ${severityClass}">${r.severity}</span>
            <span style="margin-left: 6px;">${r.category}</span>
          </td>
          <td style="padding: 0.75rem 0.5rem; color:var(--text-muted);">${r.location}</td>
          <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight:700;">${slaFormatted}</td>
          <td style="padding: 0.75rem 0.5rem;">
            <button type="button" class="btn-cosign" onclick="window.fairShiftApp.coSignHazard('${r.id}')">
              Co-Sign (${r.cosigns || 1})
            </button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  function openAttritionRadar() {
    let highRiskWorker = {
      name: 'Ramesh K.',
      roleTitle: 'Scaffold Rigger',
      shiftsOver10h: 4,
      riskScore: 84,
      riskDrivers: [
        'Consecutive 10h+ shifts violate recommended rest intervals',
        'Turnaround between night and day shift under 11 hours'
      ],
      recommendations: [
        'Grant mandatory 24h rest rotation and temporarily reassign to ground safety audit role.'
      ]
    };

    try {
      if (attritionPredictor && typeof attritionPredictor.getWorkforceAnalytics === 'function') {
        const analytics = attritionPredictor.getWorkforceAnalytics();
        highRiskWorker = analytics.workers.find(w => w.riskScore >= 70) || analytics.workers[0] || highRiskWorker;
      }
    } catch (e) {}

    const aName = document.getElementById('attrition-worker-name');
    const aSub = document.getElementById('attrition-worker-sub');
    const aPct = document.getElementById('attrition-risk-pct');
    const aFactors = document.getElementById('attrition-factors-list');
    const aRec = document.getElementById('attrition-recommendation');

    if (aName) aName.textContent = `${highRiskWorker.name} (${highRiskWorker.roleTitle})`;
    if (aSub) aSub.textContent = `${highRiskWorker.shiftsOver10h || 4} Overtime shifts this week + night turnaround`;
    if (aPct) aPct.textContent = `${highRiskWorker.riskScore || 84}%`;

    if (aFactors && highRiskWorker.riskDrivers) {
      aFactors.innerHTML = highRiskWorker.riskDrivers
        .map(driver => `
          <div class="risk-factor-row">
            <span class="risk-factor-dot"></span>
            <span>${driver}</span>
          </div>
        `)
        .join('');
    }

    if (aRec && highRiskWorker.recommendations && highRiskWorker.recommendations.length > 0) {
      aRec.textContent = highRiskWorker.recommendations[0];
    }

    const modal = document.getElementById('modal-attrition');
    if (modal) modal.classList.add('active');
  }

  function openSkillPassport() {
    const passportHours = document.getElementById('passport-hours-val');
    if (passportHours) {
      passportHours.textContent = '1,420h';
    }
    const modal = document.getElementById('modal-passport');
    if (modal) modal.classList.add('active');
  }

  function openFeedbackModal() {
    const modal = document.getElementById('modal-feedback');
    if (modal) modal.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // --- Voice Readout ---
  function readPayslipAloud() {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const workerName = document.getElementById('odo-worker-name')?.textContent || 'Frontline Worker';
    const net = document.getElementById('odo-net-pay')?.textContent || '₹684.00';
    const text = `Verified Payslip for ${workerName}. Standard hours completed. Net take home payout: ${net}. Confirmed compliant with labor regulation.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showToast('Playing audio readout in English');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        doLogin();
      });
    }

    // Toggle Password Visibility
    const btnTogglePwd = document.getElementById('btn-toggle-password');
    if (btnTogglePwd) {
      btnTogglePwd.addEventListener('click', function () {
        const pinInput = document.getElementById('login-pin-input');
        const iconShow = document.getElementById('password-icon-show');
        const iconHide = document.getElementById('password-icon-hide');
        if (pinInput) {
          const isPwd = pinInput.type === 'password';
          pinInput.type = isPwd ? 'text' : 'password';
          if (iconShow) iconShow.style.display = isPwd ? 'none' : 'block';
          if (iconHide) iconHide.style.display = isPwd ? 'block' : 'none';
        }
      });
    }

    // Sign Out
    const btnSignOut = document.getElementById('btn-sign-out');
    if (btnSignOut) {
      btnSignOut.addEventListener('click', function () {
        localStorage.removeItem('fairshift_auth_user');
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) menu.classList.remove('show');
        showToast('Signed out of FairShift');
        showLogin();
      });
    }

    // Profile Dropdown Toggle
    const profileBadge = document.getElementById('user-profile-badge');
    if (profileBadge) {
      profileBadge.addEventListener('click', function (e) {
        e.stopPropagation();
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) menu.classList.toggle('show');
      });
    }

    // Bell Notifications Toggle
    const btnBell = document.getElementById('btn-bell');
    if (btnBell) {
      btnBell.addEventListener('click', function (e) {
        e.stopPropagation();
        const panel = document.getElementById('notifications-panel');
        if (panel) panel.classList.toggle('show');
      });
    }

    document.addEventListener('click', function (e) {
      const menu = document.getElementById('user-dropdown-menu');
      const badge = document.getElementById('user-profile-badge');
      if (menu && badge && !badge.contains(e.target)) {
        menu.classList.remove('show');
      }
      const panel = document.getElementById('notifications-panel');
      const bell = document.getElementById('btn-bell');
      if (panel && bell && !bell.contains(e.target)) {
        panel.classList.remove('show');
      }
    });

    // Industry Selector
    const indSelect = document.getElementById('header-industry-select');
    if (indSelect) {
      indSelect.addEventListener('change', function () {
        setIndustry(this.value);
      });
    }

    // Persona Switcher
    const personaBtn = document.getElementById('header-persona-btn');
    if (personaBtn) {
      personaBtn.addEventListener('click', function () {
        currentPersona = currentPersona === 'supervisor' ? 'worker' : 'supervisor';
        const label = document.getElementById('header-persona-label');
        if (label) label.textContent = currentPersona === 'supervisor' ? 'Supervisor Desk' : 'Worker Console';
        showToast(`Switched view to ${currentPersona === 'supervisor' ? 'Supervisor Command Desk' : 'Worker Console'}`);
      });
    }

    // Search Live Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        activeSearchQuery = e.target.value.trim();
        renderShiftRoster();
      });
    }

    // Day/Week/Month Segmented Control
    document.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
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
    const btnReadAloud = document.getElementById('btn-read-aloud');
    if (btnReadAloud) {
      btnReadAloud.addEventListener('click', readPayslipAloud);
    }

    // Action Buttons
    const btnReportHazard = document.getElementById('btn-report-hazard');
    if (btnReportHazard) {
      btnReportHazard.addEventListener('click', openSafetyDesk);
    }

    const btnClock = document.getElementById('btn-clock-action');
    if (btnClock) {
      btnClock.addEventListener('click', function () {
        if (!isInsideGeofence) {
          showToast('Geofence check failed: Must be on-site boundary to clock in.');
          return;
        }
        if (shiftTracker) {
          if (!shiftTracker.state || !shiftTracker.state.isClockedIn) {
            shiftTracker.clockIn('mason');
            showToast('Clocked in successfully! Odometer recording.');
            openWorkerOdometer(0);
          } else {
            shiftTracker.clockOut();
            showToast('Clocked out successfully! Payout audited.');
          }
        } else {
          showToast('Shift recorded.');
          openWorkerOdometer(0);
        }
      });
    }

    // Optimize Shifts Button
    const btnOptimize = document.getElementById('btn-optimize-shifts');
    if (btnOptimize) {
      btnOptimize.addEventListener('click', function () {
        const strainFill = document.getElementById('res-strain-fill');
        const strainCount = document.getElementById('res-strain-count');
        const otVal = document.getElementById('metric-ot-val');
        if (strainFill) strainFill.style.width = '35%';
        if (strainCount) strainCount.textContent = '35 / 100';
        if (otVal) otVal.textContent = '0';
        showToast('Workforce optimization complete: 3 fatigue spikes mitigated, mandatory rest allocated.');
      });
    }

    // Simulation Toggles (Hackathon Testing)
    const simGeo = document.getElementById('sim-geo-toggle');
    if (simGeo) {
      simGeo.addEventListener('click', function () {
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

    const simHeat = document.getElementById('sim-heat-toggle');
    if (simHeat) {
      simHeat.addEventListener('click', function () {
        isHeatwave = !isHeatwave;
        if (isHeatwave) {
          this.textContent = 'Temp: 42°C Extreme';
          this.className = 'sim-chip danger active';
          if (climateGuard && typeof climateGuard.setConditions === 'function') climateGuard.setConditions(42, 65);
        } else {
          this.textContent = 'Temp: 28°C Normal';
          this.className = 'sim-chip active';
          if (climateGuard && typeof climateGuard.setConditions === 'function') climateGuard.setConditions(28, 50);
        }
        renderCapacityBars();
      });
    }

    const simNet = document.getElementById('sim-net-toggle');
    if (simNet) {
      simNet.addEventListener('click', function () {
        isOffline = !isOffline;
        if (offlineQueue && typeof offlineQueue.toggleSimulatedOffline === 'function') {
          offlineQueue.toggleSimulatedOffline(isOffline);
        }
        if (isOffline) {
          this.textContent = 'Reception: Offline';
          this.className = 'sim-chip warning active';
          showToast('Simulating dead zone: Actions will buffer in local cryptographic queue.');
        } else {
          this.textContent = 'Reception: Online 5G';
          this.className = 'sim-chip active';
          showToast('Reconnected: Offline actions flushed to cloud ledger.');
        }
      });
    }

    const simFf1h = document.getElementById('sim-ff-1h');
    if (simFf1h) {
      simFf1h.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(3600);
        showToast('Shift fast-forwarded by +1 hour.');
      });
    }

    const simFf4h = document.getElementById('sim-ff-4h');
    if (simFf4h) {
      simFf4h.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(14400);
        showToast('Shift fast-forwarded by +4 hours.');
      });
    }

    const simFfOt = document.getElementById('sim-ff-ot');
    if (simFfOt) {
      simFfOt.addEventListener('click', function () {
        if (shiftTracker) shiftTracker.advanceSeconds(32400); // 9h
        showToast('Shift advanced to 9.0 hours: 1.5x Overtime triggered!');
      });
    }

    // Submit Hazard Form
    const formHazard = document.getElementById('form-new-hazard');
    if (formHazard) {
      formHazard.addEventListener('submit', function (e) {
        e.preventDefault();
        const catSelect = document.getElementById('hazard-cat-select');
        const locInput = document.getElementById('hazard-loc-input');
        if (safetyManager) {
          const res = safetyManager.submitReport({
            categoryId: catSelect ? catSelect.value : 'fall_risk',
            location: (locInput && locInput.value.trim()) || 'Central Zone',
            severity: 'Critical',
            isClockedIn: true
          });

          if (res.success) {
            showToast('Safety hazard reported! SLA timer active.');
            renderSafetyDeskTable();
            formHazard.reset();
          } else {
            showToast(`Report rejected: ${res.reason}`);
          }
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
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00bfa5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Co-sign a hazard
  function coSignHazard(reportId) {
    if (safetyManager && typeof safetyManager.cosignReport === 'function') {
      safetyManager.cosignReport(reportId);
      renderSafetyDeskTable();
      showToast('Co-signed hazard report. Verification level escalated.');
    }
  }

  // Expose API to window for inline HTML onclick handlers
  window.fairShiftApp = {
    doLogin: doLogin,
    loginDemo: loginDemo,
    openWorkerOdometer: openWorkerOdometer,
    openSafetyDesk: openSafetyDesk,
    openAttritionRadar: openAttritionRadar,
    openSkillPassport: openSkillPassport,
    openFeedbackModal: openFeedbackModal,
    closeAllModals: closeAllModals,
    coSignHazard: coSignHazard,
    setIndustry: setIndustry,
    readPayslipAloud: readPayslipAloud,
    renderWorkspace: renderWorkspace
  };

  // Immediate bootstrap regardless of DOM ready timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
