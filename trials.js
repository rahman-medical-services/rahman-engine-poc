/**
 * OutcomeLogic™ Master Evidence Ledger
 * (c) 2026 Rahman Medical Services Limited. All Rights Reserved.
 */

const TRIAL_DATA = {
    esopec: {
        category: "Oncology",
        type: "calculated",
        shortName: "Esophageal (ESOPEC)",
        title: "ESOPEC: Clinical Modeling",
        subtitle: "Perioperative FLOT vs. Neoadjuvant CROSS",
        source: "ASCO 2024 / NEJM",
        color: "#2563eb",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_flot: [100, 88, 75, 66, 62, 59],
        baseline_cross: [100, 78, 55, 48, 42, 38],
        controlsHTML: `
            <label class="nav-label">Clinical N-Stage</label>
            <select id="eso-nstage" class="ee-select" onchange="runCalculation('esopec')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">cN0 (Node Negative)</option>
                <option value="1.25">cN+ (Node Positive)</option>
            </select>
            <label class="nav-label">Age Cohort</label>
            <select id="eso-age" class="ee-select" onchange="runCalculation('esopec')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Under 65</option>
                <option value="1.1">65 or Older</option>
            </select>
        `,
        footer_note: "Survival curves adjusted via Hazard Ratios (HR) from the ESOPEC 2024 primary analysis."
    },
    viale: {
        category: "Haematology",
        type: "calculated",
        shortName: "AML (VIALE-A)",
        title: "VIALE-A: AML Survival Modeling",
        subtitle: "Aza + Venetoclax vs. Aza + Placebo",
        source: "NEJM 2020",
        color: "#8e44ad",
        xAxisLabels: ['Baseline', '6m', '12m', '18m', '24m'],
        baseline_aza_ven: [100, 75, 60, 50, 43],
        baseline_aza: [100, 55, 38, 30, 24],
        controlsHTML: `
            <label class="nav-label">Cytogenetic Risk Profile</label>
            <select id="viale-risk" class="ee-select" onchange="runCalculation('viale')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Intermediate Risk</option>
                <option value="1.35">Poor/Complex Risk</option>
            </select>
        `,
        footer_note: "Standard of care for patients unfit for intensive chemotherapy. CR/CRi: 66.4% vs 28.3%."
    },
    relapstone: {
        category: "General Surgery",
        type: "calculated",
        shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE: Symptom Tracker",
        subtitle: "Surgery vs. Observational Management",
        source: "UEG Journal (2023)",
        color: "#0ea5e9",
        xAxisLabels: ['0', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m'],
        baseline: [1.0, 0.93, 0.86, 0.79, 0.76, 0.73, 0.71, 0.69, 0.67, 0.65, 0.64, 0.635, 0.63],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="calc-age" class="ee-select" onchange="runCalculation('relapstone')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">54 or younger</option>
                <option value="0.57">Over 54</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="calc-mult" onchange="runCalculation('relapstone')"> Multiple Stones?</label>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="calc-alt" onchange="runCalculation('relapstone')"> ALT > 35 U/L</label>
        `,
        footer_note: "Probability of remaining symptom-free. Cross-over rate from OM to LC was 36.7%."
    },
    inca: {
        category: "General Surgery",
        type: "calculated",
        shortName: "Hernia (INCA)",
        title: "INCA Trial: 12-Year Outcomes",
        subtitle: "Watchful Waiting vs. Crossover Probability",
        source: "INCA Trial (12-Year Follow-up)",
        color: "#142b45",
        xAxisLabels: ['0', '1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y', '9y', '10y', '11y', '12y'],
        baseCrossover: [0, 0.12, 0.22, 0.31, 0.39, 0.46, 0.51, 0.55, 0.58, 0.61, 0.63, 0.64, 0.642],
        controlsHTML: `
            <label class="nav-label">Initial Symptoms</label>
            <select id="ee-symptoms" class="ee-select" onchange="runCalculation('inca')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="none">Asymptomatic</option>
                <option value="mild">Mild Discomfort</option>
            </select>
            <label class="nav-label">Age at Diagnosis</label>
            <select id="ee-age" class="ee-select" onchange="runCalculation('inca')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="young">Under 65</option>
                <option value="old">65 or Older</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-top:15px; font-size:14px;"><input type="checkbox" id="ee-heavy" onchange="runCalculation('inca')"> High Physical Load?</label>
        `,
        footer_note: "Visualising the probability of moving from watchful waiting to surgery due to symptom progression."
    },
    reflux: {
        category: "General Surgery",
        type: "calculated",
        shortName: "GORD (REFLUX)",
        title: "REFLUX Trial: 5-Year Outcomes",
        subtitle: "Laparoscopic Fundoplication vs. Medical Management",
        source: "BMJ (5-Year Follow-up)",
        color: "#f59e0b",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_surg: [0, 88, 87, 86, 86, 86], 
        baseline_med: [0, 20, 19, 18, 18, 18],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="ref-age" class="ee-select" onchange="runCalculation('reflux')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Standard Risk (18-65)</option>
                <option value="0.85">Over 65</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="ref-bmi" onchange="runCalculation('reflux')"> BMI > 30 (Obesity)</label>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="ref-hernia" onchange="runCalculation('reflux')"> Large Hiatus Hernia Present</label>
        `,
        footer_note: "REFLUX (n=357) 5-year data. At 5 years, 14% of surgery patients required medication vs 82% of medical patients."
    },
    coda: {
        category: "General Surgery",
        type: "calculated",
        shortName: "Appendicitis (CODA)",
        title: "CODA Trial: Uncomplicated Appendicitis",
        subtitle: "Antibiotics-First vs. Appendectomy",
        source: "NEJM (2020/2021)",
        color: "#ef4444",
        xAxisLabels: ['0', '30 Days', '1 Year', '2 Years', '3 Years', '4 Years'],
        baseline_abx: [100, 89, 75, 70, 65, 61], 
        baseline_surg: [100, 100, 100, 100, 100, 100], 
        controlsHTML: `
            <div style="background:#fee2e2; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #ef4444;">
                <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; font-weight:800; color:#991b1b; font-size:14px;">
                    <input type="checkbox" id="coda-stone" onchange="runCalculation('coda')"> Appendicolith Present on CT?
                </label>
            </div>
            <label class="nav-label">Patient Preference</label>
            <select id="coda-pref" class="ee-select" onchange="runCalculation('coda')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Values Surgery Avoidance</option>
                <option value="1.2">Values Definitive Cure</option>
            </select>
        `,
        footer_note: "CODA (n=1552). Presence of an appendicolith dramatically increases the risk of antibiotic failure and 30-day readmission."
    },
    bariatrics: {
        category: "General Surgery",
        type: "calculated",
        shortName: "Bariatrics (STAMPEDE)",
        title: "Metabolic Surgery Outcomes",
        subtitle: "Gastric Bypass vs. Sleeve vs. Medical",
        source: "STAMPEDE Trial (NEJM 5-Year)",
        color: "#8b5cf6",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_bypass: [0, 29, 28, 28, 27, 27],
        baseline_sleeve: [0, 25, 24, 24, 23, 23],
        controlsHTML: `
            <label class="nav-label">Procedure Selected</label>
            <select id="bar-surg" class="ee-select" onchange="runCalculation('bariatrics')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1; font-weight:800; color:var(--brand-navy);">
                <option value="bypass">Roux-en-Y Gastric Bypass</option>
                <option value="sleeve">Sleeve Gastrectomy</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="bar-diab" onchange="runCalculation('bariatrics')"> Type 2 Diabetes Present</label>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;"><input type="checkbox" id="bar-bmi" onchange="runCalculation('bariatrics')"> Super-Obese (BMI > 50)</label>
        `,
        footer_note: "Chart displays expected Total Body Weight Loss % (TBWL). Bypass offers superior weight loss and glycemic control compared to sleeve."
    },
    protect: {
        category: "Urology",
        type: "calculated",
        shortName: "Prostate (ProtecT)",
        title: "ProtecT Trial: 15-Year Data",
        subtitle: "Active Surveillance vs. Prostatectomy",
        source: "NEJM 2023",
        color: "#3b82f6",
        xAxisLabels: ['0', '3y', '6y', '9y', '12y', '15y'],
        baseline_surv: [100, 98, 95, 93, 91, 90.6], 
        baseline_surg: [100, 99, 98, 97, 96, 95.3],
        controlsHTML: `
            <label class="nav-label">Tumour Grade (Gleason Score)</label>
            <select id="pro-gleason" class="ee-select" onchange="runCalculation('protect')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Gleason 6 (Low Risk)</option>
                <option value="1.4">Gleason 7+ (Intermediate/High)</option>
            </select>
            <label class="nav-label">PSA Level</label>
            <select id="pro-psa" class="ee-select" onchange="runCalculation('protect')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">PSA < 10 ng/mL</option>
                <option value="1.2">PSA 10-20 ng/mL</option>
            </select>
        `,
        footer_note: "ProtecT (n=1643). Prostate-cancer specific survival is ~97% across all arms at 15 years. Chart displays Metastasis-Free Survival."
    },
    topkat: {
        category: "Orthopaedics",
        type: "calculated",
        shortName: "Knees (TOPKAT)",
        title: "TOPKAT Trial: Knee Arthroplasty",
        subtitle: "Total (TKR) vs. Partial (UKR) Knee Replacement",
        source: "The Lancet 2019",
        color: "#14b8a6",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_tkr: [100, 99.5, 99, 98.8, 98.5, 98.2],
        baseline_ukr: [100, 98, 96.5, 95.5, 94.5, 94.0],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="top-age" class="ee-select" onchange="runCalculation('topkat')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Over 60</option>
                <option value="1.5">Under 60 (Higher physical demand)</option>
            </select>
        `,
        footer_note: "TOPKAT (n=528). Partial replacements (UKR) offer faster recovery but carry a slightly higher 5-year revision rate."
    },
    readiness: {
        category: "Peri-operative",
        type: "passport",
        shortName: "Readiness Passport",
        title: "Surgical Readiness Assessment",
        subtitle: "Clinical Optimisation & Risk Synthesis",
        source: "Rahman Medical Services",
        color: "#6facd5",
        controlsHTML: `
            <div id="readiness-inputs">
                <div class="rh-group">
                    <label class="rh-title">Patient Identification</label>
                    <input type="text" id="in-name" placeholder="Patient Initials / ID" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">1. Functional Capacity (DASI)</label>
                    <div class="rh-question-grid" style="font-size:13px;">
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="d-val" value="5.50"> Climb stairs / Walk up hill</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="d-val" value="8.00"> Run short distance</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="d-val" value="8.00"> Heavy housework (lifting)</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="d-val" value="7.50"> Strenuous sports (Swimming)</label>
                    </div>
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">2. Airway & Risk (STOP-BANG)</label>
                    <div class="rh-question-grid" style="font-size:13px;">
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="s-val"> Snore loudly?</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="s-val"> Often feel tired/fatigued?</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="s-val"> Observed apnea during sleep?</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" class="s-val" id="in-bmi"> BMI greater than 35?</label>
                    </div>
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">3. Optimisation Pillars</label>
                    <div class="rh-question-grid" style="font-size:13px;">
                        <label style="display:block; margin:8px 0;"><input type="checkbox" id="p-smoke"> Current Smoker / Vaper</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" id="p-diab"> Diabetes (HbA1c > 64)</label>
                        <label style="display:block; margin:8px 0;"><input type="checkbox" id="p-thin"> On Blood Thinners</label>
                    </div>
                </div>
                <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="processReadiness()">Process Clinical Narrative</button>
            </div>
        `,
        narrativeTemplate: `
            <div id="web-narrative-display" style="display:none; margin-top:30px;">
                <div style="background:var(--brand-navy); color:white; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="margin-top:0; color:#6facd5;">Clinical Narrative Summary</h3>
                    <p id="out-advice" style="font-size:1.1rem; line-height:1.5;"></p>
                </div>
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="evidence-card">
                        <div class="stat-label">Functional Capacity</div>
                        <div id="out-mets" class="stat-main">--</div>
                        <div class="stat-label">METs (Threshold > 4.0)</div>
                    </div>
                    <div class="evidence-card">
                        <div class="stat-label">Anaesthetic Risk</div>
                        <div id="out-sb" class="stat-main">--</div>
                        <div class="stat-label">STOP-BANG Score</div>
                    </div>
                </div>
                <div id="out-pillars" style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px; font-size:0.9rem;"></div>
                <button class="nav-btn active" style="margin-top:20px; width:100%; background:#10b981;" onclick="exportToPDF('Readiness-Passport')">Download Official Passport (PDF)</button>
            </div>
        `,
        footer_note: "Clinical synthesis of patient-reported metrics via the Duke Activity Status Index (DASI)."
    },
    recovery: {
        category: "Peri-operative",
        type: "calculated",
        shortName: "Recovery Passport",
        title: "Predictive Recovery Passport",
        subtitle: "Procedure-Specific ERAS Trajectories",
        source: "ERAS Society Outcomes Database",
        color: "#10b981", 
        xAxisLabels: ['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 21', 'Day 28', '6 Weeks'],
        baselines: {
            lap_minor: [5, 20, 60, 85, 95, 100, 100], 
            lap_major: [0, 10, 30, 60, 80, 90, 95],   
            open_major: [0, 0, 10, 25, 45, 60, 80]    
        },
        controlsHTML: `
            <label class="nav-label">Procedure Conducted</label>
            <select id="rec-surgery" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1; font-weight:bold; color:var(--brand-navy);">
                <option value="lap_minor">Lap Cholecystectomy / Hernia</option>
                <option value="lap_major">Lap Fundoplication / Bariatric</option>
                <option value="open_major">Major Open (Esophagectomy/Bowel)</option>
            </select>
            <label class="nav-label">Occupational / Daily Load</label>
            <select id="rec-job" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Desk / Sedentary</option>
                <option value="0.7">Light Manual</option>
                <option value="0.4">Heavy Manual Labor</option>
            </select>
            <label class="nav-label">Pre-op Fitness (From Readiness)</label>
            <select id="rec-fit" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.1">High (METs > 4)</option>
                <option value="0.8">Low (METs < 4) / Frail</option>
            </select>
            <div style="margin-top:20px; padding:15px; background:white; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <div id="rec-milestone" style="font-size:1.8rem; font-weight:800; color:#10b981;">Day 14</div>
                <div class="stat-label">Est. 50% Functional Recovery</div>
            </div>
        `,
        footer_note: "Predictive model indexing ERAS protocol baselines against occupational load and pre-operative functional reserve."
    }
};    },
    inca: {
        category: "General Surgery",
        type: "calculated",
        shortName: "Hernia (INCA)",
        title: "INCA Trial: 12-Year Outcomes",
        subtitle: "Watchful Waiting vs. Crossover Probability",
        source: "INCA Trial (12-Year Follow-up)",
        color: "#142b45",
        xAxisLabels: ['0', '1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y', '9y', '10y', '11y', '12y'],
        baseCrossover: [0, 0.12, 0.22, 0.31, 0.39, 0.46, 0.51, 0.55, 0.58, 0.61, 0.63, 0.64, 0.642],
        controlsHTML: `
            <label class="nav-label">Initial Symptoms</label>
            <select id="ee-symptoms" class="ee-select" onchange="runCalculation('inca')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="none">Asymptomatic</option>
                <option value="mild">Mild Discomfort</option>
            </select>
            <label class="nav-label">Age at Diagnosis</label>
            <select id="ee-age" class="ee-select" onchange="runCalculation('inca')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="young">Under 65</option>
                <option value="old">65 or Older</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-top:15px; font-size:14px;"><input type="checkbox" id="ee-heavy" onchange="runCalculation('inca')"> High Physical Load?</label>
        `,
        footer_note: "Visualising the probability of moving from watchful waiting to surgery due to symptom progression."
    },
 readiness: {
        category: "Peri-operative",
        type: "passport",
        shortName: "Readiness Passport",
        title: "Surgical Readiness Assessment",
        subtitle: "Clinical Optimisation & Risk Synthesis",
        source: "Rahman Medical Services",
        color: "#6facd5",
        controlsHTML: `
            <div id="readiness-inputs">
                <div class="rh-group">
                    <label class="rh-title">Patient Identification</label>
                    <input type="text" id="in-name" placeholder="Patient Initials / ID" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                </div>

                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">1. Functional Capacity (DASI)</label>
                    <div class="rh-question-grid">
                        <label><input type="checkbox" class="d-val" value="5.50"> Climb stairs / Walk up hill</label>
                        <label><input type="checkbox" class="d-val" value="8.00"> Run short distance</label>
                        <label><input type="checkbox" class="d-val" value="8.00"> Heavy housework (lifting)</label>
                        <label><input type="checkbox" class="d-val" value="7.50"> Strenuous sports (Swimming/Tennis)</label>
                    </div>
                </div>

                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">2. Airway & Risk (STOP-BANG)</label>
                    <div class="rh-question-grid">
                        <label><input type="checkbox" class="s-val"> Snore loudly?</label>
                        <label><input type="checkbox" class="s-val"> Often feel tired/fatigued?</label>
                        <label><input type="checkbox" class="s-val"> Observed apnea during sleep?</label>
                        <label><input type="checkbox" class="s-val" id="in-bmi"> BMI greater than 35?</label>
                    </div>
                </div>

                <div class="rh-group" style="margin-top:20px;">
                    <label class="rh-title">3. Optimisation Pillars</label>
                    <div class="rh-question-grid">
                        <label><input type="checkbox" id="p-smoke"> Current Smoker / Vaper</label>
                        <label><input type="checkbox" id="p-diab"> Diabetes (HbA1c > 64)</label>
                        <label><input type="checkbox" id="p-thin"> On Blood Thinners</label>
                    </div>
                </div>

                <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="processReadiness()">Process Clinical Narrative</button>
            </div>
        `,
        // This is the container where the visible narrative will be injected
        narrativeTemplate: `
            <div id="web-narrative-display" style="display:none; margin-top:30px; animation: fadeIn 0.5s ease;">
                <div style="background:var(--primary); color:white; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="margin-top:0; color:#6facd5;">Clinical Narrative Summary</h3>
                    <p id="out-advice" style="font-size:1.1rem; line-height:1.5;"></p>
                </div>
                
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="evidence-card">
                        <div class="stat-label">Functional Capacity</div>
                        <div id="out-mets" class="stat-main">--</div>
                        <div class="stat-label">METs (Threshold > 4.0)</div>
                    </div>
                    <div class="evidence-card">
                        <div class="stat-label">Anaesthetic Risk</div>
                        <div id="out-sb" class="stat-main">--</div>
                        <div class="stat-label">STOP-BANG Score</div>
                    </div>
                </div>

                <div id="out-pillars" style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px; font-size:0.9rem;"></div>
                
                <button class="nav-btn active" style="margin-top:20px; width:100%; background:#10b981;" onclick="exportToPDF('Readiness-Passport')">Download Official Passport (PDF)</button>
            </div>
        `,
        footer_note: "Clinical synthesis of patient-reported metrics via the Duke Activity Status Index (DASI). (c) 2026 Rahman Medical Services."
    },
   recovery: {
        category: "Peri-operative",
        type: "calculated",
        shortName: "Recovery Passport",
        title: "Predictive Recovery Passport",
        subtitle: "Procedure-Specific ERAS Trajectories",
        source: "ERAS Society Outcomes Database",
        color: "#10b981", 
        xAxisLabels: ['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 21', 'Day 28', '6 Weeks'],
        baselines: {
            lap_minor: [5, 20, 60, 85, 95, 100, 100], 
            lap_major: [0, 10, 30, 60, 80, 90, 95],   
            open_major: [0, 0, 10, 25, 45, 60, 80]    
        },
        controlsHTML: `
            <label class="nav-label">Procedure Conducted</label>
            <select id="rec-surgery" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1; font-weight:bold; color:var(--brand-navy);">
                <option value="lap_minor">Lap Cholecystectomy / Hernia</option>
                <option value="lap_major">Lap Fundoplication / Bariatric</option>
                <option value="open_major">Major Open (Esophagectomy/Bowel)</option>
            </select>
            
            <label class="nav-label">Occupational / Daily Load</label>
            <select id="rec-job" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Desk / Sedentary</option>
                <option value="0.7">Light Manual</option>
                <option value="0.4">Heavy Manual Labor</option>
            </select>
            
            <label class="nav-label">Pre-op Fitness (From Readiness)</label>
            <select id="rec-fit" class="ee-select" onchange="runCalculation('recovery')" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.1">High (METs > 4)</option>
                <option value="0.8">Low (METs < 4) / Frail</option>
            </select>
            
            <label class="nav-label" style="margin-top:15px; border-bottom:1px solid #cbd5e1; padding-bottom:5px;">Practical Milestones</label>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                    <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:bold;">Driving</div>
                    <div id="rec-driving" style="font-size:1.1rem; font-weight:800; color:#10b981; margin-top:5px;">--</div>
                </div>
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                    <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:bold;">Lifting >10kg</div>
                    <div id="rec-lifting" style="font-size:1.1rem; font-weight:800; color:#10b981; margin-top:5px;">--</div>
                </div>
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                    <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:bold;">Intimacy</div>
                    <div id="rec-sex" style="font-size:1.1rem; font-weight:800; color:#10b981; margin-top:5px;">--</div>
                </div>
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                    <div style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:bold;">Alcohol</div>
                    <div id="rec-alcohol" style="font-size:0.9rem; font-weight:800; color:#10b981; margin-top:5px;">--</div>
                </div>
            </div>
        `,
        footer_note: "Milestones are clinical estimates. Driving requires ability to perform an emergency stop without pain distraction. Alcohol must be avoided while on prescription opioids."
    },
cataract: {
        category: "Ophthalmology",
        type: "calculated",
        shortName: "Cataract (NOD)",
        title: "National Ophthalmology Database",
        subtitle: "Cataract Surgery Risk & Visual Recovery",
        source: "RCOphth NOD Data",
        color: "#eab308", // Yellow/Gold
        xAxisLabels: ['Pre-Op', '1 Week', '4 Weeks', '3 Months', '6 Months', '12 Months'],
        // Baseline Probability of achieving/maintaining good visual acuity (6/12 or better)
        baseline_success: [20, 85, 95, 96, 96, 96],
        controlsHTML: `
            <div style="background:#fef3c7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #eab308;">
                <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; font-weight:800; color:#b45309; font-size:14px;">
                    <input type="checkbox" id="cat-alpha" onchange="runCalculation('cataract')"> Alpha-Blockers (e.g., Tamsulosin)?
                </label>
            </div>
            <label class="nav-label">Age Cohort</label>
            <select id="cat-age" class="ee-select" onchange="runCalculation('cataract')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Under 80</option>
                <option value="0.95">80 or Older</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;">
                <input type="checkbox" id="cat-diab" onchange="runCalculation('cataract')"> Diabetic Retinopathy Present
            </label>
        `,
        footer_note: "Alpha-blockers highly increase the risk of Intraoperative Floppy Iris Syndrome (IFIS) and Posterior Capsule Rupture (PCR), blunting visual recovery."
    },

    eclipse: {
        category: "Gynaecology",
        type: "calculated",
        shortName: "HMB (ECLIPSE)",
        title: "ECLIPSE Trial: 10-Year Data",
        subtitle: "Mirena Coil (LNG-IUS) vs. Hysterectomy",
        source: "The Lancet (10-Year Follow-up)",
        color: "#ec4899", // Pink
        xAxisLabels: ['Baseline', '1 Year', '2 Years', '5 Years', '10 Years'],
        // Menorrhagia Multi-Attribute Scale (MMAS) - Quality of Life Score 0-100
        baseline_hyst: [30, 95, 96, 96, 97],
        baseline_mirena: [30, 85, 82, 80, 78],
        controlsHTML: `
            <label class="nav-label">Primary Intervention</label>
            <select id="gyn-path" class="ee-select" onchange="runCalculation('eclipse')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1; font-weight:800; color:var(--brand-navy);">
                <option value="mirena">Mirena Coil (LNG-IUS)</option>
                <option value="hyst">Surgical Hysterectomy</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;">
                <input type="checkbox" id="gyn-fibroid" onchange="runCalculation('eclipse')"> Large Uterine Fibroids Present
            </label>
        `,
        footer_note: "ECLIPSE tracks Quality of Life (MMAS). Hysterectomy offers immediate definitive cure; Mirena offers high QoL without surgical risk, though ~40% cross over to surgery by 10 years."
    },

    nature: {
        category: "ENT",
        type: "calculated",
        shortName: "Tonsils (NAtuRE)",
        title: "Adult Tonsillectomy Outcomes",
        subtitle: "Surgery vs. Conservative Management",
        source: "The Lancet / NAtuRE Cohort",
        color: "#14b8a6", // Teal
        xAxisLabels: ['Baseline', '6m', '12m', '18m', '24m'],
        // Probability of remaining Episode-Free
        baseline_surg: [100, 95, 92, 90, 88],
        baseline_cons: [100, 60, 45, 35, 30],
        controlsHTML: `
            <label class="nav-label">Baseline Episode Frequency</label>
            <select id="ent-freq" class="ee-select" onchange="runCalculation('nature')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                <option value="1.0">Standard Protocol (5-7 episodes/yr)</option>
                <option value="0.8">High Frequency (>7 episodes/yr)</option>
            </select>
            <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:14px;">
                <input type="checkbox" id="ent-smoke" onchange="runCalculation('nature')"> Current Smoker
            </label>
        `,
        footer_note: "Smokers face a statistically higher risk of secondary post-operative haemorrhage and delayed mucosal healing."
    }
};
