/**
 * OutcomeLogic™ Export Handler - FIX 1.9
 * Strategy: "Stunt Double" (A4 Hardware Decoupling)
 */

window.executePDFExport = async function(filename, btnElement) {
    const originalElement = document.getElementById('printable-area');
    const btn = btnElement || document.querySelector('button[onclick*="triggerExport"]');
    
    if (!originalElement) return;

    // 1. UI LOCKDOWN
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

        // 3. CREATE THE "STUNT DOUBLE" (Hidden A4 Container)
        const stuntDouble = document.createElement('div');
        Object.assign(stuntDouble.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '794px', // Hard-coded A4 width
            backgroundColor: 'white',
            padding: '40px'
        });

        // Clone the content into the stunt double
        const clone = originalElement.cloneNode(true);
        stuntDouble.appendChild(clone);
        document.body.appendChild(stuntDouble);

        // 4. FORMAT THE STUNT DOUBLE (Force Vertical Stack)
        const grid = clone.querySelector('.grid');
        if (grid) {
            grid.style.display = 'block'; // Simplest way to force vertical stacking
            grid.style.width = '100%';
        }

        const ghostCanvas = clone.querySelector('canvas');
        if (ghostCanvas && chartDataURL) {
            const img = new Image();
            img.src = chartDataURL;
            img.style.width = '100%';
            img.style.maxWidth = '650px';
            img.style.display = 'block';
            img.style.margin = '20px auto';
            ghostCanvas.parentNode.replaceChild(img, ghostCanvas);
        }

        // 5. PDF EXECUTION (Pointed at the Stunt Double)
        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                width: 794,
                windowWidth: 794 // No longer relies on your monitor's width
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(stuntDouble).save();

        // 6. CLEANUP
        document.body.removeChild(stuntDouble);

    } catch (err) {
        console.error("PDF Export Failure:", err);
    } finally {
        // 7. RESTORE UI
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.visibility = 'visible'; 
    }
};
