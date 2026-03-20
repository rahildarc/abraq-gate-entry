// REPLACE WITH YOUR NEW DEPLOYMENT URL
const SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1NwEyusEm2UtOxVZOU6NcOLCqnaZbRnCFxu5c7yTWW44/edit?usp=sharing"; 

const gateForm = document.getElementById('gateForm');
const whatsappBtn = document.getElementById('whatsappBtn');
let entries = JSON.parse(localStorage.getItem('abraq_data')) || [];
let lastSaved = null;

// Handle Form Submission
gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = "⚡ SENDING TO CLOUD...";
    saveBtn.disabled = true;

    const now = new Date();
    const payload = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
        pallet: document.getElementById('palletNo').value,
        unit: document.getElementById('unit').value,
        grower: document.getElementById('grower').value,
        purchaser: document.getElementById('purchaser').value,
        contact: document.getElementById('contact').value,
        type: document.getElementById('entryType').value,
        carNo: document.getElementById('carNo').value || 'N/A'
    };

    try {
        // This is the core connection to Google Sheets
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            body: JSON.stringify(payload)
        });

        // Save locally and update Screen
        entries.push(payload);
        localStorage.setItem('abraq_data', JSON.stringify(entries));
        lastSaved = payload;

        updateUI();
        gateForm.reset();
        whatsappBtn.style.display = 'block';
        saveBtn.innerText = "SAVE TO CLOUD ✅";
        saveBtn.disabled = false;
        alert("Entry Recorded Successfully!");

    } catch (err) {
        alert("Sync Error! Data saved on phone memory only.");
        saveBtn.disabled = false;
        saveBtn.innerText = "RETRY";
    }
});

// Update the Table on screen
function updateUI() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    let stats = { A: 0, B: 0, C: 0, V: 0 };

    [...entries].reverse().forEach(i => {
        tableBody.innerHTML += `<tr><td>${i.time}</td><td><b>${i.pallet}</b></td><td>${i.unit}</td><td>${i.carNo}</td></tr>`;
        if(i.unit === 'A') stats.A++;
        if(i.unit === 'B') stats.B++;
        if(i.unit === 'C') stats.C++;
        if(i.type === 'By Car') stats.V++;
    });

    document.getElementById('cA').innerText = stats.A;
    document.getElementById('cB').innerText = stats.B;
    document.getElementById('cC').innerText = stats.C;
    document.getElementById('cV').innerText = stats.V;
}

updateUI();
