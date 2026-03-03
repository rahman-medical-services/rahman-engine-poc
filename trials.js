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
        category: "Waitlist Triage & Deflection", 
        type: "calculated", 
        shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE: Symptom Tracker", 
        subtitle: "Observational Management Trajectory",
        source: "UEG Journal (2023)", 
        color: "#0ea5e9",
        xAxisLabels: ['0', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m'],
        baseline: [1.0, 0.93, 0.86, 0.79, 0.76, 0.73, 0.71, 0.69, 0.67, 0.65, 0.64, 0.635, 0.63],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="calc-age" class="ee-select" onchange="runCalculation('relapstone')">
                <option value="1.0">54 or younger</option><option value="0.57">Over 54</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="calc-mult" onchange="runCalculation('relapstone')"> Multiple Stones?</label>
            <label class="ee-check-group" style="margin-top:10px; color:var(--brand-navy); font-weight:700;">
                <input type="checkbox" id="toggle-admission" onchange="document.getElementById('admission-details').style.display = this.checked ? 'block' : 'none'; runCalculation('relapstone');"> 
                Previous Hospital Admission?
            </label>
            <div id="admission-details" style="display:none; margin-left:20px; padding:10px; border-left:2px solid #cbd5e1; margin-bottom:15px;">
                <label class="ee-check-group"><input type="checkbox" id="calc-alt" onchange="runCalculation('relapstone')"> ALT > 35 U/L</label>
                <label class="ee-check-group"><input type="checkbox" id="calc-ercp" onchange="runCalculation('relapstone')"> Previous ERCP?</label>
            </div>
        `,
        calculate: function() {
            const ageMod = parseFloat(document.getElementById('calc-age')?.value) || 1;
            const multStones = document.getElementById('calc-mult')?.checked ? 1.19 : 1.0;
            const hasAdmission = document.getElementById('toggle-admission')?.checked;
            const altHigh = (hasAdmission && document.getElementById('calc-alt')?.checked) ? 1.22 : 1.0;
            const ercpMod = (hasAdmission && document.getElementById('calc-ercp')?.checked) ? 1.39 : 1.0;
            
            const hrTotal = ageMod * multStones * altHigh * ercpMod;
            const fullTrajectory = this.baseline.map(s => Math.pow(s, hrTotal) * 100);
            const prob12m = fullTrajectory[12];

            return {
                primaryData: fullTrajectory,
                secondaryData: this.baseline.map(s => s * 100),
                synthesisText: `RELAPSTONE: 12-month pain-free probability is ${prob12m.toFixed(0)}%. Profile modifiers: Age ${ageMod < 1 ? '>54' : '<54'}, Stones ${multStones > 1 ? 'Multi' : 'Single'}${ercpMod > 1 ? ', Post-ERCP' : ''}.`,
                rawData: { 
                    mainMetric: prob12m.toFixed(0) + "%", 
                    label: "12m Symptom-Free Prob.", 
                    type: 'evidence',
                    chartPoints: fullTrajectory,
                    chartLabels: ['0', '3m', '6m', '9m', '12m'] // Every quarter markers
                }
            };
        }
    },

   inca: {
        category: "Waitlist Triage & Deflection", 
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

            const synth = `OUTCOMELOGIC SYNTHESIS (INCA): 12-Year surgical crossover probability is calculated at ${risk12y.toFixed(0)}%. Input Profile: ${age === 'old' ? 'Over 65' : 'Under 65'}, ${symp === 'mild' ? 'Mild Symptoms' : 'Asymptomatic'}.`;

            // Bridge Data to Digital Consent Module
            window.PatientSession.rawModelData = { 
                mainMetric: risk12y.toFixed(0) + "%", 
                label: "12-Year Crossover Prob.",
                type: 'evidence',
                chartPoints: this.baseCrossover.map(val => (1 - Math.pow((1 - val), hr)) * 100),
                chartLabels: ['0', '3y', '6y', '9y', '12y']
            };

            return {
                primaryData: this.baseCrossover.map(val => (1 - Math.pow((1 - val), hr)) * 100),
                secondaryData: this.baseCrossover.map(v => v * 100),
                primaryLabel: "Adjusted Crossover Rate", 
                secondaryLabel: "Baseline Trial Average",
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

    coda: {
        category: "Shared Decision Making", type: "calculated", shortName: "Appendicitis (CODA)",
        title: "CODA Trial: Uncomplicated Appendicitis", subtitle: "Antibiotics-First vs. Appendectomy",
        source: "NEJM (2020)", color: "#ef4444",
        xAxisLabels: ['0', '30 Days', '1 Year', '2 Years', '3 Years', '4 Years'],
        baseline_abx: [100, 89, 75, 70, 65, 61], baseline_surg: [100, 100, 100, 100, 100, 100], 
        controlsHTML: `
            <div style="background:#fee2e2; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #ef4444;">
                <label class="ee-check-group" style="color:#991b1b; font-weight:800;">
                    <input type="checkbox" id="coda-stone" onchange="runCalculation('coda')"> Appendicolith Present on CT?
                </label>
            </div>
        `,
        footer_note: "CODA demographic modeling. Appendicolith presence correlates with altered trial outcomes.",
        calculate: function() {
            const abxMod = document.getElementById('coda-stone')?.checked ? 0.65 : 1.0; 
            return {
                primaryData: this.baseline_abx.map((s, i) => i === 0 ? 100 : s * abxMod),
                secondaryData: this.baseline_surg,
                primaryLabel: "Antibiotics-First Pathway", secondaryLabel: "Appendectomy (Surgery)",
                labelY: "Probability of Avoiding Surgery (%)"
            };
        }
    },

    bariatrics: {
        category: "Shared Decision Making", type: "calculated", shortName: "Bariatrics Combined",
        title: "Metabolic Surgery Outcomes", subtitle: "Bypass vs. Sleeve vs. Band",
        source: "STAMPEDE & By-Band-Sleeve Trials", color: "#8b5cf6",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_bypass: [0, 29, 28, 28, 27, 27], baseline_sleeve: [0, 25, 24, 24, 23, 23], baseline_band: [0, 15, 14, 13, 12, 11],
        controlsHTML: `
            <label class="nav-label">Compare Procedure to Bypass</label>
            <select id="bar-surg" class="ee-select" onchange="runCalculation('bariatrics')">
                <option value="sleeve">Sleeve Gastrectomy vs Bypass</option>
                <option value="band">Gastric Band vs Bypass</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="bar-diab" onchange="runCalculation('bariatrics')"> Type 2 Diabetes</label>
        `,
        footer_note: "Statistical visualization of expected Total Body Weight Loss % (TBWL) across major cohorts.",
        calculate: function() {
            const surgType = document.getElementById('bar-surg')?.value || 'sleeve';
            const diabMod = document.getElementById('bar-diab')?.checked ? 0.95 : 1.0; 
            const comp = surgType === 'sleeve' ? this.baseline_sleeve : this.baseline_band;
            return {
                primaryData: this.baseline_bypass.map(s => s * diabMod),
                secondaryData: comp.map(s => s * diabMod),
                primaryLabel: "Gastric Bypass", secondaryLabel: surgType === 'sleeve' ? "Sleeve Gastrectomy" : "Gastric Band",
                labelY: "Total Body Weight Loss (TBWL %)", yMax: 40
            };
        }
    },

    // ---------------------------------------------------------
    // 3. PERI-OPERATIVE PLANNING
    // ---------------------------------------------------------
readiness: {
        category: "Peri-operative Planning", 
        type: "passport", 
        shortName: "Readiness Passport",
        title: "Surgical Readiness Assessment", 
        subtitle: "Objective Risk Metric Synthesis",
        source: "Standardized Scoring (DASI, STOP-BANG)", 
        color: "#6facd5",
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
                    <label class="nav-label">2. Risk Stratification (STOP-BANG)</label>
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
                
                <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="runCalculation('readiness')">
                    Synthesize Metrics
                </button>
            </div>
        `,
        narrativeTemplate: `
            <div id="web-narrative-display" style="display:none; margin-top:30px;">
                <div id="status-card" style="background:var(--brand-navy); color:white; padding:25px; border-radius:12px; margin-bottom:20px; border-left:8px solid #cbd5e1;">
                    <h3 style="margin-top:0; color:#6facd5;">Statistical Risk Profile</h3>
                    <p id="out-advice" style="font-size:1.1rem; line-height:1.5; color:white;"></p>
                </div>
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="evidence-card"><div class="stat-label">Calculated Capacity</div><div id="out-mets" class="stat-main">--</div><div class="stat-label">METs</div></div>
                    <div class="evidence-card"><div class="stat-label">Risk Score</div><div id="out-sb" class="stat-main">--</div><div class="stat-label">STOP-BANG</div></div>
                </div>
                <div id="out-pillars" style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px; font-size:0.9rem; line-height: 1.6;"></div>
            </div>
        `,
        footer_note: "Values aggregate patient-reported metrics into standard DASI and STOP-BANG scoring systems.",
        calculate: function() {
            let dasi = 0; 
            document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
            let mets = ((0.43 * dasi) + 9.6) / 3.5;
            let sb = 0; 
            document.querySelectorAll('.s-val:checked').forEach(i => sb += 1);

            let modifiers = [];
            if (document.getElementById('p-smoke')?.checked) modifiers.push("Current Smoker/Vaper");
            if (document.getElementById('p-diab')?.checked) modifiers.push("Diabetes (HbA1c > 64)");
            if (document.getElementById('p-thin')?.checked) modifiers.push("On Blood Thinners");
            const bmiHigh = document.getElementById('in-bmi')?.checked;
            if (bmiHigh) modifiers.push("Elevated BMI (> 35)");
            
            let modString = modifiers.length > 0 ? " Identified Clinical Factors: " + modifiers.join(", ") + "." : " No additional clinical modifiers identified.";

            const isHighRisk = (mets < 4 || sb >= 5 || bmiHigh);
            const statusColor = isHighRisk ? "#ef4444" : "#10b981";
            const statusLabel = isHighRisk ? "HIGH COMPLEXITY" : "STANDARD RISK";

            // Update UI
            document.getElementById('initial-message').style.display = 'none';
            document.getElementById('web-narrative-display').style.display = 'block';
            document.getElementById('status-card').style.borderColor = statusColor;
            document.getElementById('out-advice').innerHTML = `<span style="color:${statusColor}; font-weight:800;">[${statusLabel}]</span> Profile aligns with ${isHighRisk ? 'complex' : 'standard'} perioperative pathways.`;
            document.getElementById('out-mets').innerText = mets.toFixed(1);
            document.getElementById('out-sb').innerText = sb + "/8";
            document.getElementById('out-pillars').innerHTML = "<strong>Clinical Context:</strong><br>" + modString;

            // EVERYTHING STAYS INSIDE THE CALCULATE FUNCTION
            return { 
                synthesisText: `OUTCOMELOGIC READINESS: METs ${mets.toFixed(1)}, STOP-BANG ${sb}/8. Profile: ${statusLabel}.${modString}`,
                rawData: { 
                    mets: mets.toFixed(1), 
                    sb: sb, 
                    isHighRisk: isHighRisk, 
                    type: 'readiness' 
                }
            }; 
        } // This brace ends the function
    }, // This brace ends the readiness object
    
 recovery: {
        category: "Peri-operative Planning", 
        type: "calculated", 
        shortName: "Recovery Passport",
        title: "Predictive Recovery Passport", 
        subtitle: "Procedure-Specific Trajectories",
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
            <select id="rec-surgery" class="ee-select" onchange="runCalculation('recovery')">
                <option value="lap_minor">Lap Chole / Hernia</option>
                <option value="lap_major">Lap Fundoplication / Bariatric</option>
                <option value="open_major">Major Open Procedure</option>
            </select>
            <label class="nav-label">Physical Activity Before Surgery</label>
            <select id="rec-fit" class="ee-select" onchange="runCalculation('recovery')">
                <option value="1.1">Highly Active</option>
                <option value="1.0" selected>Normal Activity</option>
                <option value="0.8">Frail / Limited</option>
            </select>
            <label class="nav-label" style="color:#c0392b;">Post-Op Course</label>
            <select id="rec-comp" class="ee-select" onchange="runCalculation('recovery')">
                <option value="1.0">Uncomplicated</option>
                <option value="0.65">Minor Complication</option>
            </select>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:20px;">
                <div class="evidence-card">
                    <div class="stat-label">Driving</div>
                    <div id="rec-driving" class="stat-main" style="font-size:1.2rem;">--</div>
                </div>
                <div class="evidence-card">
                    <div class="stat-label">Lifting</div>
                    <div id="rec-lifting" class="stat-main" style="font-size:1.2rem;">--</div>
                </div>
                <div class="evidence-card">
                    <div class="stat-label">Intimacy</div>
                    <div id="rec-sex" class="stat-main" style="font-size:1.2rem;">--</div>
                </div>
                <div class="evidence-card">
                    <div class="stat-label">Alcohol</div>
                    <div id="rec-alcohol" class="stat-main" style="font-size:1.2rem;">--</div>
                </div>
            </div>
        `,
        calculate: function() {
            const surg = document.getElementById('rec-surgery')?.value || 'lap_minor';
            const fit = parseFloat(document.getElementById('rec-fit')?.value) || 1.0;
            const comp = parseFloat(document.getElementById('rec-comp')?.value) || 1.0;
            const selectedBaseline = this.baselines[surg];
            
            // Multiplier logic for delays based on fitness and complications
            const delayMod = (fit < 1.0 ? 1.3 : 1.0) * (comp < 1.0 ? 1.8 : 1.0); 

            // 1. Core Milestone Logic
            const driveDays = Math.round((surg === 'lap_minor' ? 7 : 14) * delayMod);
            const liftWks = Math.round((surg === 'lap_minor' ? 4 : 6) * delayMod);
            const sexDays = Math.round((surg === 'lap_minor' ? 7 : 14) * delayMod);
            const alcoholAdvice = (surg === 'lap_major') ? "Strict Avoid" : "Off Opioids";

            // 2. UI Injection
            if(document.getElementById('rec-driving')) {
                document.getElementById('rec-driving').innerText = driveDays + " Days";
                document.getElementById('rec-lifting').innerText = liftWks + " Wks";
                document.getElementById('rec-sex').innerText = sexDays + " Days";
                document.getElementById('rec-alcohol').innerText = alcoholAdvice;
            }

            // 3. Generate Trajectory Curve
            const adjustedPoints = selectedBaseline.map(val => Math.min(val * fit * comp, 100));

            // 4. Return Data Package
            return {
                primaryData: adjustedPoints,
                secondaryData: selectedBaseline,
                primaryLabel: "Selected Patient Profile", 
                secondaryLabel: "Standard ERAS Path",
                labelY: "Functional Capacity (%)",
                synthesisText: `RECOVERY: Expected return to driving ${driveDays} days, lifting ${liftWks} weeks, and intimacy ${sexDays} days. Alcohol: ${alcoholAdvice}.`,
                rawData: { 
                    mainMetric: driveDays + " Days", 
                    label: "Driving Return", 
                    type: 'recovery',
                    chartPoints: adjustedPoints,
                    chartLabels: ['D1', 'D7', 'D14', 'D21', '6W'] 
                }
            };
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

    viale: {
        category: "Precision Oncology", type: "calculated", shortName: "AML (VIALE-A)",
        title: "VIALE-A: AML Survival Modeling", subtitle: "Aza + Venetoclax vs. Aza + Placebo",
        source: "NEJM 2020", color: "#8e44ad",
        xAxisLabels: ['Baseline', '6m', '12m', '18m', '24m'],
        baseline_aza_ven: [100, 75, 60, 50, 43], baseline_aza: [100, 55, 38, 30, 24],
        controlsHTML: `
            <label class="nav-label">Cytogenetic Risk Profile</label>
            <select id="viale-risk" class="ee-select" onchange="runCalculation('viale')">
                <option value="1.0">Intermediate Risk</option><option value="1.35">Poor/Complex Risk</option>
            </select>
        `,
        footer_note: "Statistical visualization. Does not constitute a clinical prognosis.",
        calculate: function() {
            const hr = parseFloat(document.getElementById('viale-risk')?.value) || 1;
            return {
                primaryData: this.baseline_aza_ven.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_aza.map(s => Math.pow(s/100, hr) * 100),
                primaryLabel: "Azacitidine + Venetoclax", secondaryLabel: "Azacitidine + Placebo",
                labelY: "Overall Survival (%)"
            };
        }
    },

    protect: {
        category: "Precision Oncology", type: "calculated", shortName: "Prostate (ProtecT)",
        title: "ProtecT Trial: 15-Year Data", subtitle: "Active Surveillance vs. Prostatectomy",
        source: "NEJM 2023", color: "#3b82f6",
        xAxisLabels: ['0', '3y', '6y', '9y', '12y', '15y'],
        baseline_surv: [100, 98, 95, 93, 91, 90.6], baseline_surg: [100, 99, 98, 97, 96, 95.3],
        controlsHTML: `
            <label class="nav-label">Tumour Grade (Gleason Score)</label>
            <select id="pro-gleason" class="ee-select" onchange="runCalculation('protect')">
                <option value="1.0">Gleason 6 (Low Risk)</option><option value="1.4">Gleason 7+ (Intermediate/High)</option>
            </select>
        `,
        footer_note: "Data visualization only. Prostate-cancer specific survival is ~97% across all arms at 15 years. Chart displays Metastasis-Free Survival.",
        calculate: function() {
            const hr = parseFloat(document.getElementById('pro-gleason')?.value) || 1.0;
            return {
                primaryData: this.baseline_surg.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_surv.map(s => Math.pow(s/100, hr) * 100),
                primaryLabel: "Prostatectomy", secondaryLabel: "Active Surveillance",
                labelY: "Metastasis-Free Survival (%)", yMin: 85
            };
        }
    },

    // ---------------------------------------------------------
    // 5. SPECIALTY PATHWAYS
    // ---------------------------------------------------------
    topkat: {
        category: "Specialty Pathways", type: "calculated", shortName: "Knees (TOPKAT)",
        title: "Knee Replacement Outcomes", subtitle: "Total (TKR) vs. Partial (UKR) Data Comparison",
        source: "TOPKAT Trial (Lancet 2019) & NJR Data", color: "#27ae60",
        controlsHTML: `
            <label class="nav-label">Patient Age</label>
            <input type="number" id="tk-age" class="ee-select" value="65" min="40" max="90" onchange="runCalculation('topkat')">
            
            <label class="nav-label">Where is the pain located?</label>
            <select id="tk-pain" class="ee-select" onchange="runCalculation('topkat')">
                <option value="medial">Inside of Knee Only (Medial)</option>
                <option value="global">All Over / Behind Cap (Global)</option>
            </select>

            <label class="nav-label">Modeled Priority: Durability vs Function</label>
            <input type="range" min="0" max="100" value="50" style="width:100%; cursor:pointer;" id="tk-priority" oninput="runCalculation('topkat')">
            <div style="font-size:11px; color:#666; display:flex; justify-content:space-between; margin-top:5px; margin-bottom:15px;">
                <span>Durability Modeling</span><span>Functional Modeling</span>
            </div>
        `,
        footer_note: "Combines TOPKAT functional aggregates with National Joint Registry lifetime revision data.",
        calculate: function() {
            const age = parseInt(document.getElementById('tk-age')?.value) || 65;
            const location = document.getElementById('tk-pain')?.value || 'medial';
            const priority = parseInt(document.getElementById('tk-priority')?.value) || 50;

            let baseRiskTKR = age < 55 ? 15 : (age < 70 ? 5 : 2);
            let baseRiskUKR = age < 55 ? 25 : (age < 70 ? 10 : 3);
            const funcTKR = 75, funcUKR = 90;

            if (location === 'global') {
                return {
                    chartType: 'bar', customXLabels: ["Total Knee (TKR)", "Partial (Excluded from UKR Pathway)"],
                    primaryData: [funcTKR, 0], secondaryData: [baseRiskTKR, 0],
                    primaryLabel: 'Function Score (0-100)', secondaryLabel: 'Lifetime Revision Risk (%)',
                    secondaryColor: '#c0392b', labelY: "Score / Risk %", yMin: 0,
                    outputHTML: `<strong>Profile Match: Total Knee (TKR) Pathway.</strong><br>Global/Patellofemoral pain patterns were generally excluded from the UKR arm in the TOPKAT trial methodology.`, outputColor: '#2c3e50'
                };
            } else {
                let recHTML = `<strong>Comparative Statistical Profile:</strong><br>Partial Knee (UKR) aligns with higher functional outcomes but carries a higher lifetime revision risk (${baseRiskUKR}%). Total Knee (TKR) carries greater statistical durability (${baseRiskTKR}% revision probability).`;
                let recColor = "#f39c12";
                if (priority > 60) { recHTML = `<strong>Statistical Alignment: Functional Priority.</strong><br>Modeling for 'Natural Feel' maps to UKR outcomes. Note: Lifetime revision risk is elevated for this cohort (${baseRiskUKR}% vs ${baseRiskTKR}%).`; recColor = "#27ae60"; }
                else if (priority < 40) { recHTML = `<strong>Statistical Alignment: Durability Priority.</strong><br>Modeling for 'Durability' maps to TKR outcomes. Lower risk of lifetime revision for this cohort (~${baseRiskTKR}%).`; recColor = "#2980b9"; }

                return {
                    chartType: 'bar', customXLabels: ["Total Knee (TKR)", "Partial Knee (UKR)"],
                    primaryData: [funcTKR, funcUKR], secondaryData: [baseRiskTKR, baseRiskUKR],
                    primaryLabel: 'Function Score (0-100)', secondaryLabel: 'Lifetime Revision Risk (%)',
                    secondaryColor: '#c0392b', labelY: "Score / Risk %", yMin: 0,
                    outputHTML: recHTML, outputColor: recColor
                };
            }
        }
    },

    nature: {
        category: "Specialty Pathways", type: "calculated", shortName: "Tonsils (NAtuRE)",
        title: "Adult Tonsillectomy Outcomes", subtitle: "Surgery vs. Conservative Management",
        source: "The Lancet / NAtuRE Cohort", color: "#14b8a6",
        xAxisLabels: ['Baseline', '6m', '12m', '18m', '24m'],
        baseline_surg: [100, 95, 92, 90, 88], baseline_cons: [100, 60, 45, 35, 30],
        controlsHTML: `
            <label class="ee-check-group"><input type="checkbox" id="ent-smoke" onchange="runCalculation('nature')"> Current Smoker</label>
        `,
        footer_note: "Model integrates smoking status as a known statistical risk factor for delayed mucosal healing.",
        calculate: function() {
            const smokeMod = document.getElementById('ent-smoke')?.checked ? 0.90 : 1.0; 
            return {
                primaryData: this.baseline_surg.map((s, i) => i === 0 ? 100 : s * smokeMod),
                secondaryData: this.baseline_cons,
                primaryLabel: "Adult Tonsillectomy", secondaryLabel: "Conservative Management",
                labelY: "Prob. Remaining Episode-Free (%)"
            };
        }
    },

    eclipse: {
        category: "Specialty Pathways", type: "calculated", shortName: "HMB (ECLIPSE)",
        title: "ECLIPSE Trial: 10-Year Data", subtitle: "Mirena Coil (LNG-IUS) vs. Hysterectomy",
        source: "The Lancet", color: "#ec4899",
        xAxisLabels: ['Baseline', '1 Year', '2 Years', '5 Years', '10 Years'],
        baseline_hyst: [30, 95, 96, 96, 97], baseline_mirena: [30, 85, 82, 80, 78],
        controlsHTML: `
            <label class="nav-label">Primary Intervention</label>
            <select id="gyn-path" class="ee-select" onchange="runCalculation('eclipse')">
                <option value="mirena">Mirena Coil (LNG-IUS)</option><option value="hyst">Surgical Hysterectomy</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="gyn-fibroid" onchange="runCalculation('eclipse')"> Large Uterine Fibroids</label>
        `,
        footer_note: "ECLIPSE tracks Quality of Life (MMAS). Chart synthesizes comparative outcomes.",
        calculate: function() {
            const path = document.getElementById('gyn-path')?.value || 'mirena';
            const fMod = document.getElementById('gyn-fibroid')?.checked ? 0.85 : 1.0; 
            const base = path === 'mirena' ? this.baseline_mirena : this.baseline_hyst;
            const comp = path === 'mirena' ? this.baseline_hyst : this.baseline_mirena;
            return {
                primaryData: base.map((s, i) => (path === 'mirena' && i > 0) ? s * fMod : s),
                secondaryData: comp,
                primaryLabel: path === 'mirena' ? "Mirena Coil (Adjusted)" : "Surgical Hysterectomy",
                secondaryLabel: path === 'mirena' ? "Surgical Hysterectomy" : "Mirena Coil",
                labelY: "MMAS Quality of Life Score (0-100)"
            };
        }
    },

    cataract: {
        category: "Specialty Pathways", type: "calculated", shortName: "Cataract (NOD)",
        title: "National Ophthalmology Database", subtitle: "Cataract Surgery Risk & Visual Recovery",
        source: "RCOphth NOD Data", color: "#eab308",
        xAxisLabels: ['Pre-Op', '1 Wk', '4 Wks', '3 Mos', '6 Mos', '12 Mos'],
        baseline_success: [20, 85, 95, 96, 96, 96],
        controlsHTML: `
            <div style="background:#fef3c7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #eab308;">
                <label class="ee-check-group" style="color:#b45309; font-weight:800;">
                    <input type="checkbox" id="cat-alpha" onchange="runCalculation('cataract')"> Alpha-Blockers (e.g., Tamsulosin)?
                </label>
            </div>
            <label class="ee-check-group"><input type="checkbox" id="cat-diab" onchange="runCalculation('cataract')"> Diabetic Retinopathy</label>
        `,
        footer_note: "Variables (Alpha-blockers, Retinopathy) integrated as statistical modifiers against standard baseline recovery.",
        calculate: function() {
            const ifisRisk = document.getElementById('cat-alpha')?.checked ? 0.82 : 1.0; 
            const diabRisk = document.getElementById('cat-diab')?.checked ? 0.90 : 1.0;
            return {
                primaryData: this.baseline_success.map((s, i) => i === 0 ? s : s * (ifisRisk * diabRisk)),
                secondaryData: this.baseline_success,
                primaryLabel: "Modeled Visual Trajectory", secondaryLabel: "Standard Uncomplicated Baseline",
                labelY: "Prob. of Visual Recovery (%)"
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
            
            if (isMale) {
                if (hbVal === 1) score += 1;
                else if (hbVal === 3) score += 3;
                else if (hbVal === 6) score += 6;
            } else { 
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
    },

    // ---------------------------------------------------------
    // UNIVERSAL APPENDICITIS PATHWAY (Adult & Paediatric)
    // ---------------------------------------------------------
    appendicitis: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "Appendicitis (Universal)",
        title: "Universal Appendicitis Triage", subtitle: "Dynamic routing to RIFT (Adult) or Shera (Paediatric)",
        source: "WSES 2020 & RIFT Study Group", color: "#eab308",
        controlsHTML: `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                
                <div style="background:#f8fafc; padding:15px; border-radius:8px; border: 1px solid #e2e8f0;">
                    <label class="nav-label" style="margin-top:0; color:var(--brand-navy);">1. Demographics & Timeline</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top:10px;">
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">Age</label>
                            <input type="number" id="ap-age" class="ee-select" value="25" min="5" oninput="runCalculation('appendicitis')">
                        </div>
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">Gender</label>
                            <select id="ap-gender" class="ee-select" onchange="runCalculation('appendicitis')">
                                <option value="Female">Female</option><option value="Male">Male</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">Symptoms</label>
                            <select id="ap-dur" class="ee-select" onchange="runCalculation('appendicitis')">
                                <option value="<24">< 24 Hrs</option><option value=">=24">≥ 24 Hrs</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="background:#f8fafc; padding:15px; border-radius:8px; border: 1px solid #e2e8f0;">
                    <label class="nav-label" style="margin-top:0; color:var(--brand-navy);">2. Laboratory Biomarkers</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top:10px;">
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">WCC (10⁹/L)</label>
                            <input type="number" id="ap-wcc" class="ee-select" value="7" step="0.1" oninput="runCalculation('appendicitis')">
                        </div>
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">Neutrophils</label>
                            <input type="number" id="ap-neuts" class="ee-select" value="5" step="0.1" oninput="runCalculation('appendicitis')">
                        </div>
                        <div>
                            <label style="font-size:0.75rem; font-weight:bold; color:#64748b; text-transform:uppercase;">CRP (mg/L)</label>
                            <input type="number" id="ap-crp" class="ee-select" value="2" oninput="runCalculation('appendicitis')">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="nav-label">3. Clinical Presentation</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label class="ee-check-group"><input type="checkbox" id="ap-rifp" checked onchange="runCalculation('appendicitis')"> RIF Pain</label>
                            <label class="ee-check-group"><input type="checkbox" id="ap-rift" checked onchange="runCalculation('appendicitis')"> RIF Tenderness</label>
                            <label class="ee-check-group"><input type="checkbox" id="ap-migrat" onchange="runCalculation('appendicitis')"> Migratory Pain</label>
                            <label class="ee-check-group"><input type="checkbox" id="ap-temp" onchange="runCalculation('appendicitis')"> Pyrexia (≥ 38.5°C)</label>
                        </div>
                        <div>
                            <label class="ee-check-group"><input type="checkbox" id="ap-vomit" onchange="runCalculation('appendicitis')"> Vomiting</label>
                            <label class="ee-check-group"><input type="checkbox" id="ap-nausea" onchange="runCalculation('appendicitis')"> Nausea / Anorexia</label>
                            <label class="ee-check-group"><input type="checkbox" id="ap-cough" onchange="runCalculation('appendicitis')"> RIF Pain on Cough/Hop</label>
                        </div>
                    </div>
                    
                    <label class="nav-label" style="margin-top:15px;">Adult Rebound Tenderness</label>
                    <select id="ap-rebound" class="ee-select" onchange="runCalculation('appendicitis')">
                        <option value="0">None</option><option value="1">Mild</option><option value="2">Moderate</option><option value="3">Severe</option>
                    </select>
                </div>
            </div>
        `,
        footer_note: "Algorithm automatically routes to Shera Score for Age <16, and RIFT/AIR/AAS consensus for Age ≥16.",
        calculate: function() {
            // Core Inputs
            const age = parseInt(document.getElementById('ap-age')?.value) || 25;
            const gender = document.getElementById('ap-gender')?.value || 'Female';
            const dur = document.getElementById('ap-dur')?.value || '<24';
            const wcc = parseFloat(document.getElementById('ap-wcc')?.value) || 0;
            const neuts = parseFloat(document.getElementById('ap-neuts')?.value) || 0;
            const crp = parseFloat(document.getElementById('ap-crp')?.value) || 0;
            const pn = wcc > 0 ? (neuts / wcc) : 0; 

            // Clinical Signs
            const rifp = document.getElementById('ap-rifp')?.checked;
            const rift = document.getElementById('ap-rift')?.checked;
            const migrat = document.getElementById('ap-migrat')?.checked;
            const temp = document.getElementById('ap-temp')?.checked;
            const vomit = document.getElementById('ap-vomit')?.checked;
            const nausea = document.getElementById('ap-nausea')?.checked;
            const cough = document.getElementById('ap-cough')?.checked;
            const rebound = parseInt(document.getElementById('ap-rebound')?.value) || 0;

            // ==========================================
            // PAEDIATRIC LOGIC (Shera Score)
            // ==========================================
            if (age < 16) {
                let shera = 0;
                if (rift) shera += 2;
                if (cough) shera += 2;
                if (migrat) shera += 1;
                if (nausea || vomit) shera += 1; // Nausea/Vomit/Anorexia consolidation
                if (temp) shera += 1;
                if (wcc > 10.0) shera += 1; // Leucocytosis proxy
                if (neuts > 7.5) shera += 1; // Neutrophilia proxy

                let risk = "Low";
                if (shera > 3 && gender === 'Female') risk = "High";
                if (shera > 2 && gender === 'Male' && age > 11) risk = "High";

                let ppv = risk === 'High' ? "41.4%" : "N/A";
                let comp = risk === 'Low' ? "< 1%" : "16-21%";
                let appyProb = risk === 'Low' ? "4.8%" : "42%";

                let outHTML = `
                    <div style="background:#fef2f2; padding:15px; border-radius:8px; border:1px solid #fecdd3; margin-bottom:15px; text-align:center;">
                        <h4 style="margin:0; color:#e11d48; text-transform:uppercase; font-size:0.85rem; letter-spacing:1px;">Paediatric Pathway Activated (<16 yrs)</h4>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:15px; margin-bottom:15px;">
                        <div>
                            <div style="font-size:0.85rem; color:#64748b; font-weight:bold; text-transform:uppercase;">Shera Score</div>
                            <div style="font-size:2.5rem; font-weight:800; color:${risk==='High'?'#f43f5e':'#16a34a'}; line-height:1;">${shera} <span style="font-size:1rem; color:#94a3b8;">/ 10</span></div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.85rem; color:#64748b; font-weight:bold; text-transform:uppercase;">Risk Profile</div>
                            <div style="font-size:1.5rem; font-weight:bold; color:${risk==='High'?'#f43f5e':'#16a34a'};">${risk}</div>
                        </div>
                    </div>
                    <div style="font-size:0.95rem; color:#334155; line-height:1.6;">
                        <strong>Clinical Probabilities:</strong><br>
                        • Likelihood of Appendicitis: <strong>${appyProb}</strong><br>
                        • Risk of Complicated Disease: <strong>${comp}</strong>
                    </div>
                `;

                return { outputHTML: outHTML, outputColor: risk === 'High' ? "#f43f5e" : "#16a34a" };
            }

            // ==========================================
            // ADULT LOGIC (AIR, AAS, RIFT)
            // ==========================================
            else {
                // AIR Score
                let air = 0;
                if (vomit) air += 1;
                if (rifp) air += 1;
                if (rebound === 3) air += 3; else if (rebound === 2) air += 2; else if (rebound === 1) air += 1;
                if (temp) air += 1;
                if (wcc >= 15) air += 2; else if (wcc >= 10) air += 1;
                if (pn >= 0.85) air += 2; else if (pn >= 0.70) air += 1;
                if (crp >= 50) air += 2; else if (crp >= 10) air += 1;

                // AAS Score
                let aas = 0;
                if (rifp) aas += 2;
                if (migrat) aas += 2;
                if (rift && gender === 'Male' && age < 50) aas += 3; else if (rift) aas += 1;
                if (rebound === 3 || rebound === 2) aas += 4; else if (rebound === 1) aas += 2;
                if (wcc >= 14) aas += 3; else if (wcc >= 10.9) aas += 2; else if (wcc >= 7.2) aas += 1;
                if (pn >= 0.83) aas += 4; else if (pn >= 0.75) aas += 3; else if (pn >= 0.62) aas += 2;
                
                if (dur === '<24') {
                    if (crp >= 83) aas += 1; else if (crp >= 25) aas += 5; else if (crp >= 11) aas += 3; else if (crp >= 4) aas += 2;
                } else {
                    if (crp >= 152) aas += 1; else if (crp >= 53) aas += 2; else if (crp >= 12) aas += 2;
                }

                // Risk Categorization
                const riskAir = air > 8 ? 'High' : (air >= 5 ? 'Moderate' : 'Low');
                const riskAas = aas >= 16 ? 'High' : (aas >= 11 ? 'Moderate' : 'Low');
                const riskRift = (gender === 'Male' && air > 2) || (gender === 'Female' && aas > 8) ? 'High' : 'Low';

                let outHTML = `
                    <div style="background:#f0fdfa; padding:15px; border-radius:8px; border:1px solid #ccfbf1; margin-bottom:15px; text-align:center;">
                        <h4 style="margin:0; color:#0d9488; text-transform:uppercase; font-size:0.85rem; letter-spacing:1px;">Adult Pathway Activated (≥16 yrs)</h4>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; text-align:center;">
                        <div style="background:#f8fafc; padding:15px 10px; border-radius:6px; border:1px solid #e2e8f0;">
                            <div style="font-size:0.8rem; font-weight:bold; color:#64748b;">AIR SCORE</div>
                            <div style="font-size:2rem; font-weight:800; color:#eab308; line-height:1.2;">${air}</div>
                            <div style="font-size:0.8rem; color:#334155;">${riskAir} Risk</div>
                        </div>
                        <div style="background:#f8fafc; padding:15px 10px; border-radius:6px; border:1px solid #e2e8f0;">
                            <div style="font-size:0.8rem; font-weight:bold; color:#64748b;">AAS SCORE</div>
                            <div style="font-size:2rem; font-weight:800; color:#eab308; line-height:1.2;">${aas}</div>
                            <div style="font-size:0.8rem; color:#334155;">${riskAas} Risk</div>
                        </div>
                        <div style="background:${riskRift==='High'?'#fef2f2':'#f0fdf4'}; padding:15px 10px; border-radius:6px; border:1px solid ${riskRift==='High'?'#fecdd3':'#bbf7d0'};">
                            <div style="font-size:0.8rem; font-weight:bold; color:#64748b;">RIFT CONSENSUS</div>
                            <div style="font-size:1.5rem; font-weight:800; color:${riskRift==='High'?'#e11d48':'#16a34a'}; line-height:1.5; margin-top:5px;">${riskRift}</div>
                        </div>
                    </div>
                `;

                return { outputHTML: outHTML, outputColor: "#eab308" };
            }
        }
    },
    sofa: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "ICU (SOFA)",
        title: "Sequential Organ Failure Assessment", subtitle: "SOFA Score & Mortality Predictor",
        source: "Vincent JL, et al. Intensive Care Med (1996)", color: "#ef4444",
        controlsHTML: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label class="nav-label">Respiration</label>
                    <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                        <input type="number" id="sofa-po2" class="ee-select" placeholder="PaO2 (kPa)" value="13" oninput="runCalculation('sofa')">
                        <input type="number" id="sofa-fio2" class="ee-select" placeholder="FiO2 (0.21-1.0)" value="0.21" step="0.01" oninput="runCalculation('sofa')">
                    </div>
                    <label class="ee-check-group"><input type="checkbox" id="sofa-resp" onchange="runCalculation('sofa')"> Mechanically Ventilated</label>
                    
                    <label class="nav-label" style="margin-top:10px;">Coagulation (Platelets)</label>
                    <select id="sofa-plt" class="ee-select" onchange="runCalculation('sofa')">
                        <option value="0">≥ 150</option><option value="1">100 - 149</option><option value="2">50 - 99</option><option value="3">20 - 49</option><option value="4">< 20</option>
                    </select>

                    <label class="nav-label">Liver (Bilirubin µmol/L)</label>
                    <select id="sofa-bili" class="ee-select" onchange="runCalculation('sofa')">
                        <option value="0">< 20</option><option value="1">20 - 32</option><option value="2">33 - 100</option><option value="3">101 - 203</option><option value="4">> 203</option>
                    </select>
                </div>
                <div>
                    <label class="nav-label">Cardiovascular</label>
                    <select id="sofa-cv" class="ee-select" onchange="runCalculation('sofa')">
                        <option value="0">MAP ≥ 70</option><option value="1">MAP < 70</option>
                        <option value="2">Dopamine ≤ 5 or Dobutamine</option>
                        <option value="3">Dopamine 5.1-15 or NA/A ≤ 0.1</option>
                        <option value="4">Dopamine > 15 or NA/A > 0.1</option>
                    </select>

                    <label class="nav-label">Neurological (GCS)</label>
                    <input type="number" id="sofa-gcs" class="ee-select" value="15" min="3" max="15" oninput="runCalculation('sofa')">

                    <label class="nav-label">Renal (Creatinine / UO)</label>
                    <select id="sofa-creat" class="ee-select" style="margin-bottom: 5px;" onchange="runCalculation('sofa')">
                        <option value="0">Creatinine < 106</option><option value="1">106 - 168</option><option value="2">169 - 300</option><option value="3">301 - 433</option><option value="4">> 433</option>
                    </select>
                    <select id="sofa-uo" class="ee-select" onchange="runCalculation('sofa')">
                        <option value="0">Urine Output ≥ 500ml/d</option><option value="3">200 - 499 ml/d</option><option value="4">< 200 ml/d</option>
                    </select>
                </div>
            </div>
        `,
        footer_note: "SOFA scoring is used to track a patient's status during an ICU stay to determine the extent of organ function or rate of failure.",
        calculate: function() {
            const po2 = parseFloat(document.getElementById('sofa-po2')?.value) || 13;
            const fio2 = parseFloat(document.getElementById('sofa-fio2')?.value) || 0.21;
            const vent = document.getElementById('sofa-resp')?.checked;
            const re = po2 / fio2;
            let resp = 0;
            if (!vent) {
                if (re < 26.7) resp = 3; else if (re < 40) resp = 2; else if (re < 53.3) resp = 1; else resp = 0;
            } else {
                if (re < 13.3) resp = 4; else resp = 3; 
            }

            const plt = parseInt(document.getElementById('sofa-plt')?.value) || 0;
            const bili = parseInt(document.getElementById('sofa-bili')?.value) || 0;
            const cv = parseInt(document.getElementById('sofa-cv')?.value) || 0;
            const creat = parseInt(document.getElementById('sofa-creat')?.value) || 0;
            const uo = parseInt(document.getElementById('sofa-uo')?.value) || 0;
            
            const renal = Math.max(creat, uo);

            const gcsRaw = parseInt(document.getElementById('sofa-gcs')?.value) || 15;
            let gcs = 0;
            if (gcsRaw <= 5) gcs = 4; else if (gcsRaw <= 9) gcs = 3; else if (gcsRaw <= 12) gcs = 2; else if (gcsRaw <= 14) gcs = 1;

            const sofa = resp + renal + gcs + cv + plt + bili;

            let mort = "< 10%"; let meterColor = "#16a34a"; let meterWidth = (sofa / 24) * 100;
            if (sofa >= 7 && sofa <= 9) { mort = "15 - 20%"; meterColor = "#facc15"; }
            else if (sofa >= 10 && sofa <= 12) { mort = "40 - 50%"; meterColor = "#f59e0b"; }
            else if (sofa >= 13 && sofa <= 14) { mort = "50 - 60%"; meterColor = "#ea580c"; }
            else if (sofa === 15) { mort = "> 80%"; meterColor = "#dc2626"; }
            else if (sofa > 15) { mort = "> 90%"; meterColor = "#991b1b"; }

            // BYPASS CHART.JS: Returning only outputHTML
            return {
                outputHTML: `
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 0.9rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Total SOFA Score</div>
                        <div style="font-size: 3rem; font-weight: 800; color: ${meterColor}; line-height: 1;">${sofa} <span style="font-size: 1rem; color:#94a3b8;">/ 24</span></div>
                        <div style="font-size: 1.1rem; color: #334155; margin-top: 5px;">Estimated Mortality: <strong>${mort}</strong></div>
                    </div>
                    <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${meterWidth}%; height: 100%; background: ${meterColor}; transition: width 0.5s ease;"></div>
                    </div>
                `,
                outputColor: meterColor
            };
        }
    },

    cci: {
        category: "Clinical Practice Tools", type: "calculated", shortName: "Comorbidities (CCI)",
        title: "Charlson Comorbidity Index", subtitle: "10-Year Survival Probability Prediction",
        source: "Charlson ME, et al. J Chronic Dis (1987)", color: "#3b82f6",
        controlsHTML: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <label class="nav-label">1-Point Conditions</label>
                    <select id="cci-1" class="ee-select" multiple size="6" onchange="runCalculation('cci')" style="font-size:0.85rem;">
                        <option value="1">Myocardial Infarction</option>
                        <option value="1">Congestive Heart Failure</option>
                        <option value="1">Peripheral Vascular Disease</option>
                        <option value="1">Cerebrovascular Disease</option>
                        <option value="1">Dementia</option>
                        <option value="1">COPD</option>
                        <option value="1">Connective Tissue Disease</option>
                        <option value="1">Peptic Ulcer Disease</option>
                        <option value="1">Mild Liver Disease</option>
                        <option value="1">Diabetes (Uncomplicated)</option>
                    </select>
                </div>
                <div>
                    <label class="nav-label">High-Value Conditions</label>
                    <select id="cci-multi" class="ee-select" multiple size="6" onchange="runCalculation('cci')" style="font-size:0.85rem;">
                        <option value="2">Hemiplegia (2 pts)</option>
                        <option value="2">Moderate/Severe CKD (2 pts)</option>
                        <option value="2">Diabetes with End Organ Damage (2 pts)</option>
                        <option value="2">Solid Tumor / Malignancy (2 pts)</option>
                        <option value="2">Leukaemia / Lymphoma (2 pts)</option>
                        <option value="3">Moderate/Severe Liver Disease (3 pts)</option>
                        <option value="6">Metastatic Solid Tumor (6 pts)</option>
                        <option value="6">AIDS (6 pts)</option>
                    </select>
                </div>
            </div>
            <p style="font-size:0.8rem; color:#64748b; margin-top:5px; margin-bottom:0;">* Hold Ctrl/Cmd to select multiple conditions.</p>
        `,
        footer_note: "The CCI categorizes comorbidities to estimate the risk of death from comorbid disease.",
        calculate: function() {
            let score = 0;
            
            const select1 = document.getElementById('cci-1');
            if(select1) {
                for (let i = 0; i < select1.options.length; i++) {
                    if (select1.options[i].selected) score += 1;
                }
            }

            const selectMulti = document.getElementById('cci-multi');
            if(selectMulti) {
                for (let i = 0; i < selectMulti.options.length; i++) {
                    if (selectMulti.options[i].selected) score += parseInt(selectMulti.options[i].value);
                }
            }

            const tenYearSurvival = Math.pow(0.983, Math.exp(score * 0.9)) * 100;
            
            let meterColor = "#3b82f6";
            if (score > 2 && score <= 4) meterColor = "#f59e0b";
            if (score >= 5) meterColor = "#dc2626";

            let meterWidth = Math.min((score / 15) * 100, 100);

            // BYPASS CHART.JS: Returning only outputHTML
            return {
                outputHTML: `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 0.9rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Charlson Score</div>
                            <div style="font-size: 2.5rem; font-weight: 800; color: ${meterColor}; line-height: 1;">${score}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.9rem; color: #64748b; font-weight: bold; text-transform: uppercase;">Est. 10-Yr Survival</div>
                            <div style="font-size: 2.5rem; font-weight: 800; color: #334155; line-height: 1;">${tenYearSurvival.toFixed(1)}%</div>
                        </div>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${meterWidth}%; height: 100%; background: ${meterColor}; transition: width 0.3s ease;"></div>
                    </div>
                `,
                outputColor: meterColor
            };
        }
    }
};
