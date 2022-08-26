import typescript from 'rollup-plugin-typescript2'

const override = { compilerOptions: { module: 'ESNEXT' } }
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
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/yapi.js',
                format: 'es',
                name: 'yapi'
            }
        ],
        plugins: [
            typescript({
                tsconfigOverride: override
            }),

        ]
    },
    {
        input: 'src/index.ts', // 加一个空的配置，方便让index.d.ts发挥作用并且不报错
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