import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('escape-string.pasteEscapedString', () => pasteEscapedString()));
}

export async function pasteEscapedString()
{
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		const clipText = await vscode.env.clipboard.readText();
		if (clipText) {
			await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
				editBuilder.replace(activeEditor.selection, escapeString(clipText, activeEditor.document.languageId));
			});
		}
	}
}

export function escapeString(s: string, languageId: string)
{
	if (languageId === "csharp") {
		// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/verbatim
		const escaped = s.replace(/"/g, "\"\"");
		return `@"` + escaped + `"`;
	} else if (languageId === "javascript" || languageId === "typescript") {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		const escaped = s
			.replace(/\\/g, "\\\\") // backslashes must be escaped first, before we add any more backslashes
			.replace(/`/g, "\\`")
			.replace(/\${/g, "\\${");
		return "`" + escaped + "`";
	} else {
		return s;
	}
}

export function deactivate() {}
