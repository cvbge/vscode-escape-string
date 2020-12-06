import * as assert from 'assert';
import * as extension from '../../extension';

suite('extension', function() {
	suite('escapeString', function() {
		const testCases = [
			{ original: 'foo', escaped: [
				{ languageIds: ['csharp'], expected: '@"foo"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`foo`' },
				{ languageIds: ['cpp'], expected: 'R"(foo)"' },
				{ languageIds: ['python'], expected: '"foo"' },
			]},
			{ original: '"foo"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""foo"""' }, // double quotes need to be escaped
				{ languageIds: ['javascript', 'typescript'], expected: '`"foo"`' },
				{ languageIds: ['cpp'], expected: 'R"("foo")"' },
				{ languageIds: ['c'], expected: '"\\"foo\\""' },
				{ languageIds: ['python'], expected: `'"foo"'` },
			]},
			{ original: '"foo" "bar"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""foo"" ""bar"""' },
				{ languageIds: ['javascript', 'typescript'], expected: '`"foo" "bar"`' },
				{ languageIds: ['cpp'], expected: 'R"("foo" "bar")"' },
				{ languageIds: ['c'], expected: '"\\"foo\\" \\"bar\\""' },
				{ languageIds: ['python'], expected: `'"foo" "bar"'` },
			]},
			{ original: 'foo\\bar', escaped: [
				{ languageIds: ['csharp'], expected: '@"foo\\bar"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`foo\\\\bar`' }, // backslash need to be escaped
				{ languageIds: ['cpp'], expected: 'R"(foo\\bar)"' },
				{ languageIds: ['c'], expected: '"foo\\\\bar"' },
				{ languageIds: ['python'], expected: '"foo\\\\bar"' },
			]},
			{ original: 'back`stick', escaped: [
				{ languageIds: ['csharp'], expected: '@"back`stick"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`back\\`stick`' }, // backstick needs to be escaped
				{ languageIds: ['cpp'], expected: 'R"(back`stick)"' },
				{ languageIds: ['c'], expected: '"back`stick"' },
				{ languageIds: ['python'], expected: '"back`stick"' },
			]},
			{ original: 'multi\nline', escaped: [
				{ languageIds: ['csharp'], expected: '@"multi\nline"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`multi\nline`' },
				{ languageIds: ['cpp'], expected: 'R"(multi\nline)"' },
				{ languageIds: ['c'], expected: '"multi\\n"\n"line"' },
				{ languageIds: ['python'], expected: '"multi\\n" \\\n"line"' },
			]},
			{ original: 'very\r\nmulti\n\nline\r\n\r\nstring\r', escaped: [
				{ languageIds: ['c'], expected: '"very\\n"\n"multi\\n"\n"\\n"\n"line\\n"\n"\\n"\n"string\r"' },
				{ languageIds: ['python'], expected: '"very\\n" \\\n"multi\\n" \\\n"\\n" \\\n"line\\n" \\\n"\\n" \\\n"string\r"' },
			]},
			{ original: 'Foo ${bar} baz', escaped: [
				{ languageIds: ['csharp'], expected: '@"Foo ${bar} baz"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`Foo \\${bar} baz`' }, // ${ needs to be escaped
				{ languageIds: ['cpp'], expected: 'R"(Foo ${bar} baz)"' },
				{ languageIds: ['c'], expected: '"Foo ${bar} baz"' },
				{ languageIds: ['python'], expected: '"Foo ${bar} baz"' },
			]},
			{ original: '"Foo\\bar" ${bar} "`grep`"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""Foo\\bar"" ${bar} ""`grep`"""' },
				{ languageIds: ['javascript', 'typescript'], expected: '`"Foo\\\\bar" \\${bar} "\\`grep\\`"`' },
				{ languageIds: ['cpp'], expected: 'R"("Foo\\bar" ${bar} "`grep`")"' },
				{ languageIds: ['c'], expected: '"\\"Foo\\\\bar\\" ${bar} \\"`grep`\\""' },
				{ languageIds: ['python'], expected: '\'"Foo\\\\bar" ${bar} "`grep`"\'' },
			]},
			{ original: 'More\'quotes', escaped: [
				{ languageIds: ['python'], expected: '"More\'quotes"' },
			]},
			{ original: 'More\'"quotes', escaped: [
				{ languageIds: ['python'], expected: '"More\'\\"quotes"' },
			]},
			{ original: 'More"\'"quotes', escaped: [
				{ languageIds: ['python'], expected: '\'More"\\\'"quotes\'' },
			]},
			{ original: 'Mul"ti\nli\'ne', escaped: [
				{ languageIds: ['python'], expected: '\'Mul"ti\\n\' \\\n"li\'ne"' },
			]},
			{ original: 'Foo()" bar', escaped: [
				{ languageIds: ['cpp'], expected: 'R"!(Foo()" bar)!"' },
			]},
			{ original: 'Foo()!" bar', escaped: [
				{ languageIds: ['cpp'], expected: 'R"(Foo()!" bar)"' },
			]},
			{ original: 'Foo()" )!" bar', escaped: [
				{ languageIds: ['cpp'], expected: 'R"@(Foo()" )!" bar)@"' },
			]},
			{ original: 'Foo()" )!" )@" )#" )$" )%" )^" )&" )*" )~" )`" )-" )_" )=" )+" bar', escaped: [
				{ languageIds: ['cpp'], expected: 'Foo()" )!" )@" )#" )$" )%" )^" )&" )*" )~" )`" )-" )_" )=" )+" bar' }, // expecting original string because all delimiters used
			]},
		];
		for (const testCase of testCases) {
			for (const escaped of testCase.escaped) {
				for (const languageId of escaped.languageIds) {
					test(`escapes ${testCase.original} in ${languageId} to ${escaped.expected}`, function() {
						assert.strictEqual(extension.escapeString(testCase.original, languageId, "\n"), escaped.expected);
					});
				}
			}
		}
	});
});
