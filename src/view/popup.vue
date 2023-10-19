<template>
	<div class="main_app">
		<div class="line">
			<b>server:&nbsp;</b><input type="text" :value="body.ws" placeholder="websocket server" />
		</div>
		<div class="line">
			<div class="tips" :class="status">{{ status }}</div>
			<button @click="disconnect">disconnect</button>
			<button @click="connect">connect</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "PopupView",
	data() {
		return {
			status: "loading",
		};
	},
	computed: {
		body() {
			return this.$root;
		},
	},
	mounted() {
		this.refresh();
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.status) {
				this.status = request.status;
			}
		});
	},
	methods: {
		connect() {
			chrome.runtime.sendMessage({type: "connect", ws: this.body.ws});
		},
		disconnect() {
			chrome.runtime.sendMessage({type: "disconnect"});
		},
		refresh() {
			chrome.runtime.sendMessage({type: "status"}, (response) => {
				this.status = response.status;
			});
		},
	},
};
</script>

<style lang="less">
.main_app {
	padding: 16px;
	min-width: 280px;
	> .line {
		display: flex;
		align-items: center;
		min-height: 40px;
		> input {
			flex: 1;
		}
		> .tips {
			color: #ccc;
			flex: 1;
			&.connected {
				color: #0f0;
			}
			&.disconnected {
				color: #f00;
			}
		}
		> button {
			margin-left: 10px;
		}
	}
}
</style>
