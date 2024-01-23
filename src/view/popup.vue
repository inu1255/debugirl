<template>
	<div class="main_app">
		<div class="box">
			<table>
				<thead>
					<tr>
						<th>id</th>
						<th>地址</th>
						<th width="92">状态</th>
						<th width="120">操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in list" :key="item.id">
						<td>{{ item.id }}</td>
						<td><input v-model="item.url" type="text" placeholder="请输入websocket地址" /></td>
						<td>{{ item.status }}</td>
						<td>
							<button @click="connect(item)">连接</button>
							<button @click="disconnect(item)">断开</button>
							<button @click="remove(item)">删除</button>
						</td>
					</tr>
					<tr>
						<td>{{ maxId }}</td>
						<td><input v-model="body.url" type="text" placeholder="请输入websocket地址" /></td>
						<td></td>
						<td>
							<button @click="connect(body)">连接</button>
							<button @click="disconnect(body)">断开</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="line tar">
			<div class="flex-1"></div>
			<button @click="connectAll">全部连接</button>
			<button @click="disconnectAll">全部断开</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "PopupView",
	data() {
		return {
			status: "loading",
			list: this.$root.list,
			body: {
				url: "",
			},
		};
	},
	computed: {
		maxId() {
			return this.list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
		},
	},
	mounted() {
		setInterval(() => {
			chrome.runtime.sendMessage({type: "status"}, (data) => {
				this.list.forEach((x) => {
					let item = data[x.id];
					if (item) {
						this.$set(x, "status", item.status);
					} else {
						this.$set(x, "status", "disconnected");
					}
				});
			});
		}, 1e3);
	},
	methods: {
		connect(item) {
			item.enabled = true;
			if (!item.id) {
				this.list.push({...item, id: this.maxId});
				this.body.url = "";
			}
			this.refresh();
		},
		disconnect(item) {
			item.enabled = false;
			if (!item.id) {
				this.list.push({...item, id: this.maxId});
				this.body.url = "";
			}
			this.refresh();
		},
		remove(item) {
			this.list = this.list.filter((i) => i.id !== item.id);
			this.refresh();
		},
		connectAll() {
			this.list.forEach((item) => {
				item.enabled = true;
			});
			this.refresh();
		},
		disconnectAll() {
			this.list.forEach((item) => {
				item.enabled = false;
			});
			this.refresh();
		},
		refresh() {
			chrome.runtime.sendMessage({
				type: "refresh",
				list: this.list.map(({id, url, enabled}) => ({id, url, enabled})),
			});
		},
	},
};
</script>

<style lang="less">
.main_app {
	padding: 16px;
	min-width: 520px;
	.flex-1 {
		flex: 1;
	}
	button {
		cursor: pointer;
	}
	button + button {
		margin-left: 10px;
	}
	> .box {
		max-height: 400px;
		overflow-y: auto;
		th {
			position: sticky;
			top: 0;
			background-color: #fff;
			border-bottom: 1px solid #666;
		}
		th,
		td {
			padding: 10px;
			white-space: nowrap;
		}
		input {
			flex: 1;
			border: none;
			border-bottom: 1px solid #666;
			min-width: 240px;
			width: 100%;
			&:focus {
				outline: none;
			}
		}
		table {
			width: 100%;
			button {
				border: none;
				background: transparent;
				padding: 0;
				color: #0b57d0;
				&:hover {
					color: #a8c7fa;
				}
			}
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
	}
	> .line {
		display: flex;
		align-items: center;
		min-height: 40px;
	}
}
</style>
