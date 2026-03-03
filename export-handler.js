/**
 * OutcomeLogic™ Export Handler - FIX 1.3
 * Addressing: TypeError: undefined is not an object (evaluating 't.width.toString')
 */

window.executePDFExport = async function(filename, btnElement) {
    const element = document.getElementById('printable-area');
    const btn = btnElement || document.querySelector('button[onclick*="triggerExport"]');
    
    if (!element) return;

    // 1. UI LOCKDOWN
    const originalText = btn.innerText;
    btn.innerText = "Preparing...";
    btn.disabled = true;

    try {
        // 2. FORCE CHART STABILITY
        // We grab the image data and immediately check if it exists
        const canvas = document.getElementById('mainChart');
        let chartDataURL = null;
        if (canvas) {
            chartDataURL = canvas.toDataURL('image/png', 1.0);
            if (!chartDataURL || chartDataURL === "data:,") {
                throw new Error("Canvas not ready for capture.");
            }
        }

        // 3. THE "T.WIDTH" FIX: Delay & Explicit Dimensions
        // We force the browser to 'rest' for 250ms to ensure the DOM is stable
        await new Promise(resolve => setTimeout(resolve, 250));

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        const opt = {
            margin: 10,
            filename: filename + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                // Explicitly defining these prevents the library from 
                // guessing (which is where the 't.width' error lives)
                width: 794,
                windowWidth: isMobile ? 794 : 1024, 
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 4. EXECUTION
        await html2pdf().set(opt).from(element).save();

    } catch (err) {
        console.error("PDF Engine Crash:", err);
        alert("The PDF engine timed out. Your clinical data is safe. Please try again in a moment.");
    } finally {
        // 5. GUARANTEED UNFREEZE
        // This MUST run regardless of the internal library error
        btn.innerText = originalText;
        btn.disabled = false;
        console.log("UI Reset complete.");
    }
};
