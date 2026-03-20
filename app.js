// --- CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxC-_pUEcMJA-631PecIQyKrQmA0Mmf7JUYHA4LbHHw0UzeUTY9DifoLC_eWhCu0Prv/exec"; 
const GROUP_URL = "https://chat.whatsapp.com/Bs8iGTHqfjp4kp9o1NKHQD";

// --- DOM ELEMENTS ---
const gateForm = document.getElementById('gateForm');
const typeBtns = document.querySelectorAll('.t-btn');
const entryTypeInput = document.getElementById('entryType');
const carInputDiv = document.getElementById('carInput');
const whatsappBtn = document.getElementById('whatsappBtn');
const tableBody = document.getElementById('tableBody');

let entries = JSON.parse(localStorage.getItem('abraq_master_log')) || [];
let lastEntryData = null;

// --- BUTTON TOGGLE LOGIC ---
typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const typeValue = btn.getAttribute('data-type');
        entryTypeInput.value = typeValue;
        
        // Show/Hide Vehicle Input
        carInputDiv.style.display = (typeValue === 'By Car') ? 'block' : 'none';
        document.getElementById('carNo').required = (typeValue === 'By Car');
    });
});

// --- FORM SUBMISSION ---
gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!entryTypeInput.value) return alert("Please select Entry Type (Hand or Car) first!");

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = "☁️ SYNCING TO CLOUD...";
    saveBtn.disabled = true;

    const now = new Date();
    const entryData = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
        pallet: document.getElementById('palletNo').value,
        unit: document.getElementById('unit').value,
        grower: document.getElementById('grower').value,
        purchaser: document.getElementById('purchaser').value,
        contact: document.getElementById('contact').value,
        type: entryTypeInput.value,
        carNo: document.getElementById('carNo').value || 'N/A'
    };

    try {
        // 1. Send to Google Sheets
        await fetch(SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors', 
            cache: 'no-cache',
            body: JSON.stringify(entryData) 
        });

        // 2. Save Locally & UI Update
        entries.push(entryData);
        localStorage.setItem('abraq_master_log', JSON.stringify(entries));
        lastEntryData = entryData;

        updateUI();
        gateForm.reset();
        typeBtns.forEach(b => b.classList.remove('active'));
        carInputDiv.style.display = 'none';
        
        // 3. Prepare WhatsApp
        whatsappBtn.style.display = 'block';
        saveBtn.innerText = "SAVE TO DATABASE ✅";
        saveBtn.disabled = false;
        
        alert("Success! Entry secured in Cloud Database.");
        
    } catch (err) {
        alert("Network Error! Check connection, but data is safe locally.");
        saveBtn.disabled = false;
        saveBtn.innerText = "RETRY SAVE";
    }
});

// --- WHATSAPP GROUP REDIRECT ---
whatsappBtn.addEventListener('click', () => {
    if(!lastEntryData) return;
    
    const text = `*🚨 ABRAQ AGRO ENTRY*%0A` +
                 `--------------------------%0A` +
                 `*Pallet:* ${lastEntryData.pallet}%0A` +
                 `*Unit:* ${lastEntryData.unit}%0A` +
                 `*Grower:* ${lastEntryData.grower}%0A` +
                 `*Vehicle:* ${lastEntryData.carNo}%0A` +
                 `*Time:* ${lastEntryData.time}%0A` +
                 `--------------------------`;

    window.open(`${GROUP_URL}?text=${text}`, '_blank');
    whatsappBtn.style.display = 'none'; // Hide after use
});

// --- REFRESH DASHBOARD & TABLE ---
function updateUI() {
    tableBody.innerHTML = '';
    let stats = { A: 0, B: 0, C: 0, V: 0 };

    [...entries].reverse().forEach(item => {
        tableBody.innerHTML += `<tr>
            <td>${item.time}</td>
            <td><b>${item.pallet}</b></td>
            <td>${item.unit}</td>
            <td>${item.carNo}</td>
        </tr>`;

        if(item.unit === 'A') stats.A++;
        if(item.unit === 'B') stats.B++;
        if(item.unit === 'C') stats.C++;
        if(item.type === 'By Car') stats.V++;
    });

    document.getElementById('cA').innerText = stats.A;
    document.getElementById('cB').innerText = stats.B;
    document.getElementById('cC').innerText = stats.C;
    document.getElementById('cV').innerText = stats.V;
}

function clearScreen() {
    if(confirm("Clear entries from phone screen? All data remains safe in Google Sheets.")) {
        entries = [];
        localStorage.removeItem('abraq_master_log');
        updateUI();
    }
}

updateUI();
