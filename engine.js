/**
 * OutcomeLogic™ Universal Engine v2.0
 * Supports: Static Evidence, Calculated Risk Models, and Readiness Passports
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
        renderPassportView(type, mount);
    } else if (trial.type === "calculated") {
        renderCalculatedView(type, mount);
    } else {
        renderStaticView(type, mount);
    }
}

// --- VIEW RENDERING LOGIC ---

function renderStaticView(type, mount) {
    const trial = TRIAL_DATA[type];
    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex"><h2>${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
            <div class="grid">
                <div>
                    <div class="evidence-card">
                        <div class="stat-main">${trial.metrics.m1_value}</div><div class="stat-label">${trial.metrics.m1_label}</div>
                        <div class="stat-main muted">${trial.metrics.m2_value}</div><div class="stat-label">${trial.metrics.m2_label}</div>
                    </div>
                    <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="exportToPDF('${trial.shortName}')">Export Evidence PDF</button>
                </div>
                <div class="chart-box"><canvas id="mainChart"></canvas></div>
            </div>
        </div>`;
    renderChart('mainChart', trial.subgroups.all.intervention, trial.subgroups.all.control, trial.color, trial.yAxisLabel);
}

function renderCalculatedView(type, mount) {
    const trial = TRIAL_DATA[type];
    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex"><h2>${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
            <div class="grid">
                <div class="ee-sidebar" style="background:#f8fafc; padding:15px; border-radius:10px;">
                    ${trial.calcControls} 
                    <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="exportToPDF('${trial.shortName}')">Export PDF Summary</button>
                </div>
                <div class="chart-box"><canvas id="mainChart"></canvas></div>
            </div>
        </div>`;
    runCalculation(type);
}

function renderPassportView(type, mount) {
    const trial = TRIAL_DATA[type];
    mount.innerHTML = `<div class="widget-container" id="printable-area">${trial.passportHTML}</div>`;
}

// --- CORE MATH & CHARTING ---

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    if (type === 'relapstone') {
        const hr = (parseFloat(document.getElementById('calc-age')?.value) || 1) * (document.getElementById('calc-mult')?.checked ? 1.19 : 1) *
                   (document.getElementById('calc-alt')?.checked ? 1.22 : 1);
        const data = trial.baseline.map(s => Math.pow(s, hr) * 100);
        renderChart('mainChart', data, trial.baseline.map(s => s * 100), trial.color, trial.yAxisLabel);
    } 
    if (type === 'inca') {
        const hr = (document.getElementById('ee-symptoms').value === 'mild' ? 1.45 : 1.0) *
                   (document.getElementById('ee-age').value === 'old' ? 1.25 : 1.0) *
                   (document.getElementById('ee-heavy').checked ? 1.30 : 1.0);
        const data = trial.baseCrossover.map(val => (1 - Math.pow((1 - val), hr)) * 100);
        renderChart('mainChart', data, trial.baseCrossover.map(v => v * 100), trial.color, trial.yAxisLabel);
    }
}

function renderChart(id, primary, secondary, color, yLabel) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: primary.map((_, i) => i),
            datasets: [
                { label: 'Selected Scenario', data: primary, borderColor: color, borderWidth: 4, fill: false, tension: 0.3 },
                { label: 'Trial Average', data: secondary, borderColor: '#cbd5e1', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 }
            ]
        },
        options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100, title: { display: true, text: yLabel } } } }
    });
}

// --- UNIVERSAL PDF EXPORT ---
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
