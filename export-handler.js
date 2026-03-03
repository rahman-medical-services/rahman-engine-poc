/**
 * OutcomeLogic™ Export Handler v1.0
 * Isolated PDF Generation Module
 * (c) 2026 Rahman Medical Services Limited
 */

window.executePDFExport = async function(filename, btn) {
    const originalElement = document.getElementById('printable-area');
    if (!originalElement) {
        console.error("Export Handler: #printable-area not found.");
        return;
    }

    const originalText = btn ? btn.innerText : 'Download PDF';

    // 1. UI Lockdown
    if (btn) {
        btn.innerText = "Generating PDF...";
        btn.disabled = true;
        btn.style.opacity = "0.7";
    }

    try {
        // 2. Capture Chart Data BEFORE any cloning or movement
        const canvas = document.getElementById('mainChart');
        let chartDataURL = null;
        if (canvas) {
            // High-resolution capture of the live canvas
            chartDataURL = canvas.toDataURL('image/png', 1.0);
        }

        // 3. Device Detection for Viewport Management
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // 4. PDF Configuration
        const opt = {
            margin: [10, 10, 10, 10], // Top, Left, Bottom, Right (mm)
            filename: `${filename}-Evidence.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: false,
                width: 794, // Force A4 width in pixels
                windowWidth: isMobile ? 794 : undefined, // Fixes desktop zoom
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('printable-area');
                    if (!clonedElement) return;

                    // Apply A4 Portrait Styles to the CLONE only
                    Object.assign(clonedElement.style, {
                        width: '794px',
                        minWidth: '794px',
                        maxWidth: '794px',
                        padding: '40px',
                        margin: '0',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                    });

                    // Force the grid to stack vertically for the PDF
                    const grid = clonedElement.querySelector('.grid');
                    if (grid) {
                        grid.style.display = 'flex';
                        grid.style.flexDirection = 'column';
                        grid.style.gap = '30px';
                    }

                    // Replace the "live" canvas in the clone with the static high-res image
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
                    
                    // Remove the download button from the PDF output
                    const pdfBtn = clonedElement.querySelector('button');
                    if (pdfBtn) pdfBtn.style.display = 'none';
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 5. Execute PDF Snap from the original element (modified by onclone)
        await html2pdf().set(opt).from(originalElement).save();

    } catch (err) {
        console.error("PDF Export Critical Error:", err);
        alert("There was an error generating your document. The clinical engine remains stable.");
    } finally {
        // 6. UI Restoration
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    }
};
