import typescript from 'rollup-plugin-typescript2';
export default {
  input: 'src/saveFile.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript(/*{ plugin options }*/),

  ]
};