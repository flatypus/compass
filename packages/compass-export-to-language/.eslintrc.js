module.exports = {
  root: true,
  extends: ['@cloud-mongodb-js/eslint-config-compass'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig-lint.json'],
  },
  env: {
    node: true,
    browser: true,
  },
};
