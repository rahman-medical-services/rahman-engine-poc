let currentChart = null;

// 1. Build the Sidebar automatically on load
function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = ''; 

    // Get unique categories from TRIAL_DATA
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

// 2. Load the specific Trial Widget
function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    // UI: Handle Active Button State
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');

    // Build HTML Structure
    mount.innerHTML = `
        <div class="widget-container">
            <div class="header-flex">
                <h2 style="margin:0;">${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            <div class="grid">
                <div class="evidence-card">
                    <div class="stat-main">${trial.metrics.m1_value}</div>
                    <div class="stat-label">${trial.metrics.m1_label}</div>
                    <div class="stat-main muted">${trial.metrics.m2_value}</div>
                    <div class="stat-label">${trial.metrics.m2_label}</div>
                    <div class="secondary-info">${trial.metrics.secondary}</div>
                </div>
                <div class="chart-box"><canvas id="mainChart"></canvas></div>
            </div>
            <div class="governance-box">${trial.footer_note}</div>
        </div>
    `;

    renderChart('mainChart', trial.subgroups.all, trial.color);
}

// 3. Render the Chart.js Logic
function renderChart(id, subgroupData, color) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Baseline', '1yr', '2yr', '3yr'],
            datasets: [
                { label: 'Intervention', data: subgroupData.intervention, borderColor: color, borderWidth: 4, fill: false, tension: 0.1 },
                { label: 'Control', data: subgroupData.control, borderColor: '#cbd5e1', borderDash: [5, 5], fill: false, tension: 0.1 }
            ]
        },
        options: { 
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: false, title: { display: true, text: 'Outcome Probability (%)' } } }
        }
    });
}

// Initialise
window.onload = initializeSidebar;
