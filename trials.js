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
        subtitle: "DASI / STOP-BANG Clinical Optimisation",
        source: "Rahman Medical Services",
        color: "#6facd5",
        controlsHTML: `
            <div class="rh-group">
                <label class="rh-title">Functional Capacity (DASI)</label>
                <div class="rh-question" style="display:flex; justify-content:space-between; margin:8px 0; font-size:13px;">
                    <label>Climb a flight of stairs?</label><input type="checkbox" class="d-val" value="5.50">
                </div>
                <div class="rh-question" style="display:flex; justify-content:space-between; margin:8px 0; font-size:13px;">
                    <label>Strenuous sports / Swimming?</label><input type="checkbox" class="d-val" value="7.50">
                </div>
            </div>
            <div class="rh-group" style="margin-top:20px;">
                <label class="rh-title">Anaesthetic Risk (STOP-BANG)</label>
                <div class="rh-question" style="display:flex; justify-content:space-between; margin:8px 0; font-size:13px;">
                    <label>Snore loudly?</label><input type="checkbox" class="s-val">
                </div>
                <div class="rh-question" style="display:flex; justify-content:space-between; margin:8px 0; font-size:13px;">
                    <label>BMI > 35?</label><input type="checkbox" class="s-val">
                </div>
            </div>
        `,
        previewPlaceholder: `
            <div style="background:#f8fafc; padding:30px; border:1px dashed #cbd5e1; border-radius:12px; text-align:center;">
                <h3 style="color:#142b45;">Digital Passport Preview</h3>
                <p style="color:#64748b; font-size:0.9rem;">Patient optimisation metrics will be synthesised into a downloadable PDF summary for anaesthetic review.</p>
            </div>
        `,
        footer_note: "Based on the Duke Activity Status Index. Functional reserve (METs > 4.0) is a key peri-operative predictor."
    }
};
