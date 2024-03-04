const vscode = require('vscode');

function register(context) {
    const disposable = vscode.commands.registerCommand('gularen.preview', function () {
		preview(context);
	});

    context.subscriptions.push(disposable);
}

function preview(context) {
    const panel = vscode.window.createWebviewPanel(
        // Webview id
        'GularenPreview',
        // Webview title
        'Preview',
        // This will open the second column for preview inside editor
        2,
        {
            // Enable scripts in the webview
            enableScripts: true,
            retainContextWhenHidden: true,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')]
        }
    );

	let sourceCode = '';

	if (vscode.window.activeTextEditor) {
		sourceCode = vscode.window.activeTextEditor.document.getText();
	}

	const toWebPath = (path) => {
		const diskPath = vscode.Uri.joinPath(context.extensionUri, 'assets', path);
		return panel.webview.asWebviewUri(diskPath);
	};

    panel.webview.html = `
		<link rel="stylesheet" href="${toWebPath('style.css')}">
		<link rel="stylesheet" href="${toWebPath('library/code/style.css')}">
		<link rel="stylesheet" href="${toWebPath('library/math/style.css')}">

		<div id="htmlRoot"></div>

		<script src="${toWebPath('library/markup/gularen.js')}"></script>
		<script>
			window.gularen = {}
			window.gularen.transpiled = false;

			function transpile() {
				htmlRoot.innerHTML = Module.transpile(${JSON.stringify(sourceCode)});
				dispatchEvent(new Event('gularentranspile', {
					bubbles: true,
					cancelable: true,
					composed: false
				}));
				window.gularen.transpiled = true;

				htmlRoot.querySelectorAll('time').forEach(timeNode => {
					const dateTime = timeNode.getAttribute('datetime');
					if (dateTime) {
						timeNode.textContent = (new Date(dateTime)).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					}
				});
			}

			Module.onRuntimeInitialized = () => {
				htmlRoot.innerHTML = 'Awesome';
				transpile();
			};
		</script>


		<script src="${toWebPath('library/code/script.js')}"></script>
		<script>
			function parseHighlight() {
				document.querySelectorAll('code').forEach(el => {
					for (let i = 0; i < el.classList.length; i += 1) {
						const className = el.classList[i];
						if (className == 'language-latex' || className == 'language-mermaid') {
							return; // dont highlight this two
						}
					}
					hljs.highlightElement(el);
				});
			}
			addEventListener('gularentranspile', parseHighlight);
			if (gularen.transpiled) {
				parseHighlight();
			}
		</script>
	
		<script src="${toWebPath('library/diagram/script.js')}"></script>
		<script>
			mermaid.initialize({
				theme: 'dark',
			});
			function parseMermaid() {
				mermaid.init(undefined, '.language-mermaid');
			}
			addEventListener('gularentranspile', parseMermaid)
			if (gularen.transpiled) {
				parseMermaid();
			}
		</script>
	
		<script src="${toWebPath('library/math/script.js')}"></script>
		<script>
			function parseKatex() {
				document.querySelectorAll('.language-latex').forEach(node => {
					katex.render(node.innerHTML, node);
				})
			}
			addEventListener('gularentranspile', parseKatex);
			if (gularen.transpiled) {
				parseKatex();
			}
		</script>
	`;
}

module.exports = {
    register
};