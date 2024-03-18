const vscode = require('vscode');
let panel = null;

function register(context) {
    const disposable = vscode.commands.registerCommand('gularen.preview', function () {
		preview(context);
	});

    context.subscriptions.push(disposable);
}

function preview(context) {
	if (!vscode.window.activeTextEditor) {
		return;
	}

	if (panel) {
		panel.reveal(vscode.ViewColumn.Active);
		return;
	}

    panel = vscode.window.createWebviewPanel(
        // Webview id
        `gularenPreview`,
        // Webview title
        'Preview',
        // This will open the second column for preview inside editor
        vscode.ViewColumn.Two,
        {
            // Enable scripts in the webview
            enableScripts: true,
            retainContextWhenHidden: true,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')]
        }
    );

	const sourceCode = vscode.window.activeTextEditor.document.getText();

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
			window.gularen.source = ${JSON.stringify(sourceCode)};

			function transpile() {
				htmlRoot.innerHTML = Module.transpile(window.gularen.source);
				dispatchEvent(new Event('gularentranspile', {
					bubbles: true,
					cancelable: true,
					composed: false
				}));
				window.gularen.transpiled = true;
			}

			Module.onRuntimeInitialized = () => {
				htmlRoot.innerHTML = 'Awesome';
				transpile();
			};

			window.addEventListener('message', (e) => {
				window.gularen.source = e.data.content;
				transpile();
			});
		</script>


		<script src="${toWebPath('library/code/script.js')}"></script>
		<script>
			function parseHighlight() {
				document.querySelectorAll('code').forEach(el => {
					for (let i = 0; i < el.classList.length; i += 1) {
						const className = el.classList[i];
						if (className == 'language-math' || className == 'language-mermaid') {
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
				document.querySelectorAll('.language-math').forEach(node => {
					katex.render(node.innerHTML, node);
				})
			}
			addEventListener('gularentranspile', parseKatex);
			if (gularen.transpiled) {
				parseKatex();
			}
		</script>

		<script src="${toWebPath('library/emoji/script.js')}"></script>
		<script>
			function parseEmoji() {
				document.querySelectorAll('.emoji').forEach(node => {
					if (Emoji.database.hasOwnProperty(node.textContent)) {
						node.textContent = Emoji.database[node.textContent];
					}
				});
			}
			addEventListener('gularentranspile', parseEmoji);
			if (gularen.transpiled) {
				parseEmoji();
			}
		</script>
	`;

	let changeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(event => {
        if (event) {
			const fileExtension = event.document.uri.toString().split('.').pop();
			if (fileExtension == 'gr' || fileExtension == 'gularen') {
				panel.webview.postMessage({
					type: 'SOURCE',
					content: event.document.getText(),
				});
			}
        }
    });

	let changeContentDisposable = vscode.workspace.onDidChangeTextDocument(event => {
		const fileExtension = event.document.uri.toString().split('.').pop();
		if (fileExtension == 'gr' || fileExtension == 'gularen') {
			panel.webview.postMessage({
				type: 'SOURCE',
				content: event.document.getText(),
			});
		}
	});

	context.subscriptions.push(changeEditorDisposable);
	context.subscriptions.push(changeContentDisposable);

	panel.onDidDispose(() => {
		changeEditorDisposable.dispose();
		changeContentDisposable.dispose();
		panel = null;
	});
}

module.exports = {
    register
};