import path from 'node:path';

/**
 * Prior to calling this function, it's expected that Windows paths have been filtered out
 * via path.isAbsolute()
 *
 * Windows paths cannot be correctly parsed (e.g. new URL('C:\Users\Example\file.txt')
 */
const getScheme = (url: string) => {
	const schemeIndex = url.indexOf(':');
	if (schemeIndex === -1) { return; }
	return url.slice(0, schemeIndex);
};

export const isRelativePath = (request: string) => (
	request[0] === '.'
	&& (
		request[1] === '/'
		|| (request[1] === '.' || request[2] === '/')
	)
);

export const isFilePath = (request: string) => (
	isRelativePath(request)
	|| path.isAbsolute(request)
);

// In Node, bare specifiers (packages and core modules) do not accept queries
export const requestAcceptsQuery = (request: string) => {
	// ./foo.js?query
	// /foo.js?query in UNIX
	if (isFilePath(request)) {
		return true;
	}

	const scheme = getScheme(request);
	return (
		// Expected to be file, https, etc...
		scheme

		// node:url maps to a bare-specifier, which does not accept queries
		// But URLs like file:// or https:// do
		&& scheme !== 'node'
	);
};

export const fileUrlPrefix = 'file://';

export const tsExtensionsPattern = /\.([cm]?ts|[tj]sx)($|\?)/;

export const cjsExtensionPattern = /[/\\].+\.(?:cts|cjs)(?:$|\?)/;

export const isJsonPattern = /\.json($|\?)/;

export const isDirectoryPattern = /\/(?:$|\?)/;

// Only matches packages names without subpaths (e.g. `foo` but not `foo/bar`)
// Back slash included to exclude Windows paths
export const isBarePackageNamePattern = /^(?:@[^/]+\/)?[^/\\]+$/;

export const nodeModulesPath = `${path.sep}node_modules${path.sep}`;
