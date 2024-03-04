const vscode = require('vscode');
const cp = require('child_process');

const runners = {
    js: {
        command: ['node'],
    },
    'esoftplay-request': {
        out: 'esoftplay-response',
        command: ['esoftplay-resolver'],
    },
};

function spawn(command, input, outputCallback) {
    try {
        let process = cp.spawn(command[0]);

        if (input.length > 0) {
            process.stdin.write(input);
        }
        process.stdin.end();

        let outText = '';
        let errorText = '';

        process.stdout.on('data', (data) => {
            outText += data;
        });

        process.stderr.on('data', (data) => {
            errorText += data;
        });

        process.on('close', (code, signal) => {
            if (code != 0) {
                outputCallback(`command exit with code ${code}\n ${errorText}`);
                return;
            }
            outputCallback(outText);
        });
    } catch (e) {
        outputCallback(`exception thrown ${e.toString()}`);
    }
}

function run(document, lineIndex, languageId) {
    const inputLines = [];

    let i = lineIndex + 1;
    let inputEndLine = 0;
    let inputEndColumn = 0;

    for (; i < document.lineCount; i++) {
        const line = document.lineAt(i).b;
        const matches = /^\s*---$/.exec(line.substr(0, 50));
        if (matches) {
            inputEndLine = i;
            inputEndColumn = line.length;
            i++;
            break; 
        }
        inputLines.push(line);
    }

    const outputRegex = new RegExp(`^\s*--- ${createOutLabel(languageId)}$`);
    const outputStartLine = i;

    if (outputStartLine < document.lineCount && outputRegex.exec(document.lineAt(outputStartLine).b)) {
        for (let i = outputStartLine; i < document.lineCount; i++) {
            const line = document.lineAt(i).b;
            const matches = /^\s*---$/.exec(line.substr(0, 50));
            if (matches) {
                vscode.window.activeTextEditor.edit(builder => {
                    builder.delete(new vscode.Range(inputEndLine, inputEndColumn, i, line.length));
                    builder.insert(
                        new vscode.Position(inputEndLine, inputEndColumn), 
                        createCodeBlock(languageId, 'please wait...!')
                    );

                    resolve(document, languageId, inputLines, inputEndLine, inputEndColumn, outputStartLine);
                });
                break;
            }
        }
    }

    vscode.window.activeTextEditor.edit(builder => {
        builder.insert(
            new vscode.Position(inputEndLine, inputEndColumn), 
            createCodeBlock(languageId, 'please wait...!')
        );

        resolve(document, languageId, inputLines, inputEndLine, inputEndColumn, outputStartLine);
    });
}

function createOutLabel(languageId) {
    return runners[languageId] && runners[languageId].out ? runners[languageId].out : `${languageId} out`;
}

function createCodeBlock(languageId, content) {
    if (typeof content == 'string') {
        content = content.toString().trimEnd();
    }
    return `\n--- ${createOutLabel(languageId)}\n${content}\n---`;
}

function resolve(document, languageId, inputLines, inputEndLine, inputEndColumn, outputStartLine) {
    spawn(runners[languageId].command, inputLines.join('\n'), (out) => {
        for (let i = outputStartLine; i < document.lineCount; i++) {
            const line = document.lineAt(i).b;
            const matches = /^\s*---$/.exec(line.substr(0, 50));
            if (matches) {
                vscode.window.activeTextEditor.edit(builder => {
                    builder.delete(new vscode.Range(inputEndLine, inputEndColumn, i, line.length));
                    builder.insert(
                        new vscode.Position(inputEndLine, inputEndColumn), 
                        createCodeBlock(languageId, out)
                    );
                });
                break;
            }
        }
    });
}

class Provider {
    async provideCodeLenses(document) {
        const lenses = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).b.substr(0, 50);
            const matches = /^\s*--- ([a-zA-Z0-9-]+)$/.exec(line);

            if (matches) {
                const languageId = matches[1];
                if (runners[languageId] !== undefined) {
                    const lens = new vscode.CodeLens(new vscode.Range(i, 0, i, 0), {
                        title: "Run",
                        command: "gularen.run",
                        arguments: [ document, i, languageId ], // document, lineIndex, languageId, 
                    });

                    lenses.push(lens);
                }
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