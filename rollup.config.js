
import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import externals from "rollup-plugin-node-externals";
import typescript from 'rollup-plugin-typescript2';

export default defineConfig([
    {
        input: {
            index: 'src/index.ts', 
        },
        output: [
            {
                dir: 'dist',
                format: 'es', 
            }
        ],
        plugins: [
            nodeResolve(),
            externals({
                devDeps: false, // 可以识别我们 package.json 中的依赖当作外部依赖处理 不会直接将其中引用的方法打包出来
            }),
            typescript(),
            commonjs(),
        ],
    },
]);