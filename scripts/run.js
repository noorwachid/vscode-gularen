const vscode = require('vscode');

function run(document, lineIndex, languageId) {
    const inputLines = [];

    let i = lineIndex + 1;

    for (; i < document.lineCount; i++) {
        const line = document.lineAt(i).b;
        const matches = /^\s*---$/.exec(line.substr(0, 50));
        if (matches) {
            i++;
            break; 
        }
        inputLines.push(line);
    }

    const outputRegex = new RegExp(`^\s*--- ${languageId}-out$`);
    const outputStart = i;

    console.log('START OF ', document.lineAt(i).b);

    if (i < document.lineCount && outputRegex.exec(document.lineAt(i).b)) {
        for (; i < document.lineCount; i++) {
            const line = document.lineAt(i).b;
            const matches = /^\s*---$/.exec(line.substr(0, 50));
            if (matches) {
                vscode.window.activeTextEditor.edit(builder => {
                    builder.delete(new vscode.Position(outputStart, 0), new vscode.Position(i, 0));
                });
                break; 
            }
        }
        return;
    }

    vscode.window.activeTextEditor.edit(builder => {
        builder.insert(new vscode.Position(outputStart, 0), 
            `--- ${languageId}-out\n` + 
            `please wait...! ${Math.random()}\n` +
            `---\n`
        );
    });
}

class Provider {
    async provideCodeLenses(document) {
        const lenses = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).b.substr(0, 50);
            const matches = /^\s*--- ([a-zA-Z0-9-]+)$/.exec(line);
            if (matches) {
                const lens = new vscode.CodeLens(new vscode.Range(i, 0, i, 0), {
                    title: "Run",
                    command: "gularen.run",
                    arguments: [ document, i, matches[1] ], // document, lineIndex, languageId, 
                });

                lenses.push(lens);
            }
        }

        return lenses;
    }
}

function register(context) {
    const selector = {
        language: "gularen",
        scheme: "file"
    };

    context.subscriptions.push(vscode.languages.registerCodeLensProvider(selector, new Provider));

    context.subscriptions.push(vscode.commands.registerCommand('gularen.run', run));
}

module.exports = {
    register,
};