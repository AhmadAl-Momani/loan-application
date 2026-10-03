module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['airbnb', 'airbnb/hooks', 'plugin:jsx-a11y/recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { 'import/resolver': { node: { extensions: ['.js', '.jsx'] } } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'react/function-component-definition': 'off',
    'import/extensions': ['error', 'ignorePackages', { js: 'always', jsx: 'always' }],
    'import/prefer-default-export': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
};
