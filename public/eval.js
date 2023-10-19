(function () {
	var cur = document.currentScript;
	var s = cur.previousElementSibling;
	var code = s.textContent;
	var rid = +cur.id;
	var id = cur.getAttribute("eid");
	try {
		var pms = eval(code);
		if (pms && typeof pms.then === "function") {
			pms
				.then(function (data) {
					send({rid: rid, data: data});
				})
				.catch(function (err) {
					send({rid: rid, err: err});
				});
		} else {
			send({rid: rid, data: pms});
		}
	} catch (err) {
		send({rid: rid, err: err});
	}
	s.remove();
	cur.remove();
	function send(data) {
		if (data.err && Object.keys(data.err).length < 1) data.err = formatError(data.err);
		chrome.runtime.sendMessage(id, data);
	}
	function formatError(obj) {
		if (obj && typeof obj === "object") {
			if (typeof obj.msg === "string") return obj.msg;
			if (typeof obj.message === "string") return obj.message;
			if (typeof obj.error === "string") return obj.error;
			for (var k in obj) {
				var v = obj[k];
				if (typeof v === "string") return v;
			}
			for (var k in obj) {
				var v = obj[k];
				if (v && typeof v === "object") return formatError(v);
			}
		}
		return obj + "";
	}
})();
