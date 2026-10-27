/**
 * FairShift - Dynamic Climate & Heat-Stress Guard (Wet-Bulb Trigger)
 * Protects frontline outdoor workers against heat-stroke and thermal exhaustion.
 * Calculates Wet-Bulb Heat Index and automatically injects mandatory paid 15-minute
 * shaded hydration breaks with multilingual voice broadcasts.
 */

const HEAT_ALERTS_I18N = {
  en: 'High Heat Alert: Ambient conditions have exceeded safe thermal limits. A mandatory paid 15-minute shaded hydration break is now active. Please drink water immediately.',
  hi: 'अत्यधिक गर्मी चेतावनी: तापमान सुरक्षित सीमा से अधिक हो गया है। 15 मिनट का सवेतन छाया विश्राम व जलपान अवकाश सक्रिय है। तुरंत पानी पिएं।',
  ta: 'கடும் வெப்ப எச்சரிக்கை: வெப்பநிலை பாதுகாப்பான வரம்பை மீறியுள்ளது. கட்டாய 15 நிமிட நிழல் ஓய்வு மற்றும் குடிநீர் இடைவேளை இப்போது தொடங்குகிறது.',
  te: 'అత్యధిక ఉష్ణోగ్రత హెచ్చరిక: వాతావరణం వేడిగా ఉంది. తప్పనిసరి 15 నిమిషాల నీడ విశ్రాంతి మరియు తాగునీటి విరామం ప్రారంభమైంది.',
  bn: 'চরম তাপ সতর্কতা: তাপমাত্রা বিপজ্জনক সীমা অতিক্রম করেছে। বাধ্যতামূলক ১৫ মিনিটের ছায়া বিশ্রাম ও পানীয় জলের বিরতি শুরু হয়েছে।',
  es: 'Alerta de Calor Extremo: Condiciones térmicas peligrosas. Se activa pausa pagada obligatoria de 15 minutos en sombra e hidratación inmediata.'
};

class ClimateGuard {
  constructor(industry, onAlertTriggered) {
    this.industry = industry;
    this.onAlertTriggered = onAlertTriggered || (() => {});
    
    // Live / Simulated weather state
    this.currentTemp = 31; // Celsius
    this.currentHumidity = 55; // Relative humidity %
    this.wetBulbThreshold = (industry && industry.rules && industry.rules.heatIndexThreshold) || 35;
    
    this.isHeatStressActive = false;
    this.lastBreakInjectedAt = null;
  }

  setIndustry(industry) {
    this.industry = industry;
    this.wetBulbThreshold = (industry && industry.rules && industry.rules.heatIndexThreshold) || 35;
    this.evaluateThermalStress();
  }

  /**
   * Simplified Steadman / Rothfusz Heat Index Formula
   */
  calculateHeatIndex(tempC, humidityPct) {
    const tempF = (tempC * 9/5) + 32;
    const hiF = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidityPct * 0.094));
    
    let indexF = hiF;
    if (hiF >= 80) {
      indexF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidityPct
        - 0.22475541 * tempF * humidityPct - 0.00683783 * tempF * tempF
        - 0.05481717 * humidityPct * humidityPct + 0.00122874 * tempF * tempF * humidityPct
        + 0.00085282 * tempF * humidityPct * humidityPct - 0.00000199 * tempF * tempF * humidityPct * humidityPct;
    }
    
    const heatIndexC = Math.round(((indexF - 32) * 5/9) * 10) / 10;
    return heatIndexC;
  }

  /**
   * Evaluates current thermal conditions
   */
  evaluateThermalStress() {
    const heatIndex = this.calculateHeatIndex(this.currentTemp, this.currentHumidity);
    const wasActive = this.isHeatStressActive;

    if (heatIndex >= this.wetBulbThreshold) {
      this.isHeatStressActive = true;
      if (!wasActive) {
        this.lastBreakInjectedAt = new Date().toISOString();
        this.triggerBroadcastAlert(heatIndex);
      }
    } else {
      this.isHeatStressActive = false;
    }

    return {
      tempC: this.currentTemp,
      humidityPct: this.currentHumidity,
      heatIndexC: heatIndex,
      threshold: this.wetBulbThreshold,
      isHeatStressActive: this.isHeatStressActive,
      fatigueStrainMultiplier: this.isHeatStressActive ? 1.4 : 1.0,
      mandatoryRestMinutes: this.isHeatStressActive ? 15 : 0
    };
  }

  setConditions(tempC, humidityPct) {
    this.currentTemp = tempC;
    this.currentHumidity = humidityPct;
    return this.evaluateThermalStress();
  }

  triggerBroadcastAlert(heatIndex) {
    const alertData = {
      heatIndexC: heatIndex,
      tempC: this.currentTemp,
      mandatoryRestMinutes: 15,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      broadcasts: HEAT_ALERTS_I18N
    };

    if (typeof this.onAlertTriggered === 'function') {
      this.onAlertTriggered(alertData);
    }

    return alertData;
  }

  getVoiceBroadcast(lang = 'en') {
    return HEAT_ALERTS_I18N[lang] || HEAT_ALERTS_I18N.en;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClimateGuard, HEAT_ALERTS_I18N };
}
