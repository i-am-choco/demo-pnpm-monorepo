import { readFileSync } from "node:fs";

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
const pkg = JSON.parse(readFileSync("./package.json"));

export default [
  {
    external: [
      "react",
      "react-dom",
      "dayjs",
      "reactflow",
      "dagre",
      "antd",
      "@ant-design/icons",
    ],
    input: "./src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
      }),
      postcss(),
    ],
    watch: {
      buildDelay: 500,
    },
  },
  {
    input: "./dist/esm/index.d.ts",
    output: [{ file: "./dist/index.d.ts", format: "esm" }],
    plugins: [
      dts(),
      del({
        targets: ["dist/esm/demo", "dist/cjs/demo"],
      }),
    ],
    external: [/\.(css|less|scss)$/],
  },
];
