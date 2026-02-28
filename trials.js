/**
 * OutcomeLogic™ Master Evidence Ledger v4.0
 * (c) 2026 Rahman Medical Services Limited. All Rights Reserved.
 */

const TRIAL_DATA = {
    esopec: {
        category: "Oncology", type: "calculated", shortName: "Esophageal (ESOPEC)",
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
        footer_note: "Survival curves adjusted via Hazard Ratios (HR) from the ESOPEC 2024 primary analysis.",
        calculate: function() {
            const hr = (parseFloat(document.getElementById('eso-nstage')?.value) || 1) * (parseFloat(document.getElementById('eso-age')?.value) || 1);
            return {
                primaryData: this.baseline_flot.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_cross.map(s => Math.pow(s/100, hr) * 100),
                labelY: "Overall Survival (%)"
            };
        }
    },

    viale: {
        category: "Haematology", type: "calculated", shortName: "AML (VIALE-A)",
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
        footer_note: "Standard of care for patients unfit for intensive chemotherapy. CR/CRi: 66.4% vs 28.3%.",
        calculate: function() {
            const hr = parseFloat(document.getElementById('viale-risk')?.value) || 1;
            return {
                primaryData: this.baseline_aza_ven.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_aza.map(s => Math.pow(s/100, hr) * 100),
                labelY: "Overall Survival (%)"
            };
        }
    },

    relapstone: {
        category: "General Surgery", type: "calculated", shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE: Symptom Tracker", subtitle: "Surgery vs. Observational Management",
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
        footer_note: "Probability of remaining symptom-free. Cross-over rate from OM to LC was 36.7%.",
        calculate: function() {
            const hrTotal = (parseFloat(document.getElementById('calc-age')?.value) || 1) * (document.getElementById('calc-mult')?.checked ? 1.19 : 1.0) * (document.getElementById('calc-alt')?.checked ? 1.22 : 1.0);
            return {
                primaryData: this.baseline.map(s => Math.pow(s, hrTotal) * 100),
                secondaryData: this.baseline.map(s => s * 100),
                labelY: "Probability of Pain-Free (%)"
            };
        }
    },

    inca: {
        category: "General Surgery", type: "calculated", shortName: "Hernia (INCA)",
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
        footer_note: "Visualising the probability of moving from watchful waiting to surgery due to symptom progression.",
        calculate: function() {
            const hr = (document.getElementById('ee-symptoms')?.value === 'mild' ? 1.45 : 1.0) * (document.getElementById('ee-age')?.value === 'old' ? 1.25 : 1.0) * (document.getElementById('ee-heavy')?.checked ? 1.30 : 1.0);
            return {
                primaryData: this.baseCrossover.map(val => (1 - Math.pow((1 - val), hr)) * 100),
                secondaryData: this.baseCrossover.map(v => v * 100),
                labelY: "Surgery Probability (%)"
            };
        }
    },

    reflux: {
        category: "General Surgery", type: "calculated", shortName: "GORD (REFLUX)",
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
        footer_note: "REFLUX (n=357). At 5 years, 14% of surgery patients required medication vs 82% of medical patients.",
        calculate: function() {
            const riskMod = (document.getElementById('ref-bmi')?.checked ? 0.90 : 1.0) * (document.getElementById('ref-hernia')?.checked ? 0.85 : 1.0) * (parseFloat(document.getElementById('ref-age')?.value) || 1.0);
            return {
                primaryData: this.baseline_surg.map(s => s * riskMod),
                secondaryData: this.baseline_med,
                labelY: "Probability off PPI Medication (%)"
            };
        }
    },

    coda: {
        category: "General Surgery", type: "calculated", shortName: "Appendicitis (CODA)",
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
        footer_note: "CODA (n=1552). Presence of an appendicolith dramatically increases the risk of antibiotic failure.",
        calculate: function() {
            const abxMod = document.getElementById('coda-stone')?.checked ? 0.65 : 1.0; 
            return {
                primaryData: this.baseline_abx.map((s, i) => i === 0 ? 100 : s * abxMod),
                secondaryData: this.baseline_surg,
                labelY: "Probability of Avoiding Surgery (%)"
            };
        }
    },

    protect: {
        category: "Urology", type: "calculated", shortName: "Prostate (ProtecT)",
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
        footer_note: "Prostate-cancer specific survival is ~97% across all arms at 15 years. Chart displays Metastasis-Free Survival.",
        calculate: function() {
            const hr = parseFloat(document.getElementById('pro-gleason')?.value) || 1.0;
            return {
                primaryData: this.baseline_surv.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_surg.map(s => Math.pow(s/100, hr) * 100),
                labelY: "Metastasis-Free Survival (%)"
            };
        }
    },

    bariatrics: {
        category: "General Surgery", type: "calculated", shortName: "Bariatrics (STAMPEDE)",
        title: "Metabolic Surgery Outcomes", subtitle: "Gastric Bypass vs. Sleeve vs. Medical",
        source: "STAMPEDE Trial", color: "#8b5cf6",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_bypass: [0, 29, 28, 28, 27, 27], baseline_sleeve: [0, 25, 24, 24, 23, 23],
        controlsHTML: `
            <label class="nav-label">Procedure Selected</label>
            <select id="bar-surg" class="ee-select" onchange="runCalculation('bariatrics')">
                <option value="bypass">Roux-en-Y Gastric Bypass</option><option value="sleeve">Sleeve Gastrectomy</option>
            </select>
            <label class="ee-check-group"><input type="checkbox" id="bar-diab" onchange="runCalculation('bariatrics')"> Type 2 Diabetes</label>
        `,
        footer_note: "Chart displays expected Total Body Weight Loss % (TBWL).",
        calculate: function() {
            const surgType = document.getElementById('bar-surg')?.value || 'bypass';
            const diabMod = document.getElementById('bar-diab')?.checked ? 0.95 : 1.0; 
            const base = surgType === 'bypass' ? this.baseline_bypass : this.baseline_sleeve;
            const comp = surgType === 'bypass' ? this.baseline_sleeve : this.baseline_bypass;
            return {
                primaryData: base.map(s => s * diabMod),
                secondaryData: comp,
                labelY: "Total Body Weight Loss (TBWL %)"
            };
        }
    },

    topkat: {
        category: "Orthopaedics", type: "calculated", shortName: "Knees (TOPKAT)",
        title: "TOPKAT Trial: Knee Arthroplasty", subtitle: "Total (TKR) vs. Partial (UKR) Knee Replacement",
        source: "The Lancet 2019", color: "#14b8a6",
        xAxisLabels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'],
        baseline_tkr: [100, 99.5, 99, 98.8, 98.5, 98.2], baseline_ukr: [100, 98, 96.5, 95.5, 94.5, 94.0],
        controlsHTML: `
            <label class="nav-label">Age Cohort</label>
            <select id="top-age" class="ee-select" onchange="runCalculation('topkat')">
                <option value="1.0">Over 60</option><option value="1.5">Under 60 (Higher physical demand)</option>
            </select>
        `,
        footer_note: "TOPKAT (n=528). Partial replacements offer faster recovery but carry a slightly higher 5-year revision rate.",
        calculate: function() {
            const hr = parseFloat(document.getElementById('top-age')?.value) || 1.0;
            return {
                primaryData: this.baseline_ukr.map(s => Math.pow(s/100, hr) * 100),
                secondaryData: this.baseline_tkr.map(s => Math.pow(s/100, hr) * 100),
                labelY: "Implant Survival - Free from Revision (%)"
            };
        }
    },

    cataract: {
        category: "Ophthalmology", type: "calculated", shortName: "Cataract (NOD)",
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
        footer_note: "Alpha-blockers highly increase the risk of Intraoperative Floppy Iris Syndrome (IFIS).",
        calculate: function() {
            const ifisRisk = document.getElementById('cat-alpha')?.checked ? 0.82 : 1.0; 
            const diabRisk = document.getElementById('cat-diab')?.checked ? 0.90 : 1.0;
            return {
                primaryData: this.baseline_success.map((s, i) => i === 0 ? s : s * (ifisRisk * diabRisk)),
                secondaryData: this.baseline_success,
                labelY: "Prob. of Visual Recovery (%)"
            };
        }
    },

    eclipse: {
        category: "Gynaecology", type: "calculated", shortName: "HMB (ECLIPSE)",
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
        footer_note: "ECLIPSE tracks Quality of Life (MMAS). Hysterectomy offers immediate definitive cure; Mirena avoids surgical risk.",
        calculate: function() {
            const path = document.getElementById('gyn-path')?.value || 'mirena';
            const fMod = document.getElementById('gyn-fibroid')?.checked ? 0.85 : 1.0; 
            const base = path === 'mirena' ? this.baseline_mirena : this.baseline_hyst;
            const comp = path === 'mirena' ? this.baseline_hyst : this.baseline_mirena;
            return {
                primaryData: base.map((s, i) => (path === 'mirena' && i > 0) ? s * fMod : s),
                secondaryData: comp,
                labelY: "MMAS Quality of Life Score (0-100)"
            };
        }
    },

    nature: {
        category: "ENT", type: "calculated", shortName: "Tonsils (NAtuRE)",
        title: "Adult Tonsillectomy Outcomes", subtitle: "Surgery vs. Conservative Management",
        source: "The Lancet / NAtuRE Cohort", color: "#14b8a6",
        xAxisLabels: ['Baseline', '6m', '12m', '18m', '24m'],
        baseline_surg: [100, 95, 92, 90, 88], baseline_cons: [100, 60, 45, 35, 30],
        controlsHTML: `
            <label class="ee-check-group"><input type="checkbox" id="ent-smoke" onchange="runCalculation('nature')"> Current Smoker</label>
        `,
        footer_note: "Smokers face a statistically higher risk of secondary post-operative haemorrhage and delayed mucosal healing.",
        calculate: function() {
            const smokeMod = document.getElementById('ent-smoke')?.checked ? 0.90 : 1.0; 
            return {
                primaryData: this.baseline_surg.map((s, i) => i === 0 ? 100 : s * smokeMod),
                secondaryData: this.baseline_cons,
                labelY: "Prob. Remaining Episode-Free (%)"
            };
        }
    },

    readiness: {
        category: "Peri-operative", type: "passport", shortName: "Readiness Passport",
        title: "Surgical Readiness Assessment", subtitle: "Clinical Optimisation & Risk Synthesis",
        source: "Rahman Medical Services", color: "#6facd5",
        controlsHTML: `
            <div id="readiness-inputs">
                <div class="rh-group">
                    <label class="nav-label">1. Functional Capacity (DASI)</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="5.50"> Climb stairs / Walk up hill</label>
                    <label class="ee-check-group"><input type="checkbox" class="d-val" value="8.00"> Run short distance</label>
                </div>
                <div class="rh-group" style="margin-top:20px;">
                    <label class="nav-label">2. Airway & Risk (STOP-BANG)</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val"> Snore loudly?</label>
                    <label class="ee-check-group"><input type="checkbox" class="s-val" id="in-bmi"> BMI greater than 35?</label>
                </div>
                <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="runCalculation('readiness')">Process Clinical Narrative</button>
            </div>
        `,
        narrativeTemplate: `
            <div id="web-narrative-display" style="display:none; margin-top:30px;">
                <div style="background:var(--brand-navy); color:white; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="margin-top:0; color:#6facd5;">Clinical Narrative Summary</h3>
                    <p id="out-advice" style="font-size:1.1rem; line-height:1.5;"></p>
                </div>
                <div class="grid" style="grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="evidence-card"><div class="stat-label">Functional Capacity</div><div id="out-mets" class="stat-main">--</div><div class="stat-label">METs</div></div>
                    <div class="evidence-card"><div class="stat-label">Anaesthetic Risk</div><div id="out-sb" class="stat-main">--</div><div class="stat-label">STOP-BANG</div></div>
                </div>
                <button class="nav-btn active" style="margin-top:20px; width:100%; background:#10b981;" onclick="exportToPDF('Readiness-Passport')">Download Official Passport (PDF)</button>
            </div>
        `,
        footer_note: "Clinical synthesis of patient-reported metrics via the Duke Activity Status Index (DASI).",
        calculate: function() {
            let dasi = 0; document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
            let mets = ((0.43 * dasi) + 9.6) / 3.5;
            let sb = 0; document.querySelectorAll('.s-val:checked').forEach(i => sb += 1);

            document.getElementById('initial-message').style.display = 'none';
            document.getElementById('web-narrative-display').style.display = 'block';
            document.getElementById('out-mets').innerText = mets.toFixed(1);
            document.getElementById('out-sb').innerText = sb + "/5";

            let advice = (mets >= 4 && sb < 3 && !document.getElementById('in-bmi')?.checked) 
                ? "Patient presents as a high-readiness candidate for elective surgery."
                : "Clinical review required. Functional reserve, BMI, or airway markers identify areas for pre-operative focus.";
            document.getElementById('out-advice').innerText = advice;

            return null; // No chart data returned
        }
    },

    recovery: {
        category: "Peri-operative", type: "calculated", shortName: "Recovery Passport",
        title: "Predictive Recovery Passport", subtitle: "Procedure-Specific ERAS Trajectories",
        source: "ERAS Society Outcomes Database", color: "#10b981", 
        xAxisLabels: ['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 21', 'Day 28', '6 Weeks'],
        baselines: {
            lap_minor: [5, 20, 60, 85, 95, 100, 100], 
            lap_major: [0, 10, 30, 60, 80, 90, 95],   
            open_major: [0, 0, 10, 25, 45, 60, 80]    
        },
        controlsHTML: `
            <label class="nav-label">Procedure Conducted</label>
            <select id="rec-surgery" class="ee-select" onchange="runCalculation('recovery')">
                <option value="lap_minor">Lap Cholecystectomy / Hernia</option>
                <option value="lap_major">Lap Fundoplication / Bariatric</option>
                <option value="open_major">Major Open (Esophagectomy/Bowel)</option>
            </select>
            <label class="nav-label">Pre-op Fitness (From Readiness)</label>
            <select id="rec-fit" class="ee-select" onchange="runCalculation('recovery')">
                <option value="1.1">High (METs > 4)</option><option value="0.8">Low (METs < 4) / Frail</option>
            </select>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:20px;">
                <div class="evidence-card"><div class="stat-label">Driving</div><div id="rec-driving" class="stat-main" style="font-size:1.2rem;">--</div></div>
                <div class="evidence-card"><div class="stat-label">Lifting</div><div id="rec-lifting" class="stat-main" style="font-size:1.2rem;">--</div></div>
                <div class="evidence-card"><div class="stat-label">Intimacy</div><div id="rec-sex" class="stat-main" style="font-size:1.2rem;">--</div></div>
                <div class="evidence-card"><div class="stat-label">Alcohol</div><div id="rec-alcohol" class="stat-main" style="font-size:1.2rem;">--</div></div>
            </div>
        `,
        footer_note: "Predictive model indexing ERAS protocol baselines. Driving requires ability to perform an emergency stop without pain.",
        calculate: function() {
            const surg = document.getElementById('rec-surgery')?.value || 'lap_minor';
            const fit = parseFloat(document.getElementById('rec-fit')?.value) || 1.0;
            const selected = this.baselines[surg];
            const delay = (fit < 1.0) ? 1.3 : 1.0; 
            
            if(document.getElementById('rec-driving')) {
                document.getElementById('rec-driving').innerText = surg === 'lap_minor' ? Math.round(7 * delay) + " Days" : Math.round(14 * delay) + " Days";
                document.getElementById('rec-lifting').innerText = surg === 'lap_minor' ? Math.round(4 * delay) + " Wks" : Math.round(6 * delay) + " Wks";
                document.getElementById('rec-sex').innerText = surg === 'lap_minor' ? Math.round(7 * delay) + " Days" : Math.round(14 * delay) + " Days";
                document.getElementById('rec-alcohol').innerText = surg === 'lap_major' ? "Strict Avoid" : "Off Opioids";
            }

            return {
                primaryData: selected.map(s => Math.min(s * fit, 100)),
                secondaryData: selected,
                labelY: "Return to Normal Function (%)"
            };
        }
    }
};
