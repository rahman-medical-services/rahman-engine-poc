
/**
 * OutcomeLogic™ Master Evidence Ledger v4.5 (V2.0 Regulatory Compliant Build)
 * (c) 2026 OutcomeLogic Ltd / Rahman Medical Services Limited. All Rights Reserved.
 * NOTE: Operates strictly as a reference data synthesizer. Not a Medical Device.
 */

const TRIAL_DATA = {
    // ---------------------------------------------------------
    // 1. WAITLIST TRIAGE & DEFLECTION 
    // ---------------------------------------------------------
    relapstone: {
        category: "Waitlist Triage & Deflection", type: "calculated", shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE: Symptom Tracker", subtitle: "Observational Management Trajectory",
        source: "UEG Journal (2023)", color: "#0ea5e9",
        xAxisLabels: ['0', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m'],
        baseline: [1.0, 0.93, 0.86, 0.79, 0.76, 0.73, 0.71, 0.69, 0.67, 0.65, 0.64, 0.635, 0.63],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="calc-age" class="ee-select" onchange="runCalculation('relapstone')">
                <option value="1.0">54 or younger</option><option value="0.57">Over 54</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="calc-mult" onchange="runCalculation('relapstone')"> Multiple Stones?</label>
            <label class="ee-check-group"><input type="checkbox" id="calc-alt" onchange="runCalculation('relapstone')"> ALT > 35 U/L</label>
        `,
        footer_note: "Statistical probability of remaining symptom-free. Not a clinical recommendation.",
        calculate: function() {
            const ageMod = parseFloat(document.getElementById('calc-age')?.value) || 1;
            const multStones = document.getElementById('calc-mult')?.checked;
            const altHigh = document.getElementById('calc-alt')?.checked;
            
            const hrTotal = ageMod * (multStones ? 1.19 : 1.0) * (altHigh ? 1.22 : 1.0);
            const prob12m = Math.pow(this.baseline[12], hrTotal) * 100;

            const synth = `OUTCOMELOGIC SYNTHESIS (RELAPSTONE): Based on trial modeling, the statistical probability of remaining symptom-free at 12 months is ${prob12m.toFixed(0)}%. Input Profile: ${ageMod === 1.0 ? 'Under 54' : 'Over 54'}, ${multStones ? 'Multiple stones' : 'Single stone'}, ${altHigh ? 'Elevated ALT' : 'Normal ALT'}.`;

            return {
                primaryData: this.baseline.map(s => Math.pow(s, hrTotal) * 100),
                secondaryData: this.baseline.map(s => s * 100),
                primaryLabel: "Selected Patient Profile", secondaryLabel: "Standard Cohort Average",
                labelY: "Probability of Pain-Free (%)",
                synthesisText: synth 
            };
        }
    },

    inca: {
        category: "Waitlist Triage & Deflection", type: "calculated", shortName: "Hernia (INCA)",
        title: "INCA Trial: 12-Year Outcomes", subtitle: "Watchful Waiting vs. Crossover Probability",
        source: "INCA Trial (12-Year Follow-up)", color: "#142b45",
        xAxisLabels: ['0', '1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y', '9y', '10y', '11y', '12y'],
        baseCrossover: [0, 0.12, 0.22, 0.31, 0.39, 0.46, 0.51, 0.55, 0.58, 0.61, 0.63, 0.64, 0.642],
        controlsHTML: `
            <label class="nav-label">Initial Symptoms</label>
            <select id="ee-symptoms" class="ee-select" onchange="runCalculation('inca')">
                <option value="none">Asymptomatic</option><option value="mild">Mild Discomfort</option>
            </select>
            <label class="nav-label">Age at Diagnosis</label>
            <select id="ee-age" class="ee-select" onchange="runCalculation('inca')">
                <option value="young">Under 65</option><option value="old">65 or Older</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="ee-heavy" onchange="runCalculation('inca')"> High Physical Load?</label>
        `,
        footer_note: "Model applies hazard ratios (HR) to baseline INCA crossover data. For reference only.",
        calculate: function() {
            const symp = document.getElementById('ee-symptoms')?.value || 'none';
            const age = document.getElementById('ee-age')?.value || 'young';
            const heavy = document.getElementById('ee-heavy')?.checked;

            const hr = (symp === 'mild' ? 1.45 : 1.0) * (age === 'old' ? 1.25 : 1.0) * (heavy ? 1.30 : 1.0);
            const risk12y = (1 - Math.pow((1 - 0.642), hr)) * 100;

            const synth = `OUTCOMELOGIC SYNTHESIS (INCA): 12-Year surgical crossover probability is calculated at ${risk12y.toFixed(0)}%. Input Profile: ${age === 'old' ? 'Over 65' : 'Under 65'}, ${symp === 'mild' ? 'Mild Symptoms' : 'Asymptomatic'}, ${heavy ? 'High physical load' : 'Standard load'}. Patient has been provided with observational trajectory data.`;

            return {
                primaryData: this.baseCrossover.map(val => (1 - Math.pow((1 - val), hr)) * 100),
                secondaryData: this.baseCrossover.map(v => v * 100),
                primaryLabel: "Adjusted Crossover Rate", secondaryLabel: "Baseline Trial Average",
                labelY: "Surgery Probability (%)",
                synthesisText: synth 
            };
        }
    },

    // ---------------------------------------------------------
    // 2. SHARED DECISION MAKING
    // ---------------------------------------------------------
    reflux: {
        category: "Shared Decision Making", type: "calculated", shortName: "GORD (REFLUX)",
        title: "REFLUX Trial: 5-Year Outcomes", subtitle: "Laparoscopic Fundoplication vs. Medical Management",
        source: "BMJ (5-Year Follow-up)", color: "#f59e0b",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_surg: [0, 88, 87, 86, 86, 86], baseline_med: [0, 20, 19, 18, 18, 18],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="ref-age" class="ee-select" onchange="runCalculation('reflux')">
                <option value="1.0">Standard Risk (18-65)</option><option value="0.85">Over 65</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="ref-bmi" onchange="runCalculation('reflux')"> BMI > 30 (Obesity)</label>
            <label class="ee-check-group"><input type="checkbox" id="ref-hernia" onchange="runCalculation('reflux')"> Large Hiatus Hernia</label>
        `,
        footer_note: "REFLUX cohort observation. Demonstrates long-term medication avoidance probability.",
        calculate: function() {
            const riskMod = (document.getElementById('ref-bmi')?.checked ? 0.90 : 1.0) * (document.getElementById('ref-hernia')?.checked ? 0.85 : 1.0) * (parseFloat(document.getElementById('ref-age')?.value) || 1.0);
            return {
                primaryData: this.baseline_surg.map(s => s * riskMod),
                secondaryData: this.baseline_med,
                primaryLabel: "Fundoplication (Surgery)", secondaryLabel: "Medical Management (PPI)",
                labelY: "Probability off PPI Medication (%)"
            };
        }
    },

    // ---------------------------------------------------------
    // 3. PERI-OPERATIVE PLANNING
    // ---------------------------------------------------------
    readiness: {
        category: "Peri-operative Planning", type: "passport", shortName: "Readiness Passport",
        title: "Surgical Readiness Assessment", subtitle: "Objective Risk Metric Synthesis",
        source: "Standardized Scoring (DASI, STOP-BANG)", color: "#6facd5",
        controlsHTML: `
            <div id="readiness-inputs">
                <div class="rh-group">
                    <label class="nav-label">1. Functional Capacity (DASI)</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="5.50"> Climb stairs / Walk up hill</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="8.00"> Run short distance</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="8.00"> Heavy housework (lifting)</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="7.50"> Strenuous sports (Swimming)</label>
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="nav-label">2. Airway & Risk (STOP-BANG)</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (S) Snore loudly?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (T) Tired/fatigued?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (O) Observed apnea?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (P) High blood pressure?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val" id="in-bmi"> (B) BMI > 35?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (A) Age > 50?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (N) Neck > 16in/40cm?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> (G) Gender: Male?</label>
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="nav-label">3. Clinical Modifiers</label>
                    <label class="ee-check-group"><input type="checkbox" id="p-smoke"> Current Smoker / Vaper</label>
                    <label class="ee-check-group"><input type="checkbox" id="p-diab"> Diabetes (HbA1c > 64)</label>
                    <label class="ee-check-group"><input type="checkbox" id="p-thin"> On Blood Thinners</label>
                </div>
                <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="runCalculation('readiness')">Synthesize Metrics</button>
            </div>
        `,
        narrativeTemplate: `
            <div id="web-narrative-display" style="display:none; margin-top:30px;">
                <div style="background:var(--brand-navy); color:white; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="margin-top:0; color:#6facd5;">Statistical Risk Profile</h3>
                    <p id="out-advice" style="font-size:1.1rem; line-height:1.5;"></p>
                </div>
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="evidence-card"><div class="stat-label">Calculated Capacity</div><div id="out-mets" class="stat-main">--</div><div class="stat-label">METs</div></div>
                    <div class="evidence-card"><div class="stat-label">Airway Risk Score</div><div id="out-sb" class="stat-main">--</div><div class="stat-label">STOP-BANG</div></div>
                </div>
                <div id="out-pillars" style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px; font-size:0.9rem; line-height: 1.6;"></div>
            </div>
        `,
        footer_note: "Values aggregate patient-reported metrics into standard DASI and STOP-BANG scoring systems.",
        calculate: function() {
            let dasi = 0; document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
            let mets = ((0.43 * dasi) + 9.6) / 3.5;
            let sb = 0; document.querySelectorAll('.s-val:checked').forEach(i => sb += 1);

            let pHTML = "<strong>Identified Clinical Modifiers:</strong><br>";
            if (document.getElementById('p-smoke')?.checked) pHTML += "• Active Smoking Status (Associated with altered respiratory risk).<br>";
            if (document.getElementById('p-diab')?.checked) pHTML += "• Elevated HbA1c Status.<br>";
            if (document.getElementById('p-thin')?.checked) pHTML += "• Active Anticoagulant Therapy.<br>";
            if (document.getElementById('in-bmi')?.checked) pHTML += "• BMI > 35 (Associated with increased procedural complexity).<br>";
            if (pHTML === "<strong>Identified Clinical Modifiers:</strong><br>") pHTML = "No additional clinical modifiers identified from selection.";

            document.getElementById('initial-message').style.display = 'none';
            document.getElementById('web-narrative-display').style.display = 'block';
            document.getElementById('out-mets').innerText = mets.toFixed(1);
            document.getElementById('out-sb').innerText = sb + "/8";
            document.getElementById('out-pillars').innerHTML = pHTML;

            let advice = (mets >= 4 && sb < 3 && !document.getElementById('in-bmi')?.checked) 
                ? "Calculated profile (METs ≥ 4, STOP-BANG < 3) aligns statistically with standard baseline risk thresholds for elective procedures."
                : "Calculated profile indicates variables (e.g., METs < 4, elevated STOP-BANG, or BMI > 35) statistically associated with complex perioperative pathways.";
            document.getElementById('out-advice').innerText = advice;

            return { synthesisText: `OUTCOMELOGIC READINESS: METs ${mets.toFixed(1)}, STOP-BANG ${sb}/8. ${advice}` }; 
        }
    },

    // ---------------------------------------------------------
    // 4. PRECISION ONCOLOGY
    // ---------------------------------------------------------
    esopec: {
        category: "Precision Oncology", type: "calculated", shortName: "Esophageal (ESOPEC)",
        title: "ESOPEC: Clinical Modeling", subtitle: "Perioperative FLOT vs. Neoadjuvant CROSS",
        source: "ASCO 2024 / NEJM", color: "#2563eb",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_flot: [100, 88, 75, 66, 62, 59], baseline_cross: [100, 78, 55, 48, 42, 38],
        controlsHTML: `
            <label class="nav-label">Clinical N-Stage</label>
            <select id="eso-nstage" class="ee-select" onchange="runCalculation('esopec')">
                <option value="1.0">cN0 (Node Negative)</option><option value="1.25">cN+ (Node Positive)</option>
            </select>
            <label class="nav-label">Age Cohort</label>
            <select id="eso-age" class="ee-select" onchange="runCalculation('esopec')">
                <option value="1.0">Under 65</option><option value="1.1">65 or Older</option>
            </select>
        `,
        footer_note: "Survival curves modeled via mathematical Hazard Ratios (HR) derived from the ESOPEC 2024 primary analysis.",
        calculate: function() {
            const hr = (parseFloat(document.getElementById('eso-nstage')?.value) || 1) * (parseFloat(document.getElementById('eso-age')?.value) || 1);
            return {
                primaryData: this.baseline_flot.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_cross.map(s => Math.pow(s/100, hr) * 100),
                primaryLabel: "Perioperative FLOT", secondaryLabel: "Neoadjuvant CROSS",
                labelY: "Overall Survival (%)"
            };
        }
    },

    // ---------------------------------------------------------
    // 6. CLINICAL PRACTICE TOOLS (Direct Clinical Care)
    // ---------------------------------------------------------
    oakland: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "LGIB (Oakland)",
        title: "Lower GI Bleed Triage", subtitle: "Oakland Score for Safe Discharge",
        source: "Oakland K, et al. Lancet Gastroenterol Hepatol (2017)", color: "#dc2626",
        controlsHTML: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label class="nav-label">Age</label>
                    <select id="oak-age" class="ee-select" onchange="runCalculation('oakland')">
                        <option value="0">< 40</option><option value="1" selected>40 - 69</option><option value="2">≥ 70</option>
                    </select>
                    <label class="nav-label">Gender</label>
                    <select id="oak-gender" class="ee-select" onchange="runCalculation('oakland')">
                        <option value="0">Female</option><option value="1">Male</option>
                    </select>
                    <label class="nav-label">Systolic BP</label>
                    <select id="oak-bp" class="ee-select" onchange="runCalculation('oakland')">
                        <option value="5">< 90</option><option value="4">90-119</option><option value="3" selected>120-129</option><option value="2">130-159</option><option value="0">≥ 160</option>
                    </select>
                </div>
                <div>
                    <label class="nav-label">Heart Rate (HR)</label>
                    <select id="oak-hr" class="ee-select" onchange="runCalculation('oakland')">
                        <option value="0">< 70</option><option value="1" selected>70-89</option><option value="2">90-109</option><option value="3">≥ 110</option>
                    </select>
                    <label class="nav-label">Hemoglobin (Hb)</label>
                    <select id="oak-hb" class="ee-select" onchange="runCalculation('oakland')">
                        <option value="22">< 70</option><option value="17">70-89</option><option value="13">90-109</option><option value="8">110-129</option><option value="4" selected>130-159</option><option value="0">≥ 160</option>
                    </select>
                    <label class="ee-check-group" style="margin-top:20px;"><input type="checkbox" id="oak-prev" onchange="runCalculation('oakland')"> Previous admission with LGIB</label>
                    <label class="ee-check-group"><input type="checkbox" id="oak-dre" onchange="runCalculation('oakland')"> Blood on DRE</label>
                </div>
            </div>
        `,
        footer_note: "ACPGBI Guidelines recommend Oakland scoring to stratify risk of intervention or rebleeding.",
        calculate: function() {
            const age = parseInt(document.getElementById('oak-age')?.value) || 0;
            const gender = parseInt(document.getElementById('oak-gender')?.value) || 0;
            const bp = parseInt(document.getElementById('oak-bp')?.value) || 0;
            const hr = parseInt(document.getElementById('oak-hr')?.value) || 0;
            const hb = parseInt(document.getElementById('oak-hb')?.value) || 0;
            const prev = document.getElementById('oak-prev')?.checked ? 1 : 0;
            const dre = document.getElementById('oak-dre')?.checked ? 1 : 0;

            const score = age + gender + bp + hr + hb + prev + dre;
            
            let htmlOut = `<strong>Oakland Score: ${score} / 35</strong><br>`;
            let colorOut = "#dc2626";
            
            if (score <= 8) {
                htmlOut += `<span style="color:#16a34a;"><strong>< 5% risk</strong> of rebleeding, transfusion, or readmission. Supports discharge and outpatient investigation.</span>`;
                colorOut = "#16a34a";
            } else {
                htmlOut += `<span style="color:#dc2626;"><strong>Unacceptably high risk</strong> of rebleeding, transfusion, or therapeutic intervention. Supports inpatient investigation.</span>`;
            }

            return {
                chartType: 'bar', customXLabels: ["Calculated Patient Score", "Safe Discharge Threshold"],
                primaryData: [score, 0], secondaryData: [0, 8],
                primaryLabel: "Oakland Score", secondaryLabel: "Threshold (≤ 8)",
                labelY: "Points", yMax: 35,
                outputHTML: htmlOut, outputColor: colorOut
            };
        }
    },

    tokyo: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "Cholecystitis (Tokyo)",
        title: "Acute Cholecystitis Risk", subtitle: "Tokyo Guidelines (TG18) Severity Grading",
        source: "Okamoto K, et al. J Hepatobiliary Pancreat Sci (2018)", color: "#d97706",
        controlsHTML: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label class="nav-label">Surgical Fitness</label>
                    <select id="tg-asa" class="ee-select" onchange="runCalculation('tokyo')">
                        <option value="1">ASA 1-2 (Healthy/Mild)</option><option value="3">ASA 3+ (Severe systemic)</option>
                    </select>
                    <label class="nav-label">Charlson Comorbidity Index (CCI)</label>
                    <input type="number" id="tg-cci" class="ee-select" value="0" min="0" oninput="runCalculation('tokyo')">
                </div>
                <div>
                    <label class="nav-label">Severity Indicators</label>
                    <label class="ee-check-group"><input type="checkbox" id="tg-organ" onchange="runCalculation('tokyo')"> Organ Failure (CV, Neuro, Resp, Renal)</label>
                    <label class="ee-check-group"><input type="checkbox" id="tg-wcc" onchange="runCalculation('tokyo')"> WCC > 18</label>
                    <label class="ee-check-group"><input type="checkbox" id="tg-mass" onchange="runCalculation('tokyo')"> Palpable RUQ Mass</label>
                    <label class="ee-check-group"><input type="checkbox" id="tg-dur" onchange="runCalculation('tokyo')"> Symptoms > 72 hours</label>
                    <label class="ee-check-group"><input type="checkbox" id="tg-inf" onchange="runCalculation('tokyo')"> Marked local inflammation (e.g. gangrenous)</label>
                </div>
            </div>
        `,
        footer_note: "TG18 composite grading used to determine safety of early laparoscopic cholecystectomy vs conservative optimization.",
        calculate: function() {
            const asa = parseInt(document.getElementById('tg-asa')?.value) || 1;
            const cci = parseInt(document.getElementById('tg-cci')?.value) || 0;
            
            const organF = document.getElementById('tg-organ')?.checked;
            const modRisk = document.getElementById('tg-wcc')?.checked || document.getElementById('tg-mass')?.checked || document.getElementById('tg-dur')?.checked || document.getElementById('tg-inf')?.checked;

            let grade = "Grade 1"; let gradeNum = 1;
            if (organF) { grade = "Grade 3"; gradeNum = 3; }
            else if (modRisk) { grade = "Grade 2"; gradeNum = 2; }

            let risk = "High";
            if ((grade === "Grade 1" || grade === "Grade 2") && asa < 3 && cci < 6) { risk = "Low"; }
            if (grade === "Grade 3" && asa < 3 && cci < 4) { risk = "Low"; }

            let outHTML = `<strong>Tokyo Classification: ${grade}</strong><br>`;
            if (risk === 'Low' && grade === 'Grade 1') outHTML += `Low risk of adverse outcome. Laparoscopic cholecystectomy advisable.`;
            else if (risk === 'Low' && grade === 'Grade 2') outHTML += `Intermediate risk of adverse outcome. Consider subtotal/fundus-first approach.`;
            else if (risk === 'Low' && grade === 'Grade 3') outHTML += `High risk of adverse outcome. Pre-optimize and strongly consider early subtotal/conversion if operating.`;
            else outHTML += `High risk of adverse outcome. Consider pre-optimization and/or definitive non-operative management.`;

            return {
                chartType: 'bar', customXLabels: ["Severity Grade"],
                primaryData: [gradeNum], secondaryData: [0],
                primaryLabel: "Calculated Grade", secondaryLabel: "Baseline",
                labelY: "TG18 Grade", yMax: 3,
                outputHTML: outHTML, outputColor: risk === 'Low' ? '#16a34a' : '#d97706'
            };
        }
    },

    gbs: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "UGI Bleed (GBS)",
        title: "Upper GI Bleed Risk", subtitle: "Glasgow-Blatchford Score (GBS)",
        source: "Blatchford O, et al. Lancet (2000)", color: "#8b5cf6",
        controlsHTML: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label class="nav-label">Urea</label>
                    <select id="gbs-urea" class="ee-select" onchange="runCalculation('gbs')">
                        <option value="0">< 6.5</option><option value="2">6.5 - 8</option><option value="3">8 - 10</option><option value="4">10 - 25</option><option value="6">> 25</option>
                    </select>
                    <label class="nav-label">Hemoglobin (Hb)</label>
                    <select id="gbs-hb" class="ee-select" onchange="runCalculation('gbs')">
                        <option value="0">> 130</option><option value="1">120 - 130</option><option value="3">100 - 120</option><option value="6">< 100</option>
                    </select>
                    <label class="nav-label">Systolic BP</label>
                    <select id="gbs-bp" class="ee-select" onchange="runCalculation('gbs')">
                        <option value="0">> 109</option><option value="1">100 - 109</option><option value="2">90 - 99</option><option value="3">< 90</option>
                    </select>
                </div>
                <div>
                    <label class="ee-check-group" style="margin-top:25px;"><input type="checkbox" id="gbs-male" onchange="runCalculation('gbs')"> Gender: Male</label>
                    <label class="ee-check-group"><input type="checkbox" id="gbs-hr" onchange="runCalculation('gbs')"> HR ≥ 100</label>
                    <label class="ee-check-group"><input type="checkbox" id="gbs-mel" onchange="runCalculation('gbs')"> Malaena Present</label>
                    <label class="ee-check-group"><input type="checkbox" id="gbs-sync" onchange="runCalculation('gbs')"> Syncope</label>
                    <label class="ee-check-group"><input type="checkbox" id="gbs-liver" onchange="runCalculation('gbs')"> Hepatic Disease</label>
                    <label class="ee-check-group"><input type="checkbox" id="gbs-card" onchange="runCalculation('gbs')"> Cardiac Failure</label>
                </div>
            </div>
        `,
        footer_note: "WSES and BSG guidelines recommend GBS to stratify outpatient vs urgent endoscopic intervention.",
        calculate: function() {
            let score = parseInt(document.getElementById('gbs-urea')?.value) || 0;
            score += parseInt(document.getElementById('gbs-bp')?.value) || 0;
            
            const isMale = document.getElementById('gbs-male')?.checked;
            const hbVal = parseInt(document.getElementById('gbs-hb')?.value) || 0;
            
            // Gender specific Hb scoring based on original Blatchford logic
            if (isMale) {
                if (hbVal === 1) score += 1;
                else if (hbVal === 3) score += 3;
                else if (hbVal === 6) score += 6;
            } else { // Female
                if (hbVal === 3) score += 1;
                else if (hbVal === 6) score += 6;
            }

            if (document.getElementById('gbs-hr')?.checked) score += 1;
            if (document.getElementById('gbs-mel')?.checked) score += 1;
            if (document.getElementById('gbs-sync')?.checked) score += 2;
            if (document.getElementById('gbs-liver')?.checked) score += 2;
            if (document.getElementById('gbs-card')?.checked) score += 2;

            let outHTML = `<strong>GBS Score: ${score} / 23</strong><br>`;
            let outColor = "#8b5cf6";
            if (score <= 1) { outHTML += "Low risk (<5%) of intervention - suitable for OP management."; outColor = "#10b981"; }
            else if (score >= 7) { outHTML += "Very High risk of intervention - emergent OGD <12 hrs indicated."; outColor = "#dc2626"; }
            else { outHTML += "Intermediate-high risk of intervention - urgent OGD <24hrs indicated."; }

            return {
                chartType: 'bar', customXLabels: ["Calculated GBS", "Safe Discharge (≤1)"],
                primaryData: [score, 0], secondaryData: [0, 1],
                primaryLabel: "Patient Score", secondaryLabel: "Safe Threshold",
                labelY: "GBS Score", yMax: 23,
                outputHTML: outHTML, outputColor: outColor
            };
        }
    },

    pancreatitis: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "Pancreatitis (BISAP)",
        title: "Acute Pancreatitis Severity", subtitle: "BISAP Bedside Index",
        source: "Wu BU, et al. Gut (2008)", color: "#0ea5e9",
        controlsHTML: `
            <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #0ea5e9;">
                <label class="nav-label">SIRS Criteria (Need ≥ 2)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <label class="ee-check-group"><input type="checkbox" id="bi-temp" onchange="runCalculation('pancreatitis')"> Temp < 36 or > 38</label>
                    <label class="ee-check-group"><input type="checkbox" id="bi-hr" onchange="runCalculation('pancreatitis')"> HR > 90</label>
                    <label class="ee-check-group"><input type="checkbox" id="bi-rr" onchange="runCalculation('pancreatitis')"> RR > 20</label>
                    <label class="ee-check-group"><input type="checkbox" id="bi-wcc" onchange="runCalculation('pancreatitis')"> WCC < 4 or > 12</label>
                </div>
            </div>
            <label class="ee-check-group"><input type="checkbox" id="bi-urea" onchange="runCalculation('pancreatitis')"> Urea > 8.9 mmol/L</label>
            <label class="ee-check-group"><input type="checkbox" id="bi-del" onchange="runCalculation('pancreatitis')"> Impaired mental status (Delirium/GCS < 15)</label>
            <label class="ee-check-group"><input type="checkbox" id="bi-age" onchange="runCalculation('pancreatitis')"> Age ≥ 60</label>
            <label class="ee-check-group"><input type="checkbox" id="bi-eff" onchange="runCalculation('pancreatitis')"> Pleural Effusion Present</label>
        `,
        footer_note: "WSES 2019 guidelines recommend BISAP for early prediction of severe acute pancreatitis.",
        calculate: function() {
            let sirsCount = 0;
            if (document.getElementById('bi-temp')?.checked) sirsCount++;
            if (document.getElementById('bi-hr')?.checked) sirsCount++;
            if (document.getElementById('bi-rr')?.checked) sirsCount++;
            if (document.getElementById('bi-wcc')?.checked) sirsCount++;

            let score = 0;
            if (sirsCount >= 2) score++;
            if (document.getElementById('bi-urea')?.checked) score++;
            if (document.getElementById('bi-del')?.checked) score++;
            if (document.getElementById('bi-age')?.checked) score++;
            if (document.getElementById('bi-eff')?.checked) score++;

            let mort = "0.2%"; let severity = "Low";
            if (score === 1) { mort = "0.5%"; }
            else if (score === 2) { mort = "1.9%"; }
            else if (score === 3) { mort = "5.3%"; severity = "Severe Disease Likely"; }
            else if (score === 4) { mort = "12.7%"; severity = "Severe Disease Likely"; }
            else if (score === 5) { mort = "22.5%"; severity = "Severe Disease Likely"; }

            let outHTML = `<strong>BISAP Score: ${score} / 5</strong><br>`;
            outHTML += `Predicted Mortality: ${mort}. `;
            if (score >= 3) outHTML += `<span style="color:#dc2626; font-weight:bold;">${severity}</span>`;

            return {
                chartType: 'bar', customXLabels: ["BISAP Score"],
                primaryData: [score], secondaryData: [0],
                primaryLabel: "Patient Score", secondaryLabel: "Baseline",
                labelY: "Points", yMax: 5,
                outputHTML: outHTML, outputColor: score >= 3 ? "#dc2626" : "#0ea5e9"
            };
        }
    }
};
