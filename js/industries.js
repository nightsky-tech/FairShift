/**
 * FairShift - Multi-Industry Configuration Presets
 * Supports 4 distinct sectors: Construction, Healthcare, Manufacturing, Education/Campus.
 * Configures roles, MET strain multipliers, site hazards, geofences, and safety rules.
 */

const INDUSTRY_PRESETS = {
  construction: {
    id: 'construction',
    name: 'Metro Line 4 - Underground Rail Project',
    sector: 'Construction & Civil Infrastructure',
    icon: '🏗️',
    location: {
      name: 'South Sector Site B, Pillar 104-128',
      lat: 13.0827,
      lng: 80.2707,
      radiusMeters: 250
    },
    roles: [
      { id: 'mason', title: 'Concrete Mason', baseRate: 95, strainMET: 1.7, shiftCap: 7, category: 'Heavy Manual' },
      { id: 'rigger', title: 'Scaffold Rigger', baseRate: 110, strainMET: 1.8, shiftCap: 6.5, category: 'High Elevation' },
      { id: 'electrician', title: 'Site Electrician', baseRate: 105, strainMET: 1.3, shiftCap: 8, category: 'Technical' },
      { id: 'crane_op', title: 'Tower Crane Operator', baseRate: 140, strainMET: 1.1, shiftCap: 9, category: 'Cognitive Sedentary' }
    ],
    hazards: [
      { id: 'fall_risk', label: 'Scaffolding / Fall Hazard', icon: '⚠️', severity: 'Critical', slaHours: 2 },
      { id: 'electrical', label: 'Exposed High-Voltage Cable', icon: '⚡', severity: 'Critical', slaHours: 1 },
      { id: 'heat_stress', label: 'Extreme Heat / Water Shortage', icon: '☀️', severity: 'Warning', slaHours: 4 },
      { id: 'crane_swing', label: 'Unsecured Load in Swing Radius', icon: '🏗️', severity: 'High', slaHours: 2 },
      { id: 'ppe_missing', label: 'Damaged Safety Harness / Boots', icon: '🦺', severity: 'Moderate', slaHours: 6 }
    ],
    rules: {
      heatIndexThreshold: 35,
      nightShiftMultiplier: 1.35,
      overtimeRateMultiplier: 1.5,
      mandatoryRestHours: 11,
      maxConsecutiveDays: 6
    }
  },

  healthcare: {
    id: 'healthcare',
    name: 'Apex City Multi-Specialty Hospital',
    sector: 'Hospitals & Healthcare Facilities',
    icon: '🏥',
    location: {
      name: 'Emergency & Acute Care Wing, Block C',
      lat: 13.0475,
      lng: 80.2090,
      radiusMeters: 180
    },
    roles: [
      { id: 'icu_nurse', title: 'ICU Staff Nurse', baseRate: 130, strainMET: 1.35, shiftCap: 8, category: 'High Vigilance' },
      { id: 'orderly', title: 'Ward Orderly / Stretcher Porter', baseRate: 85, strainMET: 1.6, shiftCap: 7.5, category: 'Heavy Manual' },
      { id: 'sanitation', title: 'Bio-Sanitation Technician', baseRate: 90, strainMET: 1.5, shiftCap: 7.5, category: 'Biohazard Exposed' },
      { id: 'lab_tech', title: 'Pathology Lab Assistant', baseRate: 100, strainMET: 1.15, shiftCap: 8.5, category: 'Precision' }
    ],
    hazards: [
      { id: 'sharps', label: 'Improperly Disposed Needle / Sharps', icon: '💉', severity: 'Critical', slaHours: 1 },
      { id: 'biohazard', label: 'Infectious Fluid Spill Unattended', icon: '☣️', severity: 'Critical', slaHours: 1 },
      { id: 'patient_violence', label: 'Aggressive Escort / Physical Risk', icon: '🚨', severity: 'High', slaHours: 1 },
      { id: 'chemical_fumes', label: 'Disinfectant Fume Concentration', icon: '🧪', severity: 'Moderate', slaHours: 4 },
      { id: 'slip_floor', label: 'Wet Sterilization Floor Slip Risk', icon: '⚠️', severity: 'Moderate', slaHours: 3 }
    ],
    rules: {
      heatIndexThreshold: 30,
      nightShiftMultiplier: 1.4,
      overtimeRateMultiplier: 1.5,
      mandatoryRestHours: 12,
      maxConsecutiveDays: 5
    }
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Precision Auto Works - Assembly Plant 3',
    sector: 'Automotive & Industrial Manufacturing',
    icon: '🏭',
    location: {
      name: 'Powertrain & Welding Line D',
      lat: 12.9815,
      lng: 80.0532,
      radiusMeters: 300
    },
    roles: [
      { id: 'assembler', title: 'Chassis Assembly Operator', baseRate: 100, strainMET: 1.45, shiftCap: 8, category: 'Repetitive Physical' },
      { id: 'welder', title: 'MIG/TIG Certified Welder', baseRate: 125, strainMET: 1.65, shiftCap: 7, category: 'Thermal Strain' },
      { id: 'forklift_op', title: 'Warehouse Forklift Driver', baseRate: 110, strainMET: 1.1, shiftCap: 8.5, category: 'Mobile Equipment' },
      { id: 'quality_insp', title: 'QC Line Inspector', baseRate: 105, strainMET: 1.2, shiftCap: 8.5, category: 'Visual Strain' }
    ],
    hazards: [
      { id: 'loto', label: 'Conveyor Guard Removed / LOTO Breach', icon: '⚙️', severity: 'Critical', slaHours: 1 },
      { id: 'toxic_fumes', label: 'Welding Exhaust Ventilation Failure', icon: '💨', severity: 'Critical', slaHours: 2 },
      { id: 'noise_level', label: 'Decibel Level Exceeding 92dB', icon: '🔊', severity: 'Moderate', slaHours: 8 },
      { id: 'pinch_point', label: 'Hydraulic Press Sensor Alignment', icon: '⚠️', severity: 'High', slaHours: 2 },
      { id: 'oil_leak', label: 'Cutting Fluid Leak on Walkway', icon: '🛢️', severity: 'Moderate', slaHours: 3 }
    ],
    rules: {
      heatIndexThreshold: 34,
      nightShiftMultiplier: 1.3,
      overtimeRateMultiplier: 1.5,
      mandatoryRestHours: 11,
      maxConsecutiveDays: 6
    }
  },

  education: {
    id: 'education',
    name: 'SRM University - Campus Facilities & Labs',
    sector: 'Colleges, Universities & Schools',
    icon: '🎓',
    location: {
      name: 'Bio-Engineering & Tech Park Zone',
      lat: 12.8231,
      lng: 80.0442,
      radiusMeters: 400
    },
    roles: [
      { id: 'lab_assistant', title: 'Chemistry Lab Technician', baseRate: 95, strainMET: 1.2, shiftCap: 8, category: 'Chemical Safety' },
      { id: 'campus_security', title: 'Night Patrol Security Guard', baseRate: 80, strainMET: 1.3, shiftCap: 8.5, category: 'Circadian Vigilance' },
      { id: 'facilities_janitor', title: 'Block Sanitarian / Housekeeper', baseRate: 75, strainMET: 1.5, shiftCap: 7.5, category: 'Physical Maintenance' },
      { id: 'grounds_gardener', title: 'Grounds & Landscaping Crew', baseRate: 75, strainMET: 1.6, shiftCap: 7, category: 'Outdoor Physical' }
    ],
    hazards: [
      { id: 'acid_spill', label: 'Chemical Reagent / Acid Container Leak', icon: '🧪', severity: 'Critical', slaHours: 1 },
      { id: 'broken_glass', label: 'Shattered Autoclave Vessel in Lab', icon: '💥', severity: 'High', slaHours: 2 },
      { id: 'dark_pathway', label: 'Perimeter Light Blackout on Night Walk', icon: '💡', severity: 'Moderate', slaHours: 4 },
      { id: 'stair_damage', label: 'Cracked Granite Step at Library Entrance', icon: '⚠️', severity: 'Moderate', slaHours: 12 },
      { id: 'trash_fire', label: 'Unattended Dry Leaf Smolder in Yard', icon: '🔥', severity: 'High', slaHours: 2 }
    ],
    rules: {
      heatIndexThreshold: 36,
      nightShiftMultiplier: 1.25,
      overtimeRateMultiplier: 1.5,
      mandatoryRestHours: 10,
      maxConsecutiveDays: 6
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INDUSTRY_PRESETS };
}
