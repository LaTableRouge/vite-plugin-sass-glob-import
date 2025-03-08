import { describe, expect, it, vi } from 'vitest';

import sassGlobImportPlugin from '../src';

let source = `
body {}
@import "files/*.scss";
`;

describe('it correctly converts glob patterns to inline imports with @import', () => {
    const plugin: any = sassGlobImportPlugin();

    it('for @import', () => {
        const expected = `
body {}
@import "files/_file-a.scss";
@import "files/_file-b.scss";
`;
        const path = __dirname + '/virtual-file.scss';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });

    it('for Sass', () => {
        const expected = `
body {}
@import "files/_file-a.scss"
@import "files/_file-b.scss"
`;
        const path = __dirname + '/virtual-file.sass';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
});

describe('it warns for invalid glob paths with @import', () => {
    const plugin: any = sassGlobImportPlugin();

    it('for @import', () => {
        let source = `
body {}
@import "foo/**/*.scss";
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