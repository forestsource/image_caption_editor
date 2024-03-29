module.exports = {
  locales: ['en', 'ja'],
  sort: true,
  createOldCatalogs: false,
  defaultNamespace:"translation",
  output: 'src/i18n/$LOCALE.json',
  lexers: {
    tsx: ['JsxLexer'],
  },
  input: "src/**/*.tsx",
}