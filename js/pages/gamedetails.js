"use strict"

pageInit.gamedetails = function(placeId) {
	//warn("sup")
	if(!settings.gamedetails.enabled) { return }

	const newContainer = html`
	<div class="col-xs-12 btr-game-main-container section-content">
		<div class=placeholder-main></div>
	</div>`

	const midContainer = html`
	<div class="col-xs-12 btr-mid-container"></div>`

	if (settings.general.robuxToUSD) {
		let activeContainer = null

		const observer = new MutationObserver(() => {
			const container = document.querySelector('[class^="passesContainer"]')

			// appeared
			if (container && container !== activeContainer) {
				activeContainer = container

				container.$watchAll('*', item => {
					if (!item.className?.startsWith("gPassWrapper")) return
					const label = item.$find('[class^="text"]')
					if (!label || label.dataset.usdDone) return
					label.dataset.usdDone = "1"
					const usd = RobuxToUSD(label.textContent.replace(/,/g, ""))
					label.after(html`
						<span class=${label.className} style="float:right;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis">
							&nbsp;(${usd} payouts)
						</span>
					`)

					label.parentNode.style.display = "flex"
					label.previousElementSibling.style.flex = "0 0 auto"
					label.parentNode.setAttribute(
						"title",
						`R$ ${label.parentNode.textContent.trim()}`
					)
				})
			}

			// disappeared
			if (!container && activeContainer) {
				activeContainer = null
			}
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true
		})

		// gear container stays fine as-is
		document.$watch("#rbx-gear-container").$then()
			.$watchAll(".list-item", item => {
				const label = item.$find(".text-robux")
				if (!label || label.dataset.usdDone) return
				label.dataset.usdDone = "1"

				const usd = RobuxToUSD(label.textContent.replace(/,/g, ""))
				label.after(html`
					<span class=text-robux style="float:right;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis">
						&nbsp;($${usd})
					</span>
				`)

				label.parentNode.style.display = "flex"
				label.previousElementSibling.style.flex = "0 0 auto"
				label.parentNode.setAttribute(
					"title",
					`R$ ${label.parentNode.textContent.trim()}`
				)
			})
	}
	//console.log(settings.gamedetails.mockVIPServers)
	if (settings.gamedetails.mockVIPServers) {

		const observer = new MutationObserver(() => {
			const unsupported = [...document.querySelectorAll('.section-content-off')]
				.find(el => el.textContent.includes("does not support VIP Servers"))

			if (!unsupported || unsupported.dataset.mocked) return
			unsupported.dataset.mocked = "1"

			// 1. find dynamic classes from existing elements
			const pickScopedClass = (rootSelector, prefix, fallback) => {
				const root = document.querySelector(rootSelector)
				if (!root) return fallback

				// search ALL descendants, not just first match
				const el = [...root.querySelectorAll("*")]
					.find(n => [...n.classList].some(c => c.startsWith(prefix)))

				if (!el) return fallback

				return [...el.classList].find(c => c.startsWith(prefix)) || fallback
			}

			const serverContainerClass = pickScopedClass(
				'[class*="serverContainer-"]',
				'serverContainer-',
				'serverContainer'
			)

			const btnClass = pickScopedClass(
				'[class*="btn-"]',
				'btn-',
				'btn'
			)

			const gameStatusClass = pickScopedClass(
				'[class*="callsToAction-"]',
				'gameStatus-',
				'gameStatus'
			)

			const wrapper = (html`
				<div class="${serverContainerClass}"
					style="
					height: 60px;
					display: flex;
					align-items: center;
						padding: 12px;
					background: var(--white-color);
					margin-bottom: 6px;
					flex-direction: row;
				}">
				
					<div class="gameStatus"
						style="
							flex:1;
							text-align:left;
							color: var(--text-color-tertiary);
							font-size: 16px;
							font-weight: 400;
							line-height: 1.4em;
						">
						Play this game with friends and other people you invite.
					</div>


					<button class="button"
						style="
						height: 115%;
						background: var(--primary-color);
						text-align: center;
						font-weight: 500;
						padding-top: 8px;
						border-radius: 4px;
						padding-bottom: 8px;
						width: 15%;
						--text-color-primary: white;
						font-size: initial;
						color: white;
						border: 1px solid transparent;
						margin: 0 auto;
						display: block;
						line-height: normal;
						user-select: none;
						">
						Create VIP Server
					</button>
				</div>
			`)
				unsupported.replaceWith(wrapper)

				const openMockVipModal = () => {
					// prevent duplicates
					const gameName = document.querySelector('meta[property="og:title"]')
					?.getAttribute("content")
					const gameIcon = document.querySelector('meta[property="og:image"]')
					?.getAttribute('content')
					const robuxValue = document.querySelector('[class^="currencySpan"]')
					?.textContent.trim()




			const modalHTML = `
		<div data-mock-vip-modal
			style="
				position: fixed;
				inset: 0;
				z-index: 2147483647;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(0,0,0,0.6);
				isolation: isolate;
				pointer-events: auto;
			">

			<!-- OG MODAL BELOW (UNMODIFIED) -->
			<div class="modalBg-0-2-208" style="
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			z-index: 9999;
			position: fixed;
			background: rgba(0, 0, 0, 0.8);
			align-items: center;
			justify-content: center;
		">
				<div class="modalContainer-0-2-209 containerClass-0-2-198" style="
			width: 100%;
			height: 100%;
			outline: 0px;
			overflow: visible;
			--bs-gutter-x: 1.5rem;
			--bs-gutter-y: 0;
			width: 100%;
			padding-right: calc(var(--bs-gutter-x) * .5);
			padding-left: calc(var(--bs-gutter-x) * .5);
			margin-right: auto;
			margin-left: auto;
		">
					<div class="modalWrapper-0-2-210" style="margin-top: calc(-200px + 50vh);margin: 0, calc(50% - 250);display: flex;align-items: center;justify-content: center;">
						<div class="modalDialog-0-2-211" style="
			width: 400px;
			margin: 0;
			display: inline-block;
			max-width: 100%;
			box-sizing: border-box;
			text-align: left;
			vertical-align: middle;
		">
							<div class="modalContent-0-2-212" style="    border: 1px solid rgba(0, 0, 0, 0.2);    outline: 0;    position: relative;
			border-radius: 0;    background-clip: padding-box;    background-color: var(--white-color);">
								<div class="modalHeader-0-2-213 modalHeaderBottomBorder-0-2-214" style="    padding: 12px;    min-height: 16.428571429px;    text-align: left;    border-bottom: 1px solid var(--background-color);    border-color: var(--background-color);">
									<h5 class="modalHeaderText-0-2-215" style="
			margin: 0;
			padding: 5px 0;
			font-size: 18px;
			font-weight: 400;
			line-height: 1em;
		">Create VIP Server</h5>
									<button class="closebtn exitButton-0-2-221" style="
			top: 12px;
			right: 12px;
			border: none;
			opacity: 0.2;
			padding: 0;
			z-index: 10;
			overflow: visible;
			position: absolute;
			background: none;
		">
										<span class="icon-close"></span>
									</button>
								</div>

								<div class="modalBody-0-2-216" style="
			padding: 12px;
			position: relative;
			text-align: left;
		">
									<span class="spanText-0-2-203" style="margin-bottom: 6px;display: flex;flex-wrap: wrap;align-items: center;flex-direction: row;">
										Create a VIP Server for
										<b style="padding: 0px 3px;">Free</b>
										?
									</span>
									<span class="spanText-0-2-203" style="margin-bottom: 6px;display: flex;flex-wrap: wrap;align-items: center;flex-direction: row;">
										Game Name
										<b style="padding: 0px 3px;">${gameName}</b>
									</span>
									<span class="spanText-0-2-203" style="margin-bottom: 6px;display: flex;flex-wrap: wrap;align-items: center;flex-direction: row;">
										Server Name
										<input class="finput-0-2-188" placeholder="" maxlength="32" style="height: 20px;width: 60%;margin-left: 10px;color: var(--text-color-primary);border: 1px solid var(--text-color-secondary);display: block;padding: 2px 6px;font-size: 16px;font-weight: 400;line-height: 100%;border-radius: 3px;background-color: var(--white-color);">
									</span>

									<div class="imgContainer-0-2-200" style="
			width: 100%;
			display: flex;
			justify-content: center;
		">
										<img class="image-0-2-99 img-0-2-201" style="
			width: 55%;
			padding: 0;
			height: auto;
			margin: 0 auto;
			max-width: 400px;
		"
											src="${gameIcon}"
											>
									</div>
								</div>

								<div class="modalFooter-0-2-218 footerClass-0-2-196" style="
			color: var(--text-color-secondary);
			margin: 0 12px 12px;
			padding: 0;
			font-size: 10px;
			border-top: 0;
			text-align: center;
			font-weight: 500;
			display: flex;
			align-items: center;
			flex-direction: column;
			justify-content: center;
		">
									<div class="flex">
										<div>
											<button class="closebtn btn-0-2-128 modalBtn-0-2-197 newBuyButton-0-2-93" style="
			er;
			margin: 0 5px;
			font-size: 18px !important;
			min-width: 90px;
			font-weight: 500 !important;
			line-height: 100% !important;
			color: #fff !important;
			border: 1px solid var(--success-color);
			height: auto;
			display: inline-block;
			padding: 9px;
			background: var(--success-color);
			text-align: center;
			user-select: none;
			white-space: nowrap;
			border-color: var(--success-color) !important;
			border-radius: 3px;
			vertical-align: middle;
		">
												Get Now
											</button>
										</div>
										<div>
											<button class="closebtn btn-0-2-128 modalBtn-0-2-197 newCancelButton-0-2-96" style="
			font-size: 18px !important;
			min-width: 90px;
			font-weight: 500 !important;
			line-height: 100% !important;
			color: var(--text-color-primary) !important;
			border: 1px solid var(--text-color-secondary);
			height: auto;
			display: inline-block;
			padding: 9px;
			background: var(--white-color);
			text-align: center;
			user-select: none;
			white-space: nowrap;
			border-color: var(--text-color-secondary) !important;
			border-radius: 3px;
			vertical-align: middle;
			-webkit-transition: box-shadow 200ms ease-in-out;
		">
												Cancel
											</button>
										</div>
									</div>

									<span class="flex flex-wrap align-items-center"
										style="margin-top: 12px; color: rgb(184, 184, 184);">
										Your balance after this transaction will be
										<div class="undefined flex ffffff-0-2-204">
											<span class="icon-robux-gray-16x16 priceIcon-0-2-222 bg-pos iconClass-0-2-207"></span>
											<span class="priceLabel-0-2-223 labelClass-0-2-206"
												style="color: rgb(184, 184, 184);">${robuxValue}</span>
										</div>
										This is a subscription-based feature. It will auto-renew once a month until you cancel the subscription.
									</span>
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`

		document.documentElement.insertAdjacentHTML("beforeend", modalHTML)
		const modal = document.querySelector('[data-mock-vip-modal]')

		function closeVipModal() {
			modal.remove()
		}

		modal
			.querySelectorAll('.closebtn')
			.forEach(btn => btn.addEventListener('click', closeVipModal))
		}
		wrapper.querySelector("button")
			.addEventListener("click", openMockVipModal)
		})


		observer.observe(document.body, {
			childList: true,
			subtree: true
		})
	}
	if (settings.gamedetails.showBadgeOwned) {
	let activeBadgeList = null

	const observer = new MutationObserver(() => {
	// find the badge list container
	const container = document.querySelector('[class^="badgeList"]')
	if (!container || container === activeBadgeList) return
	activeBadgeList = container

	// process each badge container inside
	container.$watchAll('*', item => {
		// drill down from badgeContainer -> badgeContentContainer -> badgeDetailsContainer
		const badgeContainer = item.closest('[class^="badgeContainer"]') || item
		if (!badgeContainer || badgeContainer.dataset.btrDoneContainer) return
		badgeContainer.dataset.btrDoneContainer = "1"

		const content = badgeContainer.querySelector('[class^="badgeContentContainer"]')
		if (!content) return

		const badge = content.querySelector('[class^="badgeDetailsContainer"]')
		if (!badge || badge.dataset.btrDone) return
		badge.dataset.btrDone = "1"

		//console.log("found badge!", badge)
		badge.classList.add("btr-badges-container")

		const badgeQueue = []
		let ownedTimeout = null

		const updateOwned = async () => {
			const userId = await loggedInUserPromise
			if (!badgeQueue.length) return

			const list = badgeQueue.splice(0)
			const url =
				`https://www.pekora.zip/apisite/badges/v1/users/192/badges/awarded-dates?badgeIds=` +
				list.map(x => x.badgeId).join(",")

				//console.log(url)
			$.fetch(url, { credentials: "include" }).then(async res => {
				if (!res.ok) return
				const owned = (await res.json()).data.map(x => +x.badgeId)
				//console.log(owned)

				list.forEach(({ row, badgeId }) => {
					const has = owned.includes(badgeId)
					//console.log(owned.includes(badgeId) + " :" + badgeId)
					row.classList.toggle("btr-notowned", !has)
					row.title = has ? "" : "You do not own this badge"
				})
			})
		}

		const processRow = row => {
			//console.log("processing row" + row)
		//	if (!row.classList || ![...row.classList].some(c => c.startsWith("badgeContainer"))) return

			const link = row.querySelector("a")
			//console.log(link)
			if (!link) return

		//	link.textContent = link.textContent.trim()
		//	const p = row.querySelector("p")
		//		//console.log(p)
		//	if (p) p.classList.remove("para-overflow")

			const match = link.href.match(/(?:library|badges)\/(\d+)\//)
			//console.log(match)
			if (!match) return

			const badgeId = +match[1]
			badgeQueue.push({ row, badgeId })

			clearTimeout(ownedTimeout)
			ownedTimeout = setTimeout(updateOwned, 10)

			row.classList.add("btr-notowned")
			row.title = "You do not own this badge"
		}

		// process this row immediately
		processRow(badgeContainer)

		// scan existing rows inside this badge list
		const parent = badge.closest('[class^="badgeList"]') || badge.parentNode
		if (!parent) return
		parent.querySelectorAll('[class^="badgeContainer"]').forEach(processRow)

		// watch for new rows dynamically added
		const rowObserver = new MutationObserver(muts => {
			muts.forEach(m =>
				m.addedNodes.forEach(n => {
					if (!(n instanceof HTMLElement)) return
					if (n.classList && [...n.classList].some(c => c.startsWith("badgeContainer"))) {
						processRow(n)
					}
					n.querySelectorAll?.('[class^="badgeContainer"]').forEach(processRow)
				})
			)
		})
		rowObserver.observe(parent, { childList: true, subtree: true })
	})
})


	observer.observe(document.body, { childList: true, subtree: true })
}

	const watcher = document.$watch("body", body => body.classList.add("btr-gamedetails")).$then()
		.$watch("#horizontal-tabs").$then()
			.$watch(["#tab-about", "#tab-game-instances"], (aboutTab, gameTab) => {
				aboutTab.$find(".text-lead").textContent = "Recommended"

				aboutTab.classList.remove("active")
				gameTab.classList.add("active")

				const parent = aboutTab.parentNode
				parent.append(aboutTab)
				parent.prepend(gameTab)
			})
		.$back()
		.$watch("#about", about => {
			about.classList.remove("active")

			about.append(
				html`
				<div class="section btr-compat-rtrack">
					<div class=container-header><h3></h3></div>
					<div class="section-content remove-panel"><pre class="text game-description"></pre></div>
				</div>`,
				html`<div class="ng-scope btr-compat-rtrack"></div>`
			)
			
			about.$watchAll("*", x => {
				if(!x.matches("#rbx-vip-servers, #my-recommended-games, .btr-compat-rtrack")) {
					midContainer.append(x)
				}
			})
		})
		.$watch("#game-instances", games => {
			games.classList.add("active")
		})
		.$watch(".game-main-content", mainCont => {
			mainCont.classList.remove("section-content")
			mainCont.before(newContainer)
			newContainer.after(midContainer)
			newContainer.$find(".placeholder-main").replaceWith(mainCont)
		})
		.$watch(".game-about-container", aboutCont => {
			const descCont = aboutCont.$find(">.section-content")

			descCont.classList.remove("section-content")
			descCont.classList.add("btr-description")
			newContainer.append(descCont)

			aboutCont.remove()
		})
		.$watch(".tab-content", cont => {
			cont.classList.add("section")
			cont.$watchAll(".tab-pane", pane => {
				if(pane.id !== "about") {
					pane.classList.add("section-content")
				}
			})
		})
		// inside your watcher chain where `badges` is the container]
		// moved outside of ts

		.$watch("#carousel-game-details", details => details.setAttribute("data-is-video-autoplayed-on-ready", "false"))
		.$watch(".game-play-button-container", cont => {
			const makeBox = (rootPlaceId, rootPlaceName) => {
				if(+rootPlaceId === +placeId) { return }

				const box = html`
				<div class="btr-universe-box">
					This place is part of 
					<a class="btr-universe-name text-link" href="/games/${rootPlaceId}/${FormatUrlName(rootPlaceName)}">${rootPlaceName || "..."}</a>
					<div class="VisitButton VisitButtonPlayGLI btr-universe-visit-button" placeid="${rootPlaceId}" data-action=play data-is-membership-level-ok=true>
						<a class="btn-secondary-md">Play</a>
					</div>
				</div>`

				newContainer.prepend(box)

				if(!rootPlaceName) {
					const anchor = box.$find(".btr-universe-name")
					getProductInfo(rootPlaceId).then(data => {
						anchor.textContent = data.Name
						anchor.href = `/games/${rootPlaceId}/${FormatUrlName(data.Name)}`
					})
				}
			}

			const playButton = cont.$find("#MultiplayerVisitButton")
			if(playButton) {
				makeBox(playButton.getAttribute("placeid"))
				return
			}

			const buyButton = cont.$find(".PurchaseButton")
			if(buyButton) {
				makeBox(buyButton.dataset.itemId, buyButton.dataset.itemName)
				return
			}

			const url = `https://api.pekora.zip/universes/get-universe-places?placeId=${placeId}`
			$.fetch(url).then(async resp => {
				const json = await resp.json()
				const rootPlaceId = json.RootPlace
				if(rootPlaceId === placeId) { return }

				const rootPlace = json.Places.find(x => x.PlaceId === rootPlaceId)
				makeBox(rootPlaceId, rootPlace ? rootPlace.Name : "")
			})
		})
	
	getProductInfo(placeId).then(data => {
		watcher.$watch(".game-stats-container").$then()
			.$watch(
				".game-stat .text-lead",
				x => x.previousElementSibling.textContent === "Created",
				label => {
					label.title = new Date(data.Created).$format("M/D/YYYY h:mm:ss A (T)")
				}
			)
			.$watch(
				".game-stat .text-lead",
				x => x.previousElementSibling.textContent === "Updated",
				label => {
					label.classList.remove("date-time-i18n") // Otherwise Pekora rewrites the label
					
					label.title = new Date(data.Updated).$format("M/D/YYYY h:mm:ss A (T)")
					label.textContent = `${$.dateSince(data.Updated, new Date())} ago`
				}
			)
	})

	$.ready(() => {
		const placeEdit = $("#game-context-menu .dropdown-menu .VisitButtonEditGLI")
		if(placeEdit) {
			placeEdit.parentNode.parentNode.append(
				html`<li><a class=btr-download-place><div>Download</div></a></li>`
			)

			document.$on("click", ".btr-download-place", () => {
				AssetCache.loadBuffer(placeId, ab => {
					const blobUrl = URL.createObjectURL(new Blob([ab]))

					const splitPath = window.location.pathname.split("/")
					const type = GetAssetFileType(9, ab)

					startDownload(blobUrl, `${splitPath[splitPath.length - 1]}.${type}`)
					URL.revokeObjectURL(blobUrl)
				})
			})
		}
	})
}