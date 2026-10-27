/**
 * FairShift - Digital Skill Passport Engine (UN SDG 8)
 * Portable, tamper-evident career credentials, verified shift hours,
 * safety certifications, and peer endorsements that travel with the worker.
 */

class SkillPassportManager {
  constructor(workerId = 'WRK-TN-2026-881') {
    this.storageKey = 'fairshift_skill_passport';
    this.workerId = workerId;
    this.passport = this.loadPassport();
  }

  loadPassport() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Passport storage read error:', e);
    }
    return this.getDefaultPassport();
  }

  savePassport() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.passport));
      }
    } catch (e) {
      console.warn('Passport storage save error:', e);
    }
  }

  getDefaultPassport() {
    return {
      workerId: this.workerId,
      workerName: 'Krithin Parthiban',
      nationalIdMasked: 'XXXX-XXXX-9482',
      primaryTrade: 'Master Rigger & Concrete Structural Mason',
      careerVerifiedHours: 1480,
      safetyRating: 98.6,
      zeroAccidentDays: 342,
      digitalBadgeHash: 'SDG8-LEDGER-9F83A20B71',
      issuingAuthority: 'FairShift Global Workforce Protocol (SDG 8 Certified)',
      certifications: [
        {
          id: 'CERT-FALL-2025',
          title: 'Working at Heights & Scaffold Fall Arrest Protocol',
          issuer: 'National Safety Council (NSC)',
          issueDate: 'Jan 2025',
          expiryDate: 'Jan 2028',
          verified: true,
          icon: '🦺'
        },
        {
          id: 'CERT-OSHA-30',
          title: 'OSHA 30-Hour Construction Safety & Hazard Recognition',
          issuer: 'Occupational Safety Directorate',
          issueDate: 'May 2024',
          expiryDate: 'Lifetime',
          verified: true,
          icon: '🛡️'
        },
        {
          id: 'CERT-FIRSTAID-01',
          title: 'Emergency Trauma & Heat Stroke First-Responder',
          issuer: 'Red Cross First Aid Society',
          issueDate: 'Nov 2025',
          expiryDate: 'Nov 2027',
          verified: true,
          icon: '🩹'
        },
        {
          id: 'CERT-LOTO-02',
          title: 'Lockout/Tagout (LOTO) Energy Isolation Certified',
          issuer: 'Industrial Safety Board',
          issueDate: 'Aug 2025',
          expiryDate: 'Aug 2027',
          verified: true,
          icon: '🔒'
        }
      ],
      employmentHistory: [
        {
          employer: 'Metro Rail Infrastructure Ltd',
          sector: 'Construction',
          role: 'Scaffold Rigger Lead',
          duration: '14 Months (940 Verified Hours)',
          rating: 4.9,
          verified: true
        },
        {
          employer: 'Apex Multi-Specialty Hospital',
          sector: 'Healthcare Logistics',
          role: 'Acute Facility Logistics Porter',
          duration: '8 Months (540 Verified Hours)',
          rating: 4.8,
          verified: true
        }
      ],
      peerEndorsements: [
        { from: 'Site Lead Engineer', text: 'Meticulous attention to safety harness tie-offs under high-wind conditions.' },
        { from: 'Safety Inspector', text: 'Proactively flagged frayed hoisting sling before a lift occurred.' }
      ]
    };
  }

  addVerifiedHours(hours) {
    if (hours > 0) {
      this.passport.careerVerifiedHours += Math.round(hours * 10) / 10;
      this.savePassport();
    }
    return this.passport.careerVerifiedHours;
  }

  getVerificationPayload() {
    return {
      workerId: this.passport.workerId,
      workerName: this.passport.workerName,
      totalHours: this.passport.careerVerifiedHours,
      certCount: this.passport.certifications.length,
      safetyScore: this.passport.safetyRating,
      hash: this.passport.digitalBadgeHash,
      sdgTarget: 'SDG 8.8: Protect Labour Rights & Promote Safe Working Environments'
    };
  }
}

const globalScopePassport = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
globalScopePassport.SkillPassportManager = SkillPassportManager;
globalScopePassport.SkillPassport = SkillPassportManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SkillPassportManager, SkillPassport: SkillPassportManager };
}

