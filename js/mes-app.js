/**
 * MES Platform - Production Planning & Control Interactive Engine
 * Handles Authentication, Schedule Management, Resource Optimization, and Modals
 * Strict Rule: No Emojis, Pure SVG Icons, Zero Extra Fluff
 */

(function () {
  'use strict';

  // --- Initial Data ---
  const INITIAL_SCHEDULE = [
    {
      id: 'J-2847',
      timeSlot: '08:00 - 10:00',
      priority: 'high',
      status: 'in-progress',
      machine: 'CNC-01',
      period: 'today'
    },
    {
      id: 'J-2849',
      timeSlot: '08:00 - 12:00',
      priority: 'medium',
      status: 'in-progress',
      machine: 'CNC-02',
      period: 'today'
    },
    {
      id: 'J-2851',
      timeSlot: '10:00 - 14:00',
      priority: 'high',
      status: 'scheduled',
      machine: 'CNC-01',
      period: 'today'
    },
    {
      id: 'J-2851',
      timeSlot: '12:00 - 16:00',
      priority: 'medium',
      status: 'scheduled',
      machine: 'MILL-01',
      period: 'today'
    },
    {
      id: 'J-2851',
      timeSlot: '10:00 - 14:00',
      priority: 'low',
      status: 'scheduled',
      machine: 'CNC-01',
      period: 'today'
    }
  ];

  let scheduleData = JSON.parse(localStorage.getItem('mes_schedule_data')) || [...INITIAL_SCHEDULE];
  let activeTab = 'week';
  let activeSearchQuery = '';
  let editingJobIndex = null;
  let conflictsCount = 3;

  // --- DOM Elements ---
  const el = {
    loginView: document.getElementById('login-view'),
    appView: document.getElementById('app-view'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginRole: document.getElementById('login-role'),
    loginError: document.getElementById('login-error'),
    btnTogglePassword: document.getElementById('btn-toggle-password'),
    passwordIconShow: document.getElementById('password-icon-show'),
    passwordIconHide: document.getElementById('password-icon-hide'),
    btnDemoPlanner: document.getElementById('btn-demo-planner'),
    btnDemoSupervisor: document.getElementById('btn-demo-supervisor'),

    // Top Header & Profile
    userProfileBadge: document.getElementById('user-profile-badge'),
    userDropdownMenu: document.getElementById('user-dropdown-menu'),
    btnSignOut: document.getElementById('btn-sign-out'),
    userDisplayRole: document.getElementById('user-display-role'),
    btnBell: document.getElementById('btn-bell'),
    notificationsPanel: document.getElementById('notifications-panel'),

    // Search & Tabs
    searchInput: document.getElementById('search-input'),
    segmentedBtns: document.querySelectorAll('.segmented-btn'),
    scheduleContainer: document.getElementById('schedule-container'),

    // Modals
    modalSchedule: document.getElementById('modal-schedule'),
    modalModify: document.getElementById('modal-modify'),
    modalCalendar: document.getElementById('modal-calendar'),
    btnOpenScheduleModal: document.getElementById('btn-open-schedule-modal'),
    btnOpenCalendarModal: document.getElementById('btn-open-calendar-modal'),
    scheduleForm: document.getElementById('schedule-form'),
    modifyForm: document.getElementById('modify-form'),
    btnDeleteJob: document.getElementById('btn-delete-job'),

    // Metrics & Optimize
    metricConflictsVal: document.getElementById('metric-conflicts-val'),
    metricConflictsNote: document.getElementById('metric-conflicts-note'),
    btnOptimizeSchedule: document.getElementById('btn-optimize-schedule'),
    resourceCncFill1: document.getElementById('resource-cnc-fill-1'),
    resourceCncFill2: document.getElementById('resource-cnc-fill-2'),
    resourceLatheFill: document.getElementById('resource-lathe-fill'),
    resourceOperatorFill: document.getElementById('resource-operator-fill'),

    toastContainer: document.getElementById('toast-container')
  };

  // --- Auth State Management ---
  function checkAuthState() {
    const authUser = localStorage.getItem('mes_auth_user');
    if (authUser) {
      showDashboard(JSON.parse(authUser));
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
    if (user && user.role) {
      if (el.userDisplayRole) el.userDisplayRole.textContent = user.role;
    }
    renderSchedule();
  }

  function handleLogin(email, password, role) {
    if (!email || !password) {
      showLoginError('Please enter valid credentials');
      return;
    }

    const userData = {
      email: email,
      role: role || 'Production Planner',
      name: 'Alex Hales',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('mes_auth_user', JSON.stringify(userData));
    el.loginError.style.display = 'none';
    showToast('Signed in successfully');
    showDashboard(userData);
  }

  function showLoginError(msg) {
    el.loginError.textContent = msg;
    el.loginError.style.display = 'block';
  }

  // --- Render Schedule Cards ---
  function renderSchedule() {
    let filtered = scheduleData.filter(item => {
      const q = activeSearchQuery.toLowerCase();
      const matchSearch =
        item.id.toLowerCase().includes(q) ||
        item.machine.toLowerCase().includes(q) ||
        item.priority.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.timeSlot.toLowerCase().includes(q);
      return matchSearch;
    });

    if (filtered.length === 0) {
      el.scheduleContainer.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          No scheduled jobs found matching criteria.
        </div>
      `;
      return;
    }

    el.scheduleContainer.innerHTML = filtered
      .map((item, index) => {
        const priorityClass = `badge-${item.priority.toLowerCase()}`;
        const statusClass = `badge-${item.status.toLowerCase().replace(' ', '-')}`;

        return `
        <div class="schedule-item" data-id="${item.id}" data-index="${index}">
          <div class="time-slot-box">
            <span class="time-slot-label">Time Slot</span>
            <span class="time-slot-val">${item.timeSlot}</span>
          </div>

          <div class="job-details-col">
            <div class="job-id-tags-row">
              <span class="job-id-text">${item.id}</span>
              <span class="badge ${priorityClass}">${item.priority}</span>
              <span class="badge ${statusClass}">${item.status}</span>
            </div>
            <span class="machine-info-text">Machine: ${item.machine}</span>
          </div>

          <button class="btn-modify" onclick="window.mesApp.openModifyModal(${index})">
            Modify
          </button>
        </div>
      `;
      })
      .join('');
  }

  // --- Toast Notifications ---
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
    }, 3000);
  }

  // --- Schedule Optimization ---
  function optimizeSchedule() {
    conflictsCount = 0;
    el.metricConflictsVal.textContent = '0';
    el.metricConflictsNote.textContent = 'All cleared';
    el.metricConflictsNote.className = 'metric-note positive';

    // Animate progress bars to optimal capacity
    if (el.resourceCncFill1) el.resourceCncFill1.style.width = '82%';
    if (el.resourceCncFill2) el.resourceCncFill2.style.width = '45%';
    if (el.resourceLatheFill) el.resourceLatheFill.style.width = '65%';
    if (el.resourceOperatorFill) el.resourceOperatorFill.style.width = '90%';

    showToast('Schedule optimized: 3 machine conflicts resolved');
  }

  // --- Modal Controllers ---
  function openScheduleModal() {
    el.modalSchedule.classList.add('active');
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    editingJobIndex = null;
  }

  function openModifyModal(index) {
    editingJobIndex = index;
    const job = scheduleData[index];
    if (!job) return;

    document.getElementById('modify-job-id').value = job.id;
    document.getElementById('modify-time-slot').value = job.timeSlot;
    document.getElementById('modify-priority').value = job.priority;
    document.getElementById('modify-status').value = job.status;
    document.getElementById('modify-machine').value = job.machine;

    el.modalModify.classList.add('active');
  }

  function openCalendarModal() {
    el.modalCalendar.classList.add('active');
  }

  // --- Event Listeners ---
  function initEventListeners() {
    // Login form submit
    el.loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleLogin(el.loginEmail.value.trim(), el.loginPassword.value.trim(), el.loginRole.value);
    });

    // Password toggle
    el.btnTogglePassword.addEventListener('click', function () {
      const isPassword = el.loginPassword.type === 'password';
      el.loginPassword.type = isPassword ? 'text' : 'password';
      el.passwordIconShow.style.display = isPassword ? 'none' : 'block';
      el.passwordIconHide.style.display = isPassword ? 'block' : 'none';
    });

    // Demo Logins
    el.btnDemoPlanner.addEventListener('click', function () {
      el.loginEmail.value = 'alex.hales@naasmes.com';
      el.loginPassword.value = 'DemoPlanner2026';
      el.loginRole.value = 'Production Planner';
      handleLogin('alex.hales@naasmes.com', 'DemoPlanner2026', 'Production Planner');
    });

    el.btnDemoSupervisor.addEventListener('click', function () {
      el.loginEmail.value = 'sarah.jenkins@naasmes.com';
      el.loginPassword.value = 'SupervisorPass2026';
      el.loginRole.value = 'Shift Supervisor';
      handleLogin('sarah.jenkins@naasmes.com', 'SupervisorPass2026', 'Shift Supervisor');
    });

    // Profile menu toggle
    el.userProfileBadge.addEventListener('click', function (e) {
      e.stopPropagation();
      el.userDropdownMenu.classList.toggle('show');
    });

    // Sign out
    el.btnSignOut.addEventListener('click', function () {
      localStorage.removeItem('mes_auth_user');
      el.userDropdownMenu.classList.remove('show');
      showToast('Signed out');
      showLogin();
    });

    // Notification bell toggle
    el.btnBell.addEventListener('click', function (e) {
      e.stopPropagation();
      el.notificationsPanel.classList.toggle('show');
    });

    // Global click to close popups
    document.addEventListener('click', function (e) {
      if (el.userDropdownMenu && !el.userProfileBadge.contains(e.target)) {
        el.userDropdownMenu.classList.remove('show');
      }
      if (el.notificationsPanel && !el.btnBell.contains(e.target)) {
        el.notificationsPanel.classList.remove('show');
      }
    });

    // Search input
    el.searchInput.addEventListener('input', function (e) {
      activeSearchQuery = e.target.value.trim();
      renderSchedule();
    });

    // Day / Week / Month tab toggles
    el.segmentedBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        el.segmentedBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTab = this.dataset.tab;
        renderSchedule();
      });
    });

    // Modal Triggers
    el.btnOpenScheduleModal.addEventListener('click', openScheduleModal);
    el.btnOpenCalendarModal.addEventListener('click', openCalendarModal);

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });

    // Add Job Form Submit
    el.scheduleForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const newJob = {
        id: document.getElementById('new-job-id').value.trim() || `J-${Math.floor(1000 + Math.random() * 9000)}`,
        timeSlot: document.getElementById('new-time-slot').value.trim(),
        priority: document.getElementById('new-priority').value,
        status: document.getElementById('new-status').value,
        machine: document.getElementById('new-machine').value,
        period: 'today'
      };

      scheduleData.unshift(newJob);
      localStorage.setItem('mes_schedule_data', JSON.stringify(scheduleData));
      renderSchedule();
      closeModals();
      el.scheduleForm.reset();
      showToast(`Scheduled Job ${newJob.id} added`);
    });

    // Modify Job Form Submit
    el.modifyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (editingJobIndex === null || !scheduleData[editingJobIndex]) return;

      scheduleData[editingJobIndex].id = document.getElementById('modify-job-id').value.trim();
      scheduleData[editingJobIndex].timeSlot = document.getElementById('modify-time-slot').value.trim();
      scheduleData[editingJobIndex].priority = document.getElementById('modify-priority').value;
      scheduleData[editingJobIndex].status = document.getElementById('modify-status').value;
      scheduleData[editingJobIndex].machine = document.getElementById('modify-machine').value;

      localStorage.setItem('mes_schedule_data', JSON.stringify(scheduleData));
      renderSchedule();
      closeModals();
      showToast('Job details updated');
    });

    // Delete Job
    el.btnDeleteJob.addEventListener('click', function () {
      if (editingJobIndex === null) return;
      const removed = scheduleData.splice(editingJobIndex, 1);
      localStorage.setItem('mes_schedule_data', JSON.stringify(scheduleData));
      renderSchedule();
      closeModals();
      showToast(`Job ${removed[0].id} deleted`);
    });

    // Optimize Schedule
    el.btnOptimizeSchedule.addEventListener('click', optimizeSchedule);
  }

  // Expose to window for inline onclick handler
  window.mesApp = {
    openModifyModal: openModifyModal,
    openScheduleModal: openScheduleModal,
    openCalendarModal: openCalendarModal,
    closeModals: closeModals,
    optimizeSchedule: optimizeSchedule
  };

  // --- Bootstrap ---
  window.addEventListener('DOMContentLoaded', function () {
    initEventListeners();
    checkAuthState();
  });
})();
