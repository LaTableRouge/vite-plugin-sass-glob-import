import fs from 'fs';
import path from 'path';

import c from 'ansi-colors';
import { globSync } from 'glob';
import { minimatch } from "minimatch";
import { Plugin } from "vite";

import { PluginOptions, TransformResult } from './types';

export default function sassGlobImports(options: PluginOptions = {}): Plugin {
  // Regular expressions to match against
  const FILE_REGEX = /\.s[c|a]ss(\?direct)?$/;
	const IMPORT_REGEX = /^([ \t]*(?:\/\*.*\*\/)?)@(import|use|include)\s+(meta\.load-css\()?["']([^"']+\*[^"']*(?:\.scss|\.sass)?)["']\)?;?([ \t]*(?:\/[/*].*)?)$/gm;

  // Path to the directory of the file being processed
  let filePath = '';

  // Name of the file being processed
  let fileName = '';

  function isSassOrScss(filename: string) {
    return (!fs.statSync(filename).isDirectory() && path.extname(filename).match(/\.sass|\.scss/i));
  }

  const transform = (src: string): string => {
    // Determine if this is Sass (vs SCSS) based on file extension
    const isSass = path.extname(fileName).match(/\.sass/i);

    // Store base locations
    const searchBases = [filePath];

    // Ignore paths
    const ignorePaths = options.ignorePaths || [];

    // Get each line of src
    let contentLinesCount = src.split('\n').length;

    let result;

    // Loop through each line
    for (let i = 0; i < contentLinesCount; i++) {
      // Find any glob import patterns on the line
      result = [...src.matchAll(IMPORT_REGEX)];

      if (result.length) {
        const [importRule, startComment, importType, metaLoadException, globPattern, endComment] = result[0]

        let files: string[] = [];
        let basePath = '';
        for (let i = 0; i < searchBases.length; i++) {
          basePath = searchBases[i];

          files = globSync(path.join(basePath, globPattern), {
            cwd: './',
            windowsPathsNoEscape: true,
          }).sort((a, b) => a.localeCompare(b, 'en'));

          // Do directories exist matching the glob pattern?
          const globPatternWithoutWildcard = globPattern.split('*')[0];
          if (globPatternWithoutWildcard.length) {
            const directoryExists = fs.existsSync(path.join(basePath, globPatternWithoutWildcard));
            if (!directoryExists) {
              console.warn(c.yellow(`Sass Glob Import: Directories don't exist for the glob pattern "${globPattern}"`));
            }
          }

          if (files.length > 0) {
            break;
          }
        }

        let imports = [];

        files.forEach((filename: string, index: number) => {
          if (isSassOrScss(filename)) {
            // Remove parent base path
            filename = path.relative(basePath, filename).replace(/\\/g, '/');
            // Remove leading slash
            filename = filename.replace(/^\//, '');
            if (
							!ignorePaths.some((ignorePath = '') => {
								return minimatch(filename, ignorePath)
							})
						) {
							if (importType === 'use' && options.namespace) {
								// Add namespace to @use import
								let namespaceExport = ''
								let namespace = ''
								if (typeof options.namespace === 'function') {
									const computedNamespace = options.namespace(filename, index)
									namespace = typeof computedNamespace === 'string' ? computedNamespace : ''
								} else if (typeof options.namespace === 'string') {
									namespace = options.namespace
								}

								// Namespace function can return an empty string
								if (namespace.length) {
									namespaceExport = `as ${namespace}`
								}

								imports.push(`@${importType} "${filename}" ${namespaceExport}${isSass ? '' : ';'}`)
							} else if (importType === 'include' && metaLoadException) {
								// Add meta.load-css rule import
								imports.push(`@${importType} meta.load-css("${filename}")${isSass ? '' : ';'}`)
							} else {
								// remove parent base path
								imports.push(`@${importType} "${filename}"${isSass ? '' : ';'}`)
							}
						}
          }
        });

        if (startComment) {
          imports.unshift(startComment);
        }

        if (endComment) {
          imports.push(endComment);
        }

        // Removing whitespace from array
        imports = imports.filter(item => item.trim() != '');

        const replaceString = imports.join('\n');
        src = src.replace(importRule, replaceString);
      }
    }

    // Return the transformed source
    return src;
  };

  return {
    name: 'sass-glob-import',
    enforce: 'pre',

    transform(src: string, id: string): TransformResult {
      let result: TransformResult = {
        code: src,
        map: null, // provide source map if available
      }

      if (FILE_REGEX.test(id)) {
        fileName = path.basename(id);
        filePath = path.dirname(id);

        result.code = transform(src);
      }

      return result;
    },
  };
}
