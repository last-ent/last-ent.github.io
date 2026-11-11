// Regression harness for files/solchess.html — loads the two inline <script>
// blocks into a DOM-less VM (boot() is skipped because `window` is undefined)
// and exercises the pure core: mainline parse (GTM), full-variation tree
// parse, flatten, navigation helpers, authoring (add/remove ply), and the
// browse PGN export round-trip. Run: node scripts/test-solchess.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../files/solchess.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length !== 2) {
  console.error(`expected 2 inline scripts in solchess.html, found ${scripts.length}`);
  process.exit(1);
}

const ctx = vm.createContext({ console, setTimeout, clearTimeout });
try {
  vm.runInContext(scripts[0], ctx, { filename: 'solchess-engine.js' });
  vm.runInContext(scripts[1], ctx, { filename: 'solchess-app.js' });
} catch (e) {
  console.error('script load failed:', e);
  process.exit(1);
}

let fails = 0;
const ok = (cond, label) => {
  if (cond) { console.log('  ok   ' + label); return; }
  fails++;
  console.error('  FAIL ' + label);
};
const run = (expr) => vm.runInContext(expr, ctx, { filename: 'test-expr.js' });

// ── fixtures ──
const PGN1 = [
  '[Event "Test"]',
  '[White "Alice"]',
  '[Black "Bob"]',
  '[Result "1-0"]',
  '',
  '{An instructive game.} 1. e4 e5 2. Nf3 $14 {main note} (2. f4!? {risky} 2... exf4) 2... Nc6 3. Bb5 1-0',
].join('\n');

const PGN2 = [
  '[Event "T2"]',
  '[White "W"]',
  '[Black "B"]',
  '[Result "*"]',
  '',
  '1. e4 (1. d4 d5 (1... Nf6)) 1... e5',
].join('\n');

console.log('load & globals');
ok(typeof run('parseGameTree') === 'function', 'parseGameTree defined');
ok(typeof run('flattenTree') === 'function', 'flattenTree defined');
ok(typeof run('bAddPly') === 'function', 'bAddPly defined');
ok(typeof run('browsePgnText') === 'function', 'browsePgnText defined');
ok(run('Object.keys(BOARD_THEMES).length') >= 4, 'board themes present');
ok(run('state.boardTheme') === 'wood', 'default board theme (sandbox-safe)');

console.log('GTM mainline parser regression');
run(`globalThis.__g = parsePgn(${JSON.stringify(PGN1)});`);
ok(run('__g.plies.length') === 5, 'GTM parse skips variations (5 mainline plies)');
ok(run('__g.plies[0].preComment') === 'An instructive game.', 'GTM pre-comment intact');
ok(run('__g.plies[2].comment') === 'main note', 'GTM comment attachment intact');
ok(run('__g.error') === null, 'GTM parse error-free');

console.log('tree parse: structure');
run(`globalThis.__t = parseGameTree(${JSON.stringify(PGN1)});`);
ok(run('__t.error') === null, 'tree parse error-free');
ok(run('__t.result') === '1-0', 'result captured');
ok(run('__t.root.children.length') === 1, 'single root continuation');
ok(run('__t.root.children[0].san') === 'e4', 'move 1 = e4');
ok(run('__t.root.children[0].preComment') === 'An instructive game.', 'pre-comment attached');
ok(run('__t.root.children[0].fen') === 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', 'fen after e4');
ok(run('__t.root.children[0].children[0].san') === 'e5', 'continuation e5');
ok(run('__t.root.children[0].children[0].children[0].san') === 'Nf3', 'continuation Nf3');
ok(run('__t.root.children[0].children[0].children[0].comment') === 'main note', 'post comment attached');
ok(run('__t.root.children[0].children[0].children[0].srcEval') === '+=', '$14 → eval glyph');
ok(run('__t.root.children[0].children[0].children[0].children[0].san') === 'Nc6', 'mainline Nc6 after variation');
ok(run('__t.root.children[0].children[0].children[1].san') === 'f4', 'variation alternative f4');
ok(run('__t.root.children[0].children[0].children[1].srcQual') === '!?', 'suffix !? → quality glyph');
ok(run('__t.root.children[0].children[0].children[1].comment') === 'risky', 'variation comment');
ok(run('__t.root.children[0].children[0].children[1].children[0].san') === 'exf4', 'variation continuation exf4');
ok(run('__t.root.children[0].children[0].children[1].children[0].n') === 2, 'variation move number');
ok(run('__t.root.children[0].children[0].children[1].children[0].turn') === 'b', 'variation turn');
ok(run('__t.root.children[0].children[0].children[1].children[0].fen') === 'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', 'variation fen after exf4');
ok(run('__t.root.children[0].children[0].children[0].children[0].children[0].san') === 'Bb5', 'mainline Bb5');
ok(run('__t.root.children[0].children[0].children[0].children[0].children[0].fen') === 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', 'fen after Bb5');

console.log('tree parse: root-level + nested variations');
run(`globalThis.__t2 = parseGameTree(${JSON.stringify(PGN2)});`);
ok(run('__t2.error') === null, 'nested variation parse error-free');
ok(run('__t2.root.children.map(c => c.san).join(",")') === 'e4,d4', 'root-level variation attaches to root (e4,d4)');
ok(run('__t2.root.children[1].children.map(c => c.san).join(",")') === 'd5,Nf6', 'nested variation attaches to d4 (d5,Nf6)');
ok(run('__t2.root.children[1].children[1].n') === 1 && run('__t2.root.children[1].children[1].turn') === 'b', 'Nf6 numbered 1...');
ok(run('__t2.root.children[0].children[0].san') === 'e5', 'mainline resumes e5');
run(`globalThis.__f2 = flattenTree(__t2.root).map(e => e.node.san + "@" + e.depth).join(",");`);
ok(run('__f2') === 'e4@0,d4@1,d5@1,Nf6@2,e5@0', 'co-alternative order: ' + run('__f2'));

console.log('lenient broken variation (mainline unaffected)');
run(`globalThis.__lv = parseGameTree("1. e4 e5 (2... Nf6) 2. Nf3");`);
ok(run('__lv.error') === null, 'broken variation does not flag the game');
ok(run('__lv.root.children[0].children[0].children[0].san') === 'Nf3', 'mainline continues past broken variation');
run(`globalThis.__lm = parseGameTree("1. e4 e5 2. Ke3");`);
ok(run('__lm.error') === 'illegal move "Ke3"', 'broken MAINLINE still flags the error');

console.log('flatten (book render order)');
run('globalThis.__f = flattenTree(__t.root).map(e => e.node.san + "@" + e.depth).join(",");');
ok(run('__f') === 'e4@0,e5@0,Nf3@0,f4@1,exf4@1,Nc6@0,Bb5@0', 'flatten order/depth: ' + run('__f'));

console.log('authoring (pure add/remove)');
run(`
  globalThis.__mv = (from, to) => new Chess().moves({ verbose: true }).find(m => m.from === from && m.to === to) || null;
  globalThis.__mvAt = (fen, from, to) => { const b = new Chess(); b.load(fen); return b.moves({ verbose: true }).find(m => m.from === from && m.to === to) || null; };
  globalThis.__a = bAddPly(__t.root, __mv('d2', 'd4'));
`);
ok(run('__a && __a.san') === 'd4', 'authored d4 appended to root');
ok(run('__t.root.children.length') === 2, 'root children now [e4, d4]');
run('globalThis.__a2 = bAddPly(__t.root, __mv("d2", "d4"));');
ok(run('__a2 === __a && __t.root.children.length') === 2, 'duplicate SAN deduped (navigate, no dup)');
run('globalThis.__e4 = __t.root.children[0]; globalThis.__a3 = bAddPly(__e4, __mvAt(__e4.fen, "d7", "d5"));');
ok(run('__a3 && __a3.san') === 'd5', 'authored d5 as black alternative after e4');
ok(run('__e4.children.map(c => c.san).join(",")') === 'e5,d5', 'e4 children [e5, d5-alt]');
run('globalThis.__rm = bRemovePly(__e4.children[1]);');
ok(run('__rm === __e4 && __e4.children.length') === 1, 'removePly splices subtree');
run('globalThis.__bad = bAddPly(__t.root, { from: "e2", to: "e5", san: "e5", promotion: undefined });');
ok(run('__bad') === null, 'fabricated illegal move rejected');

console.log('export round-trip (fresh tree)');
run(`globalThis.__xt = parseGameTree(${JSON.stringify(PGN1)});`);
run(`globalThis.__x = browsePgnText(__xt.headers, __xt.result, __xt.root);`);
ok(/\{An instructive game\.\} 1\. e4 e5 2\. Nf3 \$14 \{main note\} \(2\. f4!\? \{risky\} 2\.\.\. exf4\) 2\.\.\. Nc6 3\. Bb5 1-0/.test(run('__x')),
  'serialized movetext round-trips');
run(`globalThis.__rt = parseGameTree(__x);`);
ok(run('__rt.error') === null, 're-parse of export error-free');
ok(run('__rt.root.children[0].san') === 'e4' &&
   run('__rt.root.children[0].children[0].san') === 'e5' &&
   run('__rt.root.children[0].children[0].children[0].san') === 'Nf3' &&
   run('__rt.root.children[0].children[0].children[0].children[0].san') === 'Nc6' &&
   run('__rt.root.children[0].children[0].children[0].children[0].children[0].san') === 'Bb5',
  'round-trip mainline intact');
ok(run('__rt.root.children[0].children[0].children[1].san') === 'f4' &&
   run('__rt.root.children[0].children[0].children[1].comment') === 'risky' &&
   run('__rt.root.children[0].children[0].children[1].srcQual') === '!?' &&
   run('__rt.root.children[0].children[0].children[1].children[0].san') === 'exf4',
  'round-trip variation + comment + glyph intact');
ok(run('__rt.root.children[0].preComment') === 'An instructive game.', 'round-trip pre-comment intact');
ok(run('__rt.root.children[0].children[0].children[0].srcEval') === '+=', 'round-trip eval NAG intact');

console.log('error handling & results');
run(`globalThis.__e = parseGameTree("1. e4 e5 2. Ke3");`);
ok(run('__e.error') === 'illegal move "Ke3"', 'illegal move stops with error');
ok(run('__e.root.children[0].san') === 'e4' && run('__e.root.children[0].children[0].san') === 'e5', 'partial tree still browsable');
run(`globalThis.__r = parseGameTree("1. e4 1-0");`);
ok(run('__r.result') === '1-0', 'result token captured');
run(`globalThis.__f3 = parseGameTree("[Event \\"x\\"]\\n\\n1. d3 *");`);
ok(run('__f3.result') === '*', 'bare result * preserved');

console.log('version stamp');
ok(typeof run('SOLCHESS_VERSION') === 'string' && /^v\d/.test(run('SOLCHESS_VERSION')), 'SOLCHESS_VERSION defined: ' + run('SOLCHESS_VERSION'));
ok(html.includes('id="verLine"'), 'version line present on page');

console.log('DOM consistency (ids + inline handlers)');
{
  const ids = new Set();
  for (const m of html.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);
  const elRefs = new Set();
  for (const m of scripts[1].matchAll(/\bel\('([^']+)'\)/g)) elRefs.add(m[1]);
  const missingIds = [...elRefs].filter((id) => !ids.has(id));
  const handlers = new Set();
  for (const m of html.matchAll(/on(?:click|change|input|search|submit)="([^"]*)"/g)) {
    for (const h of m[1].matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) handlers.add(h[1]);
  }
  const defined = new Set();
  for (const s of scripts) for (const m of s.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)) defined.add(m[1]);
  const missingFns = [...handlers]
    .filter((h) => !/^(if|for|while|switch|catch|return|function)$/.test(h))
    .filter((h) => !defined.has(h));
  ok(missingIds.length === 0, 'every el() id exists: ' + JSON.stringify(missingIds));
  ok(missingFns.length === 0, 'every inline handler defined: ' + JSON.stringify(missingFns));
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nall green');
process.exit(fails ? 1 : 0);
