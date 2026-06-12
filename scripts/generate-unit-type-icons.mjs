/**
 * Generate transparent PNG pictograms for each unit type.
 * The shapes are intentionally generic silhouettes, not historical vehicle profiles.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public/images/unit-types');
const natoOutDir = join(outDir, 'nato');
const tmpDir = join(process.cwd(), 'node_modules/.tmp/unit-type-icons');
mkdirSync(outDir, { recursive: true });
mkdirSync(natoOutDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const common = {
  fill: '#f3f0df',
  stroke: '#171a18',
  accent: '#a9b58d',
};

function svg(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none"/>
  <g fill="${common.fill}" stroke="${common.stroke}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
    ${body}
  </g>
</svg>`;
}

function natoSvg(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none"/>
  <g fill="none" stroke="#151713" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <rect x="78" y="146" width="356" height="220" rx="8" fill="#f3f0df"/>
    ${body}
  </g>
</svg>`;
}

function wheels(count, startX, y, gap, radius = 22) {
  return Array.from({ length: count }, (_, index) => `<circle cx="${startX + index * gap}" cy="${y}" r="${radius}"/>`).join('\n');
}

function trackedHull(top = 286, bottom = 362) {
  return `
    <path d="M98 ${bottom}h284c34 0 58-21 58-49s-24-49-58-49H130c-46 0-78 21-78 49s32 49 46 49z"/>
    <path d="M118 ${top + 20}h256l42 36-46 38H104l-42-38z"/>
    ${wheels(6, 138, 327, 45, 18)}
  `;
}

const icons = {
  infantry: svg(`
    <circle cx="158" cy="150" r="34"/>
    <circle cx="256" cy="126" r="38"/>
    <circle cx="354" cy="150" r="34"/>
    <path d="M116 342l28-112h28l24 112z"/>
    <path d="M208 354l32-142h32l32 142z"/>
    <path d="M316 342l24-112h28l28 112z"/>
    <path d="M132 250h52"/>
    <path d="M226 230h60"/>
    <path d="M328 250h52"/>
  `),
  tank: svg(`
    ${trackedHull()}
    <path d="M190 230h128l38 38H162z"/>
    <path d="M332 250h112"/>
    <path d="M82 386h348"/>
  `),
  'tank-destroyer': svg(`
    ${trackedHull()}
    <path d="M164 246h166l44 44H132z"/>
    <path d="M348 262h118"/>
    <path d="M92 386h328"/>
  `),
  'assault-gun': svg(`
    ${trackedHull()}
    <path d="M150 252h172l36 44H124z"/>
    <path d="M330 276h84"/>
    <path d="M92 386h328"/>
  `),
  'sp-artillery': svg(`
    ${trackedHull()}
    <path d="M150 254h164l34 42H124z"/>
    <path d="M314 250l106-78"/>
    <path d="M92 386h328"/>
  `),
  'sp-anti-aircraft': svg(`
    ${trackedHull()}
    <path d="M178 252h132l36 40H144z"/>
    <path d="M264 248l70-92"/>
    <path d="M294 252l82-82"/>
    <path d="M92 386h328"/>
  `),
  mechanised: svg(`
    <path d="M86 338h296c30 0 54-22 54-50v-40c0-28-24-50-54-50H246l-58-56h-82v196z"/>
    <path d="M106 198h122"/>
    <path d="M250 198l50 60h122"/>
    ${wheels(5, 138, 338, 58, 20)}
    <path d="M88 380h346"/>
  `),
  motorised: svg(`
    <path d="M86 336h286c30 0 54-24 54-54v-34l-46-70h-96v70H86z"/>
    <path d="M104 172h160v76H104z"/>
    <path d="M312 196h48l32 52h-80z"/>
    <circle cx="158" cy="338" r="28"/>
    <circle cx="354" cy="338" r="28"/>
    <path d="M90 384h340"/>
  `),
  'towed-artillery': svg(`
    <circle cx="194" cy="326" r="42"/>
    <circle cx="318" cy="326" r="42"/>
    <path d="M176 300h152"/>
    <path d="M252 292l142-98"/>
    <path d="M234 332l-86 78"/>
    <path d="M278 332l86 78"/>
    <path d="M104 410h304"/>
  `),
  'towed-anti-tank': svg(`
    <circle cx="208" cy="330" r="40"/>
    <circle cx="304" cy="330" r="40"/>
    <path d="M164 304h178"/>
    <path d="M274 294h142"/>
    <path d="M236 332l-92 76"/>
    <path d="M276 332l92 76"/>
    <path d="M104 410h304"/>
  `),
  'towed-anti-aircraft': svg(`
    <circle cx="208" cy="334" r="38"/>
    <circle cx="304" cy="334" r="38"/>
    <path d="M168 310h176"/>
    <path d="M248 294l54-138"/>
    <path d="M276 300l86-124"/>
    <path d="M236 338l-86 70"/>
    <path d="M276 338l86 70"/>
    <path d="M104 410h304"/>
  `),
  aircraft: svg(`
    <path d="M256 82l42 162 146 58-16 42-146-30-26 116-26-116-146 30-16-42 146-58z"/>
    <path d="M198 406h116"/>
  `),
};

const natoIcons = {
  infantry: natoSvg(`
    <path d="M100 166l312 180"/>
    <path d="M412 166L100 346"/>
  `),
  tank: natoSvg(`
    <ellipse cx="256" cy="256" rx="104" ry="52"/>
  `),
  'tank-destroyer': natoSvg(`
    <ellipse cx="240" cy="260" rx="94" ry="48"/>
    <path d="M316 250h78"/>
    <path d="M356 220l38 30-38 30"/>
  `),
  'assault-gun': natoSvg(`
    <ellipse cx="234" cy="260" rx="92" ry="46"/>
    <path d="M310 260h86"/>
  `),
  'sp-artillery': natoSvg(`
    <ellipse cx="226" cy="272" rx="82" ry="42"/>
    <circle cx="308" cy="240" r="34"/>
    <path d="M330 218l60-54"/>
  `),
  'sp-anti-aircraft': natoSvg(`
    <ellipse cx="222" cy="278" rx="82" ry="42"/>
    <path d="M292 306l70-122"/>
    <path d="M330 306l64-112"/>
  `),
  mechanised: natoSvg(`
    <path d="M100 166l312 180"/>
    <path d="M412 166L100 346"/>
    <ellipse cx="256" cy="296" rx="86" ry="36"/>
  `),
  motorised: natoSvg(`
    <path d="M100 166l312 180"/>
    <path d="M412 166L100 346"/>
    <circle cx="204" cy="316" r="24"/>
    <circle cx="308" cy="316" r="24"/>
  `),
  'towed-artillery': natoSvg(`
    <circle cx="256" cy="256" r="46"/>
    <path d="M256 302v52"/>
  `),
  'towed-anti-tank': natoSvg(`
    <circle cx="230" cy="264" r="42"/>
    <path d="M272 264h100"/>
    <path d="M334 224l38 40-38 40"/>
  `),
  'towed-anti-aircraft': natoSvg(`
    <circle cx="220" cy="292" r="38"/>
    <path d="M268 324l66-136"/>
    <path d="M306 324l62-126"/>
  `),
  aircraft: natoSvg(`
    <path d="M256 180v152"/>
    <path d="M144 258h224"/>
    <path d="M198 208l58 50 58-50"/>
    <path d="M210 332l46-42 46 42"/>
  `),
};

for (const [name, source] of Object.entries(icons)) {
  const svgPath = join(tmpDir, `${name}.svg`);
  const pngPath = join(outDir, `${name}.png`);
  writeFileSync(svgPath, source);
  execFileSync('convert', ['-background', 'none', svgPath, '-resize', '512x512', pngPath], { stdio: 'inherit' });
}

for (const [name, source] of Object.entries(natoIcons)) {
  const svgPath = join(tmpDir, `nato-${name}.svg`);
  const pngPath = join(natoOutDir, `${name}.png`);
  writeFileSync(svgPath, source);
  execFileSync('convert', ['-background', 'none', svgPath, '-resize', '512x512', pngPath], { stdio: 'inherit' });
}

rmSync(tmpDir, { recursive: true, force: true });
