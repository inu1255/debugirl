const manifest = {
	name: "调姬",
	description: "不止是调试,你的远程调用贤内助. no only debug, your remote call helper.",
	author: "inu1255",
	homepage_url: "https://github.com/inu1255/debugirl",
	manifest_version: 3,
	icons: {
		16: "icons/16x16.png",
		48: "icons/48x48.png",
		96: "icons/96x96.png",
		128: "icons/128x128.png",
	},
	permissions: [
		"debugger",
		"tabs",
		"cookies",
		"background",
		"activeTab",
		"webNavigation",
		// "contextMenus",
		// 'unlimitedStorage',
		"storage",
		"notifications",
		"scripting",
		// 'identity',
		// 'identity.email',
		"offscreen",
		"webRequest",
	],
	host_permissions: ["*://*/*"],
	optional_host_permissions: ["*://*/*"],
	action: {
		default_title: "调姬",
		default_icon: "icons/48x48.png",
		default_popup: "popup.html",
	},
	background: {
		service_worker: "js/background.js",
		type: "module",
	},
	// devtools_page: 'devtools.html',
	// options_page: 'options.html',
	content_scripts: [
		{
			js: ["js/content.js"],
			run_at: "document_end",
			matches: ["<all_urls>"],
			all_frames: true,
		},
	],
	// content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
	web_accessible_resources: [
		{
			matches: ["*://*/*"],
			resources: ["icons/*", "eval.js"],
		},
	],
	externally_connectable: {
		matches: ["*://*/*"],
	},
};

if (manifest.manifest_version == 2) {
	delete manifest.host_permissions;
	let permissions_v3 = new Set(["offscreen"]);
	manifest.permissions = manifest.permissions.filter((x) => !permissions_v3.has(x));
}

module.exports = manifest;
