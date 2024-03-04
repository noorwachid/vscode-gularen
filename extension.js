const vscode = require('vscode');
const preview = require('./scripts/preview');
const run = require('./scripts/run');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	preview.register(context);
	run.register(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
