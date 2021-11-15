const fs = require('fs');
const path = require('path');
const os = require('os');
let pkg = require('./../package.json');

let pattern =
    /({{INJECT_(?:START):(.*)}})([\s\S]*)(;|\/\/|\#)({{INJECT_(?:END):(\2)}})/g;

Number.prototype.padLeft = function (base, chr) {
    let len = String(base || 10).length - String(this).length + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
};

const injector = (file, sectionHandler) => {
    let newChanges = false;
    let fileContents = fs.readFileSync(path.normalize(file)).toString();
    let matches = fileContents.matchAll(pattern);
    let newFileContents = fileContents;
    if (matches) {
        for (const match of matches) {
            // build out matching groups
            let component = {
                full: match[0],
                start: match[1],
                name: match[2],
                body: match[3],
                syntax: match[4],
                end: match[5],
            };

            // replace matching group
            let newSectionBody = sectionHandler(component.name).join(os.EOL);
            let newComponent =
                component.start +
                os.EOL +
                newSectionBody +
                os.EOL +
                component.syntax +
                component.end;

            if (newComponent !== component.full) {
                newChanges = true;
                newFileContents = newFileContents.replace(
                    component.full,
                    newComponent
                );
            }
        }

        // done @todo make sure things change before writing...
        if (newChanges) {
            try {
                fs.writeFileSync(file, newFileContents);
                console.log(
                    '\x1b[32m',
                    '    ✔ ',
                    '\x1b[32m',
                    `${file}`,
                    '\x1b[0m'
                );
            } catch (e) {
                console.log(os.EOL);
                console.log(
                    '\x1b[31m',
                    '    ✖ ',
                    '\x1b[31m',
                    `${file}`,
                    '\x1b[0m'
                );
                console.log(os.EOL);
                console.log(e);
            }
        } else {
            console.log('\x1b[32m', '    ✔ ', '\x1b[0m', `${file}`, '\x1b[0m');
        }
    }
};

injector('./src/lib/strings.js', (section_name) => {
    switch (section_name) {
        case 'PKG':
            return [
                `const STRING_METADATA = {`,
                `    name: '${pkg.name}',`,
                `    friendlyname: '${pkg.friendlyName}',`,
                `    version: '${pkg.version}',`,
                `};`,
            ];
    }
});

injector('./build-tools/build.installer.nsi', (section_name) => {
    switch (section_name) {
        case 'PKG':
            return [
                `OutFile "../_dist/Install_${pkg.name}_v${pkg.version}_${os.arch}.exe"`,
                `!define PRODUCT_NAME "${pkg.friendlyName}"`,
                `!define PACKAGE_NAME "${pkg.name}"`,
                `!define PRODUCT_DESCRIPTION "${pkg.description}"`,
                `!define PRODUCT_VERSION "${pkg.version}"`,
                `!define SETUP_VERSION ${pkg.version}`,
                `!define MUI_TEXT_WELCOME_INFO_TEXT "This will guide you through the installation of ${pkg.friendlyName} v${pkg.version}.$\\r$\\n$\\r$\\nClick Next to continue."`,
                `Name "${pkg.friendlyName}"`,
                `BrandingText "${pkg.friendlyName} v${pkg.version}"`,
                `InstallDir "$PROGRAMFILES\\${pkg.friendlyName}"`,
                `InstallDirRegKey HKCU "Software\\${pkg.friendlyName}" ""`,
            ];
        case 'UNINSTALLER':
            return [
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "Publisher" "${pkg.author}"`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayName" "${pkg.friendlyName}"`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayVersion" ${pkg.version}`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayIcon" "$INSTDIR\\required\\app-engine.exe,0"`,
            ];
    }
});

console.log('');
