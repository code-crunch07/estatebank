# Gordita Font Files

This directory should contain the Gordita font files from The Designers Foundry.

## Required Font Files

Place the following font files in this directory:

- `Gordita-Regular.woff2` (or `.woff` / `.otf`)
- `Gordita-RegularItalic.woff2` (or `.woff` / `.otf`)
- `Gordita-Light.woff2` (or `.woff` / `.otf`)
- `Gordita-Medium.woff2` (or `.woff` / `.otf`)
- `Gordita-Bold.woff2` (or `.woff` / `.otf`)
- `Gordita-BoldItalic.woff2` (or `.woff` / `.otf`)

## Where to Purchase

Gordita is a premium font available from:
- **The Designers Foundry**: https://www.thedesignersfoundry.com/fonts/gordita
- Other authorized distributors

## License

Make sure you have the appropriate web font license for using Gordita on your website.

## Format Priority

The CSS will try to load fonts in this order:
1. `.woff2` (best compression, modern browsers)
2. `.woff` (good compression, wider browser support)
3. `.otf` (fallback)

If you only have one format, update the `@font-face` declarations in `app/globals.css` accordingly.
