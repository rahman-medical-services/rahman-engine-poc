/**
 * OutcomeLogic™ Universal Clinical Engine v2.7
 * Updated to handle Passport Narratives and PDF Generation
 */

let currentChart = null;

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

function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');

    if (trial.type === "passport") {
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex">
                    <h2 style="margin:0;">${trial.title}</h2>
                    <span class="source-tag">${trial.source}</span>
                </div>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                        ${trial.controlsHTML}
                    </div>
                    <div id="passport-display-area">
                        ${trial.narrativeTemplate}
                        <div id="initial-message" style="text-align:center; padding:50px; color:#64748b;">
                            <h3>Readiness Assessment Pending</h3>
                            <p>Complete the patient profile to generate the Clinical Narrative.</p>
                        </div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>`;
    } else {
        // Standard Chart View for Oncology/Surgery
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex"><h2>${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                        ${trial.controlsHTML || '<em>Evidence view only.</em>'}
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                    </div>
                    <div class="chart-box"><canvas id="mainChart"></canvas></div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>`;
        runCalculation(type);
    }
}

// PASSPORT LOGIC: Restoration of the Clinical Narrative
function processReadiness() {
    let dasi = 0;
    document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
    let mets = ((0.43 * dasi) + 9.6) / 3.5;
    
    let sb = 0;
    document.querySelectorAll('.s-val:checked').forEach(i => sb += 1);

    let pHTML = "<strong>Optimisation Requirements:</strong><br>";
    if (document.getElementById('p-smoke').checked) pHTML += "• Smoking Cessation required (4-week target).<br>";
    if (document.getElementById('p-diab').checked) pHTML += "• Diabetes HbA1c review required.<br>";
    if (document.getElementById('p-thin').checked) pHTML += "• Anticoagulant bridging protocol needed.<br>";
    if (document.getElementById('in-bmi').checked) pHTML += "• BMI > 35: Increased technical complexity noted.<br>";
    if (pHTML === "<strong>Optimisation Requirements:</strong><br>") pHTML = "No specific optimisation pillars identified.";

    // Update Web Interface
    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('web-narrative-display').style.display = 'block';
    
    document.getElementById('out-mets').innerText = mets.toFixed(1);
    document.getElementById('out-sb').innerText = sb + "/5";
    document.getElementById('out-pillars').innerHTML = pHTML;

    let advice = (mets >= 4 && sb < 3 && !document.getElementById('in-bmi').checked) 
        ? "Patient presents as a high-readiness candidate for surgery. Low metabolic and airway risk markers identified."
        : "Clinical review required. Functional reserve, BMI, or airway markers identify areas for pre-operative focus and 'Pre-hab' optimisation.";

    document.getElementById('out-advice').innerText = advice;
}

// MATH & CHART LOGIC (REMAINING AS PER PREVIOUS BUILD)
function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    let primaryData, secondaryData, labelY;

    if (type === 'esopec') {
        const hr = (parseFloat(document.getElementById('eso-nstage')?.value) || 1) * (parseFloat(document.getElementById('eso-age')?.value) || 1);
        primaryData = trial.baseline_flot.map(s => Math.pow(s/100, hr) * 100);
        secondaryData = trial.baseline_cross.map(s => Math.pow(s/100, hr) * 100);
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

    renderChart('mainChart', primaryData, secondaryData, trial.color, labelY, trial.xAxisLabels);
}

function renderChart(id, primary, secondary, color, labelY, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels || primary.map((_, i) => i),
            datasets: [
                { label: 'Selected Scenario', data: primary, borderColor: color, borderWidth: 4, fill: false, tension: 0.3 },
                { label: 'Trial Average', data: secondary, borderColor: '#cbd5e1', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 }
            ]
        },
        options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
    });
}

async function exportToPDF(filename) {
    const element = document.getElementById('printable-area');
    const opt = {
        margin: [15, 12, 15, 12],
        filename: `${filename}-OutcomeLogic.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

window.onload = initializeSidebar;
