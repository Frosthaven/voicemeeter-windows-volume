const { compile } = require('nexe');
const pkg = require('../package.json');

let clean = process.argv.slice(2)[0] === 'clean' ? true : false;

compile({
    input: './webpack.bundle.js',
    output: '../_dist/required/app-engine.exe',
    build: true, //required to use patches
    resources: [],
    ico: './src/assets/app.ico',
    cwd: './_build',
    clean: clean,
    enableNodeCli: true,
    verbose: true,
    rc: {
        CompanyName: 'Frosthaven',
    },
}).then(() => {
    console.log('success');
});
