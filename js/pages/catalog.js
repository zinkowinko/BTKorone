"use strict"

pageInit.catalog = function() {
	//console.log("sup rar")
	if(settings.general.robuxToUSD) {
		modifyTemplate("item-card", template => {
			template.$findAll(".item-card-price").forEach(label => {
				label.style.display = "flex"
	
				const div = html`<div style="flex:1 0 auto"></div>`
				while(label.firstChild) { div.append(label.firstChild) }
	
				label.append(div)
				const text = `($\{{::(((item.lowestPrice||item.price)*${GetRobuxRatio()[0]})/${GetRobuxRatio()[1]})|number:2}})`
				label.title = `{{::item.IsFree && "Free " || "R$ "}}{{::(item.lowestPrice||item.price)|number:0}} ${text}`
				label.append(html`
				<div style="flex:0 1 auto;padding-left:4px;overflow:hidden;text-overflow:ellipsis;" ng-if=item.lowestPrice||item.price class=text-robux ng-cloak> ${text}</div>
				`)
			})
		})
	}
	//console.log(settings.catalog.showOwnedAssets)
	if(settings.catalog.showOwnedAssets) {
		//console.log("owned!")
		const updateOwnedAssets = ownedAssets => {
			Object.entries(ownedAssets).forEach(([key, isOwned]) => {
				//console.log(key, isOwned)
				const elems = document.$findAll(".col-6 .col-md-6 .col-lg-3 .mb-4")

				elems.forEach(thumb => {
					const ownedLabel = thumb.$find(".btr-item-owned")

					if(true){//isOwned) {
						if(!ownedLabel) {
							thumb.append(html`<span class=btr-item-owned><span class=icon-checkmark-white-bold title="You own this item" style="bottom:auto;left:auto;"></span></span>`)
						}
					} else {
						if(ownedLabel) {
							ownedLabel.remove()
						}
					}
				})
			})
		}

		let currentRequest
		const checkItem = (anchor, thumb) => {
			const match = anchor.href && anchor.href.match(/\/(catalog|library|bundles)\/(\d+)/)

			if(!match) {
				delete thumb.dataset.btrOwnedId
				return
			}

			const id = match[1] === "bundles" ? "bundle_" + match[2] : match[2]

			if(!currentRequest) {
				currentRequest = []

				$.setImmediate(() => {
					MESSAGING.send("filterOwnedAssets", currentRequest, updateOwnedAssets)
					currentRequest = null
				})
			}

			currentRequest.push(id)
			thumb.dataset.btrOwnedId = id
		}

		document.$watch("#results").$then()
			.$watchAll(".hlist", hlist => {
				hlist.$watchAll(".list-item", item => {
					item.$watch([".item-card-container", ".item-card-thumb-container"], (anchor, thumb) => {
						checkItem(anchor, thumb)
						
						new MutationObserver(() => {
							checkItem(anchor, thumb)
						}).observe(anchor, {
							attributes: true,
							attributeFilter: ["href"]
						})
					})
				})
			})
	}
}