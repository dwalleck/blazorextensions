import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('blazorextensions.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from blazorextensions!');
	});
	context.subscriptions.push(vscode.commands.registerCommand('blazorextensions.createComponent', createComponent));

	context.subscriptions.push(disposable);
	
}

function createComponent(args: any) {
    promptAndSave(args, 'component');
}

function promptAndSave(args: any, templatetype: string) {
    if (args === null) {
        args = { _fsPath: vscode.workspace.rootPath };
    }
    let incomingpath: string = args._fsPath || args.fsPath || args.path;

    vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Please enter filename', value: 'New' + templatetype })
        .then(async newfilename => {
			if (typeof newfilename === 'undefined') {
				return;
			}

            let newfilepath = incomingpath + path.sep + newfilename + '.razor';

            if (fs.existsSync(newfilepath)) {
                vscode.window.showErrorMessage("File already exists");
                return;
            }

            // const namespaceDetector = new NamespaceDetector(newfilepath);
            // const namespace = await namespaceDetector.getNamespace();
            // const typename = path.basename(newfilepath, '.cs');

            openTemplateAndSaveNewFile(templatetype, "", newfilename, newfilepath);
        }, errOnInput => {
            console.error('Error on input', errOnInput);

            vscode.window.showErrorMessage('Error on input. See extensions log for more info');
        });
}

function openTemplateAndSaveNewFile(type: string, namespace: string, filename: string, originalfilepath: string) {
    const templatefileName = type + '.tmpl';
    const extension = vscode.extensions.getExtension('dwalleck.blazorextensions');

    if (!extension) {
        vscode.window.showErrorMessage('Weird, but the extension you are currently using could not be found');
        return;
    }
    const templateFilePath = path.join(extension.extensionPath, 'templates', templatefileName);

    vscode.workspace.openTextDocument(templateFilePath)
        .then(doc => {
            let text = doc.getText()
                .replace('${componentName}', filename);

			fs.writeFileSync(originalfilepath, text);
            vscode.workspace.openTextDocument(originalfilepath).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    
                });
            });
        }, errTryingToCreate => {
            const errorMessage = `Error trying to create file '${originalfilepath}' from template '${templatefileName}'`;

            console.error(errorMessage, errTryingToCreate);

            vscode.window.showErrorMessage(errorMessage);
        });
}

// this method is called when your extension is deactivated
export function deactivate() {}
