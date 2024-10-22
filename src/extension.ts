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
			const eol = activeEditor.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
			await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
				editBuilder.replace(activeEditor.selection, escapeString(clipText, activeEditor.document.languageId, eol));
			});
		}
	}
}

export function escapeString(s: string, languageId: string, eol: string)
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
		const delimiter = [ "", "!", "@", "#", "$", "%", "^", "&", "*", "~", "`", "-", "_", "=", "+" ]
			.find(d => !s.includes(`)${d}"`));
		if (delimiter === undefined) {
			console.log("Unable to create escaped string because original string contains all supported delimiters");
			return s;
		}
		return `R"${delimiter}(` + s + `)${delimiter}"`;
	} else if (languageId === "json") {
		return JSON.stringify(s);
	} else if (languageId === "c") {
		const escaped = s
			.replace(/\\/g, "\\\\") // backslashes first
			.replace(/"/g, "\\\"");
		return escaped.split(/\r?\n/).map((s, idx, arr) => `"${s}${idx !== arr.length-1 ? '\\n' : ''}"`).join(eol);
	} else if (languageId === 'python') {
		return s.split(/\r?\n/).map((line, idx, arr) => {
			const singleQuoteCount = line.split("'").length - 1;
			const doubleQuoteCount = line.split('"').length - 1;
			const delimiterQuote = singleQuoteCount >= doubleQuoteCount ? '"' : "'";
			const escaped = line
				.replace(/\\/g, "\\\\") // backslashes first
				.replace(new RegExp(delimiterQuote, "g"), `\\${delimiterQuote}`);
			const isLastLine = idx === arr.length - 1;
			return `${delimiterQuote}${escaped}${!isLastLine ? '\\n' : ''}${delimiterQuote}${(!isLastLine) ? ' \\' : ''}`;
		}).join(eol);
	} else {
		return s;
	}
}

export function deactivate() {}
