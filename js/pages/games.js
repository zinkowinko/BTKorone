"use strict";

pageInit.games = () => { /*
    if (settings.general.hideAds) {
        const fix = (el) => {
            if (el.matches?.('[class*="uselessFuckingClass"]')) 
                Object.assign(el.style, { width: "100%", maxWidth: "100%", marginTop: "0px"});
            if (el.matches?.('[class*="containerHeader"]')) 
                Object.assign(el.style, { width: "100%", position: "relative" });
        };

        new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1) { fix(n); n.querySelectorAll?.('*').forEach(fix); }
        }))).observe(document.body, { childList: true, subtree: true });

        document.querySelectorAll('[class*="uselessFuckingClass"], [class*="containerHeader"]').forEach(fix); 
    }; */
    if (true) {
            const scrollNext = `<div class="scroller next" style="height: 240px;right: 15px;border-radius: 0px;user-select: none;background-color: rgb(255, 255, 255);width: 30px;z-index: 1000;top: -3px;border: 1px solid rgb(184, 184, 184);position: absolute;">
            <div class="arrow" style="background-repeat: no-repeat; height: 100%; width: 27px; user-select: none; right: 10px;">
                <span class="icon-games-carousel-right" style="top: calc(50% - 16px); position: relative; opacity: 0.5;"></span>
            </div>
        </div>`;

         const newfix = (el) => {
        if (el.matches?.('[class*="goForward"]') && !el.classList?.contains('scroller')) {
            el.innerHTML = scrollNext
            //style="height: 249px;width: 0px;box-shadow: none;border: none;"
            Object.assign(el.style, {height: "249px", width: "0px", boxShadow: "none", border: "none"});
        }
        };
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1) { 
                newfix(n); 
                n.querySelectorAll?.('[class*="goForward"]').forEach(newfix); 
            }
        }))).observe(document.body, { childList: true, subtree: true });

    }
};