import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: !isProduction
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: !isProduction
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist'
    }),
    ...(isProduction
      ? [
          terser({
            compress: {
              passes: 2
            },
            format: {
              comments: false
            }
          })
        ]
      : [])
  ]
}
