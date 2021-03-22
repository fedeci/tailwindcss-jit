const postcss = require('postcss')
const tailwind = require('../src/index.js')
const fs = require('fs')
const path = require('path')

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: path.resolve(__filename) })
}

test('important boolean', () => {
  let config = {
    important: false,
    darkMode: 'class',
    purge: [path.resolve(__dirname, './11-important-modifier.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [],
  }

  let css = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './11-important-modifier.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchCss(expected)
  })
})
