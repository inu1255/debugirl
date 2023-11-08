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
	const url = "https://pub.alimama.com/portal/v2/tool/links/page/home/index.htm";
	let tab = await chrome.tabs.create({
		url,
		index: 0,
		active: false,
	});
	if (tab.status != "complete") await waitComplete(chrome, tab);
	tab = await chrome.tabs.get(tab.id);
	if (!tab.url.startsWith(url)) {
		chrome.girl.notify({
			title: "请先登录",
			message: "阿里妈妈掉线了，点击登录",
			url,
		});
		chrome.tabs.remove(tab.id);
		return;
	}
	let cookies = await chrome.cookies.getAll({url});
	let cookie = cookies
		.map((x) => `${encodeURIComponent(x.name)}=${encodeURIComponent(x.value)}`)
		.join("; ");
	console.log(cookie);
	chrome.tabs.remove(tab.id);
}
