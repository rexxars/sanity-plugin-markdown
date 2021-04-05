# ⚠️ Moved to new organization

Go to https://github.com/sanity-io/sanity-plugin-markdown for the new version!


# sanity-plugin-markdown

Markdown input component and schema type for [Sanity](https://www.sanity.io/)

[![npm version](https://img.shields.io/npm/v/sanity-plugin-markdown.svg?style=flat-square)](http://browsenpm.org/package/sanity-plugin-markdown)

## Installing

In your Sanity studio folder, run:

```
sanity install markdown
```

## Features

- Auto-growing input area
- Preview mode
- Keyboard shortcuts for formatting

## Basic usage

**TL;DR:** Just use `type: 'markdown'` on a field in your schema!

**Long version:** In your schema definitions (think `schemas/blogPost.js`):

```js
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // ... other fields ...
    {
      name: 'body',
      title: 'Body',
      type: 'markdown',
      options: {
        minRows: 20
      }
    }
  ]
}
```

## Options

- `editorClassName` - _string_ The class name to use for the editor.
- `minRows` - _number_ Minimum number of rows to show for the text area input (default: `10`)
- `autoGrow` - _boolean_ Whether or not to automatically grow the text area on input (default: `true`)
- `usePreview` - _boolean_ Whether or not to use the preview functionality (default: `true`)
- `previewOptions` - _object_ Object of props passed to [react-markdown](https://github.com/rexxars/react-markdown) for rendering (default: `{skipHtml: true}`)
- `renderPreview` - _function_ React component used to render Markdown preview (default: [react-markdown](https://github.com/rexxars/react-markdown))
  - **Looking to render full-blown HTML?** You may import `sanity-plugin-markdown/html-preview` for a renderer that parses HTML. **Be careful**, input is not filtered.

## Default option values

See options table. Can be retrieved programatically from the `defaultOptions` property on the input:

```js
import MarkdownInput from 'sanity-plugin-markdown'

console.log(defaultOptions)
```

## Keyboard shortcuts

Based on GitHub + Google Docs keyboard shortcuts.

Mac:

| Key                                          | Action                    |
| -------------------------------------------- | ------------------------- |
| <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>P</kbd>   | Toggle write/preview mode |
| <kbd>⌘</kbd> + <kbd>B</kbd>                  | Toggle bold               |
| <kbd>⌘</kbd> + <kbd>I</kbd>                  | Toggle italic             |
| <kbd>⌘</kbd> + <kbd>K</kbd>                  | Toggle link               |
| <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>7</kbd>   | Toggle ordered list       |
| <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>8</kbd>   | Toggle unordered list     |
| <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>7</kbd>   | Toggle ordered list       |
| <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>1-5</kbd> | Toggle heading            |

Window/Linux:

| Key                                            | Action                    |
| ---------------------------------------------- | ------------------------- |
| <kbd>⌃</kbd> + <kbd>⇧</kbd> + <kbd>P</kbd>     | Toggle write/preview mode |
| <kbd>⌃</kbd> + <kbd>B</kbd>                    | Toggle bold               |
| <kbd>⌃</kbd> + <kbd>I</kbd>                    | Toggle italic             |
| <kbd>⌃</kbd> + <kbd>K</kbd>                    | Toggle link               |
| <kbd>⌃</kbd> + <kbd>⇧</kbd> + <kbd>7</kbd>     | Toggle ordered list       |
| <kbd>⌃</kbd> + <kbd>⇧</kbd> + <kbd>8</kbd>     | Toggle unordered list     |
| <kbd>⌃</kbd> + <kbd>⇧</kbd> + <kbd>7</kbd>     | Toggle ordered list       |
| <kbd>⌃</kbd> + <kbd>Alt</kbd> + <kbd>1-5</kbd> | Toggle heading            |

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
