# 调姬

滑姬是一个浏览器插件, 可以通过 websocket 连接到服务器, 在服务器上可以通过浏览器插件的 api 控制浏览器

## 浏览器插件 API 文档

https://developer.chrome.com/docs/extensions/reference/

## 快速体验

[server/index.js](./server/index.js) 是一个简单的服务器, 可以用来获取你的 v2ex 用户名称

1. 在 Release 页面下载最新的 release 版本, 解压后加载扩展程序
2. 运行以下命令

```bash
git clone https://github.com/inu1255/debugirl.git
cd debugirl
npm install
node server
```

如果运行成功你可以得到以下输出
![demo](./static/demo.png)
