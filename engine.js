/**
 * OutcomeLogic™ Universal Clinical Engine v2.6
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

    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex">
                <h2 style="margin:0;">${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            <div class="grid">
                <div id="controls-panel" class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                    ${trial.controlsHTML || '<em>Evidence view only.</em>'}
                    <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                </div>
                <div class="chart-box" id="chart-mount">
                    <canvas id="mainChart"></canvas>
                </div>
            </div>
            <div class="governance-box">${trial.footer_note}</div>
        </div>
    `;

    if (trial.type === "passport") {
        document.getElementById('chart-mount').innerHTML = trial.previewPlaceholder;
    } else {
        runCalculation(type);
    }
}

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    let primaryData, secondaryData, labelY;

    if (type === 'esopec' || type === 'viale') {
        // Oncology / Haematology Survival Math
        const hr = type === 'esopec' ? 
            (parseFloat(document.getElementById('eso-nstage')?.value) || 1) * (parseFloat(document.getElementById('eso-age')?.value) || 1) :
            (parseFloat(document.getElementById('viale-risk')?.value) || 1);
        
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
        const hrTotal = (document.getElementById('ee-symptoms')?.value === 'mild' ? 1.45 : 1.0) *
                        (document.getElementById('ee-age')?.value === 'old' ? 1.25 : 1.0) *
                        (document.getElementById('ee-heavy')?.checked ? 1.30 : 1.0);
        primaryData = trial.baseCrossover.map(val => (1 - Math.pow((1 - val), hrTotal)) * 100);
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
            labels: xLabels,
            datasets: [
                { label: 'Selected Scenario', data: primary, borderColor: color, borderWidth: 4, fill: false, tension: 0.3 },
                { label: 'Trial Average', data: secondary, borderColor: '#cbd5e1', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 }
            ]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { min: 0, max: 100, title: { display: true, text: labelY } } }
        }
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
