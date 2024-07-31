import MagicString from 'magic-string';
import type { SourceMap } from '@ampproject/remapping';
import { parseEsm } from '../es-module-lexer.js';

export const version = '2';

const toEsmFunctionString = ((imported: Record<string, unknown>) => {
	const d = 'default';
	if (
		imported[d]
		&& typeof imported[d] === 'object'
		&& '__esModule' in imported[d]
	) {
		return imported[d];
	}

	return imported;
}).toString();

const handleDynamicImport = `.then(${toEsmFunctionString})`;

export const transformDynamicImport = (
	filePath: string,
	code: string,
	isMinified?: boolean,
) => {
	// Naive check (regex is too slow)
	if (isMinified) {
		// If minified, we can safely check for "import(" to avoid parsing
		if (!code.includes('import(')) {
			return;
		}
	} else if (!code.includes('import')) {
		// This is a bit more expensive as we end up parsing even if import statements are detected
		return;
	}

	// Passing in the filePath improves Parsing Error message
	const parsed = parseEsm(code, filePath);
	const dynamicImports = parsed[0].filter(maybeDynamic => maybeDynamic.d > -1);
	if (dynamicImports.length === 0) {
		return;
	}

	const magicString = new MagicString(code);

	for (const dynamicImport of dynamicImports) {
		magicString.appendRight(dynamicImport.se, handleDynamicImport);
	}

	const newCode = magicString.toString();
	const newMap = magicString.generateMap({
		source: filePath,
		includeContent: false,

		/**
		 * The performance hit on this is very high
		 * Since we're only transforming import()s, I think this may be overkill
		 */
		hires: 'boundary',
	}) as unknown as SourceMap;

	return {
		code: newCode,
		map: newMap,
	};
};
