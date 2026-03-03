/* ==========================================================================
 * OutcomeLogic™ Universal Clinical Engine v4.6
 * Integrated Build: Qualtrics API, Dashboard UI, & Digital Consent Suite
 * Status: Multi-Screen & Resolution Optimized
 * ========================================================================== */

let currentChart = null;
let signatureDrawing = false;
let sigCtx = null;

// --- GLOBAL SESSION STATE ---
/**
 * Transforms session into a sequential stack.
 * This allows multiple clinical findings to be bundled into one consent form.
 */
window.PatientSession = {
    procedureID: "Multi-Model Synthesis",
    lastUpdate: null,
    stack: [] // Accumulator for multiple clinical findings
};

/**
 * SESSION MANAGEMENT
 * Clears the clinical stack and reset UI for a new patient encounter.
 */
function resetPatientSession() {
    if (confirm("Clear all clinical findings for a new patient?")) {
        window.PatientSession.stack = [];
        window.PatientSession.lastUpdate = new Date().toLocaleString();
        renderWelcomeScreen();
        // Safety check before calling signature clearing
        if (typeof clearSignature === 'function') clearSignature();
    }
}

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational and administrative synthesis purposes only. 
        It visualises published research data by applying clinical modifiers to baseline cohorts. 
        It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// --- TRIGGER PDF EXPORT ---
// Delegates to the isolated export-handler.js with fallback
async function triggerExport(filename, btnElement) {
    if (typeof window.executePDFExport === 'function') {
        try {
            await window.executePDFExport(filename, btnElement);
        } catch (err) {
            console.error("PDF Export Bridge Error:", err);
            alert("The PDF generator hit a snag. Please try again.");
        }
    } else {
        console.warn("External export-handler not found. Defaulting to Native Print.");
        window.print();
    }
}

// --- QUALTRICS API BRIDGE ---
// Synchronizes URL parameters from patient surveys to UI inputs
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
    // Transmits synthesis back to parent Qualtrics window for record keeping
    window.parent.postMessage({ 
        type: 'OUTCOME_LOGIC_RESULT', 
        summaryText: summaryText 
    }, '*');
}

// --- EXECUTIVE DASHBOARD (Welcome Screen) ---
// Restores the high-fidelity branding from v4.3
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
                    <span style="background: #fef08a; color: #854d0e; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Simulation Active</span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">90<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Triage Efficiency</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">32<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Deflection Potential</div>
                    </div>
                </div>
            </div>
            
            <button class="nav-btn active" style="width:100%; height:50px; background:var(--brand-cyan); font-size:1.1rem;" onclick="renderConsentForm()">
                Initialize Digital Consent Module
            </button>
        </div>
    `;
}

// --- CORE UI LOGIC ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.toggle('open');
    if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = ''; 

    // 1. Unified Consent Access
    const consentBtn = document.createElement('button');
    consentBtn.className = 'nav-btn active';
    consentBtn.style.margin = '10px 20px 20px 20px';
    consentBtn.style.background = 'var(--brand-cyan)';
    consentBtn.innerText = 'Digital Consent Form';
    consentBtn.onclick = renderConsentForm;
    nav.appendChild(consentBtn);

    // 2. Dynamic Categories with Accordion Logic
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
            if (TRIAL_DATA[key].category === cat) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerText = TRIAL_DATA[key].shortName;
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

    // Handle Mobile Auto-Close
    if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
    }

    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex">
                <h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            
            <div class="grid">
                <div id="controls-panel" class="ee-sidebar no-print">
                    ${trial.controlsHTML}
                    ${trial.type !== 'passport' ? `<button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="triggerExport('${trial.shortName}', this)">Download Evidence PDF</button>` : ''}
                </div>
                <div id="display-area">
                    ${trial.type === 'passport' ? trial.narrativeTemplate : '<div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>'}
                    <div id="initial-message" style="text-align:center; padding:50px; color:#94a3b8; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
                        Assessment Pending - Reviewing Trial Data...
                    </div>
                    <div id="dynamic-output-box" style="display:none; margin-top: 25px; padding: 15px; border-radius: 6px; background: #f4f9fc;"></div>
                </div>
            </div>
            <div class="governance-box">${trial.footer_note}</div>
            ${GLOBAL_DISCLAIMER}
        </div>
    `;
    
    if (trial.type !== "passport") runCalculation(type);
}

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    const results = trial.calculate(); // The model now returns everything needed
    
    if (results) {
        window.PatientSession.lastUpdate = new Date().toLocaleString();
        
        // 1. Capture the finding into the stack
        // We use results.raw to ensure we only save data from THIS specific model
        const existingIndex = window.PatientSession.stack.findIndex(i => i.id === type);
        const entry = {
            id: type,
            shortName: trial.shortName,
            synthesis: results.synthesisText,
            raw: results.rawData || {} // Use the raw data returned BY the calculation
        };

        if (existingIndex > -1) window.PatientSession.stack[existingIndex] = entry;
        else window.PatientSession.stack.push(entry);

        // 2. Standard UI updates
        const out = document.getElementById('dynamic-output-box');
        if (out && results.outputHTML) { 
            out.innerHTML = results.outputHTML; 
            out.style.display = 'block'; 
        }
        const msg = document.getElementById('initial-message');
        if (msg) msg.style.display = 'none';
        if (results.primaryData) renderChart('mainChart', results, trial.color, trial.xAxisLabels);
    }
}
// --- DIGITAL CONSENT MODULE ---
/**
 * UNIVERSAL DIGITAL CONSENT RENDERER
 * Dynamically switches layouts based on the clinical session data
 */
/**
 * UNIVERSAL DIGITAL CONSENT RENDERER
 * Multi-Model Accumulator with Thumbnail Charts
 */
function renderConsentForm() {
    const mount = document.getElementById('content-mount');
    const session = window.PatientSession;

    if (!session || session.stack.length === 0) {
        mount.innerHTML = `<div class="widget-container" style="text-align:center; padding:100px;"><h3>No Clinical Data Found</h3><p>Run a clinical module first.</p></div>`;
        return;
    }

    let stackHTML = "";
    session.stack.forEach((item, index) => {
        stackHTML += `
            <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; page-break-inside: avoid;">
                <h4 style="margin: 0 0 10px 0; color: var(--brand-navy); border-bottom: 2px solid var(--brand-cyan); display: inline-block;">${item.shortName}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
                    <div style="flex: 1 1 200px;">
                        <p style="font-size: 0.95rem; line-height: 1.5; color: #334155; margin: 0;">${item.synthesis}</p>
                    </div>
                    <div style="height: 150px; width: 100%; max-width: 250px; position: relative;">
                        <canvas id="consent-chart-${index}"></canvas>
                    </div>
                </div>
            </div>`;
    });

    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div style="text-align:center; margin-bottom: 30px;">
                <h2 style="color:var(--brand-navy); margin:0;">Consent for Examination or Treatment</h2>
                <p class="subtitle" style="margin-top:5px;">Integrated Multi-Model Risk & Trajectory Synthesis</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; page-break-inside: avoid;">
                <div>
                    <label class="nav-label">Patient Name</label>
                    <input type="text" class="ee-select print-input" placeholder="Enter Full Name" style="margin-bottom:0;">
                </div>
                <div>
                    <label class="nav-label">DOB / Identifier (MRN)</label>
                    <input type="text" class="ee-select print-input" placeholder="DD/MM/YYYY - MRN" style="margin-bottom:0;">
                </div>
                <div style="grid-column: span 2;">
                    <label class="nav-label">Proposed Procedure</label>
                    <input type="text" class="ee-select print-input" placeholder="Specify Procedure (e.g., Laparoscopic Cholecystectomy)" style="margin-bottom:0;">
                </div>
            </div>

            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; font-size: 0.95rem; line-height: 1.6; color: #334155; page-break-inside: avoid;">
                <h4 style="margin:0 0 10px 0; color:var(--brand-navy);">Statement of Health Professional</h4>
                <p style="margin-bottom:20px;">I have explained the proposed procedure, including intended benefits and serious or frequently occurring risks. I have discussed alternatives (including watchful waiting) and utilized the objective clinical models below to illustrate the patient's individualized risk profile and recovery trajectory. The patient has been given the opportunity to ask questions.</p>
                
                <h4 style="margin:0 0 10px 0; color:var(--brand-navy);">Statement of Patient</h4>
                <p style="margin:0;">I agree to the procedure described above. I confirm I have read and understood the evidence synthesis provided below. I understand that the charts represent statistical probabilities and not guarantees of my specific outcome. I have had the opportunity to discuss alternatives and ask questions.</p>
            </div>

            <h3 style="color:var(--brand-navy); margin-bottom: 15px; border-bottom: 2px solid var(--brand-cyan); display: inline-block;">Personalized Evidence Synthesis</h3>
            <div style="background:#f1f5f9; padding:25px; border-radius:12px; margin-bottom:30px;">
                ${stackHTML}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; page-break-inside: avoid;">
                <div style="border: 2px solid var(--brand-navy); padding:20px; border-radius:12px; background:white;">
                    <label class="nav-label">Clinician Declaration</label>
                    <input type="text" class="ee-select print-input" placeholder="Clinician Name / Signature" style="margin-top:15px; margin-bottom:0; border: none; border-bottom: 1px dashed #cbd5e1; border-radius:0; padding-left:0; font-family:inherit;">
                    <input type="date" class="ee-select print-input" style="margin-top:10px; margin-bottom:0; border: none; border-bottom: 1px dashed #cbd5e1; border-radius:0; padding-left:0; color: var(--text-muted); font-family:inherit;">
                </div>
                <div style="border: 2px solid var(--brand-navy); padding:20px; border-radius:12px; background:white;">
                    <label class="nav-label">Unified Patient Signature</label>
                    <div style="background:#fff; border:1px dashed #cbd5e1; height:100px; margin-top:15px; position:relative;">
                        <canvas id="sig-canvas"></canvas>
                    </div>
                </div>
            </div>

            <div class="no-print" style="margin-top:40px; display:flex; gap:15px;">
                <button class="nav-btn active" style="flex:2; height:55px; background:var(--brand-navy);" onclick="window.print()">Print Legal Consent PDF</button>
                <button class="nav-btn" style="flex:1;" onclick="renderWelcomeScreen()">Return to Dashboard</button>
            </div>
            
            <div style="margin-top: 30px; font-size: 9px; color: #777; border-top: 1px solid #eee; padding-top: 10px; line-height: 1.4; text-align:center;">
                Generated by OutcomeLogic™ | This document acts as a supplementary record of Shared Decision Making and individualized risk communication.
            </div>
        </div>`;

    session.stack.forEach((item, index) => renderConsentThumbnail(`consent-chart-${index}`, item));
    initSignaturePad();
}

// --- SIGNATURE PAD LOGIC ---
function initSignaturePad() {
    const canvas = document.getElementById('sig-canvas');
    if (!canvas) return;
    
    sigCtx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    sigCtx.strokeStyle = "#0f172a";
    sigCtx.lineWidth = 2.5;
    sigCtx.lineCap = "round";

    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - r.left, y: clientY - r.top };
    };

    const start = (e) => { 
        signatureDrawing = true; 
        const pos = getPos(e);
        sigCtx.beginPath();
        sigCtx.moveTo(pos.x, pos.y);
        if (e.touches) e.preventDefault(); 
    };

    const move = (e) => {
        if (!signatureDrawing) return;
        const pos = getPos(e);
        sigCtx.lineTo(pos.x, pos.y);
        sigCtx.stroke();
        if (e.touches) e.preventDefault();
    };

    const stop = () => { signatureDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', stop);
}

function clearSignature() {
    const canvas = document.getElementById('sig-canvas');
    if (sigCtx && canvas) sigCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- CHARTING CORE ---
function renderChart(id, results, color, xLabels) {
    if (currentChart) currentChart.destroy();
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isBar = results.chartType === 'bar';
    const safeLabels = xLabels || results.primaryData.map((_, i) => i === 0 ? 'Baseline' : '+' + i);
    
    currentChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: results.customXLabels || safeLabels,
            datasets: [
                { 
                    label: results.primaryLabel || 'Patient Profile', 
                    data: results.primaryData, 
                    borderColor: color, 
                    backgroundColor: isBar ? color : color + '20', 
                    fill: !isBar, tension: 0.3 
                },
                { 
                    label: results.secondaryLabel || 'Standard Cohort', 
                    data: results.secondaryData, 
                    borderColor: '#94a3b8', 
                    borderDash: [5, 5], fill: false 
                }
            ]
        },
        options: { 
            animation: false, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: results.yMax || 100 } }
        }
    });
}

function renderConsentThumbnail(id, item) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const type = item.raw?.type;
    const labels = item.raw?.chartLabels || [];

    let chartConfig = {
        type: 'line',
        data: { labels: labels, datasets: [] },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            animation: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { 
                    display: labels.length > 0,
                    grid: { display: false },
                    ticks: { 
                        font: { size: 10, weight: 'bold' }, 
                        maxRotation: 0,
                        autoSkip: false,
                        // FILTER: Only show the very last label
                        callback: function(val, index) {
                            return index === labels.length - 1 ? this.getLabelForValue(val) : '';
                        }
                    } 
                }, 
                y: { 
                    display: true, 
                    beginAtZero: true, 
                    suggestedMax: 100,
                    ticks: { font: { size: 9 }, count: 3 } 
                } 
            } 
        }
    };

    if (type === 'readiness') {
    chartConfig.type = 'bar';
    chartConfig.data = {
        labels: ['Patient', 'Limit'],
        datasets: [{
            data: [item.raw.mets, 4.0],
            backgroundColor: [item.raw.isHighRisk ? '#ef4444' : '#10b981', '#94a3b8']
        }]
    };
    // FIX: Set a realistic Y-axis for METs
    chartConfig.options.scales.y.suggestedMax = 12; 
    chartConfig.options.scales.y.title = { display: true, text: 'METs', font: { size: 8 } };
} else {
        chartConfig.data.datasets.push({
            data: item.raw.chartPoints || [],
            borderColor: 'var(--brand-navy)',
            borderWidth: 2.5,
            tension: 0.3,
            fill: false,
            pointRadius: 0 // Remove points for a cleaner "trajectory" look
        });
    }

    new Chart(ctx, chartConfig);
}

// --- APP INITIALISATION ---
window.onload = function() {
    initializeSidebar();
    loadDataFromQualtrics();
    if (!new URLSearchParams(window.location.search).get('model')) renderWelcomeScreen();
};
