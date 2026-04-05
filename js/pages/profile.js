"use strict"

	//console.log(loggedInUser)
pageInit.profile = async function(userId) {
	if (loggedInUser == 192) { //console.log(userId) 
		return }
	if(!settings.profile.enabled) { return }

	const newCont = html`
	<div class=btr-profile-container>
		<div class=btr-profile-left>
			<div class="btr-profile-about profile-about">
				<div class="container-header" style="display: flex;">
				<h3 style="width: 100%">About</h3></div>
				<div class=section-content>
					<div class=placeholder-status style=display:none></div>
					<div class=placeholder-avatar style=display:none></div>
					<div class=placeholder-desc style=display:none></div>
					<div class=placeholder-aliases style=display:none></div>
					<div class=placeholder-stats style=display:none></div>
					<div class=placeholder-footer style=display:none></div>
				</div>
			</div>
			<div class=placeholder-pekoraBadges>
				<div class=container-header><h3>Pekora Badges</h3></div>
				<div class=section-content style="width:98%">
					<ul class=hlist>
				</div>
			</div>
			<div class=btr-profile-playerbadges>
				<div class=container-header><h3>Player Badges</h3></div>
				<div class=section-content style="width:98%">
					<ul class=hlist>
					</ul>
				</div>
			</div>
			<div class=btr-profile-groups>
				<div class=container-header><h3>Groups</h3></div>
				<div class=section-content style="width:98%">
					<ul class=hlist style="padding: 0px !important">
						<div class="section-content-off btr-section-content-off">This user is not in any Groups</div>
					</ul>
				</div>
			</div>
		</div>

		<div class=btr-profile-right>
			<div class=placeholder-games>
				<div class="container-header" style="display: flex;flex: auto;">
					<h3 style="width: 87%;">Games</h3>
					<a href=# class="button-0-2-195 btn-secondary-xs btn-fixed-width btn-more see-all-link-icon">See All</a>
				</div>
				<div class=section-content style="width:98%">
					<ul class="hlist game-cards">
						<div class="section-content-off btr-section-content-off">This user has no Games</div>
					</ul>
				</div>
			</div>
			<div class=placeholder-friends>
				<div class=container-header><h3>Friends</h3></div>
				<div class=section-content style="width:98%">
					<div class="section-content-off btr-section-content-off">This user has no Friends</div>
				</div>
			</div>
			<div class=btr-profile-favorites>
				<div class="container-header" style="display: flex;flex: auto;">
					<h3 style="width: 87%;">Favorites</h3>
					<a href=./favorites class="button-0-2-195 btn-secondary-xs btn-fixed-width btn-more see-all-link-icon">See All</a>
				</div>
				<div class=section-content style="width:98%">
					<ul class="hlist game-cards">
						<div class="section-content-off btr-section-content-off">This user has no favorite Places</div>
					</ul>
				</div>
			</div>
		</div>

		<div class=btr-profile-bottom style="overflow:clip; height:883px">
			<div class=placeholder-collections></div>
			<div class=placeholder-inventory></div>
		</div>
	</div>`

	const onlineStatus = settings.profile.lastOnline ? await (async () => {
		try {
			const response = await $.fetch(`https://www.pekora.zip/apisite/presence/v1/presence/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userIds: [userId.toString()]
				})
			});
			return await response.json();
		} catch (error) {
			console.error("Error fetching online status:", error);
			return null;
		}
	})() : null;

	const bodyWatcher = document.$watch("body", body => body.classList.add("btr-profile")).$then()

	bodyWatcher.$watch('[class*="profileContainer"]').$then()
		.$watch('[class*="selectedElement"]', cont => {
			cont.before(newCont)
			cont.setAttribute("ng-if", "false")
		})
		.$watch('[class*="buttonCol"]', buttons => {
			buttons.remove()
		})
		.$watch(".divider-top", bodyElement => {
			const descContent = bodyElement.parentElement.children[0]
			newCont.$find(".placeholder-desc").replaceWith(descContent)

						if(!descContent.textContent) {
				descContent.classList.add("text-label");
				descContent.textContent = "This user has no description";
			}
		})
		
		.$watch(".icon-pastname", taliases => { // footer, not aliases.
			newCont.$find(".placeholder-aliases").replaceWith(taliases.parentElement.parentElement.parentElement.parentElement.parentElement)
		})
		.$watch(".social-link-icon", tsocial => {
			const main = newCont.$find(".btr-profile-about .container-header")
			const reduction = tsocial.parentElement.parentElement.children.length * 8.2;
			const newWidth = 100 - reduction;
			main.children[0].style.width = newWidth + "%";
			main.append(tsocial.parentElement.parentElement)
		}) 

		.$watch('[class*="profileHeaderContainer"]', () => {
			const status = document.$find(".avatar-status")
			const statusDiv = html`<div class="btr-header-status-parent"></div>`
			newCont.$find(".placeholder-footer").replaceWith(statusDiv)
			const statusText = html`<span class="btr-header-status-text"></span>`
			statusDiv.append(statusText)
			const statusLabel = html`<span></span>`
			statusText.append(statusLabel)

			if(!status) {
				statusText.classList.add("btr-status-offline")
				statusLabel.textContent = "Offline"
			} else {
				const statusTitle = status.getAttribute("title")

				if(status.classList.contains("icon-game")) {
					statusText.classList.add("btr-status-ingame")
					statusLabel.textContent = statusTitle || "In Game"
					
					const link = status.parentElement
					if(link.href && link.href.includes("PlaceId=")) {
						const anchor = html`<a href="${link.href}" title="${status.title}"></a>`
						statusText.before(anchor)
						anchor.prepend(statusText)
							const followBtn = html`
								<a class="btr-header-status-follow-button" title="Follow"></a>
							`
							anchor.after(followBtn)

							followBtn.addEventListener("click", () => {
								Pekora.GameLauncher.followPlayerIntoGame(userId)
							})
					}
				} else if(status.classList.contains("icon-studio")) {
					statusText.classList.add("btr-status-studio")
					statusLabel.textContent = statusTitle || "In Studio"

					$(".profile-container").$watch("#profile-header-more").$then().$watch(">script", script => {
						if(script.textContent.includes("play_placeId=")) {
							const id = +script.textContent.match(/play_placeId=(\d+)/)[1]
							if(Number.isSafeInteger(id) && id !== 0) {
								const anchor = html`<a href="/games/${id}/" title="${statusTitle}"></a>`
								statusText.before(anchor)
								anchor.prepend(statusText)
							}
						}
					})
				} else {
					statusText.classList.add("btr-status-online")
					statusLabel.textContent = statusTitle || "Online"
				}
			}
		})
		.$watch('[class*="avatarImageWrapper"]', those => {
			const avatar = those.parentElement.parentElement.parentElement
			newCont.$find(".placeholder-avatar").replaceWith(avatar)
			avatar.$find(".col-12").remove()
			//("wtf", those.parentElement.parentElement.className)
			those.parentElement.parentElement.classList.remove("col-lg-6")

			const avatarLeft = those.parentElement.parentElement
			const avatarRight = document.querySelector('[class*="assetContainerCard"]').parentElement
			//(avatarRight.className)


			avatar.classList.remove("section")
			avatarRight.classList.remove("col-lg-6")

			const toggleItems = html`<span class="newCancelButton-0-2-141 btr-toggle-items btn-control btn-control-sm" style="cursor:pointer">Show Items</span>`
			those.parentElement.append(toggleItems)
			
			toggleItems.style.bottom = "15px";
			toggleItems.style.right = "15px";
			toggleItems.style.display = "flex";
			toggleItems.style.zIndex = "3";
			toggleItems.style.position = "absolute";


			let visible = false
			
			function toggleVisible() {
				visible = !visible
				avatarRight.style.visibility = visible ? "visible" : "hidden"
				if (!visible) {
					avatarRight.style.height = "0";
				} else {
					avatarRight.style.height = "";
				}
				toggleItems.textContent = visible ? "Hide Items" : "Show Items"
			}

			toggleItems.$on("click", ev => {
				toggleVisible()
				ev.stopPropagation()
			})
			avatarRight.style.visibility = "hidden"
			avatarRight.style.height = "0";

			avatarRight.$on("click", ev => ev.stopPropagation())
			document.$on("click", () => visible && toggleVisible())
		})
		 .$watch('[class*="padder"]', stats => {
			 newCont.$find(".placeholder-stats").replaceWith(stats.parentElement);
			if(settings.profile.lastOnline) {
				//("btrlastOnline!", stats.className)
				stats.classList.add("btr-lastOnline")

				const label = html`
				<li class=col-4>
					<p class=label-0-2-217 style=" color: var(--text-color-secondary); overflow: hidden; font-size: 16px; text-align: center; font-weight: 400; white-space: nowrap; margin-bottom: 0;">Last Online</p>
					<p class=value-0-2-218 style="font-size: 18px;margin-top: 5px;text-align: center;margin-bottom: 0 !important;">Loading</p>
				</li>`
				label.style.listStyle = 'none';

				if(stats.firstElementChild) {
					stats.firstElementChild.after(label)
				} else {
					stats.prepend(label)
				}
				Promise.resolve(onlineStatus).then(async resp => {
					if (!resp && !resp.lastOnline) {
						label.$find(".value-0-2-218").textContent = "Failed"
						return
					}

					const presence = resp.userPresences[0];
					const lastOnline = new Date(presence.lastOnline)
					if(presence.userPresenceType == "Offline") {
						const lastOnline = new Date(presence.lastOnline);
						const now = new Date();
						const diffInSeconds = Math.floor((now - lastOnline) / 1000);
						
						function formatSince(seconds) {
						    if (seconds < 60) return `${Math.floor(seconds )} seconds ago`;
						    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
						    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
						    return `${Math.floor(seconds / 86400)} days ago`;
						}
						
						label.$find(".value-0-2-218").textContent = formatSince(diffInSeconds);
					} else {
						label.$find(".value-0-2-218").textContent = "Now"
					}

					label.$find(".value-0-2-218").title = lastOnline.$format("MMM D, YYYY | hh:mm A (T)")
				})
			}
		})
		
		.$watch(".card .pt-4 .pb-4 .pe-4 .ps-4", btn => {
			newCont.$find(".placeholder-Pekorabadges").replaceWith(btn)
			const Title = html`<div class="container-header"><h3>Korone Badges</h3></div>`
			btn.before(Title)
			badges.$find(".section-content").classList.remove("remove-panel")
			badges.classList.add("btr-profile-Pekorabadges")
			badges.$find(".btn-more").setAttribute("ng-show", badges.$find(".badge-list").children.length > 10)

			badges.$watch(".badge-list").$then().$watchAll(".badge-item", badge => {
				badge.$watch(".asset-thumb-container", thumb => {
					const newThumb = html`<span class=asset-thumb-container></span>`
					thumb.before(newThumb)
					newThumb.append(thumb)
					thumb.classList.remove("asset-thumb-container")
				})
			})
		})
		.$watch("#placeholder-gamesd", switcher => {
			
			
			const games = switcher.parentNode
			newCont.$find(".placeholder-games").replaceWith(games)
			games.classList.add("section")

			const grid = games.$find(".game-grid")
			grid.setAttribute("ng-cloak", "")

			const cont = html`<div id="games-switcher" class="section-content" ng-hide="isGridOn"></div>`
			switcher.setAttribute("ng-if", "false")
			switcher.style.display = "none"
			switcher.after(cont)

			const hlist = html`<ul class="hlist btr-games-list" ng-non-bindable></ul>`
			cont.append(hlist)

			const pageSize = 10
			const pager = createPager(false, true)
			hlist.after(pager)

			const gameItems = []
			let lastRequest
			let selected

			pager.onsetpage = page => {
				pager.setPage(page)
				gameItems.forEach(item => item.updateVisibility())
			}

			class GameDetailsRequest {
				constructor() {
					this.placeIdList = []
					this.executed = false
				}
				canJoin() {
					return !this.executed && this.placeIdList.length < 50
				}
				append(placeId) {
					this.placeIdList.push(placeId)
					if(!this.promise) {
						this.promise = new SyncPromise(resolve =>
							$.setImmediate(() => this.execute(resolve))
						)
					}
				}
				execute(resolve) {
					this.executed = true
					const places = this.placeIdList.join("&placeIds=")
					const fetchUrl = `https://www.pekora.zip/apisite/games/v1/games/multiget-place-details?placeIds=${places}`

					$.fetch(fetchUrl, { credentials: "include" }).then(resp => {
						if(!resp.ok) {
							console.warn("[BTKorone]: Failed to load place details")
							return
						}

						resolve(resp.json())
					})
				}
			}

			class GameItem {
				constructor(slide) {
					this.init(slide)
				}

				async init(slide) {
					const slideImage = await slide.$watch(".slide-item-image").$promise()
					const slideName = await slide.$watch(".slide-item-name").$promise()
					const slideDesc = await slide.$watch(".slide-item-description").$promise()
					const slideEmblemLink = await slide.$watch(".slide-item-emblem-container > a").$promise()
					const slideStats = await slide.$watch(".slide-item-stats > .hlist").$promise()
					
					const index = this.index = +slide.dataset.index
					const pageIndex = this.pageIndex = Math.floor(index / pageSize)
					const placeId = this.placeId = slideImage.dataset.emblemId

					const title = slideName.textContent
					const desc = slideDesc.textContent
					const url = slideEmblemLink.href
					const iconThumb = slideImage.dataset.src
					this.iconRetryUrl = slideImage.dataset.retry

					const item = this.item = html`
					<li class="btr-game">
						<div class="btr-game-button">
							<span class="btr-game-title">${title}</span>
						</div>
						<div class="btr-game-content">
							<div class="btr-game-thumb-container">
								<a href="${url}">
									<img class="btr-game-thumb">
									<img class="btr-game-icon" src="${iconThumb}">
								</a>
							</div>
							<div class="btr-game-desc">
								<span class="btr-game-desc-content">${desc}</span>
							</div>
							<div class="btr-game-info">
								<div class="btr-game-playbutton-container">
									<div class="btr-game-playbutton btn-primary-lg VisitButtonPlay VisitButtonPlayGLI" placeid="${placeId}"  data-action=play data-is-membership-level-ok=true>
										Play
									</div>
								</div>
								<div class="btr-game-stats"></div>
							</div>
						</div>
					</li>`

					item.$find(".btr-game-stats").append(slideStats)
					item.$find(".btr-game-button").$on("click", () => this.toggle())

					hlist.append(item)
					pager.setMaxPage(pageIndex + 1)
					gameItems.push(this)

					this.updateVisibility()
				}

				updateVisibility() {
					const visible = this.pageIndex === (pager.curPage - 1)
					this.item.classList.toggle("visible", visible)

					if(visible && this.index === (pager.curPage - 1) * pageSize) {
						this.select(true)
					}
					
					if(visible && !this.firstVisible) {
						this.firstVisible = true
						
						this.item.$find(".btr-game-thumb").src = `https://www.pekora.zip/asset-thumbnail/image?assetId=${this.placeId}&width=768&height=432`

						lastRequest = (lastRequest && lastRequest.canJoin()) ? lastRequest : new GameDetailsRequest()
						lastRequest.append(this.placeId)

						const gamePromise = lastRequest.promise.then(data => data.find(x => +x.placeId === +this.placeId))

						loggedInUserPromise.then(loggedInUser => {
							if(+userId !== +loggedInUser) { return }

							const dropdown = html`
							<div class="btr-game-dropdown">
								<a class="rbx-menu-item" data-toggle="popover" data-container="body" data-bind="btr-placedrop-${this.placeId}">
									<span class="icon-more"></span>
								</a>
								<div data-toggle="btr-placedrop-${this.placeId}" style="display:none">
									<ul class="dropdown-menu" role="menu">
										<li><a onclick=Pekora.GameLauncher.editGameInStudio(${this.placeId})><div>Edit</div></a></li>
										<li><a href="/places/${this.placeId}/stats"><div>Developer Stats</div></a></li>
										<li><a href="/places/${this.placeId}/update"><div>Configure this Place</div></a></li>
										<li><a class=btr-btn-toggle-profile data-placeid="${this.placeId}"><div>Remove from Profile</div></a></li>
										<li><a class=btr-btn-shutdown-all data-placeid="${this.placeId}"><div>Shut Down All Servers</div></a></li> 
									</ul>
								</div>
							</div>`

							this.item.$find(".btr-game-button").before(dropdown)

							gamePromise.then(data => {
								if(!data) { return }

								dropdown.$find(".dropdown-menu").children[2].after(
									html`<li><a href=/universes/configure?id=${data.universeId}><div>Configure this Game</div></a></li>`,
									html`<li><a href=/localization/games/${data.universeId}/configure><div>Configure Localization</div></a></li>`,
								)
							})
						})

						const descElem = this.item.$find(".btr-game-desc")
						const descContent = this.item.$find(".btr-game-desc-content")
						const descToggle = html`<span class="btr-toggle-description">Read More</span>`

						descToggle.$on("click", () => {
							const expanded = !descElem.classList.contains("expanded")
							descElem.classList.toggle("expanded", expanded)

							descToggle.textContent = expanded ? "Show Less" : "Read More"
						})

						const updateDesc = () => {
							if(descContent.offsetHeight > 156) {
								descElem.append(descToggle)
							} else {
								descToggle.remove()
							}

							if(!descContent.textContent.trim()) {
								descContent.classList.toggle("text-label", true)
								descContent.textContent = "This game has no description"
							} else {
								descContent.classList.toggle("text-label", false)
							}
						}

						updateDesc()

						gamePromise.then(data => {
							if(data) {
								descContent.textContent = data.description

								if(!data.isPlayable) {
									const btn = this.item.$find(".btr-game-playbutton")
									btn.classList.remove("VisitPlayButton")
									btn.setAttribute("disabled", "")
									btn.title = ProhibitedReasons[data.reasonProhibited] || data.reasonProhibited
								}
							}

							Linkify(descContent)
							updateDesc()
						})
					}
				}

				deselect(instant) {
					if(this !== selected) { return }
					selected = null

					this.item.classList.remove("selected")
	
					const content = this.item.$find(".btr-game-content")
					const height = content.scrollHeight
					const duration = instant ? 0 : .25

					content.style.maxHeight = `${height}px`
					content.style.transition = `max-height ${duration}s`

					window.requestAnimationFrame(() => content.style.maxHeight = "0px")
					clearTimeout(this.animTimeout)
				}

				select(instant) {
					if(this === selected) { return }

					if(selected) { selected.deselect() }
					selected = this

					this.item.classList.add("selected")

					const content = this.item.$find(".btr-game-content")
					const height = content.scrollHeight
					const duration = instant ? 0 : .25

					content.style.maxHeight = `${height}px`
					content.style.transition = `max-height ${duration}s`

					this.animTimeout = setTimeout(() => content.style.maxHeight = "none", duration * 1e3)
				}

				toggle(instant) {
					if(this !== selected) {
						this.select(instant)
					} else {
						this.deselect(instant)
					}
				}
			}
			
			document.body
				.$on("click", ".btr-btn-toggle-profile", ev => {
					const placeId = ev.currentTarget.dataset.placeid
					$.fetch("https://www.pekora.zip/game/toggle-profile", {
						method: "POST",
						credentials: "include",
						body: new URLSearchParams({ placeId, addToProfile: false }),
						xsrf: true
					})
				})
				.$on("click", ".btr-btn-shutdown-all", ev => {
					const placeId = ev.currentTarget.dataset.placeid
					$.fetch("https://www.pekora.zip/Games/shutdown-all-instances", {
						method: "POST",
						credentials: "include",
						body: new URLSearchParams({ placeId }),
						xsrf: true
					})
				})

			switcher.$watch(">.hlist").$then().$watchAll(".slide-item-container", slide => {
				gameItems.push(new GameItem(slide))
			})
		})
		.$watch('[class*="listItemFriend"]', element => {
			newCont.$find(".placeholder-friends").replaceWith(element.parentElement.parentElement.parentElement);
		})
		.$watch('[class*="gameCardsContainer"]', favorites => favorites.parentElement.parentElement.remove())
		.$watch(".profile-collections", collections => {
			collections.classList.remove("layer", "gray-layer-on")
			newCont.$find(".placeholder-collections").replaceWith(collections)
		})
			.$watch(".divider-top", container => {
			container.parentElement.parentElement.parentElement.parentElement.remove()
			})

	function initPlayerBadges() {
		const badgesElem = newCont.$find(".btr-profile-playerbadges")
		const hlist = badgesElem.$find(".hlist")
		const pager = createPager(true)
		pager.querySelector('.pager').style.display = "ruby";
		pager.querySelector('.pager').querySelector('.pager-mid').style.paddingRight = "0px"

		const thumbClasses = {
			Error: "icon-broken",
			InReview: "icon-in-review",
			Blocked: "icon-blocked",
			Pending: "icon-pending"
		}

		const playerBadges = []
		const pageSize = 10

		let currentPage = 1
		let isLoading = false
		let hasMorePages = true
		let nextPageCursor

		const openPage = async page => {
			const pageStart = (page - 1) * pageSize
			const badges = playerBadges.slice(pageStart, pageStart + pageSize)

			currentPage = page
			pager.setPage(currentPage)
			pager.togglePrev(currentPage > 1)
			pager.toggleNext(hasMorePages)
			hlist.$empty()
			hlist.style.display = "inline-flex";
			hlist.style.flexWrap = "wrap";
			hlist.style.listStyle = "none";
			hlist.style.paddingLeft = "0em";

			if(!badges.length) {
				hlist.append(html`<div class="section-content-off btr-section-content-off">This user has no Player Badges</div>`)
			} else {
				if(!pager.parentNode) {
					hlist.after(pager)
				}

				badges.forEach(data => {
					const badgeUrl = `/badges/${data.id}/${FormatUrlName(data.name)}`
					const thumbUrl = data.thumb && data.thumb.imageUrl || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
					const thumbClass = data.thumb && thumbClasses[data.thumb.state] || ""

					hlist.append(html`
					<li class="list-item badge-item asset-item" ng-non-bindable>
						<a href="${badgeUrl}" class="badge-link" title="${data.name}">
							<span class=asset-thumb-container>
								<img class="border ${thumbClass}" style="border-radius: 6px;" src="${thumbUrl}" data-badgeId="${data.id}">
							</span>
							<span class="font-header-2 item-name" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.name}</span>
						</a>
					</li>`)
					
				})
			}
			
			const needsThumbs = badges.filter(x => !x.thumbUrl && !x.gettingThumb)
			if(needsThumbs.length) {
				const thumbsUrl = `https://www.pekora.zip/apisite/thumbnails/v1/assets?assetIds=${needsThumbs.map(x => x.id).join(",")}&format=png&size=150x150`
				needsThumbs.forEach(x => x.gettingThumb = true)

				$.fetch(thumbsUrl).then(async resp => {
					const thumbData = await resp.json()

					thumbData.data.forEach(thumb => {
						const badge = badges.find(x => x.id === thumb.targetId)
						badge.thumb = thumb

						const img = hlist.$find(`img[data-badgeId="${badge.id}"`)
						if(img) {
							const thumbUrl = badge.thumb.imageUrl || "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
							const thumbClass = thumbClasses[badge.thumb.state] || ""

							img.src = thumbUrl
							if(thumbClass) {
								img.classList.add(thumbClass)
							}
						}
					})
				})
			}
		}

		const loadPage = async page => {
			if(isLoading) {
				return
			}

			isLoading = true
			page = Math.max(1, page)

			const lastIndex = page * pageSize
			while(playerBadges.length < lastIndex && hasMorePages) {
				const url = `https://badges.pekora.zip/v1/users/${userId}/badges?sortOrder=Desc&limit=10&cursor=${nextPageCursor || ""}`
				const badges = await $.fetch(url).then(resp => resp.json())

				nextPageCursor = badges.nextPageCursor
				hasMorePages = !!nextPageCursor

				playerBadges.push(...badges.data)
			}

			page = Math.min(Math.ceil(playerBadges.length / pageSize), page)

			await openPage(page)
			isLoading = false
		}

		pager.onprevpage = () => loadPage(currentPage - 1)
		pager.onnextpage = () => loadPage(currentPage + 1)
		loadPage(1)
	}
	
	function initPekoraBadges() {
		const badgesElem = newCont.$find(".placeholder-pekoraBadges")
		const hlist = badgesElem.$find(".hlist")
		const pager = createPager(true)
		pager.querySelector('.pager').style.display = "ruby";
		pager.querySelector('.pager').querySelector('.pager-mid').style.paddingRight = "0px"

		const thumbClasses = {
			Error: "icon-broken",
			InReview: "icon-in-review",
			Blocked: "icon-blocked",
			Pending: "icon-pending"
		}

		const playerBadges = []
		const pageSize = 10

		let currentPage = 1
		let isLoading = false
		let hasMorePages = true
		let nextPageCursor

		const openPage = async page => {
			const pageStart = (page - 1) * pageSize
			const badges = playerBadges.slice(pageStart, pageStart + pageSize)

			currentPage = page
			pager.setPage(currentPage)
			pager.togglePrev(currentPage > 1)
			pager.toggleNext(hasMorePages)
			hlist.$empty()
			hlist.style.display = "inline-flex";
			hlist.style.flexWrap = "wrap";
			hlist.style.listStyle = "none";
			hlist.style.paddingLeft = "0em";
				//console.log("asdasdasdasdasd", badges.length)

			if(!badges.length) {
				hlist.append(html`<div class="section-content-off btr-section-content-off">This user has no Player Badges</div>`)
			} else {
				if(!pager.parentNode) {
					hlist.after(pager)
				}
				badges.forEach(data => {
					//console.log("hi")
					const badgeUrl = "/Badges.aspx"
					const thumbUrl =  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
					const thumbClass =  ""

					hlist.append(html`
					<li class="list-item badge-item asset-item" ng-non-bindable>
						<a href="${badgeUrl}" class="badge-link" title="${data.name}">
							<span class=asset-thumb-container>
								<img class="border ${thumbClass}" style="border-radius: 6px;" src="${thumbUrl}" data-badgeId="${data.id}">
							</span>
							<span class="font-header-2 item-name" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.name}</span>
						</a>
					</li>`)
					
				})
			}
			
		}

		const loadPage = async page => {
			if(isLoading) {
				return
			}

			isLoading = true
			page = Math.max(1, page)

			const lastIndex = page * pageSize
			while(playerBadges.length < lastIndex && hasMorePages) {

				const url = `https://www.pekora.zip/apisite/accountinformation/v1/users/${userId}/roblox-badges`
				const badges = await $.fetch(url).then(resp => resp.json())

				nextPageCursor = badges.nextPageCursor
				hasMorePages = !!nextPageCursor

				playerBadges.push(...badges)
			}

			page = Math.min(Math.ceil(playerBadges.length / pageSize), page)

			await openPage(page)
			isLoading = false
		}

		pager.onprevpage = () => loadPage(currentPage - 1)
		pager.onnextpage = () => loadPage(currentPage + 1)
		loadPage(1)
	}

	function initGroups() {
		const groups = newCont.$find(".btr-profile-groups")
		const hlist = groups.$find(".hlist")
		hlist.setAttribute("ng-non-bindable", "")
		const pageSize = 8

		const pager = createPager(false, true)
		hlist.after(pager)

		function loadPage(page) {
			pager.setPage(page)

			$.each(hlist.children, (obj, index) => {
				obj.classList.toggle("visible", Math.floor(index / pageSize) + 1 === page)
			})
		}

		pager.onsetpage = loadPage

		$.ready(() => { 
			const url = `https://pekora.zip/apisite/groups/v1/users/${userId}/groups/roles`
			$.fetch(url).then(async response => {
				const json = await response.json()
				const numGroups = json.data.length

				pager.setMaxPage(Math.floor((numGroups - 1) / pageSize) + 1)
				if(numGroups === 0) { return }
				hlist.$empty()

				const thumbs = {}

				json.data.forEach(({ group, role }, index) => {
					const parent = html`
					<li class="list-item game-card ${index < pageSize ? "visible" : ""}">
						<div class="card-item game-card-container">
							<a href="/groups/${group.id}/${FormatUrlName(group.name)}" title="${group.name}">
								<div class=game-card-thumb-container>
									<img class="game-card-thumb card-thumb unloaded" style="border-radius: 6px;" alt="${group.name}" src="https://www.pekora.zip/img/placeholder.png">
								</div>
								<div class="text-overflow game-card-name">${group.name}</div>
							</a>
							<div class="text-overflow game-card-name-secondary text-secondary small">
								${group.memberCount} ${group.memberCount === 1 ? "Member" : "Members"}
							</div>
							<div class="text-overflow game-card-name-secondary text-secondary small">${role.name}</div>
						</div>
					</li>`

					const thumb = parent.$find(".card-thumb")
					thumbs[group.id] = thumb

					thumb.$once("load", () => thumb.classList.remove("unloaded"))

					hlist.append(parent)
				})

				hlist.style["min-height"] = `${hlist.scrollHeight + 1}px`

				const thumbUrl = `https://www.pekora.zip/apisite/thumbnails/v1/groups/icons?groupIds=${Object.keys(thumbs).join(",")}&size=150x150`
				const thumbData = await $.fetch(thumbUrl).then(resp => resp.json())

				thumbData.data.forEach(thumbInfo => {
					thumbs[thumbInfo.targetId].src = thumbInfo.imageUrl
				})
			})
		})
	}
	

function initFavorites() {
	const favorites = newCont.$find(".btr-profile-favorites")
	const hlist = favorites.$find(".hlist")
	hlist.setAttribute("ng-non-bindable", "")
	favorites.querySelector(".section-content").style.display = "inline-grid"

	const pageSize = 6
	const pager = createPager(false, true)
	hlist.after(pager)
	hlist.style.listStyle = "none"
	hlist.style.paddingLeft = "0em"
	pager.style.marginTop = "0"

	let isLoading = false
	let currentPage = 1
	let allItems = []
	const thumbCache = {}

	async function loadPage(page) {
		if (isLoading) return
		isLoading = true
		page = Math.max(1, page)
		currentPage = page

		// fetch all items once
		if (!allItems.length) {
			const url = `https://www.pekora.zip/users/favorites/list-json?userId=${userId}&assetTypeId=9&&thumbWidth=150&thumbHeight=150&itemsPerPage=50&pageNumber=1`
			const json = await $.fetch(url).then(r => r.json())
			allItems = json?.Data?.Items || []
			pager.setMaxPage(Math.ceil(allItems.length / pageSize))
		}

		const start = (currentPage - 1) * pageSize
		const pageItems = allItems.slice(start, start + pageSize)
		const universeIds = pageItems.map(i => i.Item.UniverseId)

		// batch fetch all thumbnails at once
		const missingIds = universeIds.filter(id => !thumbCache[id])
		if (missingIds.length) {
			const thumbUrl = `https://www.pekora.zip/apisite/thumbnails/v1/games/icons?size=150x150&format=png&universeIds=${missingIds.join(",")}`
			const j = await $.fetch(thumbUrl).then(r => r.json())
			if (j?.data) {
				j.data.forEach(t => {
					if (t.imageUrl) thumbCache[t.targetId] = t.imageUrl
				})
			}
		}

		hlist.$empty()
		if (!pageItems.length) {
			hlist.append(html`
				<div class="section-content-off btr-section-content-off">
					This user has no favorite Places
				</div>
			`)
			isLoading = false
			return
		}

		pageItems.forEach(data => {
			const item = html`
			<li class="list-item game-card">
				<div class="card-item game-card-container">
					<a href="${data.Item.AbsoluteUrl}" title="${data.Item.Name}">
						<div class="game-card-thumb-container">
							<img class="game-card-thumb card-thumb"
								style="border-radius: 6px;"
								alt="${data.Item.Name}"
								src="https://www.pekora.zip/img/placeholder.png">
						</div>
						<div class="text-overflow game-card-name" title="${data.Item.Name}" ng-non-bindable>
							${data.Item.Name}
						</div>
					</a>
					<div class="game-card-name-secondary btr-creator-link-container">
						<span class="text-secondary">By </span>
						<a class="text-link text-overflow btr-creator-link" href="${data.Creator.CreatorProfileLink}">
							${data.Creator.Name}
						</a>
					</div>
				</div>
			</li>`

			hlist.append(item)

			// set the thumbnail from cache
			const img = item.$find(".game-card-thumb")
			const thumb = thumbCache[data.Item.UniverseId]
			if (thumb) {
				img.onload = () => img.classList.remove("unloaded")
				img.src = thumb
			}
		})

		isLoading = false
	}

	// pager controls
	pager.onprevpage = () => loadPage(currentPage - 1)
	pager.onnextpage = () => loadPage(currentPage + 1)

	$.ready(() => loadPage(1))
}



function initGames() {
	const games = newCont.$find(".placeholder-games")
	const hlist = games.$find(".hlist")
	hlist.setAttribute("ng-non-bindable", "")

	games.querySelector(".section-content").style.display = "inline-grid"
	games.querySelector(".section-content").style.width = "98%"

	const pageSize = 6
	const pager = createPager(false, true)
	hlist.after(pager)

	hlist.style.listStyle = "none"
	hlist.style.paddingLeft = "0em"
	pager.style.marginTop = "0"

	let isLoading = false
	let currentPage = 1
	let allGames = []
	let loaded = false
	let creatorData = null
	let creatorPromise = null
	const thumbCache = {}

	async function getCreator() {
	if (creatorData) return creatorData
}


	async function loadPage(page) {
		if (isLoading) return
		isLoading = true

		page = Math.max(1, page)

		// fetch ONCE
		if (!loaded) {
			const url = `https://www.pekora.zip/apisite/games/v2/users/${userId}/games?limit=50`
			const json = await $.fetch(url).then(r => r.json())

			allGames = json?.data || []
			loaded = true

			pager.setMaxPage(Math.ceil(allGames.length / pageSize))
		}

		currentPage = Math.min(
			page,
			Math.ceil(allGames.length / pageSize)
		)

		const start = (currentPage - 1) * pageSize
		const pageGames = allGames.slice(start, start + pageSize)
		const universeIds = pageGames.map(g => g.id)

		// only fetch missing thumbs
		const missingIds = universeIds.filter(id => !thumbCache[id])

		if (missingIds.length) {
			const thumbUrl =
				`https://www.pekora.zip/apisite/thumbnails/v1/games/icons` +
				`?size=150x150&format=png&universeIds=2%2C${missingIds.join("%2C")}`
			//console.log(thumbUrl)
			try {
				const j = await $.fetch(thumbUrl).then(r => r.json())
				if (j?.data) {
					j.data.forEach(t => {
						if (t.imageUrl) {
							thumbCache[t.targetId] = t.imageUrl
						}
					})
				}
			} catch {}
		}


		hlist.$empty()

		if (!pageGames.length) {
			hlist.append(html`
				<div class="section-content-off btr-section-content-off">
					This user has no Games
				</div>
			`)
			isLoading = false
			return
		}
		const mainInfo = document.querySelector('[class*="userInfoContainer"]')
		const owner = mainInfo.querySelector('[class*="username"]').textContent.trim()
		pageGames.forEach(data => {
			const item = html`
			<li class="list-item game-card">
				<div class="card-item game-card-container">
					<a href="https://www.pekora.zip/games/${data.rootPlaceId}/${data.name}" title="${data.name}">
						<div class="game-card-thumb-container">
							<img class="game-card-thumb card-thumb"
								style="border-radius: 6px;"
								alt="${data.name}"
								src="https://www.pekora.zip/img/placeholder/icon_one.png">
						</div>
						<div class="text-overflow game-card-name" title="${data.name}" ng-non-bindable>
							${data.name}
						</div>
					</a>
					<div class="game-card-name-secondary btr-creator-link-container">
						<span class="text-secondary">By </span>
						<a class="text-link text-overflow btr-creator-link" href="#">
							${owner}
						</a>
					</div>
				</div>
			</li>`

			hlist.append(item)

			// thumbnail
			const img = item.$find(".game-card-thumb")
			img.src = "https://www.pekora.zip/img/placeholder/icon_one.png"

			if (thumbCache[data.id]) {
				img.style.width = "128.33px"
				img.style.height = "128.33px"
				img.onload = () => {
					img.src = thumbCache[data.id]
				}
			}


			// creator
		})

		isLoading = false
	}

	pager.onprevpage = () => loadPage(currentPage - 1)
	pager.onnextpage = () => loadPage(currentPage + 1)

	$.ready(() => loadPage(1))
}


	initGroups()
	initFavorites()
	initGames()

	

	$.ready(() => {
		//console.log(+loggedInUser)
		/*("Ready!")
		if() {
			initPekoraBadges()
			initPlayerBadges()
			}
		 else {
			newCont.$watch(".btr-profile-playerbadges", el => {
				el.remove()
			})
			const friends = newCont.$find(".placeholder-friends")
			if(friends) { friends.remove() }
		}*/

		if(settings.profile.embedInventoryEnabled) {
			const cont = html`
			<div style="width: 100%;transform: scale(.752);transform-origin: 0 0;top: -80px;position: relative;">
				<iframe id="btr-injected-inventory" 
				src="/internal/collectibles?userId=${userId}" 
				scrolling="no" 
				sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
				style="width: 1280px;height: 1280px;">
			</div>`
			newCont.$find(".placeholder-inventory").replaceWith(cont)
		} else {
			newCont.$find(".placeholder-inventory").remove()
		}
	})
	
}

