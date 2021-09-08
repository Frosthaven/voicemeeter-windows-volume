const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('../package.json');

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
    'win-audio',
];
hard_copy_modules.forEach((module) => {
    hard_copy.push({
        from: `./node_modules/${module}`,
        to: `../_dist/required/node_modules/${module}`,
    });
});

// we also hard copy assets necessary to complete the project
hard_copy.push({
    from: './src/assets',
    to: '../_dist/required/assets',
});
hard_copy.push({
    from: './build-tools/include/app-launcher.vbs',
    to: `../_dist/${pkg.name}.vbs`,
});

/// WEBPACK CONFIG *************************************************************
//******************************************************************************
module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: './src/index.js',
    output: {
        path: path.resolve('./_build'),
        filename: 'webpack.bundle.js',
    },
    target: 'node',
    externalsPresets: { node: true },
    externals: [nodeExternals()],

    mode: 'production',
    module: {
        rules: [
            { test: /\.node$/, use: 'node-loader' },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
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
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: true,
                },
            }),
        ],
    },
};
