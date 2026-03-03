/* ==========================================================================
 * OutcomeLogic™ Universal Clinical Engine v4.3 (V2.0 Commercial Build)
 * Decoupled Refactor
 * ========================================================================== */

let currentChart = null;

// --- GLOBAL SESSION STATE ---
// Bridge for passing calculator data to the future Consent UI
window.PatientSession = {
    procedureID: "",
    calculatorResult: "",
    lastUpdate: null
};

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational and administrative synthesis purposes only. It visualises published research data by applying clinical modifiers to baseline cohorts. It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// --- TRIGGER PDF EXPORT ---
// Delegates to the isolated export-handler.js
async function triggerExport(filename, btnElement) {
    if (typeof window.executePDFExport === 'function') {
        try {
            await window.executePDFExport(filename, btnElement);
        } catch (err) {
            console.error("PDF Export Bridge Error:", err);
            alert("The PDF generator hit a snag. The app is still working; please try again.");
        }
    } else {
        console.error("export-handler.js is not loaded.");
        alert("The PDF export module is currently unavailable.");
    }
}

// --- QUALTRICS API BRIDGE ---
function loadDataFromQualtrics() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');
    if (modelTarget && TRIAL_DATA[modelTarget]) {
        loadWidget(modelTarget, null);
        urlParams.forEach((value, key) => {
            if (key !== 'model') {
                const inputElement = document.getElementById(key);
                if (inputElement) {
                    if (inputElement.type === 'checkbox') {
                        inputElement.checked = (value === 'true' || value === 'on');
                    } else {
                        inputElement.value = value;
                    }
                }
            }
        });
        runCalculation(modelTarget);
    }
}

function exportToQualtrics(summaryText) {
    if (!summaryText) return;
    window.parent.postMessage({ type: 'OUTCOME_LOGIC_RESULT', summaryText: summaryText }, '*');
}

// --- EXECUTIVE DASHBOARD ---
function renderWelcomeScreen() {
    const mount = document.getElementById('content-mount');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    mount.innerHTML = `
        <div style="padding: 40px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease-in;">
            <div style="border-bottom: 3px solid var(--brand-navy); padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: var(--brand-navy); font-size: 2.4rem; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.5px;">OutcomeLogic™</h1>
                <h2 style="color: #64748b; font-size: 1.4rem; font-weight: 400; margin-top: 0;">Evidence-Driven Clinical Decision Intelligence</h2>
                <p style="font-size: 1.15rem; color: #334155; line-height: 1.6; max-width: 700px; margin-top: 15px;">Transform patient questionnaire data into actionable triage profiles and optimized surgical pathways.</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: var(--brand-navy); font-size: 1.3rem;">Projected Pathway Impact</h3>
                    <span style="background: #fef08a; color: #854d0e; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Demonstration Simulation</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">90<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Triage Time Reduction</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">32<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Conservative Allocation</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- CORE UI LOGIC ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = ''; 
    const categories = [...new Set(Object.values(TRIAL_DATA).map(t => t.category))];
    categories.forEach((cat, index) => {
        const details = document.createElement('details');
        details.className = 'nav-category';
        if (index === 0) details.open = true; 
        const summary = document.createElement('summary');
        summary.className = 'nav-label';
        summary.innerText = cat;
        details.appendChild(summary);
        const content = document.createElement('div');
        content.className = 'category-content';
        Object.keys(TRIAL_DATA).forEach(key => {
            const trial = TRIAL_DATA[key];
            if (trial.category === cat) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerText = trial.shortName;
                btn.onclick = (e) => loadWidget(key, e);
                content.appendChild(btn);
            }
        });
        details.appendChild(content);
        nav.appendChild(details);
    });
}

function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');

    if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) toggleSidebar();
    }

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
                            <h3>Assessment Pending</h3>
                        </div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
                ${GLOBAL_DISCLAIMER}
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
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="triggerExport('${trial.shortName}', this)">Download Evidence PDF</button>
                    </div>
                    <div>
                        <div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>
                        <div id="dynamic-output-box" style="display:none; margin-top: 25px; padding: 15px; border-radius: 6px; background: #f4f9fc;"></div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
                ${GLOBAL_DISCLAIMER}
            </div>
        `;
        runCalculation(type);
    }
}

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    if (!trial || typeof trial.calculate !== 'function') return;
    const results = trial.calculate();
    if (results) {
        // Update Session for Consent Form
        window.PatientSession.procedureID = type;
        window.PatientSession.calculatorResult = results.synthesisText || "";
        window.PatientSession.lastUpdate = new Date().toISOString();

        const outputBox = document.getElementById('dynamic-output-box');
        if (results.outputHTML) {
            outputBox.innerHTML = results.outputHTML;
            outputBox.style.display = 'block';
        }
        const chartMount = document.getElementById('chart-mount');
        if (results.primaryData) {
            if (chartMount) chartMount.style.display = 'block';
            renderChart('mainChart', results, trial.color, trial.xAxisLabels);
        } else {
            if (chartMount) chartMount.style.display = 'none';
        }
        if (results.synthesisText) exportToQualtrics(results.synthesisText);
    }
}

/**
 * RENDER CONSENT FORM
 * Pulls the latest clinical synthesis into a legal consent framework
 */
function renderConsentForm() {
    const mount = document.getElementById('content-mount');
    const session = window.PatientSession;

    // Check if we have data to show
    const riskSummary = session.calculatorResult || 
        "<span style='color:red;'>No clinical assessment data found. Please run a calculator first.</span>";

    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex">
                <h2 style="margin:0; color:var(--brand-navy);">Digital Consent & Risk Acknowledgement</h2>
                <span class="source-tag">v2.0 Legal Template</span>
            </div>
            <p class="subtitle">Patient-Specific Risk Synthesis for ${session.procedureID || 'Selected Procedure'}</p>
            
            <div style="margin-top:20px; border: 1px solid #cbd5e1; border-radius:12px; overflow:hidden;">
                <div style="background:var(--brand-navy); color:white; padding:20px;">
                    <h3 style="margin:0; font-size:1rem; color:var(--brand-cyan);">Clinician's Risk Synthesis</h3>
                    <p style="margin-top:10px; font-size:1.1rem; line-height:1.5;">${riskSummary}</p>
                </div>

                <div style="padding:30px; background:white;" class="prose">
                    <h4 style="margin-top:0;">Patient Declaration</h4>
                    <p style="font-size:0.95rem; color:var(--text-main);">
                        I confirm that I have discussed the risks and benefits of the proposed procedure with my clinical team. 
                        Specifically, I acknowledge the personalized risk factors identified above.
                    </p>
                    
                    <div style="margin-top:30px; border-top: 1px dashed #cbd5e1; pt-20">
                        <label class="nav-label" style="display:block; margin-bottom:10px;">Patient Signature (or authorized representative)</label>
                        <div style="height:100px; border:2px solid #f1f5f9; border-radius:8px; background:#fcfcfc; display:flex; align-items:center; justify-content:center; color:#cbd5e1;">
                            [Signature Area - Digital Pad Placeholder]
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top:30px; display:flex; gap:15px;" class="no-print">
                <button class="nav-btn active" style="flex:1; text-align:center; background:var(--brand-navy);" onclick="triggerExport('Patient-Consent', this)">
                    Finalize & Print Consent PDF
                </button>
                <button class="nav-btn" style="flex:1; text-align:center;" onclick="renderWelcomeScreen()">
                    Cancel
                </button>
            </div>

            <div class="governance-box">
                This document is a digital representation of the formal consent process. 
                Timestamp: ${session.lastUpdate || 'No active session'}
            </div>
            <div class="pdf-disclaimer">
                &copy; 2026 Rahman Medical Services Limited. This is a legally sensitive document.
            </div>
        </div>
    `;
}

function renderChart(id, results, color, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    const isBar = results.chartType === 'bar';
    const safeLabels = xLabels || results.primaryData.map((_, i) => i === 0 ? 'Baseline' : '+' + i);
    currentChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: results.customXLabels || safeLabels,
            datasets: [{ 
                label: results.primaryLabel || 'Patient Scenario', 
                data: results.primaryData, 
                borderColor: color, 
                backgroundColor: isBar ? color : color + '20', 
                fill: !isBar, tension: 0.3 
            },
            { 
                label: results.secondaryLabel || 'Trial Average', 
                data: results.secondaryData, 
                borderColor: '#cbd5e1', 
                borderDash: [5, 5], fill: false 
            }]
        },
        options: { animation: false, maintainAspectRatio: false }
    });
}

window.onload = function() {
    initializeSidebar();
    loadDataFromQualtrics();
    if (!new URLSearchParams(window.location.search).get('model')) renderWelcomeScreen();
};
