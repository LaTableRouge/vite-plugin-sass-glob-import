# vite-plugin-sass-glob-import

‼️‼️‼️‼️‼️ This is a fork of the https://github.com/cmalven/vite-plugin-sass-glob-import repository ‼️‼️‼️‼️‼️

> Use glob syntax for @import, @use, or @include meta.load-css() in your main Sass or SCSS file.

## Introduction

`vite-plugin-sass-glob-import` is a Vite plugin that allows you to use glob patterns in your Sass or SCSS files. This simplifies the process of importing multiple files, making your stylesheets more modular and easier to maintain.

## Install

```shell
npm i -D @mlnop/vite-plugin-sass-glob-import
```

## Configuration

Add the plugin to your Vite configuration file. You can customize the namespace for `@use` imports if needed.

```js
// In vite.config.js

import {defineConfig} from "vite";
import sassGlobImports from "vite-plugin-sass-glob-import";

export default defineConfig({
  plugins: [
    sassGlobImports(), // Basic usage without namespace
  ],
});
```

### With Namespace

```js
// In vite.config.js

import {defineConfig} from "vite";
import sassGlobImports from "vite-plugin-sass-glob-import";

export default defineConfig({
  plugins: [
    sassGlobImports({
      namespace: "*", // Use a wildcard namespace
    }),
  ],
});
```

### Custom Namespace Function

```js
// In vite.config.js

import {defineConfig} from "vite";
import sassGlobImports from "vite-plugin-sass-glob-import";

export default defineConfig({
  plugins: [
    sassGlobImports({
      namespace(filepath, index) {
        const fileParts = filepath.replace(".scss", "").split("/");
        return `${fileParts.at(-4)}-${fileParts.at(-3)}`; // Custom namespace logic
      },
    }),
  ],
});
```

## Usage

**Note:** Globbing only works in a top-level file, not within referenced files.

```scss
// In src/styles/main.scss

@use "vars/**/*.scss";

@use "vars/**/_foo.scss";

@import "utils/**/*.scss";
@import "objects/**/*.scss";

.your-class {
  @include meta.load-css("vars/**/*.scss");
}
```

The above will be transformed into something like the following before Vite processes it with Sass (It will be different depending on the config you've made in the vite.config.js):

```scss
@use "vars/var-a.scss";
@use "vars/var-b.scss";

// Depending on your namespace settings
@use "vars/component1/foo.scss" as *;
@use "vars/component2/foo.scss" as *;
@use "vars/component1/foo.scss" as "component1-foo";
@use "vars/component2/foo.scss" as "component2-foo";

@import "utils/utils-a.scss";
@import "utils/utils-b.scss";
@import "objects/objects-a.scss";
@import "objects/objects-b.scss";
@import "objects/objects-c.scss";

.your-class {
  @include meta.load-css("vars/var-a.scss");
  @include meta.load-css("vars/var-b.scss");
}
```

## Caveats

This plugin is intentionally simple and doesn't attempt to support every feature offered by Vite. If your use-case isn't similar to the examples in the README above, it probably isn't supported by this plugin.
