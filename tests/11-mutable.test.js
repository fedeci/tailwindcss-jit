const postcss = require('postcss')
const tailwind = require('../src/index.js')
const fs = require('fs')
const path = require('path')

function pluginThatMutatesRules() {
  return (root) => {
    root.walkRules((rule) => {
      rule.nodes.filter(node => node.prop === 'background-image').forEach(node => {
        node.value = 'url("./bar.png")'
      })

      return rule
    })
  }
}

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: path.resolve(__filename) })
}

test.only('plugins mutating rules after tailwind doesnt break it', async () => {
  let config = {
    purge: [path.resolve(__dirname, './11-mutable.test.html')],
    theme: {
      backgroundImage: {
        'foo': 'url("./foo.png")',
      }
    },
    plugins: [],
  }

  let css = `@tailwind utilities;`

  function checkResult(result) {
    let expectedPath = path.resolve(__dirname, './11-mutable.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchCss(expected)
  }

  // Verify the first run produces the expected result
  let firstRun = await run(css, config)
  checkResult(firstRun)

  // Outside of the context of tailwind jit more postcss plugins may operate on the AST:
  // In this case we have a plugin that mutates rules directly
  await postcss([ pluginThatMutatesRules() ]).process(firstRun, { from: path.resolve(__filename) })

  // Verify subsequent runs don't produce mutated rules
  let secondRun = await run(css, config)
  checkResult(secondRun)
})
