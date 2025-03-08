import { describe, expect, it, vi } from 'vitest';

import sassGlobImportPlugin from '../src';

let source = `
body {}
@use "files/*.scss";
`;

describe('it correctly converts glob patterns to inline imports with @use', () => {
    const plugin: any = sassGlobImportPlugin();

    it('for @use', () => {
        const expected = `
body {}
@use "files/_file-a.scss";
@use "files/_file-b.scss";
`;
        const path = __dirname + '/virtual-file.scss';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it correctly applies namespace option with @use', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace: '*',
    });

    it('for @use with namespace', () => {
        const expected = `
body {}
@use "files/_file-a.scss" as *;
@use "files/_file-b.scss" as *;
`;
        const path = __dirname + '/virtual-file.scss';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it correctly applies namespace option with @use', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace(filepath, index) {
            const fileParts = filepath.replace(".scss", "").split("/");
            return `${fileParts.at(-2)}-${index}`;
        },
    });

    it('for @use with namespace', () => {
        const expected = `
body {}
@use "files/_file-a.scss" as files-0;
@use "files/_file-b.scss" as files-1;
`;
        const path = __dirname + '/virtual-file.scss';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it correctly applies namespace option with @use', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace: '*',
    });

    it('for @use with namespace', () => {
        const expected = `
body {}
@use "files/_file-a.scss" as *
@use "files/_file-b.scss" as *
`;
        const path = __dirname + '/virtual-file.sass';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it correctly applies namespace option with @use', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace(filepath, index) {
            const fileParts = filepath.replace(".scss", "").split("/");
            return `${fileParts.at(-2)}-${index}`;
        },
    });

    it('for @use with namespace', () => {
        const expected = `
body {}
@use "files/_file-a.scss" as files-0
@use "files/_file-b.scss" as files-1
`;
        const path = __dirname + '/virtual-file.sass';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it warns for invalid glob paths with @use', () => {
    const plugin: any = sassGlobImportPlugin();

    it('for @use', () => {
        let source = `
body {}
@use "foo/**/*.scss";
`;
        const expected = `
body {}

`;
        const path = __dirname + '/virtual-file.scss';
        vi.spyOn(console, 'warn');
        expect(plugin.transform(source, path)?.code).toEqual(expected);
        expect(console.warn).toHaveBeenCalledTimes(1);
    });
}); 