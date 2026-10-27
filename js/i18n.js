/**
 * FairShift - Internationalization & Speech Engine
 * Multilingual accessibility: English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Spanish (Español).
 * Web Speech API TTS & Speech Recognition with fallback chimes and visual cues.
 */

const I18N_LANGUAGES = {
  en: { label: 'English', native: 'English', voiceCode: 'en-US' },
  hi: { label: 'Hindi', native: 'हिंदी', voiceCode: 'hi-IN' },
  ta: { label: 'Tamil', native: 'தமிழ்', voiceCode: 'ta-IN' },
  te: { label: 'Telugu', native: 'తెలుగు', voiceCode: 'te-IN' },
  bn: { label: 'Bengali', native: 'বাংলা', voiceCode: 'bn-IN' },
  es: { label: 'Spanish', native: 'Español', voiceCode: 'es-ES' }
};

const TRANSLATIONS = {
  en: {
    appTitle: 'FairShift',
    appTagline: 'Decent Work & Transparent Shifts',
    workerMode: 'Worker Interface',
    adminMode: 'Employer Dashboard',
    industrySwitch: 'Industry Preset',
    language: 'Language',
    listenPage: '🔊 Read Aloud',
    listening: '🔊 Reading...',
    stopAudio: '⏹️ Stop Audio',
    
    // Shift Tracking
    shiftStatus: 'Today\'s Shift Tracker',
    notClockedIn: 'Not Clocked In',
    clockedIn: 'Shift Active',
    clockInBtn: '📍 1-Tap Clock In',
    clockOutBtn: '🛑 Clock Out Shift',
    takeBreakBtn: '☕ Take 15m Break',
    onBreak: 'On Break (Downtime Logged)',
    resumeWork: '▶️ Resume Work',
    geofenceOk: 'GPS Verified: Inside Works Zone',
    geofenceOut: 'GPS Warning: Outside Geofence Boundary',
    simLocation: 'Mock Site GPS',
    simInside: '✅ Inside Site Zone',
    simOutside: '⚠️ 1.5km Away (Outside)',
    qrCheckin: '📷 Scan Site QR',
    hoursLogged: 'Hours Logged',
    standardHours: 'Standard (8h Max)',
    overtimeHours: 'Overtime (1.5x Rate)',
    fatigueRisk: 'Fatigue Risk Level',
    fatigueSafe: 'Safe Strain',
    fatigueModerate: 'Elevated Strain',
    fatigueHigh: 'Critical Burnout Warning',

    // Payslip
    transparentPayslip: 'Transparent Shift Payslip',
    listenPayslip: '🔊 Listen to Salary Breakdown',
    basePay: 'Base Regular Wages',
    overtimePay: 'Overtime Pay (1.5x Multiplier)',
    hazardBonus: 'Shift Hazard Allowance',
    statutoryDeduct: 'Statutory Welfare Deductions',
    netTakeHome: 'Net Take-Home Pay',
    auditBadge: 'Verified by SDG 8 Digital Ledger',

    // End of Shift Energy Check
    batteryCheckTitle: '3-Second Shift Energy Check',
    batterySub: 'How is your body feeling after this shift? Helps adjust tomorrow\'s workload.',
    batteryGood: '🟢 Energized (100%)',
    batteryTired: '🟡 Tired / Normal',
    batteryExhausted: '🔴 Exhausted / In Pain',
    batteryLogged: 'Energy recorded. Rest well!',

    // Safety Hazard Reporting
    safetyDesk: 'Safety Hazard Reporting Desk',
    voiceReportBtn: '🎙️ Speak Hazard (No Typing)',
    stopRecording: '⏹️ Stop Recording',
    hazardCategory: 'Hazard Category',
    severityLevel: 'Severity Level',
    criticalUrgent: '🚨 Critical (1h SLA)',
    moderateUrgent: '⚠️ Moderate Hazard',
    lowUrgent: 'ℹ️ Notice',
    locationTag: 'Work Zone / Pillar Location',
    submitReportBtn: '🛡️ Submit Verified Hazard Report',
    peerCosignTitle: 'Active Site Hazards & Peer Verification',
    cosignBtn: '🤝 Confirm / I Also Saw This',
    verifiedReports: 'Peer Verified Reports',
    slaTimeRemaining: 'Resolution SLA Remaining',
    statusReported: 'Reported',
    statusInvestigating: 'Under Inspection',
    statusResolved: 'Resolved & Safe',

    // Anonymous Feedback
    feedbackTitle: '100% Anonymous Workplace Feedback',
    feedbackSub: 'Your identity is strictly unlinked via blind token. Rate safely.',
    supervisorRating: 'Supervisor & Management Conduct',
    restWaterRating: 'Rest Breaks, Shade & Clean Water',
    safetyEquipment: 'Safety Equipment & Tools Quality',
    feedbackComment: 'Optional voice or text comment...',
    submitFeedback: '🔒 Send Anonymous Review',
    feedbackSuccess: 'Review logged anonymously. Thank you for making work fairer!',

    // Skill Passport
    skillPassportTitle: 'Digital Skill Passport (SDG 8)',
    passportSub: 'Tamper-proof verifiable record that stays with you across employers.',
    verifiedHoursTotal: 'Verified Shift Hours',
    safetyRecord: 'Zero-Accident Safety Record',
    certifications: 'Earned Certifications',
    credentialQr: 'Scan to Verify Credentials',
    downloadPdf: '📄 Download Official Card',

    // Employer Dashboard
    liveHeadcount: 'Live Workforce On-Site',
    activeShifts: 'Active Shifts in Progress',
    pendingHazards: 'Open Safety Triage Items',
    overtimeAccrued: 'Total Overtime Accrued',
    attritionPredictor: 'AI Attrition & Burnout Radar',
    attritionSub: 'Predicts resignation risk based on back-to-back 10h+ shifts, night rotations & unresolved safety alerts.',
    riskHigh: 'High Quit Risk (>75%)',
    riskMedium: 'Moderate Risk (40-75%)',
    riskLow: 'Low Risk (<40%)',
    suggestedAction: 'Recommended Intervention',
    overtimeAudit: 'Overtime & Wage Theft Audit Ledger',
    incidentSlaQueue: 'Safety Incident SLA Countdown Queue',
    actionResolve: 'Mark Resolved (With Proof)',
    actionAcknowledge: 'Acknowledge & Dispatch',
    feedbackTrends: 'Workforce Morale & Feedback Pulse'
  },

  hi: {
    appTitle: 'फेयरशिफ्ट (FairShift)',
    appTagline: 'उचित कार्य और पारदर्शी शिफ्ट प्रबंधन (SDG 8)',
    workerMode: 'श्रमिक इंटरफ़ेस',
    adminMode: 'नियोक्ता / सुपरवाइजर डैशबोर्ड',
    industrySwitch: 'उद्योग चयन',
    language: 'भाषा',
    listenPage: '🔊 बोलकर सुनाएं',
    listening: '🔊 पढ़ा जा रहा है...',
    stopAudio: '⏹️ आवाज बंद करें',

    shiftStatus: 'आज का शिफ्ट ट्रैकर',
    notClockedIn: 'शिफ्ट शुरू नहीं हुई',
    clockedIn: 'शिफ्ट चालू है',
    clockInBtn: '📍 1-टैप हाजिरी लगाएं',
    clockOutBtn: '🛑 शिफ्ट समाप्त करें',
    takeBreakBtn: '☕ 15 मिनट विश्राम लें',
    onBreak: 'विश्राम पर हैं',
    resumeWork: '▶️ काम पुनः शुरू करें',
    geofenceOk: 'GPS सत्यापित: आप कार्यस्थल के अंदर हैं',
    geofenceOut: 'चेतावनी: आप कार्यस्थल से 1.5 किमी दूर हैं',
    simLocation: 'स्थान परीक्षण (GPS Mock)',
    simInside: '✅ कार्यस्थल के अंदर',
    simOutside: '⚠️ कार्यस्थल से बाहर',
    qrCheckin: '📷 साइट क्यूआर कोड स्कैन करें',
    hoursLogged: 'कुल दर्ज घंटे',
    standardHours: 'सामान्य घंटे (8 घंटे तक)',
    overtimeHours: 'ओवरटाइम (1.5 गुना दर)',
    fatigueRisk: 'थकान और तनाव स्तर',
    fatigueSafe: 'सुरक्षित स्तर',
    fatigueModerate: 'मध्यम तनाव',
    fatigueHigh: 'अत्यधिक थकान चेतावनी',

    transparentPayslip: 'पारदर्शी वेतन पर्ची (Payslip)',
    listenPayslip: '🔊 अपनी भाषा में वेतन का हिसाब सुनें',
    basePay: 'मूल सामान्य मजदूरी',
    overtimePay: 'ओवरटाइम मजदूरी (1.5 गुना)',
    hazardBonus: 'जोखिम / शिफ्ट भत्ता',
    statutoryDeduct: 'कल्याणकारी कटौतियां',
    netTakeHome: 'शुद्ध हाथ में आने वाली राशि',
    auditBadge: 'SDG 8 डिजिटल लेजर द्वारा सत्यापित',

    batteryCheckTitle: '3-सेकंड शारीरिक ऊर्जा जांच',
    batterySub: 'शिफ्ट के बाद आपका शरीर कैसा महसूस कर रहा है?',
    batteryGood: '🟢 ऊर्जावान (100%)',
    batteryTired: '🟡 सामान्य थकान',
    batteryExhausted: '🔴 बहुत ज्यादा थकावट / दर्द',
    batteryLogged: 'ऊर्जा स्तर दर्ज किया गया। अच्छा विश्राम करें!',

    safetyDesk: 'सुरक्षा जोखिम रिपोर्टिंग डेस्क',
    voiceReportBtn: '🎙️ बोलकर जोखिम दर्ज करें (लिखने की जरूरत नहीं)',
    stopRecording: '⏹️ रिकॉर्डिंग रोकें',
    hazardCategory: 'खतरे की श्रेणी',
    severityLevel: 'गंभीरता स्तर',
    criticalUrgent: '🚨 गंभीर खतरा (1 घंटे में समाधान)',
    moderateUrgent: '⚠️ मध्यम जोखिम',
    lowUrgent: 'ℹ️ सामान्य सूचना',
    locationTag: 'कार्य क्षेत्र / पिलर नंबर',
    submitReportBtn: '🛡️ सुरक्षा रिपोर्ट भेजें',
    peerCosignTitle: 'कार्यस्थल के सक्रिय खतरे एवं साथियों द्वारा सत्यापन',
    cosignBtn: '🤝 पुष्टि करें / मैंने भी यह देखा',
    verifiedReports: 'साथियों द्वारा पुष्ट रिपोर्टें',
    slaTimeRemaining: 'समाधान हेतु शेष समय',
    statusReported: 'दर्ज हुई',
    statusInvestigating: 'जांच जारी है',
    statusResolved: 'सुरक्षित व हल हो गई',

    feedbackTitle: '100% गोपनीय व अनाम फीडबैक',
    feedbackSub: 'आपकी पहचान पूर्णतः सुरक्षित और छिपी हुई है। बेझिझक राय दें।',
    supervisorRating: 'सुपरवाइजर का व्यवहार व सम्मान',
    restWaterRating: 'विश्राम, छाया और पीने का स्वच्छ पानी',
    safetyEquipment: 'सुरक्षा उपकरण और औजारों की गुणवत्ता',
    feedbackComment: 'वैकल्पिक टिप्पणी बोलें या लिखें...',
    submitFeedback: '🔒 अनाम समीक्षा भेजें',
    feedbackSuccess: 'आपकी समीक्षा सुरक्षित रूप से दर्ज कर ली गई है। धन्यवाद!',

    skillPassportTitle: 'डिजिटल कौशल पासपोर्ट (Skill Passport)',
    passportSub: 'आपका प्रमाणित कार्य अनुभव जो हर नई नौकरी में आपके साथ रहेगा।',
    verifiedHoursTotal: 'सत्यापित कार्य घंटे',
    safetyRecord: 'शून्य-दुर्घटना सुरक्षा रिकॉर्ड',
    certifications: 'प्राप्त प्रमाणपत्र',
    credentialQr: 'सत्यापन हेतु क्यूआर कोड',
    downloadPdf: '📄 आधिकारिक कार्ड डाउनलोड करें',

    liveHeadcount: 'साइट पर उपस्थित कुल श्रमिक',
    activeShifts: 'सक्रिय शिफ्ट्स',
    pendingHazards: 'लंबित सुरक्षा मामले',
    overtimeAccrued: 'कुल अर्जित ओवरटाइम',
    attritionPredictor: 'एआई थकान एवं नौकरी छोड़ने का जोखिम रडार',
    attritionSub: 'लगातार 10+ घंटे, रात की पाली व अनसुलझी शिकायतों के आधार पर जोखिम का विश्लेषण।',
    riskHigh: 'उच्च जोखिम (>75%)',
    riskMedium: 'मध्यम जोखिम (40-75%)',
    riskLow: 'सुरक्षित स्तर (<40%)',
    suggestedAction: 'प्रबंधन हेतु अनुशंसित कदम',
    overtimeAudit: 'ओवरटाइम व मजदूरी पारदर्शिता ऑडिट',
    incidentSlaQueue: 'सुरक्षा समाधान उलटी गिनती (SLA)',
    actionResolve: 'हल किया (प्रमाण सहित)',
    actionAcknowledge: 'स्वीकार करें व टीम भेजें',
    feedbackTrends: 'श्रमिक संतुष्टि एवं फीडबैक ट्रेंड्स'
  },

  ta: {
    appTitle: 'பேர்ஷிப்ட் (FairShift)',
    appTagline: 'நேர்மையான வேலை மற்றும் வெளிப்படையான ஷிப்ட் தளம் (SDG 8)',
    workerMode: 'தொழிலாளர் பக்கம்',
    adminMode: 'நிர்வாக டாஷ்போர்டு',
    industrySwitch: 'துறை தேர்வு',
    language: 'மொழி',
    listenPage: '🔊 குரலில் கேளுங்கள்',
    listening: '🔊 ஒலிக்கிறது...',
    stopAudio: '⏹️ குரலை நிறுத்து',

    shiftStatus: 'இன்றைய பணி கண்காணிப்பு',
    notClockedIn: 'ஷிப்ட் இன்னும் தொடங்கவில்லை',
    clockedIn: 'பணியில் உள்ளீர்கள்',
    clockInBtn: '📍 1-தட்டலில் பணி தொடங்கவும்',
    clockOutBtn: '🛑 ஷிப்ட் முடிக்கவும்',
    takeBreakBtn: '☕ 15 நிமிடம் ஓய்வு எடுக்கவும்',
    onBreak: 'ஓய்வு பதிவு செய்யப்பட்டது',
    resumeWork: '▶️ வேலையைத் தொடரவும்',
    geofenceOk: 'GPS சரிபார்க்கப்பட்டது: நீங்கள் பணியிடத்திற்குள் உள்ளீர்கள்',
    geofenceOut: 'எச்சரிக்கை: நீங்கள் பணியிடத்திற்கு வெளியே உள்ளீர்கள்',
    simLocation: 'இடத்தை சோதிக்கவும் (GPS Mock)',
    simInside: '✅ தளத்திற்குள்',
    simOutside: '⚠️ தளத்திற்கு வெளியே',
    qrCheckin: '📷 QR ஸ்கேன் செய்யவும்',
    hoursLogged: 'பதிவான வேலை மணிநேரம்',
    standardHours: 'வழக்கமான நேரம் (8 மணி வரை)',
    overtimeHours: 'கூடுதல் நேரம் (1.5 மடங்கு ஊதியம்)',
    fatigueRisk: 'உடல் சோர்வு மற்றும் அழுத்த நிலை',
    fatigueSafe: 'பாதுகாப்பான நிலை',
    fatigueModerate: 'மிதமான சோர்வு',
    fatigueHigh: 'அதிகப்படியான சோர்வு எச்சரிக்கை',

    transparentPayslip: 'வெளிப்படையான சம்பளச் சீட்டு (Payslip)',
    listenPayslip: '🔊 சம்பளக் கணக்கை தமிழில் கேளுங்கள்',
    basePay: 'அடிப்படை வழக்கமான ஊதியம்',
    overtimePay: 'கூடுதல் நேர ஊதியம் (1.5x)',
    hazardBonus: 'பாதுகாப்பு / ஷிப்ட் படி',
    statutoryDeduct: 'நலத்திட்ட பிடித்தங்கள்',
    netTakeHome: 'கைக்கு வரும் நிகர சம்பளம்',
    auditBadge: 'SDG 8 டிஜிட்டல் முறையில் சரிபார்க்கப்பட்டது',

    batteryCheckTitle: '3-வினாடி உடல் ஆற்றல் சோதனை',
    batterySub: 'இன்றைய பணிக்கு பின் உங்கள் உடல் நிலை எப்படி உள்ளது?',
    batteryGood: '🟢 புத்துணர்ச்சி (100%)',
    batteryTired: '🟡 சாதாரண சோர்வு',
    batteryExhausted: '🔴 கடுமையான சோர்வு / வலி',
    batteryLogged: 'ஆற்றல் பதிவு செய்யப்பட்டது. நல்ல ஓய்வு எடுங்கள்!',

    safetyDesk: 'பணியிட ஆபத்து புகார் பிரிவு',
    voiceReportBtn: '🎙️ பேசிப் புகாரளிக்கவும் (எழுத தேவையில்லை)',
    stopRecording: '⏹️ பதிவை நிறுத்தவும்',
    hazardCategory: 'ஆபத்தின் வகை',
    severityLevel: 'தீவிரத் தன்மை',
    criticalUrgent: '🚨 அவசர ஆபத்து (1 மணி நேர தீர்வு)',
    moderateUrgent: '⚠️ நடுத்தர ஆபத்து',
    lowUrgent: 'ℹ️ பொதுவான தகவல்',
    locationTag: 'பணி பகுதி / பில்லர் எண்',
    submitReportBtn: '🛡️ ஆபத்து புகாரை சமர்ப்பிக்கவும்',
    peerCosignTitle: 'பணியிட ஆபத்துகள் & சக தொழிலாளர் உறுதிப்படுத்தல்',
    cosignBtn: '🤝 உறுதி செய்கிறேன் / நானும் பார்த்தேன்',
    verifiedReports: 'உறுதிப்படுத்தப்பட்ட புகார்கள்',
    slaTimeRemaining: 'தீர்வு காண மீதமுள்ள நேரம்',
    statusReported: 'பதிவு செய்யப்பட்டது',
    statusInvestigating: 'ஆய்வில் உள்ளது',
    statusResolved: 'சரிசெய்யப்பட்டது',

    feedbackTitle: '100% பெயர் தெரியாத ரகசிய கருத்துப் பதிவு',
    feedbackSub: 'உங்கள் அடையாளம் எக்காரணத்தைக் கொண்டும் வெளிப்படாது.',
    supervisorRating: 'மேற்பார்வையாளர் நடத்தை & மரியாதை',
    restWaterRating: 'ஓய்வு இடைவேளை & குடிநீர் வசதி',
    safetyEquipment: 'பாதுகாப்பு உபகரணங்களின் தரம்',
    feedbackComment: 'கருத்துக்களை பேசலாம் அல்லது எழுதலாம்...',
    submitFeedback: '🔒 ரகசிய கருத்தை அனுப்புக',
    feedbackSuccess: 'உங்கள் கருத்து பாதுகாப்பாக பதிவானது. நன்றி!',

    skillPassportTitle: 'டிஜிட்டல் திறன் பாஸ்போர்ட் (Skill Passport)',
    passportSub: 'உங்கள் அனுபவத்தையும் தகுதியையும் நிரூபிக்கும் சான்றிதழ்.',
    verifiedHoursTotal: 'சரிபார்க்கப்பட்ட பணி மணிநேரம்',
    safetyRecord: 'விபத்தில்லா சாதனை பதிவு',
    certifications: 'பெற்ற பாதுகாப்பு சான்றிதழ்கள்',
    credentialQr: 'சரிபார்க்க QR குறியீடு',
    downloadPdf: '📄 சான்றிதழ் அட்டையைப் பதிவிறக்கு',

    liveHeadcount: 'பணியிடத்தில் உள்ள தொழிலாளர்கள்',
    activeShifts: 'நடப்பு ஷிப்ட்கள்',
    pendingHazards: 'தீர்க்கப்படாத ஆபத்துகள்',
    overtimeAccrued: 'மொத்த கூடுதல் நேரம்',
    attritionPredictor: 'வேலை விலகல் & சோர்வு கணிப்பு AI',
    attritionSub: 'தொடர் 10+ மணிநேர வேலை மற்றும் சோர்வு அடிப்படையில் கணிப்பு.',
    riskHigh: 'அதிக அபாயம் (>75%)',
    riskMedium: 'மிதமான அபாயம் (40-75%)',
    riskLow: 'பாதுகாப்பானது (<40%)',
    suggestedAction: 'பரிந்துரைக்கப்படும் நிர்வாக நடவடிக்கை',
    overtimeAudit: 'கூடுதல் நேர ஊதிய வெளிப்படைத்தன்மை',
    incidentSlaQueue: 'அவசர ஆபத்து தீர்வு கவுண்டவுன்',
    actionResolve: 'சரிசெய்யப்பட்டது என முடி',
    actionAcknowledge: 'ஏற்றுக்கொண்டு குழுவை அனுப்பு',
    feedbackTrends: 'தொழிலாளர் திருப்தி நிலவரம்'
  },

  te: {
    appTitle: 'ఫెయిర్‌షిఫ్ట్ (FairShift)',
    appTagline: 'న్యాయమైన పని మరియు పారదర్శక షిఫ్ట్ నిర్వహణ (SDG 8)',
    workerMode: 'కార్మికుల విభాగం',
    adminMode: 'యాజమాన్య డ్యాష్‌బోర్డ్',
    industrySwitch: 'పరిశ్రమ ఎంపిక',
    language: 'భాష',
    listenPage: '🔊 గొంతుతో వినండి',
    listening: '🔊 చదువుతోంది...',
    stopAudio: '⏹️ ఆడియో ఆపు',

    shiftStatus: 'ఈరోజు షిఫ్ట్ ట్రాకర్',
    notClockedIn: 'హాజరు నమోదు కాలేదు',
    clockedIn: 'షిఫ్ట్ నడుస్తోంది',
    clockInBtn: '📍 1-ట్యాప్ హాజరు వేయండి',
    clockOutBtn: '🛑 షిఫ్ట్ ముగించండి',
    takeBreakBtn: '☕ 15 నిమిషాల విరామం',
    onBreak: 'విరామంలో ఉన్నారు',
    resumeWork: '▶️ పని కొనసాగించండి',
    geofenceOk: 'GPS ధృవీకరించబడింది: మీరు పని ప్రదేశంలోనే ఉన్నారు',
    geofenceOut: 'హెచ్చరిక: మీరు పని ప్రదేశం వెలుపల ఉన్నారు',
    simLocation: 'స్థాన పరీక్ష (GPS Mock)',
    simInside: '✅ పని ప్రదేశంలో',
    simOutside: '⚠️ పని ప్రదేశం వెలుపల',
    qrCheckin: '📷 QR కోడ్ స్కాన్ చేయండి',
    hoursLogged: 'నమోదైన పని గంటలు',
    standardHours: 'సాధారణ గంటలు (8 గంటల వరకు)',
    overtimeHours: 'ఓవర్‌టైమ్ (1.5 రెట్లు జీతం)',
    fatigueRisk: 'శరీర అలసట స్థాయి',
    fatigueSafe: 'సురక్షితం',
    fatigueModerate: 'మధ్యస్థ అలసట',
    fatigueHigh: 'అత్యధిక అలసట హెచ్చరిక',

    transparentPayslip: 'పారదర్శక జీతం రసీదు (Payslip)',
    listenPayslip: '🔊 జీతం వివరాలు తెలుగులో వినండి',
    basePay: 'ప్రాథమిక సాధారణ జీతం',
    overtimePay: 'ఓవర్‌టైమ్ వేతనం (1.5x)',
    hazardBonus: 'రిస్క్ / షిఫ్ట్ అలవెన్స్',
    statutoryDeduct: 'సంక్షేమ తగ్గింపులు',
    netTakeHome: 'చేతికి వచ్చే నికర జీతం',
    auditBadge: 'SDG 8 డిజిటల్ లెడ్జర్ ద్వారా ధృవీకరించబడింది',

    batteryCheckTitle: '3-సెకన్ల శారీరక శక్తి తనిఖీ',
    batterySub: 'షిఫ్ట్ తర్వాత మీ శరీరం ఎలా అనిపిస్తోంది?',
    batteryGood: '🟢 ఉత్సాహంగా (100%)',
    batteryTired: '🟡 సాధారణ అలసట',
    batteryExhausted: '🔴 తీవ్రమైన అలసట / నొప్పి',
    batteryLogged: 'శక్తి స్థాయి నమోదు చేయబడింది. విశ్రాంతి తీసుకోండి!',

    safetyDesk: 'భద్రతా సమస్యల రిపోర్టింగ్ విభాగం',
    voiceReportBtn: '🎙️ మాట్లాడి సమస్యను చెప్పండి (రాయనవసరం లేదు)',
    stopRecording: '⏹️ రికార్డింగ్ ఆపండి',
    hazardCategory: 'ప్రమాద రకం',
    severityLevel: 'తీవ్రత స్థాయి',
    criticalUrgent: '🚨 అత్యవసర ప్రమాదం (1 గంటలో పరిష్కారం)',
    moderateUrgent: '⚠️ మధ్యస్థ ప్రమాదం',
    lowUrgent: 'ℹ️ సాధారణ సమాచారం',
    locationTag: 'పని ప్రాంతం / పిల్లర్ సంఖ్య',
    submitReportBtn: '🛡️ భద్రతా రిపోర్ట్ పంపండి',
    peerCosignTitle: 'పని ప్రదేశ ప్రమాదాలు & సహచరుల ధృవీకరణ',
    cosignBtn: '🤝 అవును / నేను కూడా చూశాను',
    verifiedReports: 'ధృవీకరించబడిన రిపోర్టులు',
    slaTimeRemaining: 'పరిష్కారానికి మిగిలిన సమయం',
    statusReported: 'నమోదైంది',
    statusInvestigating: 'పరిశీలనలో ఉంది',
    statusResolved: 'పరిష్కరించబడింది',

    feedbackTitle: '100% అజ్ఞాత స్పందన (Anonymous)',
    feedbackSub: 'మీ వివరాలు ఎక్కడా బహిర్గతం కావు. నిర్భయంగా చెప్పండి.',
    supervisorRating: 'సూపర్‌వైజర్ ప్రవర్తన & గౌరవం',
    restWaterRating: 'విశ్రాంతి & తాగునీటి సౌకర్యం',
    safetyEquipment: 'భద్రతా పరికరాల నాణ్యత',
    feedbackComment: 'అభిప్రాయాన్ని మాట్లాడండి లేదా రాయండి...',
    submitFeedback: '🔒 అజ్ఞాత అభిప్రాయం పంపండి',
    feedbackSuccess: 'మీ అభిప్రాయం సురక్షితంగా నమోదైంది. ధన్యవాదాలు!',

    skillPassportTitle: 'డిజిటల్ స్కిల్ పాస్‌పోర్ట్',
    passportSub: 'మీ పని అనుభవం మరియు ధృవపత్రాల రికార్డు.',
    verifiedHoursTotal: 'ధృవీకరించిన పని గంటలు',
    safetyRecord: 'ప్రమాద రహిత రికార్డు',
    certifications: 'పొందిన భద్రతా సర్టిఫికెట్లు',
    credentialQr: 'ధృవీకరణ కోసం QR కోడ్',
    downloadPdf: '📄 అధికారిక కార్డును డౌన్‌లోడ్ చేయండి',

    liveHeadcount: 'సైట్‌లో ఉన్న కార్మికులు',
    activeShifts: 'ప్రస్తుత షిఫ్టులు',
    pendingHazards: 'పరిష్కారం కాని సమస్యలు',
    overtimeAccrued: 'మొత్తం ఓవర్‌టైమ్',
    attritionPredictor: 'ఉద్యోగం మానేసే రిస్క్ ప్రిడిక్టర్ AI',
    attritionSub: 'వరుస 10+ గంటల పని మరియు అలసట ఆధారంగా అంచనా.',
    riskHigh: 'అధిక రిస్క్ (>75%)',
    riskMedium: 'మధ్యస్థ రిస్క్ (40-75%)',
    riskLow: 'సురక్షితం (<40%)',
    suggestedAction: 'యాజమాన్యానికి సూచన',
    overtimeAudit: 'ఓవర్‌టైమ్ వేతన పారదర్శకత ఆడిట్',
    incidentSlaQueue: 'అత్యవసర ప్రమాద పరిష్కార కౌంట్‌డౌన్',
    actionResolve: 'పరిష్కరించబడింది అని గుర్తించండి',
    actionAcknowledge: 'స్వీకరించి బృందాన్ని పంపండి',
    feedbackTrends: 'కార్మికుల సంతృప్తి స్థితి'
  },

  bn: {
    appTitle: 'ফেয়ারশিফ্ট (FairShift)',
    appTagline: 'ন্যায্য কাজ ও স্বচ্ছ শিফট পরিচালনা (SDG 8)',
    workerMode: 'শ্রমিক ইন্টারফেস',
    adminMode: 'নিয়োগকর্তা ড্যাশবোর্ড',
    industrySwitch: 'শিল্প নির্বাচন',
    language: 'ভাষা',
    listenPage: '🔊 কথা শুনে বুঝুন',
    listening: '🔊 পড়া হচ্ছে...',
    stopAudio: '⏹️ শব্দ থামান',

    shiftStatus: 'আজকের শিফট ট্র্যাকার',
    notClockedIn: 'শিফট শুরু হয়নি',
    clockedIn: 'শিফট চলছে',
    clockInBtn: '📍 ১-ট্যাপে হাজিরা দিন',
    clockOutBtn: '🛑 শিফট সমাপ্ত করুন',
    takeBreakBtn: '☕ ১৫ মিনিট বিশ্রাম নিন',
    onBreak: 'বিশ্রামে আছেন',
    resumeWork: '▶️ কাজ পুনরায় শুরু করুন',
    geofenceOk: 'GPS যাচাইকৃত: আপনি কর্মক্ষেত্রের ভেতরে আছেন',
    geofenceOut: 'সতর্কতা: আপনি কর্মক্ষেত্রের বাইরে আছেন',
    simLocation: 'অবস্থান পরীক্ষা (GPS Mock)',
    simInside: '✅ কর্মক্ষেত্রের ভেতরে',
    simOutside: '⚠️ কর্মক্ষেত্রের বাইরে',
    qrCheckin: '📷 QR কোড স্ক্যান করুন',
    hoursLogged: 'মোট কাজের ঘণ্টা',
    standardHours: 'সাধারণ ঘণ্টা (৮ ঘণ্টা পর্যন্ত)',
    overtimeHours: 'ওভারটাইম (১.৫ গুণ মজুরি)',
    fatigueRisk: 'ক্লান্তি ও শারীরিক চাপের স্তর',
    fatigueSafe: 'নিরাপদ স্তর',
    fatigueModerate: 'মাঝারি ক্লান্তি',
    fatigueHigh: 'চরম ক্লান্তি সতর্কতা',

    transparentPayslip: 'স্বচ্ছ বেতন রশিদ (Payslip)',
    listenPayslip: '🔊 বাংলায় বেতনের হিসাব শুনুন',
    basePay: 'মূল সাধারণ মজুরি',
    overtimePay: 'ওভারটাইম মজুরি (১.৫ গুণ)',
    hazardBonus: 'ঝুঁকি / শিফট ভাতা',
    statutoryDeduct: 'কল্যাণমূলক কর্তন',
    netTakeHome: 'হাতে পাওয়া মোট মজুরি',
    auditBadge: 'SDG 8 ডিজিটাল খতিয়ান দ্বারা যাচাইকৃত',

    batteryCheckTitle: '৩-সেকেন্ডের শারীরিক শক্তি যাচাই',
    batterySub: 'শিফটের পর আপনার শরীর কেমন অনুভব করছে?',
    batteryGood: '🟢 সতেজ (১০০%)',
    batteryTired: '🟡 সাধারণ ক্লান্তি',
    batteryExhausted: '🔴 চরম ক্লান্তি / ব্যথা',
    batteryLogged: 'শক্তির মাত্রা সংরক্ষিত হয়েছে। ভালো বিশ্রাম নিন!',

    safetyDesk: 'কর্মক্ষেত্রের বিপদ রিপোর্টিং বিভাগ',
    voiceReportBtn: '🎙️ মুখে বলে বিপদ জানান (লেখার দরকার নেই)',
    stopRecording: '⏹️ রেকর্ডিং থামান',
    hazardCategory: 'বিপদের ধরন',
    severityLevel: 'তীব্রতার মাত্রা',
    criticalUrgent: '🚨 জরুরি বিপদ (১ ঘণ্টার মধ্যে সমাধান)',
    moderateUrgent: '⚠️ মাঝারি ঝুঁকি',
    lowUrgent: 'ℹ️ সাধারণ তথ্য',
    locationTag: 'কাজের স্থান / পিলার নম্বর',
    submitReportBtn: '🛡️ সুরক্ষা রিপোর্ট জমা দিন',
    peerCosignTitle: 'কর্মক্ষেত্রের বিপদ ও সহকর্মীদের সত্যতা যাচাই',
    cosignBtn: '🤝 হ্যাঁ / আমিও এটি দেখেছি',
    verifiedReports: 'যাচাইকৃত রিপোর্ট',
    slaTimeRemaining: 'সমাধানের বাকি সময়',
    statusReported: 'জমা হয়েছে',
    statusInvestigating: 'তদন্ত চলছে',
    statusResolved: 'সমাধান হয়েছে',

    feedbackTitle: '১০০% গোপনীয় বেনামী মতামত',
    feedbackSub: 'আপনার পরিচয় সম্পূর্ণ গোপন থাকবে। নির্ভয়ে জানান।',
    supervisorRating: 'সুপারভাইজারের আচরণ ও সম্মান',
    restWaterRating: 'বিশ্রাম ও বিশুদ্ধ পানীয় জল',
    safetyEquipment: 'সুরক্ষা সরঞ্জামের মান',
    feedbackComment: 'মতামত বলুন বা লিখুন...',
    submitFeedback: '🔒 বেনামী পর্যালোচনা পাঠান',
    feedbackSuccess: 'আপনার মতামত নিরাপদে জমা হয়েছে। ধন্যবাদ!',

    skillPassportTitle: 'ডিজিটাল স্কিল পাসপোর্ট',
    passportSub: 'আপনার কাজের অভিজ্ঞতা ও দক্ষতার স্থায়ী দলিল।',
    verifiedHoursTotal: 'যাচাইকৃত কাজের ঘণ্টা',
    safetyRecord: 'দুর্ঘটনামুক্ত রেকর্ড',
    certifications: 'অর্জিত সুরক্ষা সনদ',
    credentialQr: 'যাচাইয়ের জন্য QR কোড',
    downloadPdf: '📄 অফিসিয়াল কার্ড ডাউনলোড করুন',

    liveHeadcount: 'কর্মস্থলে উপস্থিত কর্মী',
    activeShifts: 'চলমান শিফট',
    pendingHazards: 'অমীমাংসিত বিপদ',
    overtimeAccrued: 'মোট অতিরিক্ত সময়',
    attritionPredictor: 'চাকরি ছাড়ার ঝুঁকি নির্দেশক AI',
    attritionSub: 'টানা ১০+ ঘণ্টার কাজ এবং ক্লান্তির ভিত্তিতে পূর্বাভাস।',
    riskHigh: 'উচ্চ ঝুঁকি (>৭৫%)',
    riskMedium: 'মাঝারি ঝুঁকি (৪০-৭৫%)',
    riskLow: 'নিরাপদ স্তর (<৪০%)',
    suggestedAction: 'ব্যবস্থাপনার জন্য করণীয়',
    overtimeAudit: 'ওভারটাইম ও মজুরি স্বচ্ছতা অডিট',
    incidentSlaQueue: 'জরুরি বিপদ সমাধান কাউন্টডাউন',
    actionResolve: 'সমাধান হিসেবে চিহ্নিত করুন',
    actionAcknowledge: 'গ্রহণ করুন এবং দল পাঠান',
    feedbackTrends: 'কর্মী সন্তুষ্টির চিত্র'
  },

  es: {
    appTitle: 'FairShift',
    appTagline: 'Trabajo Decente y Turnos Transparentes (ODS 8)',
    workerMode: 'Panel del Trabajador',
    adminMode: 'Panel del Empleador',
    industrySwitch: 'Sector Industrial',
    language: 'Idioma',
    listenPage: '🔊 Escuchar en voz alta',
    listening: '🔊 Reproduciendo...',
    stopAudio: '⏹️ Detener audio',

    shiftStatus: 'Control de Turno de Hoy',
    notClockedIn: 'Turno no iniciado',
    clockedIn: 'Turno activo',
    clockInBtn: '📍 Fichar con 1-Toque',
    clockOutBtn: '🛑 Finalizar Turno',
    takeBreakBtn: '☕ Pausa de 15 min',
    onBreak: 'En Pausa Registrada',
    resumeWork: '▶️ Reanudar Trabajo',
    geofenceOk: 'GPS Verificado: Dentro de la zona de obra',
    geofenceOut: 'Alerta GPS: Fuera del perímetro asignado',
    simLocation: 'Simular GPS de Obra',
    simInside: '✅ Dentro de la Zona',
    simOutside: '⚠️ Fuera (A 1.5 km)',
    qrCheckin: '📷 Escanear QR de Sitio',
    hoursLogged: 'Horas Registradas',
    standardHours: 'Horas Estándar (Máx 8h)',
    overtimeHours: 'Horas Extra (Tarifa 1.5x)',
    fatigueRisk: 'Nivel de Fatiga y Desgaste',
    fatigueSafe: 'Nivel Seguro',
    fatigueModerate: 'Desgaste Moderado',
    fatigueHigh: '¡Alerta de Fatiga Crítica!',

    transparentPayslip: 'Nómina Transparente del Turno',
    listenPayslip: '🔊 Escuchar desglose de salario',
    basePay: 'Salario Base Regular',
    overtimePay: 'Pago por Horas Extra (1.5x)',
    hazardBonus: 'Plus de Peligrosidad / Turno',
    statutoryDeduct: 'Deducciones de Bienestar Social',
    netTakeHome: 'Salario Neto a Percibir',
    auditBadge: 'Verificado por Libro Digital ODS 8',

    batteryCheckTitle: 'Chequeo de Energía en 3 Segundos',
    batterySub: '¿Cómo siente su cuerpo tras este turno? Ayuda a planificar descansos.',
    batteryGood: '🟢 Con Energía (100%)',
    batteryTired: '🟡 Cansancio Normal',
    batteryExhausted: '🔴 Agotado / Con Dolor',
    batteryLogged: 'Nivel de energía registrado. ¡Que descanse!',

    safetyDesk: 'Mesa de Reportes de Seguridad',
    voiceReportBtn: '🎙️ Dictar Peligro (Sin Escribir)',
    stopRecording: '⏹️ Detener Grabación',
    hazardCategory: 'Categoría del Peligro',
    severityLevel: 'Nivel de Severidad',
    criticalUrgent: '🚨 Crítico (Solución en 1h)',
    moderateUrgent: '⚠️ Peligro Moderado',
    lowUrgent: 'ℹ️ Aviso General',
    locationTag: 'Zona de Trabajo / Pilar',
    submitReportBtn: '🛡️ Enviar Reporte Verificado',
    peerCosignTitle: 'Peligros Activos y Validación de Compañeros',
    cosignBtn: '🤝 Confirmar / Yo También lo Vi',
    verifiedReports: 'Reportes Validados por Compañeros',
    slaTimeRemaining: 'Tiempo Restante para Solución',
    statusReported: 'Reportado',
    statusInvestigating: 'En Inspección',
    statusResolved: 'Resuelto y Seguro',

    feedbackTitle: 'Opinión 100% Anónima del Puesto',
    feedbackSub: 'Identidad completamente desvinculada por token ciego. Opine seguro.',
    supervisorRating: 'Trato y Respeto del Supervisor',
    restWaterRating: 'Descansos, Sombra y Agua Potable',
    safetyEquipment: 'Calidad de Equipos y Protección (EPI)',
    feedbackComment: 'Comentario opcional por voz o texto...',
    submitFeedback: '🔒 Enviar Valoración Anónima',
    feedbackSuccess: '¡Su valoración se guardó de forma anónima. Gracias!',

    skillPassportTitle: 'Pasaporte Digital de Habilidades',
    passportSub: 'Registro verificable de su experiencia que viaja con usted entre empleos.',
    verifiedHoursTotal: 'Horas de Turno Verificadas',
    safetyRecord: 'Récord de Cero Accidentes',
    certifications: 'Certificaciones Obtenidas',
    credentialQr: 'QR de Verificación Oficial',
    downloadPdf: '📄 Descargar Credencial Oficial',

    liveHeadcount: 'Trabajadores Activos en Sitio',
    activeShifts: 'Turnos en Curso',
    pendingHazards: 'Incidentes de Seguridad Abiertos',
    overtimeAccrued: 'Total Horas Extra Acumuladas',
    attritionPredictor: 'Radar IA de Desgaste y Renuncias',
    attritionSub: 'Predice riesgo de dimisión según turnos de 10h+, noches seguidas y quejas abiertas.',
    riskHigh: 'Alto Riesgo de Abandono (>75%)',
    riskMedium: 'Riesgo Moderado (40-75%)',
    riskLow: 'Riesgo Bajo (<40%)',
    suggestedAction: 'Acción Preventiva Recomendada',
    overtimeAudit: 'Auditoría Transparente de Horas Extra',
    incidentSlaQueue: 'Cuenta Regresiva de Seguridad (SLA)',
    actionResolve: 'Marcar Resuelto (Con Pruebas)',
    actionAcknowledge: 'Reconocer y Enviar Cuadrilla',
    feedbackTrends: 'Tendencias de Satisfacción Laboral'
  }
};

class SpeechEngine {
  constructor() {
    this.currentLang = 'en';
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.recognition = null;
    this.isSpeaking = false;
    this.isListening = false;
    this.initRecognition();
  }

  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
    }
  }

  getText(key) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  playChime(type = 'success') {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // AudioContext policy safe catch
    }
  }

  speak(text, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    this.stopSpeaking();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langConfig = I18N_LANGUAGES[this.currentLang] || I18N_LANGUAGES.en;
    utterance.lang = langConfig.voiceCode;
    utterance.rate = 0.95; // Clearer for low literacy
    utterance.pitch = 1.0;

    this.isSpeaking = true;
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser. Please use text input or standard voice simulation.');
      return;
    }

    const langConfig = I18N_LANGUAGES[this.currentLang] || I18N_LANGUAGES.en;
    this.recognition.lang = langConfig.voiceCode;

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N_LANGUAGES, TRANSLATIONS, SpeechEngine };
}
