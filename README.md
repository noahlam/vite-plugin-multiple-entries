# Introduction

Support multiple JS(TS) entries in an HTML file, all of which can be built, and the final build products are placed in the same directory

# Usage 

## Base Demo

```js
import { multipleEntryFilePlugin } from 'vite-plugin-multiple-entries';
export default defineConfig({
  plugins: [
    multipleEntryFilePlugin({
      chunkName: 'other',
      entryPath: resolve('./other.ts'),
      injectTo: 'body-prepend',
    }),
  ],
});
```

## Options

### chunkName

Type: `string`

Default Value: `-`

Required: `Yes`

Description: the entry chunk name, which affects the output file name

### entryPath

Type: `string`

Default Value: `-`

Required: `Yes`

Description: the entry file path

### entryFileName

Type: `string`

Default Value: `-`

Required: `No`

Description: The same as rollupOptions.output.chunkFileNames, it will affect the output file name, By default, the output file name will hit options.output.entryFileNames naming logic. it will be set to the same file name as the main entry. If you want to specify the output file name, you need set pluginOptions.entryFileName in the same way as rollup.output.entryFileNames.
### crossorigin

Type: `string`

Default Value: `-`

Required: `No`

Description: Whether to add the crossorigin field to the injected script tag

Example:

```js
export default defineConfig({
  plugins: [
    multipleEntryFilePlugin({
      chunkName: 'other',
      entryPath: resolve('./other.ts'),
      crossorigin: 'anonymous',
    }),
  ],
});
```

```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-dns-prefetch-control" content="on" />
    <script type="module" crossorigin src="/assets/index-22c3b48c.js"></script>
  </head>
  <body>
    <script src="assets/other-cc41acd1.js" crossorigin="anonymous"></script>
    <div id="app"></div>
  </body>
</html>
```

### injectTo

Type: `'head' | 'body' | 'head-prepend' | 'body-prepend'`

Default Value: `head-prepend`

Required: `No`

Description: Inject position, it will affect the position of the `<script>` tag in output HTML
### insertPlaceholder

Type: `string`

Default Value: `-`

Required: `No`

Description: Inject placeholder, which will be replaced by script tag finally, and ensure that there is such content in the input HTML file

Example:

```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- other script placeholder -->
    <meta http-equiv="x-dns-prefetch-control" content="on" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="index.ts"></script>
  </body>
</html>
```

```javascript
export default defineConfig({
  plugins: [
    multipleEntryFilePlugin({
      chunkName: 'other',
      entryPath: resolve('./other.ts'),
      insertPlaceholder: '<!-- other script placeholder -->',
    }),
  ],
});
```

Build result:

```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="/assets/other-cc41acd1.js"></script>
    <meta http-equiv="x-dns-prefetch-control" content="on" />
    <script type="module" crossorigin src="/assets/index-22c3b48c.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

# Development
## Requirements
- Node.js
- pnpm

## DEV
```shell
pnpm i
pnpm run dev:demo // for vite dev
pnpm run build:demo // for vite build
```
## Build

```shell
pnpm run build
```