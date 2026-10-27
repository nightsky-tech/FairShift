/**
 * FairShift - Abuse-Proof Safety Hazard Reporting & Peer Consensus Desk
 * Strictly isolates physical site hazards from manager reviews.
 * Includes peer "Co-Sign / Also Saw This" verification, SLA countdowns,
 * and voice-based hazard reporting for low-literacy workers.
 */

class SafetyManager {
  constructor(industry, onUpdate) {
    this.industry = industry;
    this.onUpdate = onUpdate || (() => {});
    this.storageKey = 'fairshift_safety_hazards';
    this.reports = this.loadReports();

    // Start SLA countdown ticker
    this.slaInterval = setInterval(() => {
      this.tickSLAs();
    }, 1000);
  }

  setIndustry(industry) {
    this.industry = industry;
    // If no reports for this industry yet, seed realistic starter reports
    if (!this.reports.some(r => r.industryId === industry.id)) {
      this.seedInitialReports();
    }
    this.onUpdate(this.getReportsForCurrentIndustry());
  }

  loadReports() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Safety storage load error:', e);
    }
    return this.getDefaultSeedReports();
  }

  saveReports() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
      }
    } catch (e) {
      console.warn('Safety storage save error:', e);
    }
    this.onUpdate(this.getReportsForCurrentIndustry());
  }

  seedInitialReports() {
    const seeds = this.getDefaultSeedReports();
    seeds.forEach(s => {
      if (!this.reports.some(r => r.id === s.id)) {
        this.reports.push(s);
      }
    });
    this.saveReports();
  }

  getDefaultSeedReports() {
    const now = Date.now();
    return [
      {
        id: 'HAZ-METRO-101',
        industryId: 'construction',
        category: 'Scaffolding / Fall Hazard',
        icon: '⚠️',
        severity: 'Critical',
        slaMinutesRemaining: 42,
        totalSlaMinutes: 120,
        location: 'Pier 114 - West Excavation Frame',
        description: 'Scaffold clamp missing at 4-meter working level. Platform wobbles during windy gusts.',
        voiceNote: true,
        reportedAt: new Date(now - 4680000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Under Inspection',
        assignedTo: 'R. Sharma (Safety Officer)',
        cosigns: 4,
        cosignedByMe: false,
        evidenceAttached: 'photo_mock_scaffold.jpg'
      },
      {
        id: 'HAZ-METRO-102',
        industryId: 'construction',
        category: 'Exposed High-Voltage Cable',
        icon: '⚡',
        severity: 'Critical',
        slaMinutesRemaining: 18,
        totalSlaMinutes: 60,
        location: 'Underground Tunnel Sump Pump Junction',
        description: 'Heavy vehicle ran over 415V armor cable. Insulation breached near standing water.',
        voiceNote: false,
        reportedAt: new Date(now - 2520000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Reported',
        assignedTo: 'Electrical Maintenance Lead',
        cosigns: 6,
        cosignedByMe: false,
        evidenceAttached: 'photo_mock_cable.jpg'
      },
      {
        id: 'HAZ-HOSP-201',
        industryId: 'healthcare',
        category: 'Improperly Disposed Needle / Sharps',
        icon: '💉',
        severity: 'Critical',
        slaMinutesRemaining: 35,
        totalSlaMinutes: 60,
        location: 'Emergency Trauma Bay 3 - Linen Hamper',
        description: 'Uncapped IV needle found tangled in soiled bedsheet during linen change.',
        voiceNote: true,
        reportedAt: new Date(now - 1500000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Under Inspection',
        assignedTo: 'Sister Anitha (Infection Control)',
        cosigns: 3,
        cosignedByMe: false,
        evidenceAttached: 'photo_mock_sharps.jpg'
      },
      {
        id: 'HAZ-AUTO-301',
        industryId: 'manufacturing',
        category: 'Conveyor Guard Removed / LOTO Breach',
        icon: '⚙️',
        severity: 'Critical',
        slaMinutesRemaining: 24,
        totalSlaMinutes: 60,
        location: 'Powertrain Transfer Conveyor 4',
        description: 'Mesh safety guard detached during shift handover; optical interlock disabled.',
        voiceNote: false,
        reportedAt: new Date(now - 2160000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Under Inspection',
        assignedTo: 'Maintenance Foreman',
        cosigns: 5,
        cosignedByMe: false,
        evidenceAttached: 'photo_mock_conveyor.jpg'
      },
      {
        id: 'HAZ-CAMPUS-401',
        industryId: 'education',
        category: 'Chemical Reagent / Acid Container Leak',
        icon: '🧪',
        severity: 'Critical',
        slaMinutesRemaining: 48,
        totalSlaMinutes: 60,
        location: 'Tech Park Biotech Lab 204 Fume Hood',
        description: 'Cracked concentrated nitric acid winchester bottle leaking inside lower cabinet.',
        voiceNote: true,
        reportedAt: new Date(now - 720000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Reported',
        assignedTo: 'Lab Safety Marshal',
        cosigns: 2,
        cosignedByMe: false,
        evidenceAttached: 'photo_mock_acid.jpg'
      }
    ];
  }

  getReportsForCurrentIndustry() {
    return this.reports.filter(r => r.industryId === this.industry.id);
  }

  submitReport({ categoryId, severity, location, description, voiceNote = false, isClockedIn = true }) {
    // Abuse & spam protection check: Worker must be clocked in or near zone
    if (!isClockedIn) {
      return {
        success: false,
        reason: 'NOT_ON_SITE',
        message: 'To prevent remote spam, safety hazard reports require worker clock-in verification within the site zone.'
      };
    }

    const hazardPreset = this.industry.hazards.find(h => h.id === categoryId) || this.industry.hazards[0];
    const totalSla = (hazardPreset.slaHours || 2) * 60;

    const newReport = {
      id: 'HAZ-' + Date.now().toString(36).toUpperCase(),
      industryId: this.industry.id,
      category: hazardPreset.label,
      icon: hazardPreset.icon,
      severity: severity || hazardPreset.severity || 'Critical',
      slaMinutesRemaining: totalSla,
      totalSlaMinutes: totalSla,
      location: location || `${this.industry.location.name} - Zone A`,
      description: description || 'Voice-recorded safety alert from frontline worker.',
      voiceNote: Boolean(voiceNote),
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Reported',
      assignedTo: 'Site Safety Supervisor',
      cosigns: 1, // Self verified
      cosignedByMe: true,
      evidenceAttached: 'photo_verified_geotag.jpg'
    };

    this.reports.unshift(newReport);
    this.saveReports();

    return {
      success: true,
      report: newReport,
      message: 'Safety hazard report logged. Priority SLA clock started!'
    };
  }

  /**
   * Peer Consensus ("Co-Sign / Also Saw This")
   * Multi-worker confirmation prevents frivolous complaints and elevates real emergencies
   */
  cosignReport(reportId) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;

    if (report.cosignedByMe) {
      // Toggle off
      report.cosigns = Math.max(1, report.cosigns - 1);
      report.cosignedByMe = false;
    } else {
      report.cosigns += 1;
      report.cosignedByMe = true;
      // High peer confirmation automatically escalates status to Under Inspection
      if (report.cosigns >= 3 && report.status === 'Reported') {
        report.status = 'Under Inspection';
      }
    }

    this.saveReports();
    return true;
  }

  /**
   * Employer/Supervisor Actions
   */
  updateStatus(reportId, newStatus, resolutionProof = '') {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;

    report.status = newStatus;
    if (newStatus === 'Resolved & Safe') {
      report.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      report.resolutionProof = resolutionProof || 'Verified by Safety Marshal on-site inspection.';
      report.slaMinutesRemaining = 0;
    }

    this.saveReports();
    return true;
  }

  tickSLAs() {
    let updated = false;
    this.reports.forEach(r => {
      if (r.status !== 'Resolved & Safe' && r.slaMinutesRemaining > 0) {
        // decrement slightly for visual realism in demo, keeping 1 decimal place max
        r.slaMinutesRemaining = Math.max(0, Math.round((r.slaMinutesRemaining - 0.05) * 10) / 10);
        updated = true;
      }
    });
    if (updated) {
      this.onUpdate(this.getReportsForCurrentIndustry());
    }
  }
}

const globalScopeSafety = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
globalScopeSafety.SafetyManager = SafetyManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SafetyManager };
}

