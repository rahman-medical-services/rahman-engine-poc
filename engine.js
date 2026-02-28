/**
 * OutcomeLogic™ Universal Clinical Engine v3.1
 * (c) 2026 Rahman Medical Services Limited. All Rights Reserved.
 * Core Logic: Multi-Mode Rendering, Power Law Math, Predictive Baselines, Practical Milestones, PDF Generation.
 */

let currentChart = null;

// 1. DYNAMIC SIDEBAR BUILDER
function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = ''; 

    const categories = [...new Set(Object.values(TRIAL_DATA).map(t => t.category))];
    categories.forEach(cat => {
        const label = document.createElement('span');
        label.className = 'nav-label';
        label.innerText = cat;
        nav.appendChild(label);

        Object.keys(TRIAL_DATA).forEach(key => {
            const trial = TRIAL_DATA[key];
            if (trial.category === cat) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerText = trial.shortName;
                btn.onclick = (e) => loadWidget(key, e);
                nav.appendChild(btn);
            }
        });
    });
}

// 2. MULTI-MODE WIDGET LOADER
function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');

    if (trial.type === "passport") {
        // --- PASSPORT NARRATIVE VIEW (e.g., Readiness) ---
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex">
                    <h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2>
                    <span class="source-tag">${trial.source}</span>
                </div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                        ${trial.controlsHTML}
                    </div>
                    <div id="passport-display-area">
                        ${trial.narrativeTemplate}
                        <div id="initial-message" style="text-align:center; padding:50px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
                            <h3 style="margin-top:0;">Assessment Pending</h3>
                            <p style="font-size:0.9rem;">Complete the clinical profile on the left to generate the patient narrative.</p>
                        </div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>
        `;
    } else {
        // --- CALCULATED MATH & CHART VIEW (e.g., Surgery, Oncology, Recovery) ---
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex">
                    <h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2>
                    <span class="source-tag">${trial.source}</span>
                </div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                        ${trial.controlsHTML || '<em>Evidence view only.</em>'}
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                    </div>
                    <div class="chart-box" id="chart-mount">
                        <canvas id="mainChart"></canvas>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>
        `;
        runCalculation(type);
    }
}

// 3. READINESS PASSPORT LOGIC (NARRATIVE GENERATION)
function processReadiness() {
    let dasi = 0;
    document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
    let mets = ((0.43 * dasi) + 9.6) / 3.5;
    
    let sb = 0;
    document.querySelectorAll('.s-val:checked').forEach(i => sb += 1);

    let pHTML = "<strong>Optimisation Requirements:</strong><br>";
    if (document.getElementById('p-smoke')?.checked) pHTML += "• Smoking Cessation required (4-week target).<br>";
    if (document.getElementById('p-diab')?.checked) pHTML += "• Diabetes HbA1c review required.<br>";
    if (document.getElementById('p-thin')?.checked) pHTML += "• Anticoagulant bridging protocol needed.<br>";
    if (document.getElementById('in-bmi')?.checked) pHTML += "• BMI > 35: Increased technical complexity noted. 'Pre-hab' strategy recommended.<br>";
    
    if (pHTML === "<strong>Optimisation Requirements:</strong><br>") pHTML = "No specific pre-operative optimisation pillars identified at this stage.";

    // UI Updates
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('web-narrative-display').style.display = 'block';
    
    document.getElementById('out-mets').innerText = mets.toFixed(1);
    document.getElementById('out-sb').innerText = sb + "/5";
    document.getElementById('out-pillars').innerHTML = pHTML;

    let advice = (mets >= 4 && sb < 3 && !document.getElementById('in-bmi')?.checked) 
        ? "Patient presents as a high-readiness candidate for elective surgery. Low metabolic and airway risk markers identified."
        : "Clinical review required. Functional reserve, BMI, or airway markers identify areas for pre-operative focus and clinical optimisation.";

    document.getElementById('out-advice').innerText = advice;
}

// 4. CLINICAL MATH ENGINE (Charts & Trajectories)
function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    if (!trial) return;
    
    let primaryData = [], secondaryData = [], labelY = "";

    if (type === 'esopec' || type === 'viale') {
        const hr = type === 'esopec' 
            ? (parseFloat(document.getElementById('eso-nstage')?.value) || 1) * (parseFloat(document.getElementById('eso-age')?.value) || 1)
            : (parseFloat(document.getElementById('viale-risk')?.value) || 1);
        
        const baseInterv = type === 'esopec' ? trial.baseline_flot : trial.baseline_aza_ven;
        const baseControl = type === 'esopec' ? trial.baseline_cross : trial.baseline_aza;

        primaryData = baseInterv.map(s => Math.pow(s/100, hr) * 100);
        secondaryData = baseControl.map(s => Math.pow(s/100, hr) * 100);
        labelY = "Overall Survival (%)";
    } 
    else if (type === 'relapstone') {
        const hrTotal = (parseFloat(document.getElementById('calc-age')?.value) || 1) * (document.getElementById('calc-mult')?.checked ? 1.19 : 1.0) * (document.getElementById('calc-alt')?.checked ? 1.22 : 1.0);
        primaryData = trial.baseline.map(s => Math.pow(s, hrTotal) * 100);
        secondaryData = trial.baseline.map(s => s * 100);
        labelY = "Probability of Pain-Free (%)";
    }
    else if (type === 'inca') {
        const combinedHR = (document.getElementById('ee-symptoms')?.value === 'mild' ? 1.45 : 1.0) * (document.getElementById('ee-age')?.value === 'old' ? 1.25 : 1.0) * (document.getElementById('ee-heavy')?.checked ? 1.30 : 1.0);
        primaryData = trial.baseCrossover.map(val => (1 - Math.pow((1 - val), combinedHR)) * 100);
        secondaryData = trial.baseCrossover.map(v => v * 100);
        labelY = "Surgery Probability (%)";
    }
    else if (type === 'reflux') {
        const riskMod = (document.getElementById('ref-bmi')?.checked ? 0.90 : 1.0) * (document.getElementById('ref-hernia')?.checked ? 0.85 : 1.0) * (parseFloat(document.getElementById('ref-age')?.value) || 1.0);
        primaryData = trial.baseline_surg.map(s => s * riskMod);
        secondaryData = trial.baseline_med;
        labelY = "Probability off PPI Medication (%)";
    }
    else if (type === 'coda') {
        const stonePresent = document.getElementById('coda-stone')?.checked;
        const abxFailureMod = stonePresent ? 0.65 : 1.0; 
        primaryData = trial.baseline_abx.map((s, i) => i === 0 ? 100 : s * abxFailureMod);
        secondaryData = trial.baseline_surg; 
        labelY = "Probability of Avoiding Surgery (%)";
    }
    else if (type === 'protect') {
        const gleasonHR = parseFloat(document.getElementById('pro-gleason')?.value) || 1.0;
        const psaHR = parseFloat(document.getElementById('pro-psa')?.value) || 1.0;
        const totalHR = gleasonHR * psaHR;
        primaryData = trial.baseline_surv.map(s => Math.pow(s/100, totalHR) * 100);
        secondaryData = trial.baseline_surg.map(s => Math.pow(s/100, totalHR) * 100);
        labelY = "Metastasis-Free Survival (%)";
    }
    else if (type === 'bariatrics') {
        const surgType = document.getElementById('bar-surg')?.value || 'bypass';
        const diabMod = document.getElementById('bar-diab')?.checked ? 0.95 : 1.0; 
        const superObeseMod = document.getElementById('bar-bmi')?.checked ? 0.90 : 1.0;

        const baseArray = surgType === 'bypass' ? trial.baseline_bypass : trial.baseline_sleeve;
        const comparator = surgType === 'bypass' ? trial.baseline_sleeve : trial.baseline_bypass;

        primaryData = baseArray.map(s => s * diabMod * superObeseMod);
        secondaryData = comparator; 
        labelY = "Total Body Weight Loss (TBWL %)";
    }
    else if (type === 'topkat') {
        const activityHR = parseFloat(document.getElementById('top-age')?.value) || 1.0;
        primaryData = trial.baseline_ukr.map(s => Math.pow(s/100, activityHR) * 100);
        secondaryData = trial.baseline_tkr.map(s => Math.pow(s/100, activityHR) * 100);
        labelY = "Implant Survival - Free from Revision (%)";
    }
    else if (type === 'recovery') {
        const surgeryType = document.getElementById('rec-surgery')?.value || 'lap_minor';
        const jobFactor = parseFloat(document.getElementById('rec-job')?.value) || 1.0;
        const fitFactor = parseFloat(document.getElementById('rec-fit')?.value) || 1.0;
        
        const selectedBaseline = trial.baselines[surgeryType] || trial.baselines['lap_minor'];
        const recoveryModifier = jobFactor * fitFactor;
        
        // Render the Chart
        primaryData = selectedBaseline.map(s => Math.min(s * recoveryModifier, 100)); 
        secondaryData = selectedBaseline; 
        labelY = "Return to Normal Function (%)";

        // Calculate Practical Milestones dynamically
        // Lower fitness (< 1.0) creates a multiplier that delays recovery milestones
        const delay = (fitFactor < 1.0) ? 1.3 : 1.0; 
        
        let driving, lifting, intimacy, alcohol;
        
        if (surgeryType === 'lap_minor') {
            driving = Math.round(7 * delay) + " Days";
            lifting = Math.round(4 * delay) + " Weeks";
            intimacy = Math.round(7 * delay) + " Days";
            alcohol = "Off Opioids";
        } else if (surgeryType === 'lap_major') {
            driving = Math.round(14 * delay) + " Days";
            lifting = Math.round(6 * delay) + " Weeks";
            intimacy = Math.round(14 * delay) + " Days";
            alcohol = "Strict Avoidance"; 
        } else {
            driving = Math.round(4 * delay) + " Weeks";
            lifting = Math.round(8 * delay) + " Weeks";
            intimacy = Math.round(4 * delay) + " Weeks";
            alcohol = "Off Opioids";
        }

        // Update DOM Elements for practical milestones
        if(document.getElementById('rec-driving')) document.getElementById('rec-driving').innerText = driving;
        if(document.getElementById('rec-lifting')) document.getElementById('rec-lifting').innerText = lifting;
        if(document.getElementById('rec-sex')) document.getElementById('rec-sex').innerText = intimacy;
        if(document.getElementById('rec-alcohol')) document.getElementById('rec-alcohol').innerText = alcohol;
    }

    renderChart('mainChart', primaryData, secondaryData, trial.color, labelY, trial.xAxisLabels);
}

// 5. CHARTING CORE
function renderChart(id, primary, secondary, color, labelY, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    // Fallback labels if none provided
    const safeLabels = xLabels || primary.map((_, i) => i === 0 ? 'Baseline' : `+${i}`);

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: safeLabels,
            datasets: [
                { 
                    label: 'Selected Patient Scenario', 
                    data: primary, 
                    borderColor: color, 
                    backgroundColor: `${color}20`, 
                    borderWidth: 4, 
                    fill: true, 
                    tension: 0.3,
                    pointBackgroundColor: color,
                    pointRadius: 4
                },
                { 
                    label: 'Trial Average / Comparator', 
                    data: secondary, 
                    borderColor: '#cbd5e1', 
                    borderDash: [5, 5], 
                    pointRadius: 0, 
                    fill: false, 
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'top', labels: { font: { weight: 'bold', family: 'Inter', color: '#334155' } } },
                tooltip: { backgroundColor: '#0f172a', padding: 12 }
            },
            scales: { 
                y: { min: 0, max: 100, title: { display: true, text: labelY, font: { weight: 'bold', color: '#475569' } }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } }
            }
        }
    });
}

// 6. PDF EXPORT HOOK
async function exportToPDF(filename) {
    const element = document.getElementById('printable-area');
    const btn = event.target;
    const originalText = btn.innerText;
    
    btn.innerText = "Generating PDF...";
    btn.disabled = true;

    // Optional Chart.js white background plugin effect applied via CSS during PDF gen
    element.style.backgroundColor = "white";

    const opt = {
        margin: [15, 12, 15, 12],
        filename: `${filename}-Evidence-Summary.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowHeight: element.scrollHeight + 100 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Export Error:", err);
        alert("Failed to generate PDF. Please ensure html2pdf.js is loaded correctly.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        element.style.backgroundColor = ""; // Reset background
    }
}

// INITIALISE
window.onload = initializeSidebar;
