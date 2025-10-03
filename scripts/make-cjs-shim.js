import { writeFileSync } from "node:fs";

const shim = `module.exports = require("./index.js");\n`;
writeFileSync("./dist/index.cjs", shim);
