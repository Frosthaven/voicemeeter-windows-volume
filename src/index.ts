/**
 * main entry point for voicemeeter-windows-volume
 */

// imports *********************************************************************
// *****************************************************************************

import { init } from './lib/lifecycle';

// main ************************************************************************
// *****************************************************************************

// we wrap our main logic in an init function to provide async/await support
init();
