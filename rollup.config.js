import babel from "rollup-plugin-babel";

export default {
  input: "dist/index.js",
  output: [
    {
      file: "dist/index.node.js",
      format: "cjs"
    }
  ],
  plugins: [babel()]
};
