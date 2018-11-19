import * as path from 'path'
import typescript from 'rollup-plugin-typescript'

function bundle(input, name) {
  return {
    input: `./src/${input}`,
    output: {
      file: `./dist-umd/${input}.js`,
      format: 'umd',
      name,
      globals: {
        lodash: '_',
        baconjs: 'Bacon',
        jquery: 'jQuery',
        [path.resolve(__dirname, 'src/annotations-rendering')]: 'annotationsRendering'
      }
    },
    external: ['lodash', 'baconjs', 'jquery', './annotations-rendering'],
    plugins: [typescript({ target: 'es5', include: ['src/*.js', 'src/*.ts'] })],
    watch: {
      include: ['src/*.js', 'src/*.ts'],
      clearScreen: false
    }
  }
}

export default [
  bundle('annotations-rendering', 'annotationsRendering'),
  bundle('annotations-editing', 'annotationsEditing')
]
