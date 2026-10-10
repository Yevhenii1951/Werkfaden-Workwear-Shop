module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true, decorators: true },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  testMatch: ["**/src/**/__tests__/**/*.unit.spec.[jt]s?(x)"],
  moduleNameMapper: {
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
}
