let notify_map = new Map();
chrome.notifications.onClicked.addListener(function (id) {
	let url = notify_map.get(id);
	if (url) {
		chrome.tabs.create({url});
		chrome.notifications.clear(id);
		notify_map.delete(id);
	}
});
chrome.girl = {
	notify({title, message, iconUrl, url}) {
		if (!iconUrl) iconUrl = chrome.runtime.getURL("icons/128x128.png");
		chrome.notifications.create(
			{
				type: "basic",
				iconUrl,
				title,
				message,
			},
			function (id) {
				if (url) notify_map.set(id, url);
			}
		);
	},
};
