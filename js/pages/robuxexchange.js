"use strict";
let rrobux = 0
let rtix = 0
const rstartExchangeScript = () => {
    // Only target the specific container
    const tixMain = document.querySelector('.btn');
    
    // Safety: Stop if not found or already injected
    //console.log(tixMain)
    if (!tixMain) return;

    const items = `
        <div class="mt-4" style="width: max-content;float: right;">
           <label id="current-tix" style="position: relative;padding: .0.375rem;margin-top: 1.2rem !important;float: right;color: goldenrod;font-weight: 400;">Tx: undefined</label>
          <label id="new-robux" style="position: relative;position: relative;padding: .0 .375rem;margin-top: 1.2rem !important;color: goldenrod;font-weight: 400;">+undefined R$</label>
            <label id="current-robux" style="position: relative;position: relative;padding: .0 .375rem;margin-top: 1.2rem !important;color: limegreen;font-weight: 400;">R$: undefined</label>
        </div>
        `;

    tixMain.parentElement.insertAdjacentHTML('beforeend', items);

    const tixInput = document.querySelector('input#robux');
    const labelTix = document.getElementById('current-tix');
    const labelNew = document.getElementById('new-robux');
    const labelRobux = document.getElementById('current-robux');
    const pFormat = new Intl.NumberFormat('en-US');
    
    //console.log("hi3")
const updateLabels = () => {
    //console.log("update label")
let inputStr = tixInput.value;
    const maxChars = String(rrobux).length;

    // 1. Character Limit: If string is longer than the balance's length, trim it
    if (inputStr.length > maxChars) {
        inputStr = inputStr.substring(0, maxChars);
        tixInput.value = inputStr;
    }

    let inputValue = parseFloat(inputStr) || 0;

    // 2. Value Limit: If value is higher than balance, snap to balance
    if (inputValue > rrobux) {
        inputValue = rrobux;
        tixInput.value = rrobux;
    }

    // 3. Prevent negatives
    if (inputValue < 0) {
        inputValue = 0;
        tixInput.value = 0;
    }

        // Calculate Remaining Tix and New Robux
        const newRobux = rrobux + (inputValue / 10);
        const hey = Math.round((inputValue * 10));
        
        labelTix.innerText = `Tx: ${pFormat.format(rtix)}`;
        labelTix.style.color = "darkgoldenrod";
        labelNew.innerText = `+${pFormat.format(hey)} Tx`;
        labelRobux.innerText = `R$ ${pFormat.format(rrobux)}`;
        
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
            rrobux = data.robux;
            rtix = data.tickets;
            if (tixInput) {
                updateLabels();
            }
        })
        .catch(err => console.error("Currency fetch failed:", err));

    if (tixInput) {
        tixInput.addEventListener('input', (e) => updateLabels(e.target.value));
    //console.log("hi4")
    }
};

// Instead of an observer on the whole document, 
// we check every 500ms but ONLY if we are on the right URL.
if (window.location.pathname.includes('robuxexchange')) {
    const checkExist = setInterval(() => {
        if (document.querySelector('.btn')) {
            rstartExchangeScript();
            clearInterval(checkExist); // Stop looking once found
        }
    }, 500);

    // Safety: stop looking after 10 seconds so it doesn't run forever
    setTimeout(() => clearInterval(checkExist), 10000);
}

// Hook into your existing system
pageInit.robuxexchange = function () {
    //console.log("tix exchange page detected via pageInit");
    rstartExchangeScript();
};