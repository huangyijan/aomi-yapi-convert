import typescript from 'rollup-plugin-typescript2'

const override = { compilerOptions: { module: 'ESNEXT'}}
export default [
    {
        input: 'src/enter/index.ts',
        output: [
            {
                file: 'dist/update.js',
                format: 'cjs',
                banner: '#!/usr/bin/env node'
            }
        ],
        plugins: [
            typescript({
                tsconfigOverride: override
            }),

        ]
    },
    {
        input: 'typings/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs'
            }
        ],
        plugins: [
            typescript({
                tsconfigOverride: override
            }),

        ]
    }
]