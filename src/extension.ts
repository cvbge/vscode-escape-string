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
	} else if (languageId === "cpp") {
		// Raw string literal https://en.cppreference.com/w/cpp/language/string_literal
		// By default string begins with R"( and ends with )". The problem is when there's )" inside the string. There are no escape characters.
		// The only way is to use optional delimiter, which goes between quote and parentheses. For example: R"#(content)#". But what if content
		// contains the )#" ? A different delimiter needs to be choosen...
		const delimiters = [ "!", "@", "#", "$", "%", "^", "&", "*", "~", "`", "-", "_", "=", "+" ];
		let d = "";
		let endSequence = `)${d}"`;
		while (s.includes(endSequence) && delimiters.length > 0) {
			d = delimiters.shift()!;
			endSequence = `)${d}"`;
		}
		if (s.includes(endSequence)) {
			console.log("Unable to create escaped string because original string contains all supported delimiters");
			return s;
		}
		return `R"${d}(` + s + `)${d}"`;
	} else {
		return s;
	}
}

export function deactivate() {}
