// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs")
const shell = require('child_process').execSync;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.esoftplayExtractString', function (uri) {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user		

		const editor = vscode.window.activeTextEditor;
		const fullName = editor.document.fileName.split("/")
		const fullpath = fullName.slice(0, fullName.length - 3).join("/")
		let selectedText = editor.document.getText(editor.selection);
		if (
			(selectedText.lastIndexOf("\"") == selectedText.length - 1)
			|| (selectedText.lastIndexOf("\'") == selectedText.length - 1)
			|| (selectedText.lastIndexOf("\`") == selectedText.length - 1)
		) {
			selectedText = selectedText.slice(0, selectedText.length - 1)
		}
		if (
			(selectedText.lastIndexOf("\"") == 0)
			|| (selectedText.lastIndexOf("\'") == 0)
			|| (selectedText.lastIndexOf("\`") == 0)
		) {
			selectedText = selectedText.slice(1, selectedText.length)
		}
		let task = fullName[fullName.length - 1]
		task = task.slice(0, task.lastIndexOf('.'))
		const module = fullName.slice(fullName.length - 2, fullName.length - 1)
		shell("mkdir -p " + fullpath + "/assets/locale")
		vscode.window.showInputBox({ placeHolder: "Input a key for string resource" }).then((title => {
			if (!title || title.trim().length == 0) {
				vscode.window.showWarningMessage("String need a key for extraction");
				return
			}
			let data = {}
			if (fs.existsSync(fullpath + "/assets/locale/id.json")) {
				data = JSON.parse(fs.readFileSync(fullpath + "/assets/locale/id.json").toString())
			}
			if (data && data.hasOwnProperty(module + "/" + task)) {
				if (data[module + "/" + task].hasOwnProperty(title)) {
					vscode.window.showInputBox({
						placeHolder: "Resource string with key " + title + " is exist, replace with this one? (Y/N)",
						prompt: "Resource string with key " + title + " is exist, replace with this one? (Y/N)"
					}).then((y => {
						if (y == "Y" || y == "y") {
							doExtract()
						}
					}))
					return
				}
			}
			doExtract()
			function doExtract() {
				if (data && data.hasOwnProperty(module + "/" + task)) {
					data[module + "/" + task] = {
						...data[module + "/" + task],
						[title]: selectedText
					}
				} else {
					data[module + "/" + task] = {
						...data[module + "/" + task],
						[title]: selectedText
					}
				}
				fs.writeFileSync(fullpath + "/assets/locale/id.json", JSON.stringify(data, undefined, 2))
				editor.edit(builder => {
					builder.replace(editor.selection, "esp.lang(\"" + module + "/" + task + "\",\"" + title + "\")")
				})
				vscode.window.showInformationMessage("Success extracting string!");
			}
		}))
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
