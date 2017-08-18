var require = {
  // eslint-disable-line no-unused-vars
  waitSeconds: 0,
  baseUrl: "..",
  paths: {
    jquery: "./node_modules/jquery/dist/jquery.min",
    chai: "./node_modules/chai/chai",
    mocha: "./node_modules/mocha/mocha",
    bacon: "./node_modules/baconjs/dist/Bacon.min",
    lodash: "./node_modules/lodash/index"
  },
  shim: {
    "mocha": {
      exports: "mocha"
    }
  }
}
