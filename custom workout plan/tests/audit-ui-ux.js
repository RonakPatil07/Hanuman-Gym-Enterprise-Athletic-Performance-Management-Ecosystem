/**
 * ==============================================================================
 * HANUMAN GYM — UI/UX ARCHITECTURAL AUDIT & JS DEPENDENCY MAPPER
 * Scans all stylesheets and templates for token alignment, easing curves,
 * 12-column grid compliance, and maps all JS DOM selectors.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');

function getFiles(dir, ext) {
    let res = [];
    if (!fs.existsSync(dir)) return res;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git' && e.name !== 'vendor') {
            res = res.concat(getFiles(p, ext));
        } else if (e.isFile() && (!ext || e.name.endsWith(ext))) {
            res.push(p);
        }
    });
    return res;
}

// -----------------------------------------------------------------------------
// 1. JS DOM SELECTOR DEPENDENCY MAP
// -----------------------------------------------------------------------------
const jsFiles = getFiles(root, '.js');
const idDeps = new Set();
const classDeps = new Set();
const dataAttrDeps = new Set();

jsFiles.forEach(f => {
    if (f.includes('tests\\') || f.includes('tests/')) return;
    const code = fs.readFileSync(f, 'utf8');

    // getElementById
    const idRegex = /getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    let m;
    while ((m = idRegex.exec(code)) !== null) {
        idDeps.add(m[1]);
    }

    // querySelector / querySelectorAll
    const qsRegex = /querySelector(?:All)?\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((m = qsRegex.exec(code)) !== null) {
        const sel = m[1];
        // extract IDs
        const ids = sel.match(/#([a-zA-Z0-9_-]+)/g);
        if (ids) ids.forEach(id => idDeps.add(id.replace('#', '')));

        // extract classes
        const classes = sel.match(/\.([a-zA-Z0-9_-]+)/g);
        if (classes) classes.forEach(c => classDeps.add(c.replace('.', '')));

        // extract data attrs
        const attrs = sel.match(/\[([a-zA-Z0-9_-]+)/g);
        if (attrs) attrs.forEach(a => dataAttrDeps.add(a.replace('[', '')));
    }

    // classList.add / remove / toggle / contains
    const clRegex = /classList\.(?:add|remove|toggle|contains)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((m = clRegex.exec(code)) !== null) {
        classDeps.add(m[1]);
    }

    // getAttribute('data-...')
    const gaRegex = /getAttribute\s*\(\s*['"`](data-[^'"`]+)['"`]\s*\)/g;
    while ((m = gaRegex.exec(code)) !== null) {
        dataAttrDeps.add(m[1]);
    }
});

// -----------------------------------------------------------------------------
// 2. CSS TOKEN & EASING AUDIT
// -----------------------------------------------------------------------------
const cssFiles = getFiles(root, '.css');

const auditResults = {
    totalCssFiles: cssFiles.length,
    canonicalTokens: {
        '--onyx-base': '#0A0D14',
        '--onyx-elevated': '#0D111A',
        '--gold-primary': '#B3DD24',
        '--gold-secondary': '#F59E0B',
        '--cyan-accent': '#38BDF8',
        '--crimson-alert': '#EF4444',
        '--ease-canonical': 'cubic-bezier(0.16, 1, 0.3, 1)'
    },
    files: []
};

cssFiles.forEach(f => {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const content = fs.readFileSync(f, 'utf8');

    // Easing curves
    const easings = content.match(/cubic-bezier\([^)]+\)|ease-in-out|ease-in|ease-out|\bease\b|\blinear\b/g) || [];
    const nonCanonicalEasings = easings.filter(e => e !== 'cubic-bezier(0.16, 1, 0.3, 1)');

    // Hardcoded color occurrences
    const hexColors = content.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g) || [];
    const rgbColors = content.match(/rgba?\([^)]+\)/g) || [];
    const hslColors = content.match(/hsla?\([^)]+\)/g) || [];

    // Blur filters
    const blurs = content.match(/blur\([^)]+\)/g) || [];

    // Shadow declarations
    const shadows = content.match(/box-shadow:[^;]+|drop-shadow\([^)]+\)/g) || [];

    // Layout systems
    const has12ColGrid = /grid-template-columns:\s*repeat\(12,/i.test(content) || /--grid-12/.test(content);
    const gridCount = (content.match(/display:\s*grid/gi) || []).length;
    const flexCount = (content.match(/display:\s*flex/gi) || []).length;

    auditResults.files.push({
        file: rel,
        lines: content.split('\n').length,
        totalColors: hexColors.length + rgbColors.length + hslColors.length,
        easingsTotal: easings.length,
        nonCanonicalEasingsCount: nonCanonicalEasings.length,
        uniqueEasings: [...new Set(easings)],
        blursCount: blurs.length,
        uniqueBlurs: [...new Set(blurs)],
        shadowsCount: shadows.length,
        has12ColGrid,
        gridCount,
        flexCount
    });
});

console.log('================================================================================');
console.log('       HANUMAN GYM — UI/UX ARCHITECTURAL AUDIT REPORT');
console.log('================================================================================');
console.log(`Audited ${auditResults.files.length} CSS stylesheets across all project modules.\n`);

console.log('1. Easing Curves & Motion Drift Summary:');
auditResults.files.forEach(item => {
    if (item.easingsTotal > 0) {
        console.log(` - [${item.file}] (Lines: ${item.lines})`);
        console.log(`   Easings: ${item.easingsTotal} total (${item.nonCanonicalEasingsCount} non-canonical)`);
        console.log(`   Variants: ${item.uniqueEasings.join(', ')}`);
    }
});

console.log('\n2. 12-Column Grid vs Flex/Ad-Hoc Layout Summary:');
auditResults.files.forEach(item => {
    console.log(` - [${item.file}]: 12-Col Grid: ${item.has12ColGrid ? 'YES' : 'NO (Ad-hoc/Flex: ' + item.flexCount + ' flex, ' + item.gridCount + ' grid)'}`);
});

console.log('\n3. JS Protected Selector Map Summary:');
console.log(` - Protected Element IDs: ${idDeps.size}`);
console.log(` - Protected CSS Classes: ${classDeps.size}`);
console.log(` - Protected Data Attributes: ${dataAttrDeps.size}`);

// Write JSON artifacts
fs.writeFileSync(path.resolve(__dirname, 'ui-ux-audit-results.json'), JSON.stringify(auditResults, null, 2));
fs.writeFileSync(path.resolve(__dirname, 'js-dependency-map.json'), JSON.stringify({
    ids: Array.from(idDeps).sort(),
    classes: Array.from(classDeps).sort(),
    dataAttributes: Array.from(dataAttrDeps).sort()
}, null, 2));

console.log('\nDetailed JSON maps written to custom workout plan/tests/ui-ux-audit-results.json and js-dependency-map.json.');
