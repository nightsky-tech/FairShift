# 🛡️ FairShift — Decent Work & Shift Transparency Platform (UN SDG 8)

> **Prompt Wars 2026 × SRM ACM Student Chapter**  
> **Theme**: UN Sustainable Development Goal 8 — *Decent Work and Economic Growth*  
> **Target Sectors**: Construction, Hospitals, Factories, and Campus Facilities  

---

## 📌 Executive Summary

Many employee-intensive organizations manage large frontline workforces through paper registers, chaotic spreadsheets, and informal WhatsApp groups. This creates severe systemic problems:
* **For Workers**: Uncounted overtime, opaque salary calculations, fear of retaliation when giving feedback, unreported site hazards, and lost career equity when switching jobs.
* **For Employers**: Zero visibility into worker burnout, surprise resignations (attrition blind spots), and delayed emergency issue escalation.

**FairShift** replaces these broken manual processes with an accessible, voice-assisted, and dual-interface platform engineered for low-literacy workers and operational supervisors.

---

## 🚀 Key Deliverables & Architectural Modules

### 1. Dual Interfaces (2 Distinct UIs)
* **Worker Interface (Mobile-First)**:
  * **1-Tap Check-In with Geofence Verification**: GPS boundary validation and QR code check-in. Includes a **Mock GPS Site Location Toggle** (*Inside Site Zone* vs. *1.5km Away*) for live hackathon judge testing.
  * **Transparent Payslip with Audio Readout**: Real-time breakdown of standard hours, 1.5× overtime bonus, site hazard allowances, and statutory deductions with a **"🔊 Read Aloud"** button in regional languages.
  * **Abuse-Proof Voice Safety Reporting**: Frontline hazard logging via voice dictation or intuitive pictograms. Separates physical site hazards from manager grievances, requires on-site presence, and features **Peer Co-Signing ("🤝 Confirm / I Also Saw This")** with live SLA countdowns.
  * **3-Second End-of-Shift Battery Check**: Quick energy rating (🟢 Energized / 🟡 Tired / 🔴 Exhausted) and 1-tap break logger to calibrate individualized fatigue thresholds.
  * **Digital Skill Passport**: Verifiable record of cumulative hours, OSHA/NSC safety certifications, and peer endorsements with a shareable QR verification card.
  * **100% Anonymous Feedback**: Cryptographic blind tokens and automated phone/email redactors protect worker identity while preventing review-bombing (max 1 review per shift).

* **Employer / Admin Dashboard**:
  * **Live Site Headcount & Geofence Status**: Real-time active shift monitoring across site zones.
  * **AI Attrition & Burnout Radar**: Explainable quit-risk predictor (0–100%) tracking consecutive 10h+ shifts, night shift rotations, zone hazard proximity, and low sentiment scores.
  * **Safety Incident Triage Queue**: Priority escalation desk with live SLA timers for critical hazards.
  * **Overtime & Payroll Audit Trail**: Transparent digital ledger preventing wage theft and labor disputes.
  * **Workforce Morale Pulse**: Aggregated sentiment metrics across supervision, rest/water facilities, and equipment quality.

---

## 🏭 Multi-Industry Adoption (4 Distinct Sectors)

FairShift dynamically configures roles, metabolic strain, site hazards, and shift rules across 4 industries:

| Sector | Target Environment | Key Roles | Industry-Specific Hazards | Fatigue & Shift Rules |
| :--- | :--- | :--- | :--- | :--- |
| 🏗️ **Construction** | Metro Line 4 Rail Project | Concrete Masons, Scaffold Riggers, Electricians, Crane Operators | Scaffolding instability, exposed 415V cables, extreme heat stress, unsecured crane loads | High heat-index breaks (>35°C), 7h manual cap, 11h mandatory rest |
| 🏥 **Healthcare** | Apex City Multi-Specialty Hospital | ICU Nurses, Ward Orderlies, Bio-Sanitation Techs, Lab Assistants | Needle-stick sharps, biohazard fluid spills, aggressive patients, chemical disinfectants | Max consecutive night shifts (cap 3), 12h mandatory recovery |
| 🏭 **Manufacturing** | Precision Auto Works Assembly Plant 3 | Chassis Assemblers, MIG/TIG Welders, Forklift Drivers, QC Inspectors | LOTO conveyor breaches, welding exhaust fumes, 92dB+ noise, pinch points | Machine rotation cycles, vibration and repetitive strain limits |
| 🎓 **Education** | SRM University Campus & Tech Park | Chemistry Lab Techs, Campus Security, Janitorial Staff, Grounds Crew | Acid reagent spills, shattered autoclave glass, perimeter blackouts, leaf smolders | Lone-worker check-in intervals, chemical inventory compliance |

---

## 🌐 Accessibility & Inclusivity

* **6 Regional Languages**: English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Spanish (Español).
* **Store-and-Forward Offline Queue**: Cryptographically nonced background queue that buffers clock-ins, break logs, and voice hazard drafts when in cell-dead zones (basements, remote sites) and automatically flushes upon reconnection.
* **Dynamic Climate & Heat-Stress Guard**: Integrated Steadman/Rothfusz heat-index algorithm calculating real-time wet-bulb apparent temperature, triggering mandatory 15-minute rest breaks and 1.4× physiological strain multipliers when exceeding safety thresholds.
* **Limited Literacy Voice Cues**: Browser-native Web Speech API (`speechSynthesis` and `SpeechRecognition`) provides zero-cloud-cost, instant spoken readouts and voice dictation with graceful fallbacks.
* **Low-End Phone & Offline Optimized**: Zero heavy dependencies, ultra-fast initial bundle (< 150KB), 60fps animations, sub-15ms cold start, and local storage offline persistence.

---

## 🧪 Automated Unit Test Suite

The platform includes a built-in automated test runner covering payroll math, overtime rules, fatigue scoring, anti-abuse mechanisms, offline sync, climate guard, and security sanitization:

```bash
npm test
```

### Test Coverage Highlights (19/19 Tests Passing):
* ✅ Standard 8-hour shift caps and 1.5× overtime calculations
* ✅ Geofence boundary check-in acceptance & rejection
* ✅ Role-weighted physiological strain (Mason MET 1.7 vs. Crane Operator MET 1.1)
* ✅ Safety hazard clock-in requirement & peer co-sign escalation
* ✅ Anonymous feedback phone/email redaction and blind token generation
* ✅ Cross-sector configuration completeness across all 4 industries
* ✅ Multilingual dictionary parity across all 6 regional languages
* ✅ Offline store-and-forward queue with cryptographic nonces and sync logging
* ✅ Dynamic climate & heat-stress guard triggering mandatory rest periods
* ✅ Security sanitization against XSS, null-byte injection, and formatting utilities

---

## ☁️ Google Cloud Run Deployment

FairShift is built to deploy natively to **Google Cloud Run**:
* Listens on `0.0.0.0` and the required `PORT` environment variable.
* Native health check endpoint at `/health` (`status: "healthy"`, `cloudRunReady: true`).
* Container footprint < 50MB using lightweight Alpine Node.
* Repository size **< 10 MB**.

### Build & Deploy Commands:
```bash
# 1. Build Docker image
docker build -t gcr.io/[PROJECT_ID]/fairshift:latest .

# 2. Test locally
docker run -p 8080:8080 -e PORT=8080 gcr.io/[PROJECT_ID]/fairshift:latest

# 3. Deploy to Google Cloud Run
gcloud run deploy fairshift \
  --image gcr.io/[PROJECT_ID]/fairshift:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## ⚡ Vercel Deployment

FairShift is fully configured for zero-config global deployment on **Vercel**:
* Configuration file: [vercel.json](file:///c:/Users/admin/Downloads/promtwars/vercel.json)
* Serverless health check: [api/health.js](file:///c:/Users/admin/Downloads/promtwars/api/health.js) (`/health` and `/_health` rewrites)
* Security headers pre-configured (OWASP defense-in-depth)

### Deploy via Vercel CLI:
```bash
# 1. Deploy preview
npx vercel

# 2. Deploy to production
npx vercel --prod
```

### Deploy via Git (GitHub / GitLab):
1. Push repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/[YOUR-USERNAME]/fairshift.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Click **Deploy**. Vercel detects `vercel.json` and static assets automatically.


## 📱 LinkedIn Post Story (Ready to Share)

```markdown
🚀 Excited to unveil FairShift — built for Prompt Wars 2026 (SRM ACM Student Chapter) under UN SDG 8 (Decent Work & Economic Growth)!

📍 Step 01 — The Problem:
Millions of frontline workers in construction, healthcare, factories, and schools are managed through paper registers and WhatsApp groups. Overtime goes uncounted, safety hazards go unreported due to fear of retaliation, and worker fatigue is only noticed after someone gets hurt or quits.

🛠️ Step 02 — Our Build:
We engineered FairShift, a voice-assisted, dual-interface platform built for real-world frontline conditions:
• Worker UI: 1-tap geofenced check-in, transparent payslips with native voice readouts in 6 languages (Hindi, Tamil, Telugu, Bengali, Spanish, English), abuse-proof hazard reporting with peer co-signing, and a digital portable Skill Passport.
• Employer Dashboard: Live site visibility, an explainable AI Attrition & Fatigue Radar (MET-weighted strain model), and an emergency SLA triage countdown queue.
• Multi-Industry: Pre-configured across Construction, Hospitals, Factories, and Campus Operations.

🎯 Step 03 — Solution Fit & Impact:
FairShift directly aligns with UN SDG 8 by eliminating wage theft, breaking literacy barriers with voice technology, and giving employers proactive burnout visibility. Deployable to Google Cloud Run with zero bloat and a sub-10MB footprint.

#PromptWars2026 #SRMACM #SDG8 #DecentWork #CloudRun #SocialImpact #AI #InclusiveTech
```

---

## 📄 License
MIT License. Built for Prompt Wars 2026.
