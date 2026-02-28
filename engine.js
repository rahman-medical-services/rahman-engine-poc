/**
 * OutcomeLogic™ Universal Clinical Engine v4.0
 * Fully decoupled architecture using Open-Closed Principle.
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
    if (event) event.target.classList.add('active');

    if (trial.type === "passport") {
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex"><h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar">${trial.controlsHTML}</div>
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
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex"><h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar">
                        ${trial.controlsHTML}
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                    </div>
                    <div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>
        `;
        runCalculation(type);
    }
}

// THE ROUTER: Calls the specific logic inside the trial object
function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    if (!trial || typeof trial.calculate !== 'function') return;

    // Execute the trial's internal math
    const results = trial.calculate();

    // If the trial returns chart data, render the chart.
    // (Models like the Readiness Passport will return null after updating the DOM).
    if (results && results.primaryData) {
        renderChart('mainChart', results.primaryData, results.secondaryData, trial.color, results.labelY, trial.xAxisLabels);
    }
}

function renderChart(id, primary, secondary, color, labelY, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    const safeLabels = xLabels || primary.map((_, i) => i === 0 ? 'Baseline' : `+${i}`);

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: safeLabels,
            datasets: [
                { label: 'Selected Patient Scenario', data: primary, borderColor: color, backgroundColor: `${color}20`, borderWidth: 4, fill: true, tension: 0.3, pointBackgroundColor: color, pointRadius: 4 },
                { label: 'Trial Average / Comparator', data: secondary, borderColor: '#cbd5e1', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3, borderWidth: 2 }
            ]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', family: 'Inter', color: '#334155' } } } },
            scales: { 
                y: { min: 0, max: 100, title: { display: true, text: labelY, font: { weight: 'bold', color: '#475569' } } },
                x: { grid: { display: false } }
            }
        }
    });
}

async function exportToPDF(filename) {
    const element = document.getElementById('printable-area');
    const btn = event.target;
    const originalText = btn.innerText;
    
    btn.innerText = "Generating PDF...";
    btn.disabled = true;
    element.style.backgroundColor = "white";

    const opt = {
        margin: [15, 12, 15, 12],
        filename: `${filename}-Evidence-Summary.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowHeight: element.scrollHeight + 100 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try { await html2pdf().set(opt).from(element).save(); } 
    catch (err) { alert("Failed to generate PDF. Please ensure html2pdf.js is loaded correctly."); } 
    finally { btn.innerText = originalText; btn.disabled = false; element.style.backgroundColor = ""; }
}

window.onload = initializeSidebar;
