import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(
		'blazorextensions.createComponent',
		createComponent
	));
}

function createComponent(args: any) {
    promptAndSave(args, 'component');
}

function promptAndSave(args: any, templateType: string) {
    if (args === null) {
        args = { _fsPath: vscode.workspace.rootPath };
    }
    let incomingpath: string = args._fsPath || args.fsPath || args.path;

    vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter the component name', value: 'New' + templateType })
        .then(async newFileName => {
			if (typeof newFileName === 'undefined') {
				return;
			}

            let newFilePath = incomingpath + path.sep + newFileName + '.razor';

            if (fs.existsSync(newFilePath)) {
                vscode.window.showErrorMessage("File already exists");
                return;
            }

            // const namespaceDetector = new NamespaceDetector(newfilepath);
            // const namespace = await namespaceDetector.getNamespace();
            // const typename = path.basename(newfilepath, '.cs');

            openTemplateAndSaveNewFile(templateType, "", newFileName, newFilePath);
        }, errOnInput => {
            console.error('Error on input', errOnInput);

            vscode.window.showErrorMessage('Error on input. See extensions log for more info');
        });
}

function openTemplateAndSaveNewFile(type: string, namespace: string, filename: string, originalfilepath: string) {
    const templatefileName = type + '.tmpl';
    const extension = vscode.extensions.getExtension('dwalleck.blazorextensions');

    if (!extension) {
        vscode.window.showErrorMessage('The current extension cannot be found.');
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
