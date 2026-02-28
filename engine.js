/**
 * OutcomeLogic™ Universal Engine
 * Proprietary Logic: Rahman Medical Services Limited
 */

let currentChart = null;

// 1. Build the Sidebar automatically from TRIAL_DATA
function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
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

// 2. Load Widget with Subgroup Interactivity
function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    // UI: Active Button State
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');

    // Build Subgroup Dropdown (Only if more than 1 subgroup exists)
    let subgroupHTML = '';
    const keys = Object.keys(trial.subgroups);
    if (keys.length > 1) {
        subgroupHTML = `
            <div style="margin-bottom: 25px;">
                <label style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:8px;">Subgroup Filter</label>
                <select id="subgroup-picker" onchange="updateView('${type}', this.value)" 
                        style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0; font-family:inherit; font-weight:600; background:#fff; cursor:pointer;">
                    ${keys.map(k => `<option value="${k}">${trial.subgroups[k].label}</option>`).join('')}
                </select>
            </div>
        `;
    }

    // Build the Main UI Structure
    mount.innerHTML = `
        <div class="widget-container">
            <div class="header-flex">
                <h2 style="margin:0; font-weight:800;">${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            
            <div class="grid">
                <div>
                    ${subgroupHTML}
                    <div class="evidence-card">
                        <div id="stat-m1" class="stat-main">${trial.metrics.m1_value}</div>
                        <div class="stat-label">${trial.metrics.m1_label}</div>
                        
                        <div id="stat-m2" class="stat-main muted">${trial.metrics.m2_value}</div>
                        <div class="stat-label">${trial.metrics.m2_label}</div>
                        
                        <div class="secondary-info" id="secondary-display">
                            <strong>Trial Metrics:</strong><br>
                            ${trial.metrics.secondary}<br>
                            <span id="stat-hr" style="color:var(--accent); font-weight:700;">HR: ${trial.subgroups.all.hr || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="chart-box">
                    <canvas id="mainChart"></canvas>
                </div>
            </div>
            <div class="governance-box">
                <strong>Clinical Note:</strong> ${trial.footer_note}
            </div>
        </div>
    `;

    // Initial Render (Always start with 'all' subgroup)
    updateView(type, 'all');
}

// 3. Update Chart & Stats when Subgroup changes
function updateView(trialKey, subgroupKey) {
    const trial = TRIAL_DATA[trialKey];
    const sub = trial.subgroups[subgroupKey];
    
    // Update HR/P-Value if it changes by subgroup
    if(sub.hr) document.getElementById('stat-hr').innerText = `HR: ${sub.hr}`;
    
    // Re-draw the Chart
    renderChart('mainChart', sub, trial.color, trial.yAxisLabel || 'Probability (%)');
}

// 4. Chart.js Implementation
function renderChart(id, sub, color, yLabel) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Baseline', '1yr', '2yr', '3yr', '4yr', '5yr'].slice(0, sub.intervention.length),
            datasets: [
                { 
                    label: 'Intervention Arm', 
                    data: sub.intervention, 
                    borderColor: color, 
                    borderWidth: 4, 
                    fill: false, 
                    tension: 0.15,
                    pointRadius: 4,
                    pointBackgroundColor: color
                },
                { 
                    label: 'Control Arm', 
                    data: sub.control, 
                    borderColor: '#cbd5e1', 
                    borderWidth: 2, 
                    borderDash: [6, 4], 
                    fill: false, 
                    tension: 0.15,
                    pointRadius: 0
                }
            ]
        },
        options: { 
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'bottom', labels: { boxWidth: 20, font: { weight: '600' } } },
                tooltip: { backgroundColor: '#0f172a', padding: 12 }
            },
            scales: { 
                y: { 
                    beginAtZero: false, 
                    grid: { color: '#f1f5f9' },
                    title: { display: true, text: yLabel, font: { weight: '700' } } 
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// Global Initialise
window.onload = initializeSidebar;
