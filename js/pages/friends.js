"use strict"

/* inject hover style once
if (!window.__btr_unfriend_style) {
	window.__btr_unfriend_style = true;
	const style = document.createElement("style");
	style.textContent = `
		.btr-hover-icon {
			background-position: 0px -616px;
		}
		.btr-hover-icon:hover {
			background-position-x: -30px;
		}
	`;
		const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
	document.head.appendChild(style);
}

function observeFriendsPage() {
	let scheduled = false;

	const mo = new MutationObserver(() => {
		if (scheduled) return;
		scheduled = true;

		requestAnimationFrame(() => {
			scheduled = false;
			myFriends();
		});
	});

	if (document.body) {
		mo.observe(document.body, {
			childList: true,
			subtree: true
		});
	}
}

const myFriends = () => {
	if (!settings.friends.alwaysShowUnfriend) return;

	document.querySelectorAll('.col-12.col-md-6.col-lg-4.mb-4').forEach(el => {
		// prevent duplicates
		if (el.__btr_unfriend_added) return;
		el.__btr_unfriend_added = true;

		try {
			const target =
				el.children[0]
				  .children[0]
				  .children[0]
				  .children[1];

			target.insertAdjacentHTML('beforeend', `
				<div class="d-inline-block float-end font-size-30">
					<div class="wrapper-0-2-179 undefined" style="cursor:pointer;line-height:100%;user-select:none;">
						<button class="dropdownButton-0-2-184" style="all:unset;">
							<span class="dropdownIcon-0-2-185 dropdownIcon-d0-0-2-190 btr-hover-icon"></span>
						</button>
					</div>
				</div>
			`);
		} catch (e) {}
	});
};

if (!window.__btr_unfriend_interval) {
	window.__btr_unfriend_interval = true;
	setInterval(myFriends, 1000);
}

pageInit.friends = userId => {
	if (!userId) {
		myFriends();
		observeFriendsPage();
	} else {
		loggedInUserPromise.then(loggedIn => {
			if (+loggedIn === +userId) {
				myFriends();
				observeFriendsPage();
			}
		});
	}
};
*/