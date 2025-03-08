import { describe, expect, it, vi } from 'vitest';

import sassGlobImportPlugin from '../src';

let source = `
body {
    @include meta.load-css("files/*.scss");
}
`;

describe('it correctly applies namespace option with @include meta.load-css()', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace(filepath, index) {
            const fileParts = filepath.replace(".scss", "").split("/");
            return `${fileParts.at(-2)}-${index}`;
        },
    });

    it('for @include meta.load-css() with namespace', () => {
        const expected = `
body {
@include meta.load-css("files/_file-a.scss");
@include meta.load-css("files/_file-b.scss");
}
`;
        const path = __dirname + '/virtual-file.scss';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
}); 

describe('it correctly applies namespace option with @include meta.load-css()', () => {
    const plugin: any = sassGlobImportPlugin({
        namespace(filepath, index) {
            const fileParts = filepath.replace(".scss", "").split("/");
            return `${fileParts.at(-2)}-${index}`;
        },
    });

    it('for @include meta.load-css() with namespace', () => {
        const expected = `
body {
@include meta.load-css("files/_file-a.scss")
@include meta.load-css("files/_file-b.scss")
}
`;
        const path = __dirname + '/virtual-file.sass';
        expect(plugin.transform(source, path)?.code).toEqual(expected);
    });
}); 

describe('it warns for invalid glob paths with @import', () => {
    const plugin: any = sassGlobImportPlugin();

    it('for @import', () => {
        let source = `
body {
    @include meta.load-css("foo/**/*.scss");
}
`;
        const expected = `
body {

}
`;
        const path = __dirname + '/virtual-file.scss';
        vi.spyOn(console, 'warn');
        expect(plugin.transform(source, path)?.code).toEqual(expected);
        expect(console.warn).toHaveBeenCalledTimes(1);
    });
}); 