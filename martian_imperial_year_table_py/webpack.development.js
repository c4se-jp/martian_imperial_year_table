"use static";

const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
});
