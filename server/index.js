const {WebSocketServer} = require("ws");
const {proxyChrome, waitComplete} = require("./helper");

process.on("unhandledRejection", (err) => {
	console.error(err);
});

let wss = new WebSocketServer({port: 3333});
wss.on("connection", function connection(ws) {
	console.log("connection");
	global.chrome = proxyChrome(ws, () => {
		console.log("disconnected");
	});

	start();
});

async function start() {
	let tabs = await chrome.tabs.query({
		url: "https://www.v2ex.com/",
	});
	let tab = tabs[0];
	console.log(tab);
	if (!tab) {
		tab = await chrome.tabs.create({
			url: "https://www.v2ex.com/",
			index: 0,
			active: false,
		});
	}
	if (tab.status == "unloaded") await chrome.tabs.reload(tab.id);
	if (tab.status != "complete") await waitComplete(chrome, tab);
	let name = await chrome.scripting
		.executeScript({
			target: {tabId: tab.id},
			func: function () {
				return document.querySelector(".bigger").innerText;
			},
		})
		.then((x) => x[0].result);
	console.log("your v2ex username is:", name);
}
