/**
 * OutcomeLogic™ Export Handler v1.1 (Bulletproof Fix)
 * Isolated PDF Generation Module
 */

window.executePDFExport = async function(filename, btnElement) {
    const originalElement = document.getElementById('printable-area');
    
    // Fallback: If btnElement is missing, try to find the active download button
    const btn = btnElement || document.querySelector('button[onclick*="triggerExport"]');
    const originalText = btn ? btn.innerText : 'Download Evidence PDF';

    // 1. UI Lockdown - High Visibility
    if (btn) {
        btn.innerText = "Generating...";
        btn.disabled = true;
        btn.style.pointerEvents = 'none'; // Prevent double-clicks
        btn.style.opacity = '0.5';
    }

    try {
        // 2. Capture Chart Data
        const canvas = document.getElementById('mainChart');
        let chartDataURL = null;
        if (canvas) {
            chartDataURL = canvas.toDataURL('image/png', 1.0);
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // 3. PDF Configuration
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                width: 794,
                windowWidth: isMobile ? 794 : undefined,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('printable-area');
                    if (!clonedElement) return;

                    // Apply Portrait Layout to Clone
                    Object.assign(clonedElement.style, {
                        width: '794px', padding: '40px', background: 'white'
                    });

                    const grid = clonedElement.querySelector('.grid');
                    if (grid) {
                        grid.style.display = 'flex';
                        grid.style.flexDirection = 'column';
                        grid.style.gap = '30px';
                    }

                    // Replace Canvas with Image
                    const ghostCanvas = clonedElement.querySelector('canvas');
                    if (ghostCanvas && chartDataURL) {
                        const img = clonedDoc.createElement('img');
                        img.src = chartDataURL;
                        img.style.width = '100%';
                        img.style.margin = '20px auto';
                        ghostCanvas.parentNode.replaceChild(img, ghostCanvas);
                    }
                    
                    // Ensure the button itself is hidden in the PDF
                    const innerBtn = clonedElement.querySelector('button');
                    if (innerBtn) innerBtn.style.display = 'none';
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 4. Execution
        await html2pdf().set(opt).from(originalElement).save();

    } catch (err) {
        console.error("PDF Export Critical Error:", err);
        // Alert the user but don't stop the 'finally' block from running
        alert("PDF Error: The document could not be generated, but your data is safe.");
    } finally {
        // 5. THE RESET: Guaranteed UI Restoration
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
        console.log("UI Thawed successfully.");
    }
};
