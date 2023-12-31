import Vue from "vue";
import App from "../view/popup.vue";
import config from "../common/config";
import "@/styles/common.less";

Vue.config.productionTip = false;

chrome.storage.local.get(config, (items) => {
	for (let k in items) {
		config[k] = items[k];
	}
	var data = {};
	for (let k in config) {
		Object.defineProperty(data, k, {
			enumerable: true,
			configurable: true,
			get() {
				return config[k];
			},
			set(value) {
				if (config[k] === value) return;
				config[k] = value;
				chrome.storage.local.set({
					[k]: value,
				});
			},
		});
	}

	/* eslint-disable no-new */
	let vue = new Vue({
		data: data,
		render: (h) => h(App),
	}).$mount("#app");

	chrome.storage.onChanged.addListener((changes) => {
		for (let key in changes) {
			vue[key] = changes[key].newValue;
		}
	});
});
