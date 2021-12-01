/**
 * This build step is necessary for now as NEXE doesn't support ESM loading. So
 * we need to manually copy the js bundle into the installation directory for
 * the exe to see it
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const pkg = require('./../package.json');

fs.copyFileSync(
    './_build/webpack.bundle.cjs',
    `./_dist/${pkg.name}/required/webpack.bundle.cjs`
);
