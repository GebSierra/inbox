// Playwright loader shared by the tools: uses the globally installed `playwright` (or a local node_modules copy).
import { createRequire } from 'module'; import fs from 'fs';
const req = createRequire(import.meta.url);
export const { chromium } = (() => { for (const m of ['playwright', 'playwright-core']) { try { return req(m); } catch (e) {} } throw new Error('playwright not found'); })();
// Launch args for software GL (headless, no GPU). Uses system Chrome when present, else playwright's own Chromium.
export const launchOpts = (extra = []) => ({ ...(fs.existsSync('/usr/bin/google-chrome') ? { executablePath: '/usr/bin/google-chrome' } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...extra] });
