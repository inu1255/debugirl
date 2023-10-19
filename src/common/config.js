const config = {
	/** 是否自动连接 */
	auto_connect: true,
	/** websocket地址 */
	ws: "ws://localhost:3333",
};

chrome.storage.local.get(config, function (data) {
	Object.assign(config, data);
});

export default config;
