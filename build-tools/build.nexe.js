const { compile } = require('nexe');
const pkg = require('../package.json');

let clean = process.argv.slice(2)[0] === 'clean' ? true : false;

compile({
    input: './webpack.bundle.js',
    //{{INJECT_START:PKG}}
    output: `../_dist/voicemeeter-windows-volume/required/VMWV.exe`,
    rc: {
        CompanyName: 'Frosthaven'
    },
//{{INJECT_END:PKG}}
    build: true, //required to use patches
    resources: [],
    ico: './src/assets/app-default.ico',
    cwd: './_build',
    clean: clean,
    enableNodeCli: true,
    verbose: true,
}).then(() => {
    console.log('success');
});
