
export function escapeString(s: string, languageId: string, eol: string)
{
    if (languageId === "c") {
        return cEscape(s, eol);
    }
    if (languageId === "cpp") {
        return cppEscape(s);
    }
    if (languageId === "csharp") {
        return csharpEscape(s);
    }
    if (languageId === "javascript" || languageId === "typescript") {
        return javascriptEscape(s);
    }
    if (languageId === "json") {
        return jsonEscape(s);
    }
    if (languageId === 'python') {
        return pythonEscape(s, eol);
    }
    return s;
}


function cEscape(s: string, eol: string): string
{
    const escaped = s
        .replace(/\\/g, "\\\\") // backslashes first
        .replace(/"/g, "\\\"");
    return escaped
        .split(/\r?\n/)
        .map((s, idx, arr) => `"${s}${idx !== arr.length - 1 ? '\\n' : ''}"`)
        .join(eol);
}


function cppEscape(s: string): string
{
    // Raw string literal https://en.cppreference.com/w/cpp/language/string_literal
    // By default string begins with R"( and ends with )". The problem is when there's )" inside the string.
    // There are no escape characters. The only way is to use optional delimiter, which goes between quote
    // and parentheses. For example: R"#(content)#". But what if content contains the )#" ? A different
    // delimiter needs to be choosen...
    const delimiter = ["", "!", "@", "#", "$", "%", "^", "&", "*", "~", "`", "-", "_", "=", "+"]
        .find(d => !s.includes(`)${d}"`));
    if (delimiter === undefined) {
        console.log("Unable to create escaped string because original string contains all supported delimiters");
        return s;
    }
    return `R"${delimiter}(` + s + `)${delimiter}"`;
}


function csharpEscape(s: string): string
{
    // https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/verbatim
    const escaped = s.replace(/"/g, "\"\"");
    return `@"` + escaped + `"`;
}


function javascriptEscape(s: string): string
{
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    const escaped = s
        .replace(/\\/g, "\\\\") // backslashes must be escaped first, before we add any more backslashes
        .replace(/`/g, "\\`")
        .replace(/\${/g, "\\${");
    return "`" + escaped + "`";
}


function jsonEscape(s: string): string
{
    return JSON.stringify(s);
}


function pythonEscape(s: string, eol: string): string
{
    return s.split(/\r?\n/).map((line, idx, arr) =>
    {
        const singleQuoteCount = line.split("'").length - 1;
        const doubleQuoteCount = line.split('"').length - 1;
        const delimiterQuote = singleQuoteCount >= doubleQuoteCount ? '"' : "'";
        const escaped = line
            .replace(/\\/g, "\\\\") // backslashes first
            .replace(new RegExp(delimiterQuote, "g"), `\\${delimiterQuote}`);
        const isLastLine = idx === arr.length - 1;
        return `${delimiterQuote}${escaped}${!isLastLine ? '\\n' : ''}${delimiterQuote}${(!isLastLine) ? ' \\' : ''}`;
    }).join(eol);
}
