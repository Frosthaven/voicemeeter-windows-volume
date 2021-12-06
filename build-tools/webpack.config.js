import path from 'path';
import nodeExternals from 'webpack-node-externals';
import CopyPlugin from 'copy-webpack-plugin';
import os from 'os';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const pkg = require('./../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/// PRE-CONFIG *****************************************************************
//******************************************************************************
// we hard copy all node_modules that we can't bundle into the executable for
// one reason or another
let hard_copy = [];

const hard_copy_modules = [
    'ffi-napi',
    'ref-napi',
    'ref-array-napi',
    'systray2',
    'voicemeeter-connector',
];
hard_copy_modules.forEach((module) => {
    hard_copy.push({
        from: `./node_modules/${module}`,
        to: `../_dist/${pkg.name}/required/node_modules/${module}`,
    });
});

// we also hard copy assets necessary to complete the project
hard_copy.push({
    from: './src/assets',
    to: `../_dist/${pkg.name}/required/assets`,
});
hard_copy.push({
    from: './build-tools/include/app-launcher.vbs',
    to: `../_dist/${pkg.name}/app-launcher.vbs`,
});

/// WEBPACK CONFIG *************************************************************
//******************************************************************************

export default (env) => {
    let mode = env.development ? 'development' : 'production';
    console.log(
        os.EOL + '\x1b[34mi',
        '\x1b[0mWebpack configured for \x1b[34m' + mode + '\x1b[0m' + os.EOL
    );
    return {
        context: path.resolve(__dirname, '../'),
        entry: './src/index.ts',
        output: {
            path: path.resolve('./_build'),
            filename: 'webpack.bundle.cjs',
        },
        target: 'node',
        externalsPresets: { node: true },
        externals: [nodeExternals()],
        mode: mode,
        devtool: 'source-map',
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: path.resolve(
                                    __dirname,
                                    '../tsconfig.json'
                                ),
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                { test: /\.node$/, use: 'node-loader' },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/typescript', '@babel/preset-env'],
                            plugins: ['@babel/transform-runtime'],
                        },
                    },
                },
            ],
        },
        plugins: [
            new CopyPlugin({
                patterns: hard_copy,
                options: {
                    concurrency: 100,
                },
            }),
        ],
        optimization: {
            minimize: mode === 'production' ? true : false,
        },
    };
};
