const fs = require('fs');
const path = require('path');
const os = require('os');
let pkg = require('./../package.json');

let pattern = /{{INJECT_(?:START):(?:.)*}}([\s\S]*){{INJECT_(?:END):(?:.)*}}/;

let file, fileContents, match, replaceTarget, newContents;

// update app strings with package metadata
file = './src/lib/strings.js';
fileContents = fs.readFileSync(path.normalize(file), 'utf8').toString();
match = fileContents.match(pattern);
if (match) {
    replaceTarget = match[1];
    newContents = fileContents.replace(
        replaceTarget,
        `` +
            `\nconst STRING_METADATA = {` +
            `\n    name: '${pkg.name}',` +
            `\n    friendlyname: '${pkg.friendly_name}',` +
            `\n    version: '${pkg.version}',` +
            `\n};` +
            `\n\/\/`
    );
    fs.writeFileSync(file, newContents, 'utf8');
}

// update nsi installer script with package metadata
file = './build-tools/build.installer.nsi';
fileContents = fs.readFileSync(path.normalize(file)).toString();
match = fileContents.match(pattern);
if (match) {
    replaceTarget = match[1];
    newContents = fileContents.replace(
        replaceTarget,
        `` +
            `\nOutFile "../_dist/Install_${pkg.name}_v${pkg.version}_${os.arch}.exe"` +
            `\n!define PRODUCT_NAME "${pkg.friendly_name}"` +
            `\n!define PACKAGE_NAME "${pkg.name}"` +
            `\n!define PRODUCT_DESCRIPTION "${pkg.description}"` +
            `\n!define PRODUCT_VERSION "${pkg.version}"` +
            `\n!define SETUP_VERSION ${pkg.version}` +
            `\n!define MUI_TEXT_WELCOME_INFO_TEXT "This will guide you through the installation of ${pkg.friendly_name} v${pkg.version}.$\\r$\\n$\\r$\\nClick Next to continue."` +
            `\n` +
            `\nName "${pkg.friendly_name}"` +
            `\nBrandingText "${pkg.friendly_name} v${pkg.version}"` +
            `\n` +
            `\nInstallDir "$PROGRAMFILES\\${pkg.friendly_name}"` +
            `\nInstallDirRegKey HKCU "Software\\${pkg.friendly_name}" ""` +
            `\n;`
    );
    fs.writeFileSync(file, newContents, 'utf8');
}
