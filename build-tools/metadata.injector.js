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
    var d = new Date(),
        dformat =
            [
                (d.getMonth() + 1).padLeft(),
                d.getDate().padLeft(),
                d.getFullYear(),
            ].join('/') +
            ' ' +
            [
                d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft(),
            ].join(':');
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
            let newSectionBody = sectionHandler(component.name).join('\r\n');
            newFileContents = newFileContents.replace(
                component.full,
                component.start +
                    ` Injected ${dformat} \r\n` +
                    newSectionBody +
                    '\r\n' +
                    component.syntax +
                    component.end
            );
        }

        // done
        fs.writeFileSync(file, newFileContents, 'utf8');
        console.log('\x1b[32m', '    √ ', '\x1b[35m', `${file}`, '\x1b[0m');
    }
};

injector('./src/lib/strings.js', (section_name) => {
    switch (section_name) {
        case 'PKG':
            return [
                `const STRING_METADATA = {`,
                `    name: '${pkg.name}',`,
                `    friendlyname: '${pkg.friendly_name}',`,
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
                `!define PRODUCT_NAME "${pkg.friendly_name}"`,
                `!define PACKAGE_NAME "${pkg.name}"`,
                `!define PRODUCT_DESCRIPTION "${pkg.description}"`,
                `!define PRODUCT_VERSION "${pkg.version}"`,
                `!define SETUP_VERSION ${pkg.version}`,
                `!define MUI_TEXT_WELCOME_INFO_TEXT "This will guide you through the installation of ${pkg.friendly_name} v${pkg.version}.$\\r$\\n$\\r$\\nClick Next to continue."`,
                `Name "${pkg.friendly_name}"`,
                `BrandingText "${pkg.friendly_name} v${pkg.version}"`,
                `InstallDir "$PROGRAMFILES\\${pkg.friendly_name}"`,
                `InstallDirRegKey HKCU "Software\\${pkg.friendly_name}" ""`,
            ];
        case 'UNINSTALLER':
            return [
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "Publisher" "${pkg.author}"`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayName" "${pkg.friendly_name}"`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayVersion" ${pkg.version}`,
                `    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\$\{PRODUCT_NAME\}\" "DisplayIcon" "$INSTDIR\\required\\app-engine.exe,0"`,
            ];
    }
});

console.log('');
