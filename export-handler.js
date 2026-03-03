/**
 * OutcomeLogic™ Export Handler - FIX 1.5
 * Addressing: Bottom-half Chart Cut-off & Button Visibility
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
        // 2. STABILIZE CHART
        const canvas = document.getElementById('mainChart');
        if (canvas) {
            // Ensure chart is fully painted before we measure height
            canvas.toDataURL('image/png', 1.0);
        }

        // 3. FORCE FULL HEIGHT CALCULATION
        // We measure the actual internal height of the content
        const fullHeight = element.scrollHeight;
        const fullWidth = element.scrollWidth;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        const opt = {
            margin: 10,
            filename: filename + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                // Explicitly defining height stops the 'half-chart' clipping
                height: fullHeight,
                width: isMobile ? 794 : fullWidth,
                windowWidth: isMobile ? 794 : fullWidth,
                scrollY: -window.scrollY, // Corrects for page scroll offset
                scrollX: 0
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
