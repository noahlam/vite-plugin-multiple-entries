import type { OutputBundle, OutputOptions, RollupOptions } from 'rollup';
import type { ResolvedConfig } from 'vite';

interface IPluginOptions {
    chunkName: string;
    entryPath: string;
    crossorigin?: string;
    entryFileName?: string;
    insertPlaceholder?: string;
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

export function multipleEntryFilePlugin(pluginOptions: IPluginOptions) {
    const {
        chunkName,
        entryPath,
        insertPlaceholder,
        crossorigin,
        entryFileName,
        injectTo = 'head-prepend',
    } = pluginOptions;

    let filename: string = '';
    let base: string = '';
    let isDevServer = false;

    return {
        name: 'multiple-entries-plugin',

        // Only be executed in dev mode
        configureServer() {
            isDevServer = true;
            filename = entryPath;
        },

        // Record base path for build output file path
        configResolved(resolvedConfig: ResolvedConfig) {
            base = resolvedConfig.base || '';
        },

        // Inject new entry
        options(options: RollupOptions) {
            // is string
            if (typeof options.input === 'string') {
                options.input = [options.input, entryPath];
            }
            // is array
            else if (Array.isArray(options.input)) {
                options.input.push(entryPath);
            }
            // is object
            else if (typeof options.input === 'object') {
                options.input[chunkName] = entryPath;
            }
            // No entry specified, treat current entry as the only one.
            else {
                options.input = [entryPath];
            }
        },

        /**
         * override entryFileNames, append the new entry file name into origin.
         * By default, it will hit options.output.entryFileNames naming logic. output file name will be set to the same file name as the main entry.
         * If you need to specify the output file name, set pluginOptions.entryFileName in the same way as rollup.output.entryFileNames
         */
        outputOptions(options: OutputOptions) {
            if (!entryFileName) {
                return;
            }

            if (Array.isArray(options)) {
                throw new TypeError('Array type output not supported');
            }

            const oldEntryFileNames = options.entryFileNames;

            options.entryFileNames = (chunkInfo) => {
                // Hit the entry we added
                if (
                    'isEntry' in chunkInfo &&
                    chunkInfo.isEntry === true &&
                    chunkInfo.name === chunkName
                ) {
                    return entryFileName;
                }
                // No entry file name specified, use roll up default value
                else if (oldEntryFileNames === undefined) {
                    return '[name].js';
                }
                // Entry is a function
                else if (typeof oldEntryFileNames === 'function') {
                    return oldEntryFileNames(chunkInfo);
                }
                // Entry is a string
                else {
                    return oldEntryFileNames;
                }
            };
        },
        
        // Record the file name of the injected module while generateBundle
        generateBundle(_: OutputOptions, bundle: OutputBundle) {
            Object.values(bundle).forEach((bun) => {
                if ('isEntry' in bun && bun.isEntry === true && bun.name === chunkName) {
                    filename = base + bun.fileName;
                }
            });
        },

        // Inject <script> tag for added entry file
        async transformIndexHtml(html: string) {
            // If there is a specified placeholder, use the placeholder first
            if (insertPlaceholder) {
                const injectScriptType = isDevServer ? 'type="module" ' : '';
                const crossoriginAttr = crossorigin ? `crossorigin="${crossorigin}" ` : '';
                const tag = `<script ${injectScriptType}${crossoriginAttr}src="${filename}"></script>`;
                return html.replace(insertPlaceholder, tag);
            }
            // Inject <script> tag with vite HtmlTagDescriptor
            else {
                const attrs: Record<string, string | boolean | undefined> = {
                    src: filename,
                };
                if (crossorigin !== undefined) {
                    attrs.crossorigin = crossorigin;
                }
                if (isDevServer) {
                    attrs.type = 'module';
                }
                return {
                    html,
                    tags: [{ tag: 'script', attrs, injectTo }],
                };
            }
        },
    };
}
