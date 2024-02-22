import { multipleEntryFilePlugin } from '../index';
import { resolve } from 'path';

export default {
    plugins: [
        multipleEntryFilePlugin({
            chunkName: 'other',
            entryPath: resolve('./other.ts'),
            injectTo: 'body-prepend',
        }),
    ],
};