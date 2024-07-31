import path from 'node:path';
import type { ModuleFormat } from 'node:module';
import { tsExtensionsPattern } from '../../utils/path-utils.js';
import { getPackageType } from './package-json.js';

const getFormatFromExtension = (fileUrl: string): ModuleFormat | undefined => {
	[fileUrl] = fileUrl.split('?');

	const extension = path.extname(fileUrl);

	if (extension === '.mts') {
		return 'module';
	}

	if (extension === '.cts') {
		return 'commonjs';
	}
};

export const getFormatFromFileUrl = (fileUrl: string) => {
	const format = getFormatFromExtension(fileUrl);

	if (format) {
		return format;
	}

	// ts, tsx, jsx
	if (tsExtensionsPattern.test(fileUrl)) {
		return getPackageType(fileUrl);
	}
};

export const namespaceQuery = 'tsx-namespace=';
export const getNamespace = (
	url: string,
) => {
	const index = url.indexOf(namespaceQuery);
	if (index === -1) {
		return;
	}

	const charBefore = url[index - 1];
	if (charBefore !== '?' && charBefore !== '&') {
		return;
	}

	const startIndex = index + namespaceQuery.length;
	const endIndex = url.indexOf('&', startIndex);

	return (
		endIndex === -1
			? url.slice(startIndex)
			: url.slice(startIndex, endIndex)
	);
};
