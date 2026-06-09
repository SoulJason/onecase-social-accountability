// Flat ESLint config using Expo's shared rules.
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["dist/*", "legacy/*", "node_modules/*", ".expo/*"],
  },
];
