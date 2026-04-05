"use strict"

pageInit.develop = function() {
	console.log("develop!")
	document.$watch('[class*="developerContainer"]').$then()
		.$watchAll(".row", table => {
			console.log("WTFFKK", document.querySelectorAll('[class*="visibilityButton"]'))
			if (!(document.title.match("Develop") == null)) {
			new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
				if (n.nodeType === 1) { 
					n.querySelectorAll?.('[class*="visibilityButton"]').forEach(parent =>{
					const btn = html`<tr><td><a class='btr-listed-status'/></td></tr>`
					parent.append(btn)

					btn.$on("click", () => {
						const placeId = parseInt(table.dataset.rootplaceId, 10)
						const isVisible = table.dataset.inShowcase.toLowerCase() === "true"

						if(Number.isNaN(placeId)) { return }

						$.fetch("https://www.pekora.zip/game/toggle-profile", {
							method: "POST",
							credentials: "include",
							body: new URLSearchParams({ placeId, addToProfile: !isVisible }),
							xsrf: true
						}).then(async response => {
							const json = await response.json()
							if(json.isValid) {
								table.setAttribute("data-in-showcase", json.data.inShowcase)
							}
						})
					})
				}); 
				}
			}))).observe(document.body, { childList: true, subtree: true }); }
		})
}
