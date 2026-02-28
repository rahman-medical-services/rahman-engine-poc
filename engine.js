/**
 * OutcomeLogic™ Universal Engine v1.2
 * Proprietary Logic: Rahman Medical Services Limited
 * Features: Dynamic Sidebar, Multivariate Risk Modeling, Chart.js Integration
 */

let currentChart = null;

// 1. Build the Sidebar automatically from TRIAL_DATA
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

// 2. Load Widget (Handles both Static Evidence and Multivariate Calculators)
function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    // UI Update: Active Button State
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');

    if (trial.type === "calculated") {
        // --- MULTIVARIATE CALCULATOR VIEW (RELAPSTONE STYLE) ---
        mount.innerHTML = `
            <div class="widget-container">
                <div class="header-flex">
                    <h2 style="margin:0;">${trial.title}</h2>
                    <span class="source-tag">${trial.source}</span>
                </div>
                <p class="subtitle">${trial.subtitle}</p>
                
                <div class="grid">
                    <div class="ee-sidebar" style="background:#f1f5f9; padding:20px; border-radius:12px;">
                        <label class="nav-label" style="color:#64748b;">Age Cohort</label>
                        <select id="calc-age" class="ee-select" onchange="runCalculation('${type}')" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1;">
                            <option value="1.0">54 or younger</option>
                            <option value="0.57">Over 54</option>
                        </select>

                        <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; font-size:14px; margin-bottom:10px; cursor:pointer;">
                            <input type="checkbox" id="calc-mult" onchange="runCalculation('${type}')"> Multiple stones?
                        </label>
                        <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; font-size:14px; margin-bottom:10px; cursor:pointer;">
                            <input type="checkbox" id="calc-alt" onchange="runCalculation('${type}')"> ALT > 35 U/L
                        </label>
                        <label class="ee-check-group" style="display:flex; align-items:center; gap:10px; font-size:14px; margin-bottom:15px; cursor:pointer;">
                            <input type="checkbox" id="calc-wcc" onchange="runCalculation('${type}')"> WCC > 11
                        </label>

                        <div class="evidence-card" style="background:var(--primary); color:white; text-align:center;">
                            <div id="calc-result" style="font-size:2.2rem; font-weight:800; color:#6facd5;">63.0%</div>
                            <div style="font-size:0.7rem; text-transform:uppercase; opacity:0.8;">Symptom-Free at 12m</div>
                        </div>
                        
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center;" onclick="window.print()">Download Summary</button>
                    </div>
                    
                    <div class="chart-box"><canvas id="mainChart"></canvas></div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>
        `;
        runCalculation(type);

    } else {
        // --- STANDARD STATIC EVIDENCE VIEW (ESOPEC / VIALE STYLE) ---
        let subgroupHTML = '';
        const keys = Object.keys(trial.subgroups || {});
        if (keys.length > 1) {
            subgroupHTML = `
                <div style="margin-bottom: 20px;">
                    <label class="nav-label">Filter Subgroup</label>
                    <select id="subgroup-picker" onchange="updateStaticView('${type}', this.value)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #e2e8f0; font-weight:600;">
                        ${keys.map(k => `<option value="${k}">${trial.subgroups[k].label}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        mount.innerHTML = `
            <div class="widget-container">
                <div class="header-flex">
                    <h2 style="margin:0;">${trial.title}</h2>
                    <span class="source-tag">${trial.source}</span>
                </div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div>
                        ${subgroupHTML}
                        <div class="evidence-card">
                            <div class="stat-main">${trial.metrics.m1_value}</div>
                            <div class="stat-label">${trial.metrics.m1_label}</div>
                            <div class="stat-main muted">${trial.metrics.m2_value}</div>
                            <div class="stat-label">${trial.metrics.m2_label}</div>
                            <div class="secondary-info">${trial.metrics.secondary}</div>
                        </div>
                    </div>
                    <div class="chart-box"><canvas id="mainChart"></canvas></div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
            </div>
        `;
        updateStaticView(type, 'all');
    }
}

// 3. Mathematical Engine for Calculated Models (Power Law)
function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    const ageHR = parseFloat(document.getElementById('calc-age').value);
    const multHR = document.getElementById('calc-mult').checked ? 1.19 : 1.0;
    const altHR = document.getElementById('calc-alt').checked ? 1.22 : 1.0;
    const wccHR = document.getElementById('calc-wcc').checked ? 0.79 : 1.0;

    const totalHR = ageHR * multHR * altHR * wccHR;
    
    // Applying Hazard Ratio logic: S(t) = S_base(t) ^ HR
    const adjSurv = trial.baseline.map(s => Math.pow(s, totalHR) * 100);
    const finalVal = adjSurv[12].toFixed(1);

    document.getElementById('calc-result').innerText = finalVal + "%";
    renderChart('mainChart', adjSurv, trial.baseline.map(s => s * 100), trial.color, trial.yAxisLabel);
}

// 4. Update Static Evidence View
function updateStaticView(trialKey, subgroupKey) {
    const trial = TRIAL_DATA[trialKey];
    const sub = trial.subgroups[subgroupKey];
    renderChart('mainChart', sub.intervention, sub.control, trial.color, trial.yAxisLabel || 'Probability (%)');
}

// 5. Unified Charting Core
function renderChart(id, primaryData, secondaryData, color, yLabel) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: primaryData.map((_, i) => i === 0 ? 'Baseline' : (i + 'm')),
            datasets: [
                { label: 'Selected Scenario', data: primaryData, borderColor: color, borderWidth: 4, fill: false, tension: 0.3 },
                { label: 'Study Average/Control', data: secondaryData, borderColor: '#cbd5e1', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 }
            ]
        },
        options: { 
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { min: 0, max: 100, title: { display: true, text: yLabel } } }
        }
    });
}

window.onload = initializeSidebar;
