/**
 * OutcomeLogic™ Export Handler - FIX 1.8
 * Strategy: Multi-Screen Resolution Decoupling
 */

window.executePDFExport = async function(filename, btnElement) {
    const element = document.getElementById('printable-area');
    const btn = btnElement || document.querySelector('button[onclick*="triggerExport"]');
    
    if (!element) return;

    // 1. UI LOCKDOWN & HIDE BUTTON
    const originalText = btn.innerText;
    btn.innerText = "Preparing...";
    btn.disabled = true;
    btn.style.visibility = 'hidden'; 

    try {
        // 2. CAPTURE CHART DATA
        const canvas = document.getElementById('mainChart');
        let chartDataURL = null;
        if (canvas) {
            chartDataURL = canvas.toDataURL('image/png', 1.0);
        }

        // 3. VIRTUAL VIEWPORT FORCING (The Fix for Wide Screens)
        // We tell the engine to ignore the monitor and use a 794px A4 canvas
        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                // These 4 lines prevent multi-screen resolution bugs
                width: 794,
                windowWidth: 794, 
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('printable-area');
                    if (!clonedElement) return;

                    // Force A4 Styles in the virtual document
                    Object.assign(clonedElement.style, {
                        width: '794px',
                        padding: '40px',
                        background: 'white',
                        display: 'block',
                        position: 'static'
                    });

                    // Force the vertical mobile-style stack for the PDF
                    const grid = clonedElement.querySelector('.grid');
                    if (grid) {
                        grid.style.display = 'flex';
                        grid.style.flexDirection = 'column';
                        grid.style.gap = '30px';
                        grid.style.width = '100%';
                    }

                    // Inject the static chart image
                    const ghostCanvas = clonedElement.querySelector('canvas');
                    if (ghostCanvas && chartDataURL) {
                        const img = clonedDoc.createElement('img');
                        img.src = chartDataURL;
                        img.style.width = '100%';
                        img.style.maxWidth = '650px';
                        img.style.display = 'block';
                        img.style.margin = '20px auto';
                        ghostCanvas.parentNode.replaceChild(img, ghostCanvas);
                    }
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 4. EXECUTION
        await html2pdf().set(opt).from(element).save();

    } catch (err) {
        console.error("PDF Export Failure:", err);
    } finally {
        // 5. RESTORE UI
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.visibility = 'visible'; 
    }
};
