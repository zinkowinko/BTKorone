"use strict"
let isSearchingInit = false
const initFastSearch = () => {
	const requestCache = {}
	const usernameRegex = /^\w+(?:[ _]?\w+)?$/
	const promiseCache = {}
	const fsResults = []
	const friendsList = []
	const presenceRequests = []
	let lastPresenceRequest = 0
	let fsUpdateCounter = 0
	let friendsLoaded = false
	let requestingPresences = false
	let friendsPromise
	let exactTimeout

	try {
		const data = JSON.parse(localStorage.getItem("btr-fastsearch-cache"))
		Object.entries(data.friends).forEach(([name, id]) => {
			requestCache[name.toLowerCase()] = {
				Username: name,
				UserId: id,
				IsFriend: true
			}
		})
	} catch(ex) {}

	const updateCache = () => {
		if(!friendsLoaded) { return }
		const cache = { friends: {} }

		Object.values(friendsList).forEach(friend => {
			cache.friends[friend.Username] = friend.UserId
		})

		localStorage.setItem("btr-fastsearch-cache", JSON.stringify(cache))
	}

	const requestPresence = target => {
		if(presenceRequests.includes(target)) {
			return
		}

		target.presence = new SyncPromise()
		presenceRequests.push(target)

		if(!requestingPresences) {
			requestingPresences = true

			setTimeout(() => {
				const requests = presenceRequests.splice(0, presenceRequests.length)
				const userIds = requests.map(x => x.UserId)

				lastPresenceRequest = Date.now()
				requestingPresences = false

				const url = `https://www.pekora.zip/apisite/presence/v1/presence/users`
				$.fetch(url, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userIds })
				}).then(async resp => {
					const presences = await resp.json()

					if(presences instanceof Object && "userPresences" in presences) {
						presences.userPresences.forEach(presence => {
							const index = requests.findIndex(x => x.UserId === presence.userId)

							if(index !== -1) {
								const request = requests.splice(index, 1)[0]
								request.presence.resolve(presence)
							}
						})
					}

					requests.forEach(request => {
						delete request.presence
					})
				})
			}, Math.max(100, 1500 - (Date.now() - lastPresenceRequest)))
		}
	}

	const thumbPromises = {}
	const thumbRequests = []
	let requestingThumbs

	const sendThumbRequest = () => {
		if(requestingThumbs) {
			return
		}

		requestingThumbs = true

		setTimeout(() => {
			requestingThumbs = false
			const thumbs = thumbRequests.splice(0, thumbRequests.length)
			const url = `https://www.pekora.zip/v1/users/avatar-headshot?userIds=${thumbs.join(",")}&size=48x48&format=Png`

			$.fetch(url).then(async resp => {
				const json = await resp.json()

				json.data.forEach(thumb => {
					const thumbPromise = thumbPromises[thumb.targetId]

					if(thumb.imageUrl) {
						thumbPromise.resolve(thumb.imageUrl)
					} else {
						setTimeout(() => {
							thumbRequests.push(thumb.targetId)
							sendThumbRequest()
						}, 500)
					}
				})
			})
		}, 10)
	}

	const requestThumb = userId => {
		const cachedPromise = thumbPromises[userId]
		if(cachedPromise) {
			return cachedPromise
		}

		const promise = thumbPromises[userId] = new SyncPromise()
		thumbRequests.push(userId)

		sendThumbRequest()
		return promise
	}

	const makeItem = (json, hlFrom, hlTo) => {
		if(hlFrom == null || json.Alias) {
			hlFrom = 0
			hlTo = json.Username.length
		}

		const item = html`
		<li class="rbx-navbar-search-option rbx-clickable-li btr-fastsearch" style="list-style: none;" data-searchurl=/User.aspx?userId=${json.UserId}&searchTerm=>
			<a class=btr-fastsearch-anchor href=/users/${json.UserId}/profile style="display: flex;height: 36px;margin: 4px 10px 0px 10px;flex-wrap: wrap;align-items: center;">
				<div class=btr-fastsearch-avatar style=" position: relative; display: inline-block; width: 36px; height: 36px; margin: -6px 6px -6px 0;">
					<img class=btr-fastsearch-thumbnail style="width: 36px;overflow: hidden;border-radius: 20px;border: 1px solid #BEBEBE;border-radius: 100%;"
src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">
					<div class=btr-fastsearch-status style="display: none;position: absolute;width: 12px;height: 12px;right: 0px;bottom: 0px;border: 1px solid rgb(190, 190, 190);border-radius: 12px;"></div>
				</div>
				<div class=btr-fastsearch-text style="flex: 1; margin: 3px 0px 0px 3px;">
					<div class=btr-fastsearch-name style=" color: rgb(52, 52, 52); font-size: 16px; font-weight: 400;">
						${json.Username.slice(0, hlFrom)}
						${json.Username.slice(hlFrom, hlTo)}
						${json.Username.slice(hlTo)}
					</div>
					<div class="text-label">
						${json.Alias ? `Formerly '${json.Alias}'` : json.IsFriend ? "You are friends" : ""}
					</div>
				</div>
			</a>
		</li>`

		requestThumb(json.UserId).then(url => {
			const img = item.$find("img")
			if(img) {
				img.src = url
			}
		})

		// Presence

		const updatePresence = presence => {
			if(!item.parentNode) {
				return
			}
			console.log(presence)
			let joinScript = null
			const status = item.$find(".btr-fastsearch-status")
			status.classList.remove("game", "studio", "online")

			const oldFollowBtn = item.$find(".btr-fastsearch-follow")
			if(oldFollowBtn) {
				oldFollowBtn.remove()
			}
			function launchGame(data) {
						const protocol = "pekora-player"; // Change this if the site uses a custom launcher name
						const fullUrl = `${protocol}${data}`;
    
						const iframe = document.createElement("iframe");
						iframe.style.display = "none";
						iframe.src = fullUrl;
    
						document.body.appendChild(iframe);
    
						// Clean up after a few seconds
						setTimeout(() => {
							document.body.removeChild(iframe);
						}, 2000);
					}
			switch(presence.userPresenceType) {
			case "Offline": break
			case "InGame": {
				status.style.display = "block"
				status.style.backgroundColor = "#02b757"
				status.classList.add("game")

				const followBtn = html`<button class="btr-fastsearch-follow btn-primary-xs" style=" color: #fff !important; flex:none; border: 1px solid var(--success-color); padding: 5px;background: var(--success-color); border-color: var(--success-color) !important; border-radius: 3px;">Join Game</button>`

				if(presence.gameId) {
					followBtn.addEventListener('click', 
					(async () => {
						event.preventDefault(); 
						try {
							const response = await fetch(`https://www.pekora.zip/game/get-join-script-fromjobid?placeId=${presence.rootPlaceId}&jobId=${presence.gameId}`);
            
							if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

							joinScript = await response.json();
							launchGame(joinScript.joinScriptUrl)
						} catch (error) {
							console.error("Fetch failed:", error);
						}
					}));
				} else {
					followBtn.classList.add("disabled")
				}

				item.$find(".btr-fastsearch-anchor").append(followBtn)
				break
			}
			case "Studio":
				status.classList.add("studio")
				break
			default:
				status.style.display = "block"
				status.style.backgroundColor = "#00A2FF"
				status.classList.add("online")
			}
		}

		if(!json.presence) {
			requestPresence(json)
		}
		
		json.presence.then(updatePresence)

		return item
	}

	
	const clearResults = list => {
		fsResults.splice(0, fsResults.length).forEach(x => x.remove())
		const sel = list.$find(">.selected")
		if(!sel) {
			list.children[0].classList.add("selected")
		}
	}

	const updateResults = (search, list) => {
		clearTimeout(exactTimeout)
		clearResults(list)

		if(!usernameRegex.test(search)) { return }

		const thisUpdate = ++fsUpdateCounter

		const update = () => {
			if(fsUpdateCounter !== thisUpdate) { return }
			clearResults(list)

			const matches = Object.entries(requestCache)
				.filter(x => x[1] && (x[0] === search || (x[1].IsFriend && !x[1].Alias) && (x.index = x[0].indexOf(search)) !== -1))
			if(!matches.length) { return }

			const sel = list.$find(">.selected")
			if(sel) { sel.classList.remove("selected") }

			matches.forEach(x => x.sort = x[0] === search ? 0 : Math.abs(x[0].length - search.length) / 3 + x.index + (!x[1].IsFriend ? 100 : 0))
			matches.sort((a, b) => a.sort - b.sort)
			const len = Math.min(4, matches.length)

			// Show friends before exact match (if not friend)
			const first = matches[0]
			if(first[0] === search && !first[1].IsFriend) {
				for(let i = 1; i < len; i++) {
					const self = matches[i]
					if(self[1].IsFriend) {
						matches[i] = first
						matches[i - 1] = self
					} else {
						break
					}
				}
			}

			for(let i = 0; i < len; i++) {
				const x = matches[i]

				const json = x[1]
				const item = makeItem(json, x.index, x.index + search.length)

				if(fsResults.length) {
					fsResults[fsResults.length - 1].after(item)
				} else {
					list.prepend(item)
				}

				fsResults.push(item)

				if(i === 0) {
					item.classList.add("selected")
				}
			}
		}
		
		update()

		if(!friendsLoaded) {
			if(!friendsPromise) {
				friendsPromise = new SyncPromise(resolve => {
					loggedInUserPromise.then(userId => {
						const friendsUrl = `https://www.pekora.zip/apisite/friends/v1/users/${userId}/friends`
						$.fetch(friendsUrl, { credentials: "include" }).then(async resp => {
							const json = await resp.json()

							json.data.forEach(friend => {
								const key = friend.name.toLowerCase()
								const oldItem = requestCache[key]

								const item = {
									IsFriend: true,
									UserId: friend.id,
									Username: friend.name,

									presence: oldItem && oldItem.presence
								}
								requestCache[key] = item
								friendsList[friend.id] = item

								if(!item.presence) {
									requestPresence(item)
								}
							})

							Object.entries(requestCache).forEach(([key, item]) => {
								if(item.IsFriend && friendsList[item.UserId] !== item) {
									delete requestCache[key]
								}
							})

							friendsLoaded = true
							updateCache()
							resolve(friendsList)
						})
					})
				})
			}

			friendsPromise.then(update)
		}

		if(search.length < 3) { return }

		exactTimeout = setTimeout(() => {
			if(!(search in requestCache)) {
				let cached = promiseCache[search]
				if(!cached) {
					cached = promiseCache[search] = $.fetch(`https://www.pekora.zip/users/get-by-username?username=${search}`)
						.then(async resp => {
							const json = await resp.json()

							if("Id" in json) {
								if(friendsLoaded) {
									const friendItem = friendsList[json.Id]
									if(friendItem) {
										return Object.assign({ Alias: search }, friendItem)
									}
								}

								return { UserId: json.Id, Username: json.Username }
							}
							return false
						})
				}

				cached.then(json => {
					if(!(search in requestCache)) {
						requestCache[search] = json
					}

					if(json) { update() }
				})
			}
		}, 250)
	}
	
	document.$watch('[class*="searchInput"]', async input => {
		if (isSearchingInit) return
		isSearchingInit = true
		const search = input.parentElement.parentElement
		let thlist = await search.$watch('[class*="container"]').$promise()

		thlist.$on("mouseover", "[class*=link]", ev => {
			const last = thlist.$find(">.selected")
			if(last) { last.classList.remove("selected") }
			ev.currentTarget.classList.add("selected")
		})
		
		let lastValue
		input.$on("keyup", () => {
			thlist = search.querySelector('[class*="container"]')
			if(input.value === lastValue) { return }
			lastValue = input.value
			updateResults(input.value.toLowerCase(), thlist)
		})

		thlist.prepend(fsResults)
	})
}