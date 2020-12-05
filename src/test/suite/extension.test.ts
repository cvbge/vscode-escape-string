import * as assert from 'assert';
import * as extension from '../../extension';

suite('extension', function() {
	suite('escapeString', function() {
		const testCases = [
			{ original: 'foo', escaped: [
				{ languageIds: ['csharp'], expected: '@"foo"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`foo`' },
			]},
			{ original: '"foo"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""foo"""' }, // double quotes need to be escaped
				{ languageIds: ['javascript', 'typescript'], expected: '`"foo"`' },
			]},
			{ original: '"foo" "bar"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""foo"" ""bar"""' },
				{ languageIds: ['javascript', 'typescript'], expected: '`"foo" "bar"`' },
			]},
			{ original: 'foo\\bar', escaped: [
				{ languageIds: ['csharp'], expected: '@"foo\\bar"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`foo\\\\bar`' }, // backslash need to be escaped
			]},
			{ original: 'back`stick', escaped: [
				{ languageIds: ['csharp'], expected: '@"back`stick"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`back\\`stick`' }, // backstick needs to be escaped
			]},
			{ original: 'multi\nline', escaped: [
				{ languageIds: ['csharp'], expected: '@"multi\nline"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`multi\nline`' },
			]},
			{ original: 'Foo ${bar} baz', escaped: [
				{ languageIds: ['csharp'], expected: '@"Foo ${bar} baz"' },
				{ languageIds: ['javascript', 'typescript'], expected: '`Foo \\${bar} baz`' }, // ${ needs to be escaped
			]},
			{ original: '"Foo\\bar" ${bar} "`grep`"', escaped: [
				{ languageIds: ['csharp'], expected: '@"""Foo\\bar"" ${bar} ""`grep`"""' },
				{ languageIds: ['javascript', 'typescript'], expected: '`"Foo\\\\bar" \\${bar} "\\`grep\\`"`' },
			]},
		];
		for (const testCase of testCases) {
			for (const escaped of testCase.escaped) {
				for (const languageId of escaped.languageIds) {
					test(`escapes ${testCase.original} in ${languageId} to ${escaped.expected}`, function() {
						assert.strictEqual(extension.escapeString(testCase.original, languageId), escaped.expected);
					});
				}
			}
		}
	});
});
