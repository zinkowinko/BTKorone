"use strict"

{

pageInit.groups = function () {
	//console.log(settings.groups.newgroups)
	if (settings.groups.enabled) {
		let currentGroupId = null;
		let isReplacing = false

		async function replaceGroups(targetgroupId) {

			if (isReplacing) return;
			isReplacing = true

			const root = document.querySelector('[class*="groupsContainer"]');
			if (!root) {isReplacing = false; return};

			if (!window.location.pathname.toLowerCase().includes('groups.aspx')) {isReplacing = false; return};

			let cursor = 0
			const params = new URLSearchParams(window.location.search);
			const groupId = targetgroupId || params.get('gid') || '28'; 
			const prevgroupId = targetgroupId || params.get('gid') || '28'; 

			// 1. Reset if URL changed
			if (currentGroupId !== groupId) {
				delete root.dataset.groupsReplaced;
				currentGroupId = groupId;
			}

			// 2. Check if we have the parent and haven't replaced it yet
			const parent = root
			if (!parent || root.dataset.groupsReplaced === '1') {isReplacing = false; return};

			// 3. Lock it
			root.dataset.groupsReplaced = '1';
			root.style.maxWidth = "calc(970px + 10%)";
			root.style.minHeight = "600px";
			root.style.backgroundColor = "#E3E3E3"
			//	root.parentElement.parentElement.style.backgroundColor = "#E3E3E3"

			// 4. Clear everything inside and inject your wrapper
			const wrapper = document.createElement('div');

			// 5. Run your fetches
			//console.log("Injecting UI for:", groupId);
			try {
				const groupPromise = fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}`)
				const iconPromise = fetch(`https://www.pekora.zip/apisite/thumbnails/v1/groups/icons?groupIds=${groupId}&format=png&size=420x420`)
				const wallPromise = fetch(`https://www.pekora.zip/apisite/groups/v2/groups/${groupId}/wall/posts?sortOrder=Desc&limit=20&cursor=0`)
				const rolesPromise = fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/roles`)
				const authPromise = fetch(`https://www.pekora.zip/apisite/users/v1/users/authenticated`)

				const [
					groupRes,
					iconRes,
					wallRes,
					rolesRes,
					currentUser
				] = await Promise.all([
					groupPromise,
					iconPromise,
					wallPromise,
					rolesPromise,
					authPromise
				])
				const userData = await currentUser.json();
				if (!groupRes.ok || !rolesRes.ok) throw new Error("core fetch failed")

				const groupInfo = await groupRes.json()
				const iconJson = await iconRes.json()
				const wallData = wallRes.ok ? await wallRes.json() : { data: [] }
				const roleData = await rolesRes.json()

				const groupIcon = iconJson?.data?.find(i => i.state === "Completed") || null
				const roles = roleData.roles || []
				let cRole = roles.filter(r => r.rank > 0).sort((a,b)=>a.rank-b.rank)[0]

				if (!groupInfo || !cRole) return
					const userGroupsPromise = await fetch(
						`https://www.pekora.zip/apisite/groups/v1/users/${userData.id}/groups/roles`
					).then(r => r.ok ? r.json() : null)
					const allGroupIds = userGroupsPromise.data.map(g => g.group.id);
					 const thumbMap = new Map();
					 const thumbRes = await fetch(`https://www.pekora.zip/apisite/thumbnails/v1/groups/icons?groupIds=${allGroupIds.join('%2C')}&format=png&size=420x420`);
					 const thumbData = await thumbRes.json();
					thumbData.data.forEach(item => thumbMap.set(item.targetId, item.imageUrl));

					const mockGroupGames = await fetch(
						`https://www.pekora.zip/apisite/games/v2/users/${groupInfo.owner.userId}/games?limit=25&cursor=`
					).then(r => r.ok ? r.json() : null)
					const primaryPromise = await fetch(
						`https://www.pekora.zip/apisite/groups/v1/users/${userData.id}/groups/primary/role`
					).then(async r => {
						if (!r.ok) return null;
						const text = await r.text();
						return text ? JSON.parse(text) : {}; 
					})
					
					// pre fire things like perms ,shout, etc.
						let shoutHTML = ''
						let groupsonLeft = ''
						let userRoleId = null
						let roleName = 'Guest'
						
							if (groupInfo && groupInfo.shout !== null && !(groupInfo.shout.body.trim() === "")) {
								shoutHTML = `
								<div class="section" ng-hide="$ctrl.numGroupMembers == 0">
								   <div class="container-header group-members-list-container-header" style="
									  font-size: 16px;
									  font-weight: 400;
									  line-height: 1.4em;
									  margin: 3px 0 6px;
									  box-sizing: border-box;
									  text-rendering: auto;
									  display: block;
									  unicode-bidi: isolate;
									  -webkit-font-smoothing: antialiased;
									  ">
									  <h3 class="group-title ng-binding" ng-bind="'Heading.Members' | translate" style="
							 
										 margin: 6px 0;
										 float: left;
										 font-size: 20px;
										 padding-top: 0;
										 font-weight: 300;
										 ">Shout</h3>
								   </div>
								   <div class="spinner spinner-default ng-hide" ng-show="$ctrl.membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" style="
									  display: none !important;
									  "></div>
								   <div class="section-content group-shout-list " ng-show="$ctrl.members.length &gt; 0" style="overflow: hidden; background-color: rgb(255, 255, 255); padding: 15px; position: relative; margin: 0px 0px 18px; width: 100%; box-shadow: none; display: block;">
									  <ul class="hlist shoutList" style="
										 list-style: none;
										 margin: 0;
										 padding: 0;
										 ">
										 <div class="avatar-container comment ng-scope" style="height: 80px;">
											<a href="https://www.pekora.zip/users/${groupInfo.shout.poster.userId}/profile">
											<span style="position:absolute;width:48px;height:48px;display:block;border-radius:50%;overflow:hidden;">
											<img src="https://www.pekora.zip/headshot-thumbnail/image?userId=${groupInfo.shout.poster.userId}&width=420&height=420&format=png" style="width:100%;height:100%;border-radius:50%;">
											</span>
											</a>
											<div class="wall-comment" style="width:100%;margin:0 12px;padding-left:50px;padding-right:12px;">
											   <div class="group-menu" style="
										position: relative;
										top: 6px;
										float: right;
										display: table;
									">
												  <a tabindex="0" class="rbx-menu-item">
												  <span class="icon-more"></span>
												  </a>
											   </div>
											   <div class="wall-comment-name" style="display:block;width:max-content;">
												  <a href="https://www.pekora.zip/users/${groupInfo.shout.poster.userId}/profile" class="text-name name" style="display:block;;width:100%;font-size:16px;font-weight:500;color:var(--primary-color);">
												  ${groupInfo.shout.poster.displayName}
												  </a>
											   </div>
											   <div class="wall-comment-body" style="width:100%; text-align: left;;">${groupInfo.shout.body}</div>
											   <div class="wall-comment-info" style="margin-top:12px;float:left;width:100%;">
												  <div class="text-date-hint comment-date" style="width:max-content;font-size:12px;font-weight:400;color:#b8b8b8;line-height:1.4em; text-align:left">
													 ${Date(groupInfo.shout.created).toLocaleString()}
												  </div>
											   </div>
											</div>
											<div class="shout-box" style="
											   padding-bottom: 0;
											   margin: 6px 0;
											   display: none /* toggle */ 
											   ">
											   <div class="create-shout-container float-left " style="
												  width: calc(100% - 120px - 13px);
												  font-size: 16px;
												  font-weight: 300;
												  line-height: 1.3em;
												  margin: 6px 0;
												  "><input class="shout-input" placeholder="Enter your shout" maxlength="200" style="
												  color: var(--text-color-primary);
												  width: 100%;
												  border: 1px solid var(--text-color-secondary);
												  height: 43px;
												  display: block;
												  padding: 5px 12px;
												  font-size: 16px;
												  font-weight: 300;
												  line-height: 100%;
												  border-radius: 3px;
												  background-color: var(--white-color);
												  "></div>
											   <div class="float-right " style="
												  margin: 6px 0;
												  ">
												  <div class="shout-post-button" style="
													 margin: 0 0 0 12px;
													 "><button type="submit" value="submit" class="btn-0-2-93 continueButton-0-2-197 newContinueButton-0-2-88" title="" style="
													 color: #fff !important;
													 border: 1px solid var(--primary-color);
													 height: 42px;
													 display: inline-block;
													 padding: 9px;
													 font-size: 18px;
													 background: var(--primary-color);
													 text-align: center;
													 font-weight: 500;
													 line-height: 100%;
													 user-select: none;
													 white-space: nowrap;
													 border-color: var(--primary-color) !important;
													 border-radius: 3px;
													 vertical-align: middle;
													 ">Group Shout</button></div>
											   </div>
											</div>
										 </div>
									  </ul>
								   </div>
								</div>
								`;
        
							} // shout check, also perms i guess
							const groupsLeft = document.createElement('div');
							let Joined = false
							userGroupsPromise.data.forEach(gdata => {
									// add to groups on left
									console.log(thumbMap)
									const iconUrl = thumbMap.get(gdata.group.id)
									console.log(gdata.group.id)
									const groupHtml = `
										<li class="menu-option list-item ng-scope" ng-repeat="group in $ctrl.groups" ng-class="{ 'primary-group': group.isPrimary,
											'active': group.id === $ctrl.currentGroup.id}" style="
											height: 52px;
											user-select: none;
											cursor: pointer;
											width: 100%;
											padding: 9px 5px 9px 9px;
											position: relative;
											margin: 0;
											list-style: none;
										"><groups-list-item group="group" class="ng-isolate-scope"><a target="_self" class="group-name-link" title="${gdata.group.name}" target-id="${gdata.group.id}"href="https://www.pekora.zip/My/Groups.aspx?gid=${gdata.group.id}"><div class="menu-option-content group-card" style="
											display: flex;
											height: 100%;
										"><thumbnail-2d thumbnail-type="$ctrl.thumbnailTypes.groupIcon" thumbnail-target-id="$ctrl.group.id" size="$ctrl.thumbnailSizes.small" class="ng-isolate-scope" style="
											float: left;
											display: block;
										"><span ng-class="$ctrl.getCssClasses()" thumbnail-type="groupIcon" thumbnail-target-id="${gdata.group.id}" size="small" class="" style="
											width: 32px;
											height: 32px;
											margin: 0 3px;
											display: block;
										"><!-- ngIf: $ctrl.thumbnailUrl --><img ng-if="$ctrl.thumbnailUrl" ng-src="${iconUrl}" class="ng-scope" src="${iconUrl}" style="
											width: 100%;
											height: 100%;
										"><!-- end ngIf: $ctrl.thumbnailUrl --></span></thumbnail-2d><span class="font-caption-header group-card-name text-overflow ng-binding" ng-bind="$ctrl.group.name" style="
											width: 100%;
											margin-top: 7.5px;
											padding-left: 5px;
											font-size: 12px;
											font-weight: 500;
											display: inline-block;
											overflow: hidden;
											text-overflow: ellipsis;
											height: max-content;
											white-space: nowrap;
										">${gdata.group.name}</span></div></a></groups-list-item></li>
									`
									groupsLeft.insertAdjacentHTML('afterbegin', groupHtml);
									groupsLeft.addEventListener('click', (event) => {
									});

										if (gdata.group.id == groupId) {
											userRoleId = gdata.role.id
											roleName = gdata.role.name;
											Joined = true
										
										}
									});
						
						
						const userPermissions = await fetch(
							`https://www.pekora.zip/apisite/groups/v1/groups/${(groupId && userRoleId) ? groupId : '28'}/roles/${userRoleId || 1 }/permissions`
						).then(r => r.ok ? r.json() : null)
							.catch(err => {
								console.log("yo")
							});
						// actually init user perms now 
						let postHTML = ''
						
							const perms = await userPermissions?.permissions
							console.log(perms)
							if (perms?.groupPostsPermissions?.postToWall) {
								postHTML = `
									<div class="create-comment-container" style="
									   padding-bottom: 0;
									   /* margin: 6px 0; */
									   height: max-content;
									   height: 70px;
									   ">
									   <div class="commentBox-0-2-199 float-left " style="
										  width: calc(100% - 125px - 13px);
										  font-size: 16px;
										  font-weight: 300;
										  line-height: 1.3em;
										  margin: 6px 0;
										  "><input class="comment-input" placeholder="Say something..." maxlength="200" style="
										  color: var(--text-color-primary);
										  width: 100%;
										  border: 1px solid var(--text-color-secondary);
										  height: 43px;
										  display: block;
										  padding: 5px 12px;
										  font-size: 16px;
										  font-weight: 300;
										  line-height: 100%;
										  border-radius: 3px;
										  background-color: var(--white-color);
										  "></div>
									   <div class="float-right " style="
										  margin: 6px 0;
										  ">
										  <div class="post-comment-button" style="
											 margin: 0 0 0 12px;
											 "><button type="submit" value="submit" class="btn-0-2-93 continueButton-0-2-197 newContinueButton-0-2-88" title="" style="
											 color: #fff !important;
											 border: 1px solid var(--primary-color);
											 height: 42px;
											 display: inline-block;
											 padding: 9px;
											 font-size: 18px;
											 background: var(--primary-color);
											 text-align: center;
											 font-weight: 500;
											 line-height: 100%;
											 user-select: none;
											 white-space: nowrap;
											 border-color: var(--primary-color) !important;
											 border-radius: 3px;
											 vertical-align: middle;
											 width: 125px;
											 float: right;
											 ">Post</button></div>
									   </div>
									</div>
								`; // Your post HTML string
								// 3. Fixed: Inserting postHTML instead of shoutHTML
								// 1. Select the elements we just added
							}
							if (perms?.groupPostsPermissions?.postToStatus) {
								console.log("yes we can post to status!")
								shoutHTML = shoutHTML.replace("none /* toggle */", "block");
							}
						

					const currentPrimaryId = await primaryPromise;
					const isAlreadyPrimary = currentPrimaryId?.group?.id === Number(groupId);

					// 2. Now .data.map() will work because userGroupsPromise is the resolved object
					// Store in a Map for $O(1)$ lookup: [id => url]

						// HTML placeholder
						wrapper.innerHTML = `
							<div ng-controller="groupController" ng-class="{'group-details-container-desktop-and-tablet': !library.metadata.isPhone}" group-data="" class="ng-scope group-details-container-desktop-and-tablet" style="
							   background-color: #E3E3E3;
							   ">
							<div class="create-group-button-container" style="
							   font-size: 16px;
							   font-weight: 400;
							   line-height: 1.4em;
							   width: 100%;
							   float: left;
							   background-color: #E3E3E3;
							   ">
							   <a href="https://pekora.zip/My/CreateGroup.aspx" 
								  class="btn-control-md create-group-button" 
								  title="Create Group" 
								  style="
								  /* float: right; */
								  margin-bottom: 12px;
								  opacity: 1;
								  background-color: #fff;
								  border-color: #b8b8b8;
								  color: #000000;
								  cursor: pointer; /* Changed from default to pointer */
								  user-select: none;
								  border: 1px solid #b8b8b8;
								  display: inline-block;
								  font-weight: 500;
								  height: auto;
								  text-align: center;
								  white-space: nowrap;
								  vertical-align: middle;
								  padding: 9px;
								  font-size: 18px;
								  line-height: 100%;
								  border-radius: 3px;
								  text-decoration: none; /* Keeps it looking like a button */
								  position: relative;
								  right: calc(-100% - 5px);
								  transform: translateX(-100%);
								  ">Create Group</a>
							</div>
							<!-- ngIf: isAuthenticatedUser && !library.metadata.isPhone && isLoadFinished() --><!-- ngIf: isLoadFinished() -->
							<div ng-if="isAuthenticatedUser &amp;&amp; !library.metadata.isPhone &amp;&amp; isLoadFinished()" class="menu-vertical-container ng-scope" style="
								font-size: 16px;
								font-weight: 400;
								line-height: 1.4em;
							"><groups-list groups="library.groupsList.groups" current-group="library.currentGroup" metadata="library.metadata" load-more-groups="loadMoreGroups" is-loading-groups="layout.isLoadingGroups" class="ng-isolate-scope"><div class="loading ng-hide" ng-show="$ctrl.isLoadingGroups" style="
								display: none !important;
							"><span class="spinner spinner-default" alt="Processing..."></span></div><!-- ngIf: !$ctrl.metadata.isPhone --><ul ng-if="!$ctrl.metadata.isPhone" id="groups-list" class="group-cards menu-vertical rbx-scrollbar ng-scope mCustomScrollbar _mCS_1 mCS_no_scrollbar" infinite-scroll="$ctrl.loadMoreGroups()" infinite-scroll-disabled="$ctrl.isLoadingGroups" infinite-scroll-distance="0.5" data-toggle="scrollbar" style="
								max-height: 770px;
								float: left;
								touch-action: auto;
								width: 160px;
								background-color: #fff;
								overflow: auto;
								-webkit-overflow-scrolling: touch;
								max-height: 500px;
								list-style: none;
								margin: 0;
								padding: 0;
								position: relative;
								left: -6px;
							"><div id="mCSB_1" class="mCustomScrollBox mCS-light mCSB_vertical mCSB_inside" tabindex="0" style="
								position: relative;
								overflow: hidden;
								height: 100%;
								max-width: 100%;
								outline: none;
								direction: ltr;
							"><div id="mCSB_1_container" class="mCSB_container mCS_y_hidden mCS_no_scrollbar_y" style="position:relative;top:0;left:0;margin-right: 0;overflow: hidden;width: auto;height: auto;" dir="ltr">${groupsLeft.innerHTML}<!-- ngRepeat: group in $ctrl.groups --><!-- end ngRepeat: group in $ctrl.groups --><!-- end ngRepeat: group in $ctrl.groups --></div><div id="mCSB_1_scrollbar_vertical" class="mCSB_scrollTools mCSB_1_scrollbar mCS-light mCSB_scrollTools_vertical" style="display: none;"><div class="mCSB_draggerContainer"><div id="mCSB_1_dragger_vertical" class="mCSB_dragger" style="position: absolute; min-height: 30px; height: 0px; top: 0px;" oncontextmenu="return false;"><div class="mCSB_dragger_bar" style="line-height: 30px;"></div></div><div class="mCSB_draggerRail"></div></div></div></div></ul><!-- end ngIf: !$ctrl.metadata.isPhone --><!-- ngIf: $ctrl.metadata.isPhone && $ctrl.groups[0].isPrimary --><!-- ngIf: $ctrl.metadata.isPhone --></groups-list></div>

							<div class="group-details ng-scope group-details-no-list" style="width:100%" ng-if="isLoadFinished()" ng-class="{'group-details-with-list' : currentUserIsInAnyGroup() &amp;&amp; !library.metadata.isPhone,
							   'group-details-no-list' : !currentUserIsInAnyGroup() &amp;&amp; !library.metadata.isPhone}">
							<div class="alert-system-feedback" style="
							   display: none !important;
							   ">
							   <div class="alert alert-warning"><span class="alert-context ng-binding" ng-bind="'Label.Warning' | translate">Warning</span> <span id="close" class="icon-close-white"></span></div>
							</div>
							<div class="alert-system-feedback" style="
							   display: none !important;
							   ">
							   <div class="alert alert-loading ng-binding" ng-bind="'Label.Loading' | translate">Loading...</div>
							</div>
							<div class="alert-system-feedback" style="
							   display: none !important;
							   ">
							   <div class="alert alert-success ng-binding" ng-bind="'Label.Success' | translate">Success</div>
							</div>
							<!-- ngIf: isLockedGroup() --><!-- ngIf: !isLockedGroup() -->
							<div ng-if="!isLockedGroup()" class="ng-scope" style="
								display: flex;
								flex-wrap: wrap;
								position: relative;
								right: -5px;
								width: calc(100% - 160px);
							">
							<div class="col-xs-12 section-content" style="
							   width: 100%;
							   margin: 0 0 18px;
							   box-shadow: none;
							   ">
							   <div class="hidden" id="page-top"></div>
							   <div class="group-menu" style="
								  position: relative;
								  top: 0;
								  right: 6px;
								  float: right;
								  display: table;
								  ">
								  <a tabindex="0" class="rbx-menu-item" popover-placement="bottom-right" popover-trigger="'click : blur'" uib-popover-template="'group-menu-popover'"><span class="icon-more"></span></a></div>
							   <div class="group-header" style="
								  content: &quot; &quot;;
								  display: table;
								  width: calc(100% - 29px);
								  ">
								  <div class="group-image" style="
									 float: left;
									 margin-right: 12px;
									 width: 126px;
									 height: 126px;
									 " >
									 <thumbnail-2d thumbnail-type="thumbnailTypes.groupIcon" thumbnail-target-id="library.currentGroup.id" size="thumbnailSizes.large" class="ng-isolate-scope">
										<span ng-class="$ctrl.getCssClasses()" thumbnail-type="groupIcon" thumbnail-target-id="1" size="large" class="" style="
										   display: block;
										   width: 126px;
										   height: 126px;
										   ">
										   <!-- ngIf: $ctrl.thumbnailUrl --><img ng-if="$ctrl.thumbnailUrl" ng-src="" class="ng-scope groupIconClass" src="https://www.pekora.zip${groupIcon.imageUrl}" style="
											  width: 126px;
											  height: 126px;
											  "><!-- end ngIf: $ctrl.thumbnailUrl -->
										</span>
									 </thumbnail-2d>
									 <!-- ngIf: isGroupBCOnly() -->
								  </div>
								  <div class="group-caption group-caption-with-image" style="
									 position: relative;
									 float: left;
									 height: 126px;
									 width: calc(100% - 142px);
									 ">
									 <h1 class="group-name ng-binding" ng-bind="library.currentGroup.group.name" style="
										display: inline-block;
										/* overflow: hidden; */
										text-overflow: ellipsis;
										white-space: nowrap;
										max-width: 100%;
										font-size: 32px;
										font-weight: 800;
										width: 100%;
										text-align: left
										">${groupInfo.name}</h1>
									 <div class="group-owner" style="
										width: max-content;
										">
										<span class="text-label ng-binding" ng-bind="'Label.ByOwner' | translate" style="
										   color: #b8b8b8;
										   font-weight: 400;
										   text-align: left;
										   ">By</span> <!-- ngIf: doesGroupHaveOwner() --><a ng-if="doesGroupHaveOwner()" ng-href="https://pekora.zip/users/${groupInfo.owner.userId}/profile" class="text-name name ng-binding ng-scope" ng-bind="library.currentGroup.group.owner.username" href="https://pekora.zip/users/${groupInfo.owner.userId}/profile" style="
										   font-size: 16px;
										   font-weight: 500;
										   color: var(--primary-color);
										   ">${groupInfo.owner.username}</a><!-- end ngIf: doesGroupHaveOwner() --> <!-- ngIf: doesGroupHaveOwner() === false -->
									 </div>
									 <div class="group-info" style="
										position: absolute;
										width: 100%;
										right: 0;
										bottom: 0;
										">
										<div class="dynamic-overflow-container no-wrap group-stats" style="width: 250%">
										   <div class="dynamic-width-item group-members group-guest" ng-class="{'border-right' : library.metadata.isPhone &amp;&amp; isInGroup(), 'group-guest' : !isInGroup() }" style="position: relative;float: left;display: inline-block;padding: 0 12px;font-size: 16px;font-weight: 400;line-height: 1.4em;flex: 1 1;">
											  <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate" style="
												 color: #b8b8b8;
												 font-size: 12px;
												 font-weight: 500;
												 line-height: 1.4em;
												 height: max-content;
												 ">Members</div>
											  <h3 class="group-members font-caption-body ng-binding" title="${groupInfo.memberCount}" ng-bind="library.currentGroup.group.memberCount | abbreviate" style="
												 font-size: 25px;
												 font-weight: 400;
												 ">${groupInfo.memberCount}</h3>
										   </div>
										   <div class="dynamic-width-item group-members group-rank" ng-class="{'border-right' : library.metadata.isPhone &amp;&amp; isInGroup(), 'group-guest' : !isInGroup() }" style="position: relative;float: left;display: ${Joined ? "inline-block" : "none"};padding: 0 12px;font-size: 16px;font-weight: 400;line-height: 1.4em;flex: 1 1;">
											  <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate" style="
												 color: #b8b8b8;
												 font-size: 12px;
												 font-weight: 500;
												 line-height: 1.4em;
												 height: max-content;
												 ">Rank</div>
											  <h3 class="group-rank-name font-caption-body ng-binding" title="${roleName}" ng-bind="library.currentGroup.group.memberCount | abbreviate" style="
												 font-size: 25px;
												 font-weight: 400;
												 ">${roleName}</h3>
										   </div>
										   <!-- ngIf: isInGroup() -->
										</div>
										<!-- ngIf: isAuthenticatedUser && !isInGroup() -->
									 </div>
									 <button type="submit" value="submit" class="join-Group" title="" style="
										color: #fff !important;
										border: 1px solid var(--primary-color);
										height: 42px;
										/* display: inline-block; */
										/* padding: 9px; */
										font-size: 18px;
										background: var(--primary-color);
										text-align: center;
										font-weight: 500;
										/* line-height: 100%; */
										user-select: none;
										white-space: nowrap;
										border-color: var(--primary-color) !important;
										border-radius: 3px;
										vertical-align: middle;
										width: 125px;
										position: absolute;
										bottom: 5px; 
										right: -5px; 
										display: none;
										">Join Group</button>
								  </div>
							   </div>
							</div>
							<div class="col-xs-12 rbx-tabs-horizontal" style="
							   width: 100%;
							   ">
							   <ul id="horizontal-tabs" class="nav nav-tabs" role="tablist" style="
								  text-align: center;
								  width: 100%;
								  text-align: center;
								  width: 100%;
								  ">
								  <li id="about" class="rbx-tab group-tab about-tab" ng-class="{'active': Data.activeTab === groupConstants.currentTab[1] }" ui-sref="about" href="#!/about" style="
									 width: 33.33333%;
									 background-color: white;
									 font-size: 16px;
									 font-weight: 400;
									 line-height: 1.4em;
									 box-shadow: inset 0 -4px 0 0 var(--primary-color);
									 "><a class="rbx-tab-heading" style="
									 color: #191919;
									 /* width: 100%; */
									 position: relative;
									 display: block;
									 -webkit-transition: all, .2s, ease-in-out;
									 -o-transition: all,.2s,ease-in-out;
									 transition: all, .2s, ease-in-out;
									 padding: 12px 2%;
									 padding-top: 12px;
									 padding-right: 2%;
									 padding-bottom: 12px;
									 padding-left: 2%;
									 border: 0;
									 border-radius: 0;
									 line-height: 100%;
									 "><span class="text-lead ng-binding" ng-bind="'Heading.About' | translate" style="
									 display: inline-block;
									 margin: 0;
									 font-size: 13px;
									 font-weight: 500;*
									 -webkit-transition: all, .2s, ease-in-out; */
									 -o-transition: all,.2s,ease-in-out;
									 /* transition: all, .2s, ease-in-out; */
									 /* padding: 12px 2%; */
									 border: 0;
									 border-radius: 0;
									 line-height: 100%;
									 ">About</span></a></li>
								  <li id="store" class="rbx-tab group-tab store-tab" ng-class="{'active': Data.activeTab === groupConstants.currentTab[2] }" ui-sref="store" href="#!/store" style="
									 width: 33.33333%;
									 background-color: white;
									 font-size: 16px;
									 font-weight: 400;
									 line-height: 1.4em;
									 "><a class="rbx-tab-heading" style="color: #191919;/* box-shadow: inset 0 -4px 0 0 var(--primary-color); *//* width: 100%; */position: relative;display: block;-webkit-transition: all, .2s, ease-in-out;-o-transition: all,.2s,ease-in-out;transition: all, .2s, ease-in-out;padding: 12px 2%;padding-top: 12px;padding-right: 2%;padding-bottom: 12px;padding-left: 2%;border: 0;border-radius: 0;line-height: 100%;"><span class="text-lead ng-binding" ng-bind="'Heading.Store' | translate" style="
									 display: inline-block;
									 margin: 0;
									 font-size: 13px;
									 font-weight: 500;
									 -webkit-transition: all, .2s, ease-in-out;
									 -o-transition: all,.2s,ease-in-out;
									 /* transition: all, .2s, ease-in-out; */
									 /* padding: 12px 2%; */
									 border: 0;
									 border-radius: 0;
									 line-height: 100%;
									 ">Store</span></a></li>
								  <li id="affiliates" class="rbx-tab group-tab affiliates-tab" ng-class="{'active': Data.activeTab === groupConstants.currentTab[3] }" ui-sref="affiliates" href="#!/affiliates" style="
									 width: 33.33333%;
									 background-color: white;
									 -webkit-user-select: none;
									 -moz-user-select: none;
									 -ms-user-select: none;
									 user-select: none;
									 -webkit-tap-highlight-color: transparent;
									 -webkit-touch-callout: none;
									 cursor: pointer;
									 font-size: 16px;
									 font-weight: 400;
									 line-height: 1.4em;
									 "><a class="rbx-tab-heading" style="
									 color: #191919;
									 /* box-shadow: inset 0 -4px 0 0 var(--primary-color); */
									 /* width: 100%; */
									 position: relative;
									 display: block;
									 -webkit-transition: all, .2s, ease-in-out;
									 -o-transition: all,.2s,ease-in-out;
									 transition: all, .2s, ease-in-out;
									 padding: 12px 2%;
									 padding-top: 12px;
									 padding-right: 2%;
									 padding-bottom: 12px;
									 padding-left: 2%;
									 border: 0;
									 border-radius: 0;
									 line-height: 100%;
									 "><span class="text-lead ng-binding" ng-bind="'Heading.Affiliates' | translate" style="
									 display: inline-block;
									 margin: 0;
									 font-size: 13px;
									 font-weight: 500;
									 -webkit-transition: all, .2s, ease-in-out;
									 -o-transition: all,.2s,ease-in-out;
									 /* transition: all, .2s, ease-in-out; */
									 /* padding: 12px 2%; */
									 border: 0;
									 border-radius: 0;
									 line-height: 100%;
									 ">Affiliates</span></a></li>
							   </ul>
							</div>
							<div ng-if="Data.activeTab === groupConstants.currentTab[2]" group-store="" class="ng-scope main-group-store" style="
								 display: none; width: 100%;
									">
									<div ng-controller="groupStoreController" class="tab-content rbx-tab-content section col-xs-12 ng-scope">
								   <div class="container-header">
									  <h3 ng-bind="'Heading.Store' | translate" class="ng-binding" style="
										 margin: 6px 0;
										 font-size: 20px;
										 padding-top: 0;
										 font-weight: 300;
										 ">Store</h3>
								   </div>
								   <!-- ngIf: library.currentGroup.permissions.groupEconomyPermissions.createItems && library.currentGroup.permissions.groupEconomyPermissions.manageItems && !library.metadata.isPhone -->
								   <div class="spinner spinner-default ng-hide store-loading" ng-show="layout.isLoading" style="display: none;"></div>
								   <div class="section-content-off ng-binding ng-hide store-empty" ng-show="!layout.isLoading &amp;&amp; storeData.results.length == 0" ng-bind="layout.loadStoreItemsError ? 'Message.LoadGroupStoreItemsError' : 'Label.NoStoreItems' | translate" style="
									  display: none;
									  ">No items are for sale in this group.</div>
								   <ul class="hlist item-cards-stackable" ng-show="storeData.results.length &gt; 0" ng-class="{'faded' : layout.isLoading &amp;&amp; !library.metadata.isPhone}" infinite-scroll="getNextPage()" infinite-scroll-disabled="!library.metadata.isPhone || Data.activeTab !== groupConstants.currentTab[2]" style="
									  width: 100%;
									  overflow: hidden;
									  list-style: none;
									  margin: 0;
									  padding: 0;
									  display: flex;
									  flex-wrap: wrap;
									  "></ul>
								   <div ng-show="storeData.showPagination" current-page="storeData.query.PageNumber" items-per-page="storeData.resultsPerPage" num-pages="storeData.numberOfPages" model-changed="storeData.updatePagination" page-changed="pageChanged" is-loading="layout.isLoading" show-first-last="layout.showFirstLast" pagination="" class="store-pager-container">
									  <div class="store-pager-holder" ng-hide="$ctrl.membersPager.isBusy() || ($ctrl.membersPager.getCurrentPageNumber() === 1 &amp;&amp; !$ctrl.membersPager.canLoadNextPage())" style="
										 font-size: 16px;
										 font-weight: 400;
										 line-height: 1.4em;
										 width: auto;
										 padding: 3px 0 0;
										 text-align: center;
										 box-sizing: border-box;
										 text-rendering: auto;
										 ">
										 <ul class="store-pager" style="
											display: inline-block;
											margin: 0 auto;
											width: auto;
											list-style: none;
											text-align: center;
											padding: 0;
											">
											<li class="store-pager-prev disabled"style="float: left;"><a style="
											   background-color: #fff;
											   border: 1px solid #b8b8b8;
											   border-radius: 3px;
											   margin: 0 9px 0 0;
											   height: 32px;
											   width: 32px;
											   color: #191919;
											   padding: 3px 0 0;
											   text-align: center;
											   display: inline-block;
											   text-decoration: none;
											   color: inherit;
											   "><span class="icon-left" style="
											   width: 20px;
											   height: 20px;
											   background-size: 40px auto;
											   background-position: 0px -541px;
											   "></span></a></li>
											<li style="
											   float: left;
											   "><span class="store-pager-container-text" style="
											   border: 0;
											   padding: 6px 6px 0 0;
											   display: inline-block;
											   text-align: center;
											   ">Page 1</span></li>
											<li class="store-pager-next" style="
											   float: left;
											   "><a style="
											   background-color: #fff;
											   border: 1px solid #b8b8b8;
											   border-radius: 3px;
											   margin: 0 9px 0 0;
											   height: 32px;
											   width: 32px;
											   color: #191919;
											   padding: 3px 0 0;
											   text-align: center;
											   display: inline-block;
											   text-decoration: none;
											   color: inherit;
											   "><span class="icon-right" style="
											   width: 20px;
											   height: 20px;
											   background-size: 40px auto;
											   background-position: 0px -521px;
											   "></span></a></li>
										 </ul>
									  </div>
									  <!-- end ngIf: !isLockedGroup() -->
								   </div>
								   <!-- end ngIf: isLoadFinished() -->
									 </div> 
							</div> 
							<div ng-if="Data.activeTab === groupConstants.currentTab[1]" group-about="" class="ng-scope main-group-about" style="width:100%;">
									 <div class="col-xs-12 section main-group">
										${shoutHTML}
										<!-- ngIf: canViewStatus() || (canPostToStatus()) --><!-- ngIf: library.currentGroup.group.description || currencyInRobux !== null --><!-- ngIf: library.currentGroup.areGroupGamesVisible --><!-- ngIf: isAuthenticatedUser -->
										<div class="clearfix"></div>
										<!-- ngIf: library.currentGroup.roles -->
										<div class="section" ng-hide="$ctrl.numGroupMembers == 0">
										   <div class="group-desc-title container-header group-members-list-container-header" style="
											  font-size: 16px;
											  font-weight: 400;
											  line-height: 1.4em;
											  margin: 3px 0 6px;
											  box-sizing: border-box;
											  text-rendering: auto;
											  display: block;
											  unicode-bidi: isolate;
											  -webkit-font-smoothing: antialiased;
											  ">
											  <h3 class="group-title ng-binding" ng-bind="'Heading.Members' | translate" style="
												 margin: 6px 0;
												 float: left;
												 font-size: 20px;
												 padding-top: 0;
												 font-weight: 300;
												 ">Description</h3>
												 <div class="social-links flex justify-content-end" style="float: right;"></div>
										   </div>
										   <div class="spinner spinner-default ng-hide" ng-show="$ctrl.membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" style="
											  display: none !important;
											  "></div>
										   <div class="group-desc-main section-content group-shout-list " ng-show="$ctrl.members.length &gt; 0" style="overflow: hidden; background-color: rgb(255, 255, 255); padding: 15px; position: relative; margin: 0px 0px 18px; width: 100%; box-shadow: none; display: block;">
											  <pre class="wall-comment-body" style="width:100%;text-align: left;margin-bottom: 0;white-space: pre-line;word-break: break-word;font-weight: 400;">
											  ${groupInfo.description}
										   </div>
										   <div class="group-games-main" ng-if="library.currentGroup.areGroupGamesVisible" group-games="" class="ng-scope" style="
												display: none;
											"><div ng-controller="groupGamesController" class="section ng-scope"><div class="container-header" style="
												height: max-content;
											"><h3 ng-bind="'Heading.Games' | translate" class="ng-binding" style="
												margin: 6px 0;
												float: left;
												font-size: 20px;
												padding-top: 0;
												font-weight: 300;
											">Games</h3><div class="games-pager-holder" ng-hide="$ctrl.membersPager.isBusy() || ($ctrl.membersPager.getCurrentPageNumber() === 1 &amp;&amp; !$ctrl.membersPager.canLoadNextPage())" style="
													   /* font-size: 16px; */
													   font-weight: 400;
													   /* line-height: 1.4em; */
													   /* float: right; */
													   width: auto;
													   /* padding: 3px 0 0; */
													   text-align: center;
													   /* box-sizing: border-box; */
													   text-rendering: auto;
													   width: max-content;
													   left: 100%;
													   position: relative;
													   transform: translate(-140%);
													   height: max-content;
													   display: inline-block;
													   ">
													   <ul class="games-pager" style="
														  display: inline-block;
														  margin: 0 auto;
														  width: auto;
														  list-style: none;
														  /* text-align: center; */
														  padding: 0;
														  position: relative;
														  ">
														  <li class="games-pager-prev disabled" style="float: left;"><a style="
															 background-color: #fff;
															 border: 1px solid #b8b8b8;
															 border-radius: 3px;
															 margin: 0 9px 0 0;
															 height: 32px;
															 width: 32px;
															 color: #191919;
															 padding: 3px 0 0;
															 text-align: center;
															 display: inline-block;
															 text-decoration: none;
															 color: inherit;
															 "><span class="icon-left" style="
															 width: 20px;
															 height: 20px;
															 background-size: 40px auto;
															 background-position: 0px -541px;
															 "></span></a></li>
														  <li style="float: left;"><span class="games-pager-title ng-binding" style="
															 border: 0;
															 padding: 6px 6px 0 0;
															 display: inline-block;
															 text-align: center;
															 ">Page 2</span></li>
														  <li class="games-pager-next" style="
															 float: left;
															 "><a style="
															 background-color: #fff;
															 border: 1px solid #b8b8b8;
															 border-radius: 3px;
															 margin: 0 9px 0 0;
															 height: 32px;
															 width: 32px;
															 color: #191919;
															 padding: 3px 0 0;
															 text-align: center;
															 display: inline-block;
															 text-decoration: none;
															 color: inherit;
															 "><span class="icon-right" style="
															 width: 20px;
															 height: 20px;
															 background-size: 40px auto;
															 background-position: 0px -521px;
															 "></span></a></li>
													   </ul>
													</div></div><div class="group-games"><ul class="hlist-game-cards" ng-show="!gamesPager.isBusy() &amp;&amp; games.length &gt; 0" style="
												white-space: nowrap;
												list-style: none;
												margin: 0;
												padding: 0;
												padding: 0 0 0 9px;
												display: flex;
											">
											<!-- end ngRepeat: game in games --></ul></div></div></div>
										   <group-members-list ng-if="library.currentGroup.roles" is-authenticated-user="isAuthenticatedUser" group-id="library.currentGroup.id" roles="library.currentGroup.roles" class="ng-scope ng-isolate-scope">
											  <div class="section" ng-hide="$ctrl.numGroupMembers == 0">
												 <div class="container-header group-members-list-container-header" style="
													font-size: 16px;
													font-weight: 400;
													line-height: 1.4em;
													margin: 3px 0 6px;
													box-sizing: border-box;
													text-rendering: auto;
													display: block;
													unicode-bidi: isolate;
													-webkit-font-smoothing: antialiased;
													">
													<h3 class="group-title ng-binding" ng-bind="'Heading.Members' | translate" style="
													   margin: 6px 0;
													   float: left;
													   font-size: 20px;
													   padding-top: 0;
													   font-weight: 300;
													   ">Members</h3>
													<div class="input-group-btn group-dropdown" style="
													   border-radius: 0;
													   width: 200px;
													   float: right;
													   font-size: 16px;
													   font-weight: 400;
													   line-height: 1.4em;
													   position: relative;
													   white-space: nowrap;
													   display: block;
													   vertical-align: middle;
													   padding: 0;
													   ">
													   <button type="button" class="input-dropdown-btn" data-toggle="dropdown" style="
														  -webkit-user-select: none;
														  -moz-user-select: none;
														  -ms-user-select: none;
														  user-select: none;
														  background-color: #fff;
														  border: 1px solid #b8b8b8;
														  color: #191919;
														  cursor: pointer;
														  display: inline-block;
														  font-weight: 500;
														  height: auto;
														  text-align: center;
														  white-space: nowrap;
														  vertical-align: middle;
														  border-radius: 3px;
														  padding: 5px 12px;
														  margin: 0;
														  line-height: 18px;
														  display: block;
														  width: 100%;
														  text-transform: none;
														  overflow: visible;
														  "><span class="rbx-selection-label ng-binding selectedRoleName" title="--" ng-bind="$ctrl.data.currentRoleName" style="
														  max-width: calc(100% - 16px);
														  overflow: hidden;
														  text-overflow: ellipsis;
														  float: left;
														  text-align: left;
														  font-size: 16px;
														  line-height: 26px;
														  ">--</span> <span class="icon-down-16x16" style="
														  float: right;
														  margin-top: 5px;
														  "></span></button>
													   <ul data-toggle="dropdown-menu" class="dropdown-menu" role="menu" style="display: block;width: auto;min-width: 100%;max-width: 200%;left: auto;right: 0;max-height: 266px;border-radius: 4px;background-clip: padding-box;box-shadow: 0 -5px 20px rgba(25, 25, 25, .15);float: left;font-size: 16px;margin: 0;padding: 0;position: absolute;overflow-y: auto;overflow-x: hidden;top: 100%;list-style: none;text-align: left;z-index: 1020;">
													   </ul>
													</div>
													<div class="pager-holder" ng-hide="$ctrl.membersPager.isBusy() || ($ctrl.membersPager.getCurrentPageNumber() === 1 &amp;&amp; !$ctrl.membersPager.canLoadNextPage())" style="
													   font-size: 16px;
													   font-weight: 400;
													   line-height: 1.4em;
													   float: right;
													   width: auto;
													   padding: 3px 0 0;
													   text-align: center;
													   box-sizing: border-box;
													   text-rendering: auto;
													   ">
													   <ul class="pager" style="
														  display: inline-block;
														  margin: 0 auto;
														  width: auto;
														  list-style: none;
														  text-align: center;
														  padding: 0;
														  ">
														  <li class="pager-prev disabled" ng-class="{ disabled: !$ctrl.membersPager.canLoadPreviousPage() }" style="float: left;"><a ng-click="$ctrl.membersPager.loadPreviousPage()" style="
															 background-color: #fff;
															 border: 1px solid #b8b8b8;
															 border-radius: 3px;
															 margin: 0 9px 0 0;
															 height: 32px;
															 width: 32px;
															 color: #191919;
															 padding: 3px 0 0;
															 text-align: center;
															 display: inline-block;
															 text-decoration: none;
															 color: inherit;
															 "><span class="icon-left" style="
															 width: 20px;
															 height: 20px;
															 background-size: 40px auto;
															 background-position: 0px -541px;
															 "></span></a></li>
														  <li style="
															 float: left;
															 "><span ng-bind="'Label.CurrentPage' | translate:{ currentPage: $ctrl.membersPager.getCurrentPageNumber() }" class="ng-binding" style="
															 border: 0;
															 padding: 6px 6px 0 0;
															 display: inline-block;
															 text-align: center;
															 ">Page 1</span></li>
														  <li class="pager-next" ng-class="{ disabled: !$ctrl.membersPager.canLoadNextPage() }" style="
															 float: left;
															 "><a ng-click="$ctrl.membersPager.loadNextPage()" style="
															 background-color: #fff;
															 border: 1px solid #b8b8b8;
															 border-radius: 3px;
															 margin: 0 9px 0 0;
															 height: 32px;
															 width: 32px;
															 color: #191919;
															 padding: 3px 0 0;
															 text-align: center;
															 display: inline-block;
															 text-decoration: none;
															 color: inherit;
															 "><span class="icon-right" style="
															 width: 20px;
															 height: 20px;
															 background-size: 40px auto;
															 background-position: 0px -521px;
															 "></span></a></li>
													   </ul>
													</div>
												 </div>
												 <div class="spinner spinner-default ng-hide" ng-show="$ctrl.membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" style="
													display: none !important;
													"></div>
												 <div class="section-content-off ng-binding ng-hide noOne" ng-show="!$ctrl.membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" ng-bind="$ctrl.loadMembersError ? 'Message.BuildGroupRolesListError' : 'Label.NoMembersInRole' | translate" style=" display: none !important; overflow: hidden; padding: 15px; position: relative; margin: 0 0 18px; width: 100%;">No group members are in this role.</div>
												 <div class="section-content group-members-list " ng-show="$ctrl.members.length &gt; 0" style="
													overflow: hidden;
													background-color: #fff;
													padding: 15px;
													position: relative;
													margin: 0 0 18px;
													width: 100%;
													box-shadow: none;
													">
													<ul class="hlist membersList" style="
													   list-style: none;
													   margin: 0;
													   padding: 0;
													   ">
													</ul>
												 </div>
											  </div>
										   </group-members-list>
										   <!-- end ngIf: library.currentGroup.roles --><!-- ngIf: isAuthenticatedUser -->
										   <div group-wall="">
											  <!-- ngIf: canViewWall() -->
											  <div ng-if="canViewWall()" ng-controller="groupWallController" class="col-xs-12 section ng-scope" infinite-scroll="groupWall.pager.loadNextPage()" infinite-scroll-disabled="isInfiniteScrollingDisabled()" infinite-scroll-distance="0.8">
												 <div class="container-header">
													<h3 class="group-title ng-binding" ng-bind="'Heading.Wall' | translate" 
													   style="
													   margin: 6px 0;
													   font-size: 20px;
													   padding-top: 0;
													   font-weight: 300;
													   "
													   >Wall</h3>
												 </div>
												 <!-- ngIf: showWallPrivacySettingsText() --><!-- ngIf: groupWall.posts.length > 0 || canPostToWall() -->
												 <div class="col-xs-12 section-content group-wall group-wall-no-margin ng-scope" style="    box-shadow: none;" ng-if="groupWall.posts.length &gt; 0 || canPostToWall()">
													<!-- ngIf: canPostToWall() --><!-- ngIf: canViewWall() -->
													<div group-comments="" ng-if="canViewWall()" class="ng-scope">
													   <div class="group-wall group-comments no-top-border" ng-class="{'no-top-border': !library.currentGroup.permissions.groupPostsPermissions.postToWall}">
													   ${postHTML}
													   </div>
													</div>
													<!-- end ngIf: canViewWall() -->
												 </div>
												 <!-- end ngIf: groupWall.posts.length > 0 || canPostToWall() --><!-- ngIf: canViewWall() -->
												 <div ng-if="canViewWall()" class="empty-wall section-content-off ng-binding ng-scope ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; !groupWall.loadFailure &amp;&amp; groupWall.posts.length === 0" ng-bind="'Label.NoWallPosts' | translate">Nobody has said anything yet...</div>
												 <!-- end ngIf: canViewWall() --><!-- ngIf: canViewWall() -->
												 <div ng-if="canViewWall()" class="unavailable-wall section-content-off ng-binding ng-scope ng-hide" ng-show="!groupWall.pager.isBusy() &amp;&amp; groupWall.loadFailure" ng-bind="'Label.WallPostsUnavailable' | translate" style="display:none">Wall posts are temporarily unavailable, please check back later.</div>
												 <!-- end ngIf: canViewWall() -->
												 <div class="loading ng-hide" ng-show="groupWall.pager.isBusy()"><span class="gw-loading spinner spinner-default" alt="Processing..."></span></div>
											  </div>
											  <!-- end ngIf: canViewWall() -->
										   </div>
										</div>
									 </div>
									 <!-- end ngIf: Data.activeTab === groupConstants.currentTab[1] --><!-- ngIf: Data.activeTab === groupConstants.currentTab[2] --><!-- ngIf: Data.activeTab === groupConstants.currentTab[3] -->
							</div>
							<div ng-if="Data.activeTab === groupConstants.currentTab[3]" group-affiliates="" class="col-xs-12 section ng-scope main-group-affiliates" style="
							width: 100%;
							display: none;
							"><group-affiliates group-id="library.currentGroup.id" section-title="'Heading.Allies'" no-affiliates-message="'Label.NoAllies'" relationship-type="groupConstants.relationshipType.allies" class="ng-isolate-scope"><div class="container-header"><h3 class="group-title ng-binding" ng-bind="$ctrl.sectionTitle | translate"style="
																 margin: 6px 0;
																 font-size: 20px;
																 padding-top: 0;
																 font-weight: 300;
																 ">Allies</h3></div><div class="col-xs-12 group-affiliates"><div class="section-content-off ng-binding ng-hide" ng-show="!$ctrl.affiliatesPager.isBusy() &amp;&amp; $ctrl.affiliates.length == 0" ng-bind="$ctrl.loadAffiliatesError ? 'Message.GetGroupRelationshipsError' : $ctrl.noAffiliatesMessage | translate" style="
								display: block !important;
							">This group does not have any allies.</div></div></group-affiliates><!-- ngIf: library.currentGroup.areEnemiesAllowed --><group-affiliates ng-if="library.currentGroup.areEnemiesAllowed" group-id="library.currentGroup.id" section-title="'Heading.Enemies'" no-affiliates-message="'Label.NoEnemies'" relationship-type="groupConstants.relationshipType.enemies" class="ng-scope ng-isolate-scope"><div class="container-header"><h3 class="group-title ng-binding" ng-bind="$ctrl.sectionTitle | translate"style="
											 margin: 6px 0;
											 font-size: 20px;
											 padding-top: 0;
											 font-weight: 300;
										 ">Enemies</h3></div><div class="col-xs-12 group-affiliates"><div class="section-content-off ng-binding" ng-show="!$ctrl.affiliatesPager.isBusy() &amp;&amp; $ctrl.affiliates.length == 0" ng-bind="$ctrl.loadAffiliatesError ? 'Message.GetGroupRelationshipsError' : $ctrl.noAffiliatesMessage | translate">This group does not have any enemies.</div></div></group-affiliates><!-- end ngIf: library.currentGroup.areEnemiesAllowed --></div>
							`
			
						parent.innerHTML = ''; 
						 parent.appendChild(wrapper);
						const newEl = wrapper.firstElementChild
						const joinButton = document.querySelector('.join-Group')
						
									if (!Joined) {
		joinButton.style.display = "block"
		joinButton.addEventListener('click', (e) => {
			e.preventDefault();

			// 3. Disable the button to prevent multiple firings
			joinButton.disabled = true;
			joinButton.style.opacity = "0.3";

			// 4. Send the request
			fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then(res => {
					if (res.ok) {
						// 5. Reload on success
						window.location.reload();
					}
				})
				.catch(err => {
					console.error(err);
				});
		});
	}
					const postContainer = document.querySelector('.shout-box');
					if (perms?.groupPostsPermissions?.canPostToStatus) {
					const postButton = postContainer.querySelector('.shout-post-button');
					const postInput = postContainer.querySelector('.shout-input');
					// 2. Add the click event
					postButton.addEventListener('click', (e) => {
						e.preventDefault();

						const message = postInput.value.trim();
						if (!message) return; // Don't send empty posts

						// 3. Disable the button to prevent multiple firings
						postButton.disabled = true;
						postButton.style.opacity = "0.5";

						// 4. Send the request
						fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/status`, {
							method: "PATCH",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								message: message,
							})
						})
						.then(res => {
							if (res.ok) {
								// 5. Reload on success
									window.location.reload();
							} else {
								alert("Failed to post comment.");
								// Re-enable if it fails so the user can try again
								postButton.disabled = false;
								postButton.style.opacity = "1";
							}
						})
						.catch(err => {
							console.error(err);
							postButton.disabled = false;
							postButton.style.opacity = "1";
						});
					});
					}
						const allLinks = groupsLeft.querySelectorAll('.group-name-link');
						allLinks.forEach(link => {
							link.addEventListener('click', function(event) {
								event.preventDefault();
								const newgid = link.getAttribute('target-id')
								if (!(groupId === newgid)) {
								replaceGroups(newgid)
        
								// Grab the href and strip the domain to fix the SecurityError
								const targetUrl = this.getAttribute('href').replace(/^https?:\/\/(www\.)?pekora\.zip/, '');
        
								window.history.pushState({}, '', targetUrl);
								}
							});
						});

						const membersList = newEl.querySelector('[class*="membersList"]')
						const pagerPrev = newEl.querySelector('[ng-click*="loadPreviousPage"]')
						const pagerNext = newEl.querySelector('[ng-click*="loadNextPage"]')
						const pageTitle = newEl.querySelector('[ng-bind*="Label.CurrentPage"]')


						let pagerPos = 1
						let lastCount = 0

						let nextPageCursor = 0
						let prevCursors = [] // stack to go back
						let isLoading = false
						if (groupInfo.description.trim() === "") {
							document.querySelector(".group-desc-title").style.display = "none"
							document.querySelector(".group-desc-main").style.display = "none"
						} else {
						// add social links
							const holder = document.querySelector(".social-links")
							const texts = groupInfo.description.trim().split(/\s+/)
							texts.forEach(word => {
								if (word.match("https://x.com") || word.match("https://twitter.com")) {
									const twitter = `<a title="Twitter" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon twitter"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://discord.com") || word.match("https://discord.gg")) {
									const twitter = `<a title="Discord" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon discord"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://t.me")) {
									const twitter = `<a title="Telegram" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon telegram"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://youtube.com")) {
									const twitter = `<a title="youtube" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon youtube"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://tiktok.com")) {
									const twitter = `<a title="Tiktok" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon tiktok"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://twitch.tv")) {
									const twitter = `<a title="Twitch" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon twitch"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://github.com")) {
									const twitter = `<a title="Github" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon github"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
								if (word.match("https://roblox.com")) {
									const twitter = `<a title="Roblox" class="connectionLink-0-2-144" href="${word}" target="_blank" value="${word}"><span class="social-link-icon roblox"></span></a>`
									holder.insertAdjacentHTML('beforeend', twitter)
								}
							})
						}

						function attachPager() {
							if (!pagerPrev || !pagerNext) return

							// remove old listeners
							pagerPrev.onclick = null
							pagerNext.onclick = null

							pagerPrev.addEventListener('click', e => {
								e.preventDefault()
								e.stopPropagation()
								if (isLoading) return
								if (prevCursors.length < 2) return // can't go back
								prevCursors.pop() // remove current
								const prevCursor = prevCursors.pop() // go back
								loadPlayers(prevCursor, false)
							})

							pagerNext.addEventListener('click', e => {
								e.preventDefault()
								e.stopPropagation()
								if (isLoading) return
								if (lastCount < 9) return // no more pages
								loadPlayers(nextPageCursor)
							})
						}

						function updatePagerButtons() {
							if (!pagerPrev || !pagerNext) return
							pagerPrev.disabled = prevCursors.length < 2
							pagerNext.disabled = lastCount < 9 || isLoading
						}


						function loadPlayers(cursor = 0, pushPrev = true) {
							if (isLoading) return
							isLoading = true
							updatePagerButtons()
							pageTitle.textContent = ("Page " + ((Math.floor(prevCursors.length) + 1)))
							fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/roles/${cRole.id}/users?cursor=${cursor}&limit=9&sortOrder=desc`)
							.then(res => {
								if (!res.ok) throw new Error('players fetch failed')
								return res.json()
							})
							.then(playerData => {
								const players = playerData.data || []
								lastCount = players.length
								nextPageCursor = playerData.nextPageCursor || 0

								if (pushPrev) prevCursors.push(cursor)

									 const noOneDiv = newEl.querySelector('.noOne')
									const membersContainer = newEl.querySelector('.group-members-list')
									if (players.length === 0) {
										if(noOneDiv) noOneDiv.style.display = "block"
							
										if(membersContainer) membersContainer.style.display = "none"
										isLoading = false
										updatePagerButtons()
										return
									} else {
										if(noOneDiv) noOneDiv.style.display = "none"
										if(membersContainer) membersContainer.style.display = "block"
									}

								if (!players.length) {
									membersList.innerHTML = ""
									isLoading = false
									updatePagerButtons()
									return
								}

								const userIds = players.map(p => p.userId).join('%2C')
								return fetch(`https://www.pekora.zip/apisite/thumbnails/v1/users/avatar-headshot?userIds=${userIds}&size=420x420&format=png`)
								.then(res => res.json())
								.then(thumbData => {
									const thumbs = thumbData.data || []
									const thumbMap = {}
									thumbs.forEach(t => { if(t.state==="Completed") thumbMap[t.targetId]=t.imageUrl })

									membersList.innerHTML = ""

									players.forEach(p => {
										const playerId = p.userId
										const playerName = p.username
										const playerThumb = thumbMap[playerId] || ""

										const li = document.createElement("li")
										li.className = "list-item member"
										li.id = `member-${playerId}`
										li.style.cssText = `
											width: 11.111%;
											position: relative;
											float: left;
											list-style: none;
											margin: 0;
											padding: 0;
										`
										li.innerHTML = `
											<div title="${playerName}" class="avatar-container" style="margin:3px auto;position:relative;width:90px;">
												<a href="https://www.pekora.zip/users/${playerId}/profile">
													<span style="position:absolute;width:100%;height:100%;top:0;left:0;z-index:1;"></span>
												</a>
												<div class="avatar avatar-card-fullbody" style="position:relative;">
													<span style="width:90px;height:90px;display:block;background:#d1d1d1;border-radius:50%;">
														<img src="${playerThumb}" style="width:100%;height:100%;border-radius:50%;">
													</span>
												</div>
												<span style="display:block;margin:3px 0 0;text-align:center;font-size:12px;font-weight:500;width:90px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
													${playerName}
												</span>
											</div>
										`
										membersList.appendChild(li)
									})
						

									isLoading = false
									updatePagerButtons()
									attachPager()
								})
							})
							.catch(err => {
								console.error(err)
								isLoading = false
								updatePagerButtons()
							})
						}

						function populateRolesDropdown(roles, dropdownMenu) {
							if (!dropdownMenu) return

							// clear old roles
							dropdownMenu.innerHTML = ""

							roles.slice(1).forEach(role => {
								const roleId = role.id
								const roleName = role.name
								const roleCount = role.memberCount || 0

								const li = document.createElement("li")
								li.id = `role-${roleId}`
								li.className = "ng-scope"
								li.style.cssText = `
									padding: 0;
									margin: 0;
									white-space: nowrap;
									width: 100%;
									list-style: none;
								`

								const a = document.createElement("a")
								a.href = "#"
								a.style.cssText = `
									text-overflow: ellipsis;
									overflow-x: hidden;
									padding: 10px 12px;
									display: block;
									clear: both;
									line-height: 1.42857;
									text-decoration: none;
									color: inherit;
									white-space: nowrap;
								`
								a.addEventListener("click", e => {
									e.preventDefault()

									// set current role
									cRole = role
									pagerPos = 1
									prevCursors = []
									nextPageCursor = 0

									// reload the players for this role
									loadPlayers(0)

									// optionally update the dropdown button text
									const selectedRoleName = newEl.querySelector(".selectedRoleName")
									selectedRoleName.textContent = roleName

									// hide the dropdown
									dropdownMenu.style.display = "none"
								})

								const spanName = document.createElement("span")
								spanName.textContent = roleName
								spanName.className = "text-overflow ng-binding"
								spanName.style.cssText = `
									max-width: calc(100% - 75px);
						
									display: inline-block;
									overflow: hidden;
									text-overflow: ellipsis;
									white-space: nowrap;
									clear: both;
									line-height: 1.42857;
								`

								const spanCount = document.createElement("span")
								spanCount.textContent = `(${roleCount})`
								spanCount.className = "role-member-count ng-binding ng-scope"
								spanCount.style.cssText = `
						
									float: right;
								`

								a.appendChild(spanName)
								if (roleCount > 0) a.appendChild(spanCount)
								li.appendChild(a)
								dropdownMenu.appendChild(li)
							})
						}


									// find the button and the menu
						const groupMenu = document.querySelector('.group-menu');

							const existingPopover = document.querySelector('.popover.ng-isolate-scope');

								if (existingPopover) {
									// remove early popovers
									existingPopover.remove();
									//console.log("byeee!") 
								}

							groupMenu.addEventListener('click', function(e) {
								e.stopPropagation(); // Prevents the click from immediately closing the menu via body listener
    
								// Check if the popover is already inside the menu
								const existingPopover = this.querySelector('.popover.ng-isolate-scope');

								if (existingPopover) {
									// TOGGLE OFF: Remove it from the DOM
									existingPopover.remove();
									newPopover.style.opacity = "0";
									//console.log("byeee!")
								} else {
									const popoverHtml = `
										<div uib-popover-template-popup="" class="popover ng-scope ng-isolate-scope bottom fade in bottom-right" style="top: 22px;left: calc(-112px + 100%);opacity: 0; -webkit-box-shadow: 0 1px 4px 0 rgba(25, 25, 25, .3);box-shadow: 0 1px 4px 0 rgba(25, 25, 25, .3);background-clip: padding-box;border-radius: 4px;border: 0;max-width: 276px;text-align: left;padding: 0;position: absolute;white-space: normal;z-index: 1060;">
											<div class="arrow" style="top: -6.66667px; right: 4px;"></div>
											<div class="popover-inner">
												<div class="popover-content" style="padding: 0;">
													<div class="ng-scope">
														<ul class="main-dropdown-menu" role="menu" style="display: block; position: relative; border: 0; border-radius: 4px; background-clip: padding-box; box-shadow: 0 -5px 20px rgba(25, 25, 25, .15); float: left; font-size: 16px; margin: 0; padding: 0; min-width: 105px; overflow-y: auto; overflow-x: hidden; width: 100%; top: 100%; left: 0; list-style: none; text-align: left; z-index: 1020;">
															${perms.groupManagementPermissions.manageClan ? `<li class="admin-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" href="/My/GroupAdmin.aspx?gid=${groupId}" style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>Group Admin</a></li>` : ''}
															<li class="primary-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>${isAlreadyPrimary ? 'Remove Primary' : 'Make Primary'}</a></li>
															<li class="leave-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>Leave Group</a></li>
															${perms.groupEconomyPermissions.advertiseGroup ? `<li class="advertise-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" href="My/CreateUserAd.aspx?targetId=${groupId}&targetType=group" style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>Advertise Group</a></li>` : ''} 
															${perms.groupManagementPermissions.viewAuditLogs ? `<li class="audit-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" href="https://www.pekora.zip/Groups/Audit.aspx?groupid=${groupId}" style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>Audit Log</a></li>` : ''}
															<li class="report-group" style="width: 100%; margin: 0; white-space: nowrap; padding: 0 6px;">
																<a class="ng-binding" href="https://pekora.zip/internal/report-abuse"  style="display: block; clear: both; line-height: 1.42857; padding: 10px 6px; white-space: nowrap; color: #191919; cursor: pointer;"
																>Report Abuse</a></li>
															</li>
														</ul>
													</div>
												</div>
											</div>
										</div>`;
        
									this.insertAdjacentHTML('beforeend', popoverHtml);
									const newPopover = this.querySelector('.popover.ng-isolate-scope');
									const leave = this.querySelector(".leave-group")
									const primary = this.querySelector(".primary-group")

									leave.onclick = async () => {
										try {
											const response = await fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/users/${userData.id}`, {
												method: 'DELETE'
											});

											if (response.ok) {
												// Check if the group being left is the current primary
												if (currentPrimaryId === groupId) {
													await togglePrimaryStatus(false); 
												}
												window.location.reload();
											}
										} catch (error) {
											console.error("Error leaving group:", error);
										}
									};

									// 2. Make Primary Logic
									primary.onclick = async () => {
										const currentPrimaryId = await primaryPromise;
										//console.log(isAlreadyPrimary)
    
										// If it's already primary, we DELETE; otherwise, we POST
										await togglePrimaryStatus(!isAlreadyPrimary);
										window.location.reload();
									};

									// Helper to handle the Primary API toggle
									async function togglePrimaryStatus(isSetting) {
										try {
											const response = await fetch(`https://www.pekora.zip/apisite/groups/v1/user/groups/primary`, {
												method: isSetting ? 'POST' : 'DELETE',
												headers: { 'Content-Type': 'application/json' },
												body: isSetting ? JSON.stringify({ groupId: groupId }) : null
											});
											return response.ok;
										} catch (error) {
											console.error("Primary status toggle failed:", error);
										}
									}

									if (newPopover) {
										// Force a "reflow" so the browser recognizes the element exists before changing opacity
										void newPopover.offsetWidth; 
										newPopover.style.opacity = "1";
									}
								}
							});

							// Close the menu if the user clicks anywhere else on the page
							document.addEventListener('click', function() {
								const popover = groupMenu.querySelector('.popover');
						if (popover) popover.remove();
							});

						const dropdownBtn = document.querySelector(".input-dropdown-btn")
						const dropdownMenu = document.querySelector(".dropdown-menu")
						if (dropdownBtn && roles[1]) {
							const selectedRoleName = newEl.querySelector(".selectedRoleName")
							selectedRoleName.textContent = roles[1].name
							}

						 if (dropdownBtn && dropdownMenu) {
							populateRolesDropdown(roles, dropdownMenu)
						}
						if (dropdownBtn && dropdownMenu) {
						  // hide initially
						  dropdownMenu.style.display = "none"

						  dropdownBtn.addEventListener("click", (e) => {
							e.stopPropagation() // prevent body click closing immediately
							if (dropdownMenu.style.display === "none") {
							  dropdownMenu.style.display = "block"
							} else {
							  dropdownMenu.style.display = "none"
							}
						  })

						  // click anywhere else closes it
						  document.addEventListener("click", () => {
							dropdownMenu.style.display = "none"
						  })
						}

						let wallCursor = 0
						let wallLoading = false
						const mainWall = document.querySelector(".main-group")
						const wallParent = document.querySelector(".group-wall") // your wall container

						const commentpostContainer = wallParent.querySelector('.create-comment-container');
						const commentpostButton = commentpostContainer?.querySelector('.post-comment-button');
						const commentpostInput = commentpostContainer?.querySelector('.comment-input');

						// 2. Add the click event
						commentpostButton?.addEventListener('click', (e) => {
							e.preventDefault();

							const message = commentpostInput.value.trim();
							if (!message) return; // Don't send empty posts

							// 3. Disable the button to prevent multiple firings
							commentpostButton.disabled = true;
							commentpostButton.style.opacity = "0.5";

							// 4. Send the request
							fetch(`https://www.pekora.zip/apisite/groups/v1/groups/${groupId}/wall/posts`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									body: message,
								})
							})
							.then(res => {
								if (res.ok) {
									// 5. Reload on success
									window.location.reload();
								} else {
									alert("Failed to post comment.");
									// Re-enable if it fails so the user can try again
								}
							})
							.catch(err => {
								console.error(err);
							});
						});

						const wallEmpty = document.querySelector(".empty-wall")
						const wloading = document.querySelector(".gw-loading")
						const groupRank = document.querySelector(".group-rank")
						const grName = document.querySelector(".group-rank-name")
						let storeCursor = 0
						groupRank.style.display = "none"
						wallEmpty.style.display = "none";


						(async () => {
							if (mockGroupGames && mockGroupGames.data) {
								let loadedGames = false;
								const gcd = document.querySelector(".hlist-game-cards");
								const groupLink = `https://www.pekora.zip/My/Groups.aspx?gid=${groupId}`;

								// 1. Filter games that belong to this group first
								const validGames = mockGroupGames.data.filter(game => 
									game.description.toLowerCase().includes(groupLink.toLowerCase())
								);

								if (validGames.length === 0) return;

								// 2. Prepare Universe IDs for batch API calls
								const universeIds = validGames.map(g => g.id).join('%2C');

								try {
									// 3. Fetch Votes and Thumbnails in parallel
									const [voteRes, thumbRes] = await Promise.all([
										fetch(`https://www.pekora.zip/apisite/games/v1/games/votes?universeIds=${universeIds}`).then(r => r.json()),
										fetch(`https://www.pekora.zip/apisite/thumbnails/v1/games/icons?size=420x420&format=png&universeIds=${universeIds}`).then(r => r.json())
									]);

									validGames.forEach(game => {
										// Find matching data from API responses
										const voteData = voteRes.data.find(v => v.id === game.id);
										const thumbData = thumbRes.data.find(t => t.targetId === game.id);

										// Calculate Vote Percentage
										let votePercentage = "N/A";
										if (voteData) {
											const total = voteData.upVotes + voteData.downVotes;
											votePercentage = total > 0 ? Math.floor((voteData.upVotes / total) * 100) + "%" : "--";
										}

										// Sanitize Name for Link: Keep only Latin letters and replace spaces with dashes
										const sanitizedName = game.name
											.replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-latin/non-space
											.trim()
											.replace(/\s+/g, '-')        // Replace spaces with dashes

										const thumbUrl = thumbData ? thumbData.imageUrl : "";

										if (!loadedGames) {
											document.querySelector(".group-games-main").style.display = "block";
											loadedGames = true;
										}

									const gameCard = `
										<li class="list-item ng-scope" ng-repeat="game in games" style="
											list-style: none;
											margin: 0;
											padding: 0;
											white-space: nowrap;
											display: block;
											width: 16.49484536%;
										"><group-games-item class="game-card game-tile ng-isolate-scope" game="game" style="
											width: 100%;
											padding: 0 10px 0 0;
											float: none;
											display: block;
											margin-bottom: 12px;
											vertical-align: top;
											white-space: normal;
											aspect-ratio: .67;
										"><div class="game-card-container" style="
											background-color: #fff;
											position: relative;
											border-radius: 3px;
											float: left;
											height: 100%;
											margin: 0 auto;
											padding: 0;
											top: 0;
											text-align: left;
											width: 100%;
										"><a ng-href="https://www.pekora.zip/games/${game.rootPlaceId}/${sanitizedName}" ng-click="$ctrl.goToGameDetails()" class="game-card-link" href="https://www.pekora.zip/games/${game.rootPlaceId}/${sanitizedName}" style="
											display: block;
											height: 100%;
										"><thumbnail-2d thumbnail-type="$ctrl.thumbnailTypes.gameIcon" thumbnail-target-id="$ctrl.game.id" size="$ctrl.thumbnailSizes.large" class="ng-isolate-scope" style="
											border-top-right-radius: 0;
											border-top-left-radius: 0;
											position: relative;
											height: 150px;
											width: 150px;
											max-width: 100%;
											max-height: 100%;
										"><span ng-class="$ctrl.getCssClasses()" thumbnail-type="gameIcon" thumbnail-target-id="595554786" size="large" class="" style="
											width: 100%;
											display: block;
										"> <!-- ngIf: $ctrl.thumbnailUrl --><img ng-if="$ctrl.thumbnailUrl" ng-src="${thumbUrl}" class="ng-scope" src="${thumbUrl}" style="
											width: 100%;
										"><!-- end ngIf: $ctrl.thumbnailUrl --> </span></thumbnail-2d><div class="game-card-name game-name-title ng-binding" title="${game.name}" ng-bind="$ctrl.game.name" style="
											line-height: 1.5em;
											max-height: 45px;
											word-break: break-word;
											font-weight: 500;
											width: 100%;
											padding: 0 6px;
											margin: 3px 0;
											overflow: clip;
											text-overflow: clip;
											font-size: 100%;
										">${game.name}</div><div class="game-card-info" style="
											line-height: 1.4em;
											position: absolute;
											bottom: 6px;
											width: 100%;
											margin: 0 6px;
										"><span class="info-label icon-votes-gray" style="
											background-image: url(https://www.pekora.zip/img/games.svg);
											background-repeat: no-repeat;
											display: inline-block;
											vertical-align: middle;
											background-size: 32px auto;
											width: 16px;
											height: 16px;
											background-position: 0 -480px;
										"></span> <!-- ngIf: $ctrl.game.votes.votePercentage --><span class="info-label vote-percentage-label ng-binding ng-scope" ng-if="$ctrl.game.votes.votePercentage" ng-bind="$ctrl.game.votes.votePercentage" style="
											padding: 0 12px 0 0;
											vertical-align: middle;
											display: inline-block;
											font-size: 14px;
											font-weight: 500;
											line-height: 18px;
										">${votePercentage}</span><!-- end ngIf: $ctrl.game.votes.votePercentage --> <!-- ngIf: !$ctrl.game.votes.votePercentage --> <span class="info-label icon-playing-counts-gray" style="
											background-image: url(https://www.pekora.zip/img/games.svg);
											background-position: 0 -496px;
											background-repeat: no-repeat;
											display: inline-block;
											vertical-align: middle;
											background-size: 32px auto;
											width: 16px;
											height: 16px;
										"></span> <span class="info-label playing-counts-label ng-binding" title="0" ng-bind="$ctrl.game.playing | abbreviate : { decimalPlaces: 1 }" style="
											padding: 0 12px 0 0;
											vertical-align: middle;
											display: inline-block;
											font-size: 14px;
											font-weight: 500;
											line-height: 18px;
										">0</span></div></a></div></group-games-item></li>
									`

										gcd.insertAdjacentHTML('beforeend', gameCard);
									});
								} catch (err) {
									console.error("Error loading extra game data:", err);
								}
							}
						})();

						let storeprevCursors = [];
						let storenextPageCursor = null;
						let storeisLoading = false;
						let storelastCount = 0;
						const loadStore = async (cursor = 0, pushPrev = true) => {
							// Prevent overlapping fetches
							if (storeisLoading) return;
							storeisLoading = true;

							const store = document.querySelector('.item-cards-stackable');
							const storeLoading = document.querySelector('.store-loading');
							const storeEmpty = document.querySelector('.store-empty');
							const spc = document.querySelector('.store-pager-container');
							const pagenumber = document.querySelector('.store-pager-container-text');
				
							// UI Setup
							storeLoading.style.display = "block";
							storeEmpty.style.display = "none";
    
							// Update Page Number Tracking
							if (pushPrev) storeprevCursors.push(cursor);
							pagenumber.textContent = ("Page " + storeprevCursors.length)

							try {
								// 1. Get initial list with cursor
								const searchRes = await fetch(`https://www.pekora.zip/apisite/catalog/v1/search/items?category=All&limit=30&sortType=Updated&creatorTargetId=${groupId}&creatorType=Group&cursor=${cursor}`);
								const searchData = await searchRes.json();
        
								// Update pagination data
								storenextPageCursor = searchData.nextPageCursor;
								const itemsList = searchData.data || [];
								lastCount = itemsList.length;

								if (lastCount === 0) {
									storeLoading.style.display = "none";
									storeEmpty.style.display = "block";
									store.innerHTML = ""; // Clear store
									storeisLoading = false;
									return;
								}

								// 2. Prepare payload for details
								const payload = { items: itemsList };

								// 3. Post to details endpoint
								const detailsRes = await fetch(`https://www.pekora.zip/apisite/catalog/v1/catalog/items/details`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(payload)
								});

								const data = await detailsRes.json();

								if (!detailsRes.ok) {
									throw new Error("Details fetch failed");
								}

								// Clear existing items for the new page
								store.innerHTML = "";
								storeLoading.style.display = "none";
								spc.style.display = "block";

								// 4. Render Items
								data.data.forEach(info => {
									let cwr = document.createElement('li');
									cwr.className = "list-item item-card ng-scope";
									cwr.style.cssText = "float: none; display: inline-block; padding: 5px; width: 16.66667%;";

									cwr.innerHTML = `
										<a href="https://pekora.zip/catalog/${info.id}/${info.name}" target="_self" class="item-card-container" style="display: block; text-decoration: none; color: inherit; background-color: #fff; position: relative; padding: 0 0 5px; width: 126px; max-width: 150px; height: 100%;">
											<div class="item-card-link">
												<div class="item-card-thumb-container" style="border-top-right-radius: 3px; border-top-left-radius: 3px; width: 126px; height: 126px; position: relative; border-bottom: 1px solid #e3e3e3;">
													<img class="item-card-thumb" src="https://www.pekora.zip/Thumbs/Asset.ashx?width=420&height=420&assetId=${info.id}" style="width:100%">
												</div>
											</div>
											<div class="item-card-caption" style="padding: 6px 6px 0;">
												<div class="item-card-name-link" style="width: 100%; display: block;">
													<div class="item-card-name" title="${info.name}" style="padding: 0;height: 45px; overflow: hidden; white-space: normal; font-weight: 500; font-size: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${info.name}</div>
												</div>
												<div class="item-card-price" style="width: 100%; height: 22px; font-size: 16px; margin-top: 20px; padding: 0;">
													<span class="icon icon-robux" style="background-position: 0 -64px; background-size: 32px auto; height: 16px; width: 16px; display: inline-block; vertical-align: middle;"></span>
													<span class="text-robux" style="color: #02b757; vertical-align: middle;">${info.price > 0 ? info.price : 'Free'}</span>
												</div>
											</div>
										</a>`;
									store.appendChild(cwr);
								});

								// 5. Setup/Update Pager Buttons
								updateStorePager();

							} catch (error) {
								console.error("Fetch failed:", error);
								storeLoading.style.display = "none";
								storeEmpty.style.display = "block";
							} finally {
								storeisLoading = false;
							}
						};

						const updateStorePager = () => {
							const hnext = document.querySelector('.store-pager-next'); // Ensure classes match your HTML
							const hprev = document.querySelector('.store-pager-prev');

							// Clean up old listeners
							const nextBtn = hnext.cloneNode(true);
							const prevBtn = hprev.cloneNode(true);
							hnext.parentNode.replaceChild(nextBtn, hnext);
							hprev.parentNode.replaceChild(prevBtn, hprev);

							// Prev Button Logic
							if (storeprevCursors.length <= 1) {
								prevBtn.classList.add('disabled');
							} else {
								prevBtn.classList.remove('disabled');
								prevBtn.addEventListener('click', (e) => {
									e.preventDefault();
									storeprevCursors.pop(); // Remove current page
									const prevCursor = storeprevCursors.pop(); // Get actual previous
									loadStore(prevCursor, true); 
								});
							}

							// Next Button Logic
							if (!storenextPageCursor) {
								nextBtn.classList.add('disabled');
							} else {
								nextBtn.classList.remove('disabled');
								nextBtn.addEventListener('click', (e) => {
									e.preventDefault();
									loadStore(storenextPageCursor);
								});
							}
						};

						function loadWallPosts(cursor = 0) {
							if (wallLoading) return
							wallLoading = true

							fetch(`https://www.pekora.zip/apisite/groups/v2/groups/${groupId}/wall/posts?sortOrder=Desc&limit=10&cursor=${cursor}`)
							.then(res => { if(!res.ok) {
								wallParent.style.display = "none"
								wallEmpty.style.display = "block"
								wloading.style.display = "none"
							throw new Error("wall fetch failed");
							} return res.json() })
							.then(data => {
								const posts = data.data || []
								wallCursor = data.nextPageCursor || 0
								if (!posts.length) return
								if (posts.length <= 9) {
									wloading.style.display = "none"
									if (posts.length == 0) {
										wallParent.style.display = "none"
										wallEmpty.style.display = "block"
									}
								}
					

								// get all userIds for thumbnails
								const userIds = posts.map(p => p.poster.user.userId).join("%2C")

								return fetch(`https://www.pekora.zip/apisite/thumbnails/v1/users/avatar-headshot?userIds=${userIds}&size=420x420&format=png`)
								.then(res => res.json())
								.then(thumbData => {
									const thumbMap = {}
									const thumbArray = Array.isArray(thumbData.data) ? thumbData.data : []
									thumbArray.forEach(t => {
										if (t.state === "Completed") thumbMap[t.targetId] = t.imageUrl
									})

									posts.forEach(post => {
										const userId = post.poster.user.userId
										const userName = post.poster.user.username
										const commentText = post.body
										const commentDate = new Date(post.created).toLocaleString()
										const userThumb = thumbMap[userId] || ""

										const div = document.createElement("div")
										div.className = "avatar-container comment ng-scope"
										div.style.height = "max-content"

										div.innerHTML = `
											<a href="https://www.pekora.zip/users/${userId}/profile">
												<span style="position:absolute;width:48px;height:48px;display:block;border-radius:50%;overflow:hidden;">
													<img src="${userThumb}" style="width:100%;height:100%;border-radius:50%;">
												</span>
											</a>
											<div class="wall-comment" style="width:100%;margin:0 12px;padding-left:50px;padding-right:12px;">
												<div class="group-menu" style="position: relative;top: 0;right: 6px;float: right;">
													<a tabindex="0" class="rbx-menu-item">
														<span class="icon-more"></span>
													</a>
												</div>
												<div class="wall-comment-name" style="display:block;width:100%;">
													<a href="https://www.pekora.zip/users/${userId}/profile" class="text-name name" style="display:block;;width:max-content;font-size:16px;font-weight:500;color:var(--primary-color);">
														${userName}
													</a>
												</div>
												<div class="wall-comment-body" style="width:max-content; text-align:left; max-width:95%">${commentText}</div>
												<div class="wall-comment-info" style="margin-top:12px;width:100%;">
													<div class="text-date-hint comment-date" style="width:max-content;font-size:12px;font-weight:400;color:#b8b8b8;line-height:1.4em;">${commentDate}</div>
												</div>
											</div>
										`
										wallParent.appendChild(div)
									})

									wallLoading = false
								})
							})
							.catch(err => {
								console.error(err)
								wallLoading = false
							})
						}

						// infinite scroll
						window.addEventListener("scroll", () => {
							if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
								if(wallCursor) loadWallPosts(wallCursor)
							}
						})

						// initial load
						loadWallPosts(wallCursor)

						loadStore()
						loadPlayers(pagerPos)
						updatePagerButtons()
						attachPager()
						// switch pages
						const at = document.querySelector('.about-tab')
							const about = document.querySelector('.main-group-about')
						const st = document.querySelector('.store-tab')
							const store = document.querySelector('.main-group-store')
						const af = document.querySelector('.affiliates-tab')
							const affil = document.querySelector('.main-group-affiliates')
						at.addEventListener('click', e => {
							about.style.display = "block"
							at.style.boxShadow = "inset 0 -4px 0 0 var(--primary-color)"
							store.style.display = "none"
							st.style.boxShadow = "inset 0 -4px 0 0 #fff"
							affil.style.display = "none"
							af.style.boxShadow = "inset 0 -4px 0 0 #fff"
						})

						st.addEventListener('click', e => {
							about.style.display = "none"
							st.style.boxShadow = "inset 0 -4px 0 0 var(--primary-color)"
							store.style.display = "block"
							at.style.boxShadow = "inset 0 -4px 0 0 #fff"
							affil.style.display = "none"
							af.style.boxShadow = "inset 0 -4px 0 0 #fff"
						})
						af.addEventListener('click', e => {
							affil.style.display = "block"
							af.style.boxShadow = "inset 0 -4px 0 0 var(--primary-color)"
							store.style.display = "none"
							at.style.boxShadow = "inset 0 -4px 0 0 #fff"
							about.style.display = "none"
							st.style.boxShadow = "inset 0 -4px 0 0 #fff"
						})
					} catch (err) {
						console.error(err)
						isReplacing = false
				} finally {
					isReplacing = false
				}
		}

		const startObserver = () => {
			if (!document.body) return false
			replaceGroups()
			window.addEventListener('popstate', replaceGroups);
			const observer = new MutationObserver(() => replaceGroups())
			observer.observe(document.body, { childList:true, subtree:true })
			return true
		}

		if (!startObserver()) {
			const bodyObserver = new MutationObserver(()=>{ if(startObserver()) bodyObserver.disconnect() })
			bodyObserver.observe(document.documentElement, { childList:true })
		}
	}
	if(settings.general.hoverPreview) {
		OptionalLoader.loadPreviewer().then(() => {
			HoverPreview.register(".item-card", ".item-card-thumb-container")
		})
	}
}
}

/* old groups, use for reference 
"use strict"

{
	function enableRedesign() {
		document.$watch("body", body => {
			body.classList.toggle("btr-redesign", settings.groups.modifyLayout)
			body.classList.toggle("btr-hidePayout", settings.groups.hidePayout)
			body.classList.toggle("btr-hideBigSocial", settings.groups.hideBigSocial)
		})

		if(settings.groups.modifySmallSocialLinksTitle) {
			modifyTemplate(["social-link-icon-list", "social-link-icon"], (listTemplate, iconTemplate) => {
				iconTemplate.$find("a").title = `{{ $ctrl.title || $ctrl.type }}`
				listTemplate.$find("social-link-icon").title = "socialLink.title"
			})
		}

		if(settings.groups.modifyLayout) {
			modifyTemplate(["group-base", "group-games", "group-about"], (baseTemplate, gamesTemplate, aboutTemplate) => {
				const list = baseTemplate.$find("#horizontal-tabs")

				list.setAttribute("ng-class", `{'btr-four-wide': library.currentGroup.areGroupGamesVisible}`)
				
				const about = list.$find("#about")
				about.setAttribute("ng-click", "Data.btrGamesTabSelected=false")
				about.setAttribute("ng-class", about.getAttribute("ng-class").replace(/Data.activeTab === /, "!Data.btrGamesTabSelected && Data.activeTab === "))

				const games = html`<li class="rbx-tab group-tab" ng-if="library.currentGroup.areGroupGamesVisible" ng-click="Data.btrGamesTabSelected=true" ui-sref=about><a class=rbx-tab-heading><span class=text-lead>Games</span></a>`
				games.setAttribute("ng-class", about.getAttribute("ng-class").replace(/!(?=Data.btrGamesTabSelected)/, ""))
				about.after(games)

				gamesTemplate.$find(">*").setAttribute("ng-class", "{'ng-hide': library.currentGroup.areGroupGamesVisible && !Data.btrGamesTabSelected}")
				aboutTemplate.$find("group-members-list").setAttribute("ng-class", "{'ng-hide': library.currentGroup.areGroupGamesVisible && Data.btrGamesTabSelected}")
				
				const groupHeader = baseTemplate.$find(".group-header")
				const groupAbout = groupHeader.parentNode
				groupAbout.parentNode.classList.add("btr-group-container")
				groupAbout.classList.add("btr-group-about")

				const socialLinks = aboutTemplate.$find("social-links-container")
				groupAbout.after(socialLinks)
				
				const shout = aboutTemplate.$find(".shout-container").parentNode
				shout.classList.add("btr-shout-container")
				groupAbout.after(shout)

				const descContent = aboutTemplate.$find(".group-description").parentNode
				const origDesc = descContent.parentNode

				groupHeader.after(
					origDesc.$find("social-link-icon-list"), // Small social links
					html`<div class="text-label btr-description-label">Description</div>`,
					...descContent.childNodes
				)

				origDesc.remove()
			})

			modifyTemplate("group-members-list", template => {
				template.$find(".dropdown-menu li a").title = `{{ role.name }}`
				template.$find(".dropdown-menu li a .role-member-count").title = `{{ role.memberCount | number }}`
			})
		}

		if(settings.groups.selectedRoleCount) {
			modifyTemplate("group-members-list", template => {
				const label = template.$find(".group-dropdown > button .rbx-selection-label")
				label.after(html`<span class=btr-role-member-count title="{{ $ctrl.data.currentRoleMemberCount | number }}" ng-if="$ctrl.data.currentRoleMemberCount>0">({{ $ctrl.data.currentRoleMemberCount | abbreviate }})</span>`)
			})
		}

		if(settings.groups.pagedGroupWall) {
			modifyTemplate("group-wall", template => {
				template.firstElementChild.setAttribute("infinite-scroll-disabled", "true")

				template.$find(".group-wall").parentNode.append(html`
				<div class="btr-pager-holder btr-comment-pager">
					<ul class=pager>
						<li class=first ng-class="{disabled:!btrPagerStatus.prev}"><a ng-click=btrPagerStatus.prev&&btrLoadWallPosts("first")><span class=icon-first-page></span></a></li>
						<li class=pager-prev ng-class="{disabled:!btrPagerStatus.prev}"><a ng-click=btrPagerStatus.prev&&btrLoadWallPosts("prev")><span class=icon-left></span></a></li>
						<li class=pager-mid>
							Page <form ng-submit=btrPagerStatus.input&&btrLoadWallPosts("input") style=display:contents><input class=pager-cur ng-disabled="!btrPagerStatus.input" ng-value="btrPagerStatus.pageNum" type=text value=-1></form>
						</li>
						<li class=pager-next ng-class="{disabled:!btrPagerStatus.next}"><a ng-click=btrPagerStatus.next&&btrLoadWallPosts("next")><span class=icon-right></span></a></li>
						<li class=last ng-class="{disabled:!btrPagerStatus.next}"><a ng-click=btrPagerStatus.next&&btrLoadWallPosts("last")><span class=icon-last-page></span></a></li>
					</ul>
				</div>`)
			})
		}

		if(settings.groups.groupWallRanks) {
			modifyTemplate("group-comments", template => {
				template.$find(".list-body > .text-name").after(html`<span class="btr-grouprank text-label">({{post.poster.role.name}})</span>`)
			})
		}
	}

	pageInit.groups = function() {
		if(settings.general.hoverPreview) {
			OptionalLoader.loadPreviewer().then(() => {
				HoverPreview.register(".item-card", ".item-card-thumb-container")
			})
		}

		if(settings.groups.redesign) {
			enableRedesign()
		}
	}
}
*/