// eslint-disable-next-line no-unused-vars
var require = {
  waitSeconds: 0,
  baseUrl: '..',
  paths: {
    jquery: './node_modules/jquery/dist/jquery.min',
    chai: './node_modules/chai/chai',
    mocha: './node_modules/mocha/mocha',
    bacon: './node_modules/baconjs/dist/Bacon.min',
    lodash: './node_modules/lodash/lodash.min'
  },
  map: {
    '*': {
      baconjs: 'bacon'
    }
  },
  shim: {
    bacon: ['jquery'],
    mocha: {
      exports: 'mocha'
    }
  }
}
