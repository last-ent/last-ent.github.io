#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// solchess — encrypt a PGN collection for password-protected playback.
//
//   node scripts/encrypt-pgn.mjs <input.pgn> <output.pgn.enc> [options]
//     --password <value>  use this password (visible in the process list!)
//     --passenv <VAR>     read the password from env VAR (default: SOLCHESS_PASSWORD)
//     --force             overwrite <output> if it exists
//     --self-test         run a built-in encrypt/decrypt round-trip check and exit
//
// Password resolution: --password flag → env (SOLCHESS_PASSWORD, or --passenv
// override) → interactive prompt on stdin. The password is NEVER stored — the
// envelope only carries public salt/iterations/IV plus the ciphertext. The
// same password decrypts (AES-256-GCM auth-fails on any wrong guess), and it
// is shared out-of-band with whoever should have access.
//
// Envelope format (mirrored by decryptPgn() in files/solchess.html):
//   {"v":1,"kdf":"PBKDF2-SHA256","iter":210000,"salt":<b64>,
//    "alg":"AES-256-GCM","iv":<b64>,"ct":<b64>}
// ─────────────────────────────────────────────────────────────────────────────
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createInterface } from 'node:readline';
import process from 'node:process';

const ITER = 210000;
const KDF = 'PBKDF2-SHA256';
const ALG = 'AES-256-GCM';

const USAGE = `encrypt a PGN collection into a password-protected envelope
usage: node scripts/encrypt-pgn.mjs <input.pgn> <output.pgn.enc> [options]`;

const die = (msg, code = 2) => {
  console.error('error: ' + msg);
  console.error(USAGE);
  process.exit(code);
};

function parseArgs(argv) {
  const opts = { pos: [], passenv: 'SOLCHESS_PASSWORD', force: false, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--self-test') opts.selfTest = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--password') {
      opts.password = argv[++i];
      if (opts.password === undefined) die('--password needs a value');
    } else if (a === '--passenv') {
      opts.passenv = argv[++i];
      if (opts.passenv === undefined) die('--passenv needs a variable name');
    } else if (a.startsWith('--')) die(`unknown option ${a}`);
    else opts.pos.push(a);
  }
  return opts;
}

async function readPassword(opts) {
  if (opts.password !== undefined) return opts.password;
  const envVal = process.env[opts.passenv];
  if (envVal) return envVal;
  const answer = await new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    rl.question('collection password: ', (ans) => { rl.close(); resolve(ans); });
  });
  if (!answer) die('empty password (set SOLCHESS_PASSWORD or use --password)');
  return answer;
}

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(String(s), 'base64'));

async function encryptPgn(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pw = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey('raw', pw, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, baseKey, 256);
  const key = await crypto.subtle.importKey('raw', bits, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return JSON.stringify({ v: 1, kdf: KDF, iter: ITER, salt: b64(salt), alg: ALG, iv: b64(iv), ct: b64(ct) }) + '\n';
}

// Same contract as the browser-side decryptPgn() in files/solchess.html —
// used by --self-test (and handy as a decrypt reference implementation).
async function decryptPgn(env, password) {
  if (!env || env.v !== 1 || env.kdf !== KDF || env.alg !== ALG ||
      !env.salt || !env.iv || !env.ct || !(Number(env.iter) > 0)) {
    throw new Error('unsupported encrypted-collection format');
  }
  const pw = new TextEncoder().encode(String(password));
  const baseKey = await crypto.subtle.importKey('raw', pw, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: unb64(env.salt), iterations: Number(env.iter) },
    baseKey, 256);
  const key = await crypto.subtle.importKey('raw', bits, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, unb64(env.ct));
  return new TextDecoder().decode(plain);
}

async function selfTest() {
  const sample = '[Event "self-test"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 *';
  const pw = 'solchess self-test password';
  const env = JSON.parse(await encryptPgn(sample, pw));
  const back = await decryptPgn(env, pw);
  if (back !== sample) throw new Error('round-trip mismatch');
  let rejected = false;
  try { await decryptPgn(env, pw + 'x'); } catch { rejected = true; }
  if (!rejected) throw new Error('wrong password was accepted');
  console.log('self-test OK: encrypt → decrypt round-trip, wrong password rejected');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.selfTest) return selfTest();
  if (opts.pos.length !== 2) die('expected exactly <input.pgn> and <output.pgn.enc>');
  const [input, output] = opts.pos;

  let st;
  try { st = statSync(input); } catch { die(`cannot read ${input}`); }
  if (!st || !st.isFile()) die(`${input} is not a file`);
  if (!opts.force) {
    try { statSync(output); die(`${output} exists (use --force to overwrite)`); } catch { /* fresh path */ }
  }

  const password = await readPassword(opts);
  const text = readFileSync(input, 'utf8');
  if (!text.trim()) die(`${input} is empty`);
  if (/^\s*\{\s*"v"\s*:\s*1/.test(text)) die(`${input} already looks like an encrypted envelope`);

  const enc = await encryptPgn(text, password);
  writeFileSync(output, enc);
  const base = basename(output).replace(/\.pgn\.enc$/i, '');
  console.log(`encrypted ${text.length} → ${enc.length} bytes: ${input} → ${output}`);
  console.log(`• plaintext source untouched — keep it out of the repo (see .gitignore: local-pgn/)`);
  console.log(`• add "${base}" to "encrypted" in files/collections/collections.json`);
}

main().catch((e) => {
  console.error(e && e instanceof Error ? 'error: ' + e.message + '\n' + e.stack : e);
  process.exit(1);
});
