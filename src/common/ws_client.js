import {formatError} from "./utils";

export function newClient(id, url) {
	console.log("new", id, url);
	const callback_map = new Map();
	/** @type {WebSocket} */
	let ws = null;
	let stoped = false;

	function connectWS(url) {
		if (ws && ws.readyState < 2) {
			if (ws.url == url) return;
			ws.close();
		}
		ws = new WebSocket(url);
		ws.onopen = () => {
			// 通知popup
			chrome.runtime.sendMessage({id, status: "connected"});
		};
		ws.onmessage = (e) => {
			if (e.data == "ping") return ws.send("pong");
			if (e.data == "pong") return;
			console.log(e.data);
			let data = JSON.parse(e.data);
			call(data);
		};
		ws.onerror = (e) => {
			console.error(e);
		};
		ws.onclose = (e) => {
			setTimeout(() => {
				if (!stoped) connectWS(url);
			}, 1e3);
			if (stoped) {
				// 通知popup
				chrome.runtime.sendMessage({id, status: "disconnected"});
			}
		};
		return ws;
	}

	var timer = setInterval(() => {
		if (ws && ws.readyState == 1) ws.send("ping");
	}, 5e3);

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
		if (data && data.err && Object.keys(data.err).length < 1) data.err = formatError(data.err);
		if (typeof data != "string") data = JSON.stringify(data);
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
		if (typeof obj[method] === "function") return obj[method](...args);
		throw `method ${path} not found`;
	}

	function call({path, args, rid}) {
		if (path == "chrome.scripting.executeScript") {
			let item = args[0];
			if (item.target) {
				if (!item.func && item.code) {
					item.func = function (code, extensionId, rid, wid) {
						let e = document.createElement("script");
						e.textContent = code;
						e.type = "text/eval";
						document.documentElement.appendChild(e);
						let script = document.createElement("script");
						script.id = rid;
						script.setAttribute("eid", extensionId);
						script.setAttribute("wid", wid);
						script.src = chrome.runtime.getURL("eval.js");
						document.documentElement.appendChild(script);
					};
					item.args = [item.code, chrome.runtime.id, rid, id];
					delete item.code;
				}
			}
			return chrome.scripting.executeScript(item).catch((err) => {
				send({rid, err});
			});
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

	connectWS(url);
	return {
		id,
		url,
		send,
		getWS: () => ws,
		stop: () => {
			console.log("stop", id, url);
			stoped = true;
			if (ws) ws.close();
			clearInterval(timer);
		},
	};
}
