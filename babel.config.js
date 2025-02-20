module.exports = {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }], // Transpile for the current Node version
      '@babel/preset-react',  // Transpile JSX
    ],
  };