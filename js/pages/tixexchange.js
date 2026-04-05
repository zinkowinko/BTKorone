"use strict";
let robux = 0
let tix = 0
const startExchangeScript = () => {
    // Only target the specific container
    const tixMain = document.querySelector('.btn');
    
    // Safety: Stop if not found or already injected
    if (!tixMain || document.getElementById('currency-display')) return;

    const items = `
        <div class="mt-4" style="width: max-content;float: right;">
           <label id="current-tix" style="position: relative;padding: .0.375rem;margin-top: 1.2rem !important;float: right;color: goldenrod;font-weight: 400;">Tx: undefined</label>
          <label id="new-robux" style="position: relative;position: relative;padding: .0 .375rem;margin-top: 1.2rem !important;color: limegreen;font-weight: 400;">+undefined R$</label>
            <label id="current-robux" style="position: relative;position: relative;padding: .0 .375rem;margin-top: 1.2rem !important;color: limegreen;font-weight: 400;">R$: undefined</label>
        </div>
        `;

    tixMain.parentElement.insertAdjacentHTML('beforeend', items);

    const tixInput = document.querySelector('input#tix');
    const labelTix = document.getElementById('current-tix');
    const labelNew = document.getElementById('new-robux');
    const labelRobux = document.getElementById('current-robux');
    const pFormat = new Intl.NumberFormat('en-US');

const updateLabels = () => {
let inputStr = tixInput.value;
    const maxChars = String(tix).length;

    // 1. Character Limit: If string is longer than the balance's length, trim it
    if (inputStr.length > maxChars) {
        inputStr = inputStr.substring(0, maxChars);
        tixInput.value = inputStr;
    }

    let inputValue = parseFloat(inputStr) || 0;

    // 2. Value Limit: If value is higher than balance, snap to balance
    if (inputValue > tix) {
        inputValue = tix;
        tixInput.value = tix;
    }

    // 3. Prevent negatives
    if (inputValue < 0) {
        inputValue = 0;
        tixInput.value = 0;
    }

        // Calculate Remaining Tix and New Robux
        const newRobux = robux + (inputValue / 10);
        const hey = Math.round((inputValue / 10));
        
        labelTix.innerText = `Tx: ${pFormat.format(tix)}`;
        labelTix.style.color = "darkgoldenrod";
        labelNew.innerText = `+${hey} R$`;
        labelRobux.innerText = `R$ ${pFormat.format(robux)}`;
        
        // Formatting logic
        if (inputValue > 0) {
            labelNew.style.fontWeight = "500";
        } else {
            labelNew.style.fontWeight = "400";
        }
    };

    // Fetch initial currency
    fetch('https://www.pekora.zip/apisite/economy/v1/users/192/currency')
        .then(res => res.json())
        .then(data => {
            robux = data.robux;
            tix = data.tickets;
            if (tixInput) {
                updateLabels();
            }
        })
        .catch(err => console.error("Currency fetch failed:", err));

    if (tixInput) {
        tixInput.addEventListener('input', (e) => updateLabels(e.target.value));
    }
};

// Instead of an observer on the whole document, 
// we check every 500ms but ONLY if we are on the right URL.
if (window.location.pathname.includes('tixexchange')) {
    const checkExist = setInterval(() => {
        if (document.querySelector('.btn')) {
            startExchangeScript();
            clearInterval(checkExist); // Stop looking once found
        }
    }, 500);

    // Safety: stop looking after 10 seconds so it doesn't run forever
    setTimeout(() => clearInterval(checkExist), 10000);
}

// Hook into your existing system
pageInit.tixexchange = function () {
    //console.log("tix exchange page detected via pageInit");
    startExchangeScript();
};