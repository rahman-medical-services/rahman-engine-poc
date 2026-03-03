/* ==========================================================================
 * OutcomeLogic™ Universal Clinical Engine v4.3 (V2.0 Commercial Build)
 * (c) 2026 OutcomeLogic Ltd / Rahman Medical Services Limited. 
 * All Rights Reserved. PROPRIETARY CLINICAL TRIAGE MODELS.
 * Updates: Executive ROI Dashboard, Qualtrics API Bridge, Safe PDF Export, Mobile Menu Fix
 * ========================================================================== */

let currentChart = null;

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational and administrative synthesis purposes only. It visualises published research data by applying clinical modifiers to baseline cohorts. It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// --- QUALTRICS API BRIDGE (V2.0 LOGIC) ---

function loadDataFromQualtrics() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');

    if (modelTarget && TRIAL_DATA[modelTarget]) {
        console.log("OutcomeLogic: Loading " + modelTarget + " model via Qualtrics API...");

        // Mount the widget into the DOM first
        loadWidget(modelTarget, null);

        // Auto-fill the inputs based on URL parameters
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

        // Run the math immediately with the pre-filled data
        runCalculation(modelTarget);
    }
}

function exportToQualtrics(summaryText) {
    if (!summaryText) return;
    console.log("OutcomeLogic: Exporting clinical synthesis to Qualtrics...");
    window.parent.postMessage({ 
        type: 'OUTCOME_LOGIC_RESULT', 
        summaryText: summaryText 
    }, '*');
}


// --- EXECUTIVE DASHBOARD / HOME SCREEN ---

function renderWelcomeScreen() {
    const mount = document.getElementById('content-mount');
    
    // Clear any active nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    mount.innerHTML = `
        <div style="padding: 40px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease-in;">
            
            <div style="border-bottom: 3px solid var(--brand-navy); padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: var(--brand-navy); font-size: 2.4rem; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.5px;">
                    OutcomeLogic™
                </h1>
                <h2 style="color: #64748b; font-size: 1.4rem; font-weight: 400; margin-top: 0;">
                    Evidence-Driven Clinical Decision Intelligence
                </h2>
                <p style="font-size: 1.15rem; color: #334155; line-height: 1.6; max-width: 700px; margin-top: 15px;">
                    Transform patient questionnaire data into actionable triage profiles, shared decision reports, and optimized surgical pathways.
                </p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: var(--brand-navy); font-size: 1.3rem;">Projected Pathway Impact</h3>
                    <span style="background: #fef08a; color: #854d0e; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                        Demonstration Simulation
                    </span>
                </div>
                <p style="font-size: 0.95rem; color: #64748b; margin-top: 0; margin-bottom: 25px;">
                    Simulated commercial and operational outcomes based on a cohort of 1,000 standard surgical referrals processed through the OutcomeLogic engine.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; line-height: 1;">90<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Triage Time Reduction</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">Consultant review time reduced from 8 minutes to under 60 seconds per case.</div>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; line-height: 1;">32<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Conservative Allocation</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">Patients safely routed to watchful waiting pathways using validated clinical math.</div>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; line-height: 1;">18<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Pre-Op Optimisation Flagged</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">High-risk patients identified instantly, reducing day-of-surgery cancellations.</div>
                    </div>
                </div>
            </div>

            <h3 style="color: var(--brand-navy); font-size: 1.3rem; margin-bottom: 20px;">Select a Pathway to View Interactive Demo</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('inca', event)">
                    <strong>Waitlist Triage</strong><br><span style="font-size: 0.85rem; color: #64748b;">Watchful Waiting Models (INCA)</span>
                </button>
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('readiness', event)">
                    <strong>Perioperative Planning</strong><br><span style="font-size: 0.85rem; color: #64748b;">Readiness & STOP-BANG</span>
                </button>
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('bariatrics', event)">
                    <strong>Shared Decision Making</strong><br><span style="font-size: 0.85rem; color: #64748b;">Metabolic Surgery Outcomes</span>
                </button>
            </div>
        </div>
    `;
}


// --- ORIGINAL CORE ENGINE ---

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

    // Auto-close sidebar on mobile after selection
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
                            <h3 style="margin-top:0;">Assessment Pending</h3>
                            <p style="font-size:0.9rem;">Complete the clinical profile to generate the patient narrative.</p>
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
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                    </div>
                    <div>
                        <div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>
                        <div id="dynamic-output-box" style="display:none; margin-top: 25px; padding: 15px; border-radius: 6px; font-size: 14px; color: #444; line-height: 1.5; background: #f4f9fc;"></div>
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
        const outputBox = document.getElementById('dynamic-output-box');
        if (results.outputHTML) {
            outputBox.innerHTML = results.outputHTML;
            outputBox.style.borderLeft = "5px solid " + (results.outputColor || 'var(--brand-cyan)');
            outputBox.style.display = 'block';
        } else if (outputBox) {
            outputBox.style.display = 'none';
        }

        const chartMount = document.getElementById('chart-mount');
        if (results.primaryData) {
            // Un-hide the chart box if there is data to chart
            if (chartMount) chartMount.style.display = 'block';
            renderChart('mainChart', results, trial.color, trial.xAxisLabels);
        } else {
            // Hide the chart box completely so dashboard meters look clean
            if (chartMount) chartMount.style.display = 'none';
        }

        // V2.0 LOGIC: Export synthesis to Qualtrics if available
        if (results.synthesisText) {
            exportToQualtrics(results.synthesisText);
        }
    }
}

function renderChart(id, results, color, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    const isBar = results.chartType === 'bar';
    
    // Safely generate labels without triggering syntax escapes
    const safeLabels = xLabels || results.primaryData.map((_, i) => i === 0 ? 'Baseline' : '+' + i);

    currentChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: results.customXLabels || safeLabels,
            datasets: [
                { 
                    label: results.primaryLabel || 'Selected Patient Scenario', 
                    data: results.primaryData, 
                    borderColor: color, 
                    backgroundColor: isBar ? color : color + '20', 
                    borderWidth: isBar ? 1 : 4, 
                    fill: !isBar, 
                    tension: 0.3, 
                    pointBackgroundColor: color, 
                    pointRadius: isBar ? 0 : 4 
                },
                { 
                    label: results.secondaryLabel || 'Trial Average / Comparator', 
                    data: results.secondaryData, 
                    borderColor: results.secondaryColor || '#cbd5e1', 
                    backgroundColor: isBar ? (results.secondaryColor || '#cbd5e1') : 'transparent', 
                    borderDash: isBar ? [] : [5, 5], 
                    pointRadius: 0, fill: false, tension: 0.3, 
                    borderWidth: isBar ? 1 : 2 
                }
            ]
        },
        options: { 
            animation: false, // Prevents the chart from exploding during PDF capture
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', family: 'Inter', color: '#334155' }, boxWidth: 15 } } },
            scales: { 
                y: { 
                    min: results.yMin !== undefined ? results.yMin : 0, 
                    max: results.yMax !== undefined ? results.yMax : 100, 
                    title: { display: true, text: results.labelY, font: { weight: 'bold', color: '#475569' } } 
                },
                x: { grid: { display: false } }
            }
        }
    });
}

async function exportToPDF(filename, btn) {
    const originalElement = document.getElementById('printable-area');
    const originalText = btn ? btn.innerText : 'Download PDF';

    if (btn) {
        btn.innerText = "Processing...";
        btn.disabled = true;
    }

    // 1. Capture Chart as Image BEFORE anything else
    const canvas = document.getElementById('mainChart');
    let chartDataURL = null;
    if (canvas) {
        chartDataURL = canvas.toDataURL('image/png', 1.0);
    }

    // 2. Create the "Safe-Zone" Container
    // Positioned at 0,0 but behind the main UI to ensure it renders correctly
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '794px',
        backgroundColor: 'white',
        zIndex: '-1000', 
        visibility: 'visible'
    });

    const clone = originalElement.cloneNode(true);
    container.appendChild(clone);
    document.body.appendChild(container);

    // 3. Format the Clone for A4 Portrait
    const grid = clone.querySelector('.grid');
    if (grid) {
        grid.style.display = 'block'; // Force vertical stack
    }

    // Replace canvas in clone with static image
    const ghostCanvas = clone.querySelector('canvas');
    if (ghostCanvas && chartDataURL) {
        const img = new Image();
        img.src = chartDataURL;
        img.style.width = '100%';
        img.style.maxWidth = '600px';
        img.style.display = 'block';
        img.style.margin = '20px auto';
        ghostCanvas.parentNode.replaceChild(img, ghostCanvas);
    }

    // 4. Mobile vs Desktop Logic
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const opt = {
        margin: 10,
        filename: filename + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            width: 794,
            // Only use windowWidth on mobile to prevent the desktop cropping/zooming
            windowWidth: isMobile ? 794 : undefined 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // Wait 100ms for the browser to "paint" the hidden container
        await new Promise(r => setTimeout(r, 100));
        await html2pdf().set(opt).from(container).save();
    } catch (err) {
        console.error("PDF Export Error:", err);
    } finally {
        // 5. Cleanup
        document.body.removeChild(container);
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
}
// Ensure proper loading order and URL parameter checking
window.onload = function() {
    initializeSidebar();
    
    // --- HAMBURGER MENU BULLETPROOF FIX ---
    let hamburger = document.getElementById('mobile-menu-btn');
    if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.id = 'mobile-menu-btn';
        hamburger.innerHTML = '☰';
        hamburger.onclick = toggleSidebar;
        document.body.appendChild(hamburger);
    }
    // Force it to the top right corner, above everything else
    hamburger.style.cssText = 'position: fixed; top: 15px; right: 15px; z-index: 99999; background: #0f172a; color: white; border: none; padding: 8px 15px; font-size: 24px; border-radius: 6px; cursor: pointer; display: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
    
    // Add a media query to ensure it only shows on mobile screens
    const style = document.createElement('style');
    style.innerHTML = `@media (max-width: 900px) { #mobile-menu-btn { display: block !important; } }`;
    document.head.appendChild(style);
    // --------------------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');

    if (modelTarget && TRIAL_DATA[modelTarget]) {
        loadDataFromQualtrics(); 
    } else {
        renderWelcomeScreen(); 
    }
};

// --- DYNAMIC URL LISTENER ---
// Ensures the app responds if parameters change without a full page reload

window.addEventListener('popstate', function() {
    console.log("OutcomeLogic: Detected URL change, re-evaluating parameters...");
    
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');

    if (modelTarget && TRIAL_DATA[modelTarget]) {
        loadDataFromQualtrics(); 
    } else {
        renderWelcomeScreen();
    }
});
