import * as vscode from 'vscode';
import { escapeString } from './escapeString';

export function activate(context: vscode.ExtensionContext)
{
	context.subscriptions.push(vscode.commands.registerCommand('escape-string.pasteEscapedString', () => pasteEscapedString()));
}

export async function pasteEscapedString()
{
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		const clipText = await vscode.env.clipboard.readText();
		if (clipText) {
			const eol = activeEditor.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
			await activeEditor.edit((editBuilder: vscode.TextEditorEdit) =>
			{
				editBuilder.replace(activeEditor.selection, escapeString(clipText, activeEditor.document.languageId, eol));
			});
		}
	}
}

export function deactivate() { }
