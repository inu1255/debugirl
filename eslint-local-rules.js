const fs = require("fs-extra");
const path = require("path");

module.exports = {};

if (require.main === module) {
	const {ESLint} = require("eslint");
	const engine = new ESLint({
		fix: false,
		overrideConfig: {},
	});

	async function main() {
		const results = await engine.lintFiles(process.argv[2] || `src\\pages\\index.vue`);
		console.log(results[0].output);
		const formatter = await engine.loadFormatter("stylish");
		const resultText = formatter.format(results);
		console.log(resultText);
	}

	main();
}
