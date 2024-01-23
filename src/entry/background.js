import {ready} from "@/common/config";
import "@/common/extends";
import {newClient} from "@/common/ws_client";

let clients = {};

ready.then((config) => {
	function refresh() {
		console.log(config.list);
		let map = {};
		config.list
			.filter((x) => x.enabled)
			.forEach((x) => {
				let old = clients[x.id];
				if (old && old.url == x.url) {
					map[x.id] = old;
					delete clients[x.id];
				} else {
					map[x.id] = newClient(x.id, x.url);
				}
			});
		for (let k in clients) {
			let v = clients[k];
			v.stop();
		}
		clients = map;
		chrome.clients = map;
	}
	refresh();

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type == "refresh") {
			config.list = message.list;
			chrome.storage.local.set(config);
			refresh();
		} else if (message.type == "status") {
			let map = {};
			for (let k in clients) {
				let v = clients[k];
				let ws = v.getWS();
				map[k] = {status: ws && ws.readyState == 1 ? "connected" : "connecting"};
			}
			sendResponse(map);
		}
	});
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
	console.log("extra", message);
	if (message && message.rid && message.wid) {
		let item = clients[message.wid];
		if (item) item.send(message);
	}
});
