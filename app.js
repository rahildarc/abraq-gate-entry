const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx4T5QmmbgFYL_fIlDIUIOgQ_D56yjrbnTWY4Y69MiAfS7wsrV1hQgRUVYLi2ExKjYOiA/exec";

// The 'async' here makes 'await' valid below
gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        pallet: document.getElementById('palletNo').value,
        unit: document.getElementById('unit').value,
        grower: document.getElementById('grower').value,
        purchaser: document.getElementById('purchaser').value,
        contact: document.getElementById('contact').value,
        type: document.getElementById('entryType').value,
        carNo: document.getElementById('carNo').value || 'N/A'
    };

    try {
        // 'await' works here because of the 'async' above
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        alert("Saved to Google Sheets!");
        location.reload(); // Refresh to clear form
    } catch (err) {
        alert("Error saving data.");
    }
});
