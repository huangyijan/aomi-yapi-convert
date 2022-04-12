import typescript from 'rollup-plugin-typescript2';
export default {
  input: 'src/enter/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(/*{ plugin options }*/),

  ]
};