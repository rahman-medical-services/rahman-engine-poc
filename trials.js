/**
 * OutcomeLogic™ Master Evidence Ledger
 * (c) 2026 Rahman Medical Services Limited
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
        color: "#8e44ad", // Purple for Haematology
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
    }
};
