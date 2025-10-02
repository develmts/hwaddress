// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    globals: true,
    bail: 0,
    coverage: {
      provider: "v8",                     // nadiu (no cal nyc/c8)
      reportsDirectory: "coverage",       // carpeta de sortida
      reporter: ["text", "html", "lcov"], // consola + informe HTML + lcov
      all: true,                          // mesura encara que no s’hagin importat
      include: ["src/**/*.{ts,js}"],      // arxius a mesurar
      exclude: [
        "tests/**",
        "dist/**",
        "old/**",
        "**/*.d.ts"
      ],
      thresholds: {
        lines: 80,
        functions: 80, 
        branches: 80, 
        statements: 80 ,
        perFile: true
      }
    }    
  }
});
