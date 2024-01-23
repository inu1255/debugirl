const config = {
	list: [{id: 1, url: "ws://localhost:3333", enabled: true}],
};

/** @type {Promise<typeof config>} */
export const ready = new Promise((resolve, reject) => {
	chrome.storage.local.get(function (data) {
		if (data && data.ws) {
			config.list = [
				{
					id: 1,
					url: data.ws,
					enabled: !!data.auto_connect,
				},
			];
			delete data.ws;
			delete data.auto_connect;
			chrome.storage.local.set({ws: null, auto_connect: null, list: config.list});
		} else {
			Object.assign(config, data);
		}
		resolve(config);
	});
});

export default config;
