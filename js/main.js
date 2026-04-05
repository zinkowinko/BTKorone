"use strict"

const pageInit = {}

let areAllContentScriptsLoaded = false
let isInitDeferred = false

let settings
let currentPage

// store injected page-specific rules so they can be removed on navigation
let pageCssRules = []

// Update currentPage and re-init when a "navigation" is detected
function updateCurrentPage(force = false) {
	/*console.log(
		"[NAV UPDATE]",
		"href:", location.href,
		"path:", location.pathname,
		"title:", document.title
	)*/
    const newPage = GET_PAGE(window.location.pathname)
    const changed = !currentPage || newPage.name !== currentPage.name || JSON.stringify(newPage.matches) !== JSON.stringify(currentPage.matches)

    if (changed || force) {
        currentPage = newPage
        //console.log("BTKorone - Navigation detected, Current Page:", currentPage)

        // remove old page css and inject new page css (keep theme/main CSS intact)
        if (pageCssRules && pageCssRules.length) {
            removeCSS(pageCssRules)
            pageCssRules = []
        }
        if (currentPage && currentPage.css && currentPage.css.length) {
            pageCssRules = injectCSS(...currentPage.css)
        }

        // run page initializer
        try { Init() }
        catch (ex) { console.error(ex) }
    }
}

// Monkeypatch history and listen to popstate for SPA navigation
function setupNavigationObserver() {
    // avoid double-patching
    if (window.__btr_history_patched) {
        //console.log("already patched!")
        return
    }
    window.__btr_history_patched = true

    const origPush = history.pushState
    const origReplace = history.replaceState

    history.pushState = function (...args) {
        const res = origPush.apply(this, args)
        setTimeout(() => updateCurrentPage(), 0)
        return res
    }
    history.replaceState = function (...args) {
        const res = origReplace.apply(this, args)
        setTimeout(() => updateCurrentPage(), 0)
        return res
    }

    window.addEventListener("popstate", () => updateCurrentPage())

    // hook document.title (some pages still use this)
    if (!window.__btr_title_patched) {
        window.__btr_title_patched = true

        const desc = Object.getOwnPropertyDescriptor(Document.prototype, "title")
        if (desc && desc.set) {
            Object.defineProperty(document, "title", {
                get() {
                    return desc.get.call(this)
                },
                set(value) {
                    desc.set.call(this, value)
                    updateCurrentPage()
                }
            })
        }
    }

    let lastPageKey = null

    const detectPageChange = () => {
        const key = location.pathname + "|" + document.title
        if (key !== lastPageKey) {
            lastPageKey = key
            updateCurrentPage()
        }
    }

   const appRoot =
        document.getElementById("react-app") ||
        document.getElementById("root") ||
        document.body

    if (appRoot) {
        const reactMo = new MutationObserver(() => {
            detectPageChange()
        })

        reactMo.observe(appRoot, {
            childList: true,
            subtree: true
        })
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            const root =
                document.getElementById("react-app") ||
                document.getElementById("root") ||
                document.body

            if (!root) return

            const reactMo = new MutationObserver(() => {
                detectPageChange()
            })

            reactMo.observe(root, {
                childList: true,
                subtree: true
            })
        })
    }
}



let mainStyleSheet
const injectCSS = (...paths) => {
	if(!paths.length) { return [] }

	if(!mainStyleSheet) {
		const style = document.createElement("style")
		style.setAttribute("name", "BTPekora/inject.css")
		style.type = "text/css"

		const parent = document.head || document.documentElement
		parent.append(style)

		mainStyleSheet = document.styleSheets[document.styleSheets.length - 1]
	}

	return paths.map(file => {
		const index = mainStyleSheet.insertRule(`@import url("${getURL("css/" + file)}")`)
		return mainStyleSheet.rules[index].cssText
	})
}

const removeCSS = rules => {
	if(!mainStyleSheet) { return }

	rules.forEach(cssText => {
		const index = Array.prototype.findIndex.call(mainStyleSheet.rules, x => x.cssText === cssText)

		//console.log(cssText, index)

		if(index !== -1) {
			mainStyleSheet.deleteRule(index)
		}
	})
}

const InjectJS = {
	queue: [],

	send(action, ...detail) {
	//	if(IS_FIREFOX) { detail = cloneInto(detail, //window.wrappedJSObject) }
//		document.dispatchEvent(new CustomEvent//(`inject.${action}`, { detail }))
	},

	listen(actions, callback, props) {
		const actionList = actions.split(" ")
		const once = props && props.once

		const cb = ev => {
			if(once) {
				actionList.forEach(action => {
					document.removeEventListener(`content.${action}`, cb)
				})
			}

			if(!ev.detail) {
				console.warn("[BTKorone] Didn't get event detail from InjectJS", actions)
				return
			}

			return callback(...ev.detail)
		}

		actionList.forEach(action => {
			document.addEventListener(`content.${action}`, cb)
		})
	}
}

const OptionalLoader = {
	libraries: {
		previewer: {
			promise: null,
			assets: [
				"lib/three.min.js",
				"js/rbx/Avatar/Animator.js",
				"js/rbx/Avatar/AvatarRigs.js",
				"js/rbx/Avatar/Composites.js",
				"js/rbx/Avatar/Avatar.js",
				"js/rbx/Avatar/Appearance.js",
				"js/rbx/Scene.js",
				"js/rbx/Preview.js"
			]
		},
		explorer: {
			promise: null,
			assets: [
				"js/rbx/ApiDump.js",
				"js/rbx/Explorer.js"
			]
		},
		settings: {
			promise: null,
			assets: [
				"js/feat/btr-settings.js",
				"btr-settings.css"
			]
		}
	},

	_loadLib(name) {
		const lib = this.libraries[name]

		if(!lib.promise) {
			const jsAssets = lib.assets.filter(file => file.endsWith(".js"))
			const cssAssets = lib.assets.filter(file => file.endsWith(".css"))
			
			if(cssAssets.length) {
				injectCSS(...cssAssets)
			}

			if(jsAssets.length) {
				lib.promise = new SyncPromise(resolve => MESSAGING.send("loadOptAssets", jsAssets, resolve))
			} else {
				lib.promise = SyncPromise.resolve()
			}
		}

		return lib.promise
	},

	loadPreviewer() { return this._loadLib("previewer") },
	loadExplorer() { return this._loadLib("explorer") },
	loadSettings() { return this._loadLib("settings") }
}

const templatePromises = {}
const domParser = new DOMParser()

function modifyTemplate(idList, callback) {
	if(typeof idList === "string") {
		idList = [idList]
	}

	const templates = new Array(idList.length)
	let templatesLeft = idList.length

	const finish = () => {
		try { callback(...templates) }
		catch(ex) {
			console.error(ex)

			if(IS_DEV_MODE) {
				alert("Hey, modifyTemplate errored!")
			}
		}

		idList.forEach((id, i) => {
			InjectJS.send(`TEMPLATE_${id}`, templates[i].innerHTML)
		})
	}

	idList.forEach((id, index) => {
		if(!templatePromises[id]) {
			templatePromises[id] = new SyncPromise(resolve => InjectJS.listen(
				`TEMPLATE_${id}`,
				html => resolve(domParser.parseFromString(`<body>${html}</body>`, "text/html").body),
				{ once: true }
			))

			InjectJS.send("TEMPLATE_INIT", id)
		}
		
		templatePromises[id].then(template => {
			templates[index] = template

			if(--templatesLeft === 0) {
				finish()
			}
		})
	})
}


function Init() {
	try { pageInit.common() }
	catch(ex) { console.error(ex) }

	if(currentPage && pageInit[currentPage.name]) {
		try { pageInit[currentPage.name].apply(currentPage, currentPage.matches) }
		catch(ex) { console.error(ex) }
	}
}


function PreInit() {
	if(document.contentType !== "text/html") { return }
	if(window.location.protocol.search(/^https?:$/) === -1) { return }
	
	if(IS_FIREFOX && document.readyState === "complete") { return } // Stop reloading extension

	const pathname = window.location.pathname
	const exclude = EXCLUDED_PAGES.some(patt => new RegExp(patt, "i").test(pathname))
	if(exclude) { return }

	currentPage = GET_PAGE(pathname)
    //console.log("BTKorone - Current Page:", currentPage)

    // watch SPA-ish navigations and semi-reloads
    setupNavigationObserver()

	//

	const cssFiles = ["main.css"]
	const themeStyles = []

	const updateTheme = theme => {
		const oldStyles = themeStyles.splice(0, themeStyles.length)
		removeCSS(oldStyles)

		if(theme !== "default") {
			themeStyles.push(...injectCSS(...cssFiles.map(file => `${theme}/${file}`)))
		}
	}

	if(currentPage) { cssFiles.push(...currentPage.css) }

    // store page-specific rules so they can be removed on navigation
    pageCssRules = injectCSS(...cssFiles)

	//

	const script = document.createElement("script")
	script.setAttribute("name", "BTPekora/inject.js")
	script.textContent = `"use strict";\n(${String(INJECT_SCRIPT)})();`
	
	const scriptParent = document.head || document.documentElement
	scriptParent.prepend(script)

	//

	SETTINGS.onChange("general.theme", updateTheme)
	SETTINGS.load(_settings => {
		settings = JSON.parse(JSON.stringify(_settings))

		// Change settings to be name: value
		Object.values(settings).forEach(group => {
			Object.entries(group).forEach(([name, setting]) => {
				group[name] = setting.value
			})
		})

		// Inject theme
		updateTheme(settings.general.theme)

		InjectJS.send(
			"INIT",
			settings,
			currentPage ? currentPage.name : null,
			currentPage ? currentPage.matches : null,
			IS_DEV_MODE
		)
		
		if(areAllContentScriptsLoaded) {
			Init()
		} else {
			isInitDeferred = true
		}
	})

	//

	PERMISSIONS.hasHostAccess().then(hasAccess => {
		if(hasAccess) {
			return
		}

		document.$watch("#header", header => {
			const btn = html`<div class=btr-rha>Some permissions required for BTKorone to function have been disabled. Click here to fix the issue.</div>`
			let busy = false

			btn.$on("click", () => {
				if(btn.classList.contains("finished")) {
					return window.location.reload()
				}

				if(busy) {
					return
				}

				busy = true
				PERMISSIONS.requestHostAccess().then(granted => {
					if(!granted) {
						busy = false
						return
					}
					
					btn.classList.add("finished")
					
					setTimeout(() => window.location.reload(), 500)
				})
			})

			header.after(btn)
		})
	})
}

PreInit()