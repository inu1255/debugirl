import config from "@/common/config";
import {formatError} from "@/common/utils";

const callback_map = new Map();
/** @type {WebSocket} */
let ws = null;

function connectWS(url) {
	if (ws && ws.readyState < 2) {
		if (ws.url == url) return;
		ws.close();
	}
	ws = new WebSocket(url);
	ws.onopen = () => {
		// 通知popup
		chrome.runtime.sendMessage({status: "connected"});
	};
	ws.onmessage = (e) => {
		if (e.data == "ping") return ws.send("pong");
		console.log(e.data);
		let data = JSON.parse(e.data);
		call(data);
	};
	ws.onerror = (e) => {
		console.error(e);
	};
	ws.onclose = (e) => {
		setTimeout(() => {
			if (config.auto_connect) connectWS(url);
		}, 1e3);
		if (!config.auto_connect) {
			// 通知popup
			chrome.runtime.sendMessage({status: "disconnected"});
		}
	};
	return ws;
}

function once(type, fn) {
	function cb() {
		ws.removeEventListener(type, cb);
		fn.apply(this, arguments);
	}
	ws.addEventListener(type, cb);
}

function send(data) {
	if (!ws) return;
	console.log("send", data);
	if (typeof data != "string") data = JSON.stringify(data);
	else if (data && data.err && Object.keys(data.err).length < 1) data.err = formatError(data.err);
	if (ws.readyState != WebSocket.OPEN) {
		once("open", () => ws.send(data));
	} else {
		ws.send(data);
	}
}

function call0({path, args, rid}) {
	path = path.split(".");
	let method = path.pop();
	let obj = self;
	for (let i = 0; i < path.length; i++) {
		obj = obj[path[i]];
	}
	args = args.map((x) => {
		let m = /^callback_id:(\d+)$/.exec(x);
		if (m) {
			let cid = +m[1];
			let cb = callback_map.get(cid);
			if (!cb) {
				cb = function () {
					let args = Array.from(arguments);
					send({rid: cid, args});
				};
				callback_map.set(cid, cb);
			}
			return cb;
		}
		return x;
	});
	return obj[method](...args);
}

function call({path, args, rid}) {
	if (path == "chrome.scripting.executeScript") {
		let item = args[0];
		if (item.target) {
			if (!item.func && item.code) {
				item.func = function (code, extensionId, rid) {
					let e = document.createElement("script");
					e.textContent = code;
					e.type = "text/eval";
					document.documentElement.appendChild(e);
					let script = document.createElement("script");
					script.id = rid;
					script.setAttribute("eid", extensionId);
					script.src = chrome.runtime.getURL("eval.js");
					document.documentElement.appendChild(script);
				};
				item.args = [item.code, chrome.runtime.id, rid];
				delete item.code;
			}
		}
		return chrome.scripting.executeScript(item);
	}
	try {
		console.log(args);
		let result = call0({path, args, rid});
		if (result instanceof Promise) {
			result
				.then((data) => {
					send({rid, data: data});
				})
				.catch((err) => {
					send({rid, err});
				});
		} else {
			send({rid, data: result});
		}
	} catch (err) {
		send({rid, err});
	}
}

if (config.auto_connect) connectWS(config.ws);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type == "connect") {
		config.auto_connect = true;
		config.ws = message.ws;
		chrome.storage.local.set(config);
		connectWS(message.ws);
	} else if (message.type == "disconnect") {
		config.auto_connect = false;
		chrome.storage.local.set(config);
		ws.close();
	} else if (message.type == "status") {
		sendResponse({status: ws && ws.readyState < 2 ? "connected" : "disconnected"});
	}
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
	if (message && message.rid) send(message);
});
