#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# solchess — upload plaintext PGN collections to Lichess as private studies.
#
#   python3 scripts/lichess_upload.py [options] <collection.pgn> ...
#     --public       make the studies public instead of private
#     --unlisted     make the studies unlisted instead of private
#     --dry-run      print the plan (studies + chapter counts), no API writes
#     --self-test    throwaway create → import → verify → cleanup round trip
#
# Each collection becomes one study; each game in the PGN becomes one chapter
# (named from its Event tag). Lichess caps a study at 64 chapters, so larger
# collections are split into numbered sub-studies ("Name (2/35)"). Import
# responses are VERIFIED: the API returns HTTP 200 even when it silently
# drops chapters past the cap, so the created count is checked against the
# games sent.
#
# Auth: personal access token with the study:write scope — create one at
# https://lichess.org/account/oauth/token/create. Resolved from, in order:
#   1. $LICHESS_TOKEN
#   2. local-pgn/.lichess-token   (gitignored — NEVER commit the token)
#
# Encrypted collections (.pgn.enc) are out of scope here — plaintext only.
# ─────────────────────────────────────────────────────────────────────────────
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = 'https://lichess.org'
STUDY_URL = 'https://lichess.org/study/{}'
TOKEN_PAGE = 'https://lichess.org/account/oauth/token/create'
MAX_CHAPTERS = 64        # Lichess hard cap: chapters per study
REQUEST_PAUSE = 0.7      # seconds between API writes (rate-limit politeness)
# Member-capability defaults for created studies ("owner" always keeps full
# control). The API rejects POST /api/study without these fields.
STUDY_SETTINGS = {
    'explorer': 'nobody',
    'computer': 'nobody',
    'chat': 'nobody',
    'shareable': 'nobody',
    'cloneable': 'nobody',
}
SCRIPT_DIR = Path(__file__).resolve().parent
TOKEN_FILE = SCRIPT_DIR.parent / 'local-pgn' / '.lichess-token'

SELF_TEST_PGN = (
    '[Event "solchess-upload self-test"]\n[Site "local"]\n[Date "????.??.??"]\n'
    '[Round "?"]\n[White "Self"]\n[Black "Test"]\n[Result "*"]\n\n'
    '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *\n'
)


def die(msg, code=2):
    print('error: ' + msg, file=sys.stderr)
    sys.exit(code)


def read_token():
    tok = os.environ.get('LICHESS_TOKEN', '').strip()
    if tok:
        return tok, '$LICHESS_TOKEN'
    try:
        tok = TOKEN_FILE.read_text(encoding='utf-8-sig').strip()
    except OSError:
        tok = ''
    if tok:
        return tok, str(TOKEN_FILE)
    die(
        'no Lichess token found — set $LICHESS_TOKEN or save a personal access '
        f'token (study:write scope) in {TOKEN_FILE}\ncreate one at {TOKEN_PAGE}'
    )


def split_games(text):
    """Split a multi-game PGN into per-game strings (tag rows + movetext).

    A new game starts at the first tag line that follows movetext, so tag
    rows of the current game's header are kept together with its moves.
    """
    games, cur, seen_moves = [], [], False
    for line in text.splitlines():
        if line.startswith('[') and seen_moves:
            if any(s.strip() for s in cur):
                games.append('\n'.join(cur).strip())
            cur, seen_moves = [line], False
        else:
            if line.strip() and not line.startswith('['):
                seen_moves = True
            cur.append(line)
    if cur and any(s.strip() for s in cur):
        games.append('\n'.join(cur).strip())
    return games


def api(method, path, token, fields=None):
    """One Lichess API call. Returns (http_status, body_text)."""
    data = urllib.parse.urlencode(fields).encode() if fields is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header('Authorization', 'Bearer ' + token)
    if data is not None:
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.status, res.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except urllib.error.URLError as e:
        return 0, str(e)


def batches_of(games, size=MAX_CHAPTERS):
    return [games[i:i + size] for i in range(0, len(games), size)]


def study_name(base, i, n):
    base = base.strip()[:60] or 'collection'
    return f'{base} ({i}/{n})' if n > 1 else base


def upload_collection(path, token, visibility):
    """Upload one .pgn file. Returns True on success, False on failure."""
    if path.name.endswith('.pgn.enc'):
        print(f'\u23ed  {path.name}: encrypted collection — skipped (plaintext only)')
        return True
    try:
        text = path.read_text(encoding='utf-8-sig', errors='replace')
    except OSError as e:
        print(f'\u2717 {path.name}: cannot read ({e})')
        return False
    games = split_games(text)
    if not games:
        print(f'\u2717 {path.name}: no games found')
        return False

    batches = batches_of(games)
    n = len(batches)
    ok = True
    for i, batch in enumerate(batches, 1):
        name = study_name(path.stem, i, n)
        code, body = api('POST', '/api/study', token,
                         {'name': name, 'visibility': visibility, **STUDY_SETTINGS})
        if code != 200:
            print(f'\u2717 {name}: create study failed HTTP {code}: {body[:300]}')
            ok = False
            continue
        try:
            sid = json.loads(body)['id']
        except (ValueError, KeyError):
            print(f'\u2717 {name}: unexpected create response: {body[:300]}')
            ok = False
            continue

        code, body = api('POST', f'/api/study/{sid}/import-pgn', token,
                         {'pgn': '\n\n'.join(batch) + '\n'})
        time.sleep(REQUEST_PAUSE)
        if code != 200:
            print(f'\u2717 {name}: import failed HTTP {code}: {body[:300]}')
            print(f'  (empty study left behind: {STUDY_URL.format(sid)})')
            ok = False
            continue
        res = json.loads(body)
        made = len(res.get('chapters', []))
        if res.get('error'):
            print(f'\u26a0 {name}: lichess reported: {res["error"]}')
            ok = False
        if made != len(batch):
            print(f'\u26a0 {name}: sent {len(batch)} games, '
                  f'lichess created only {made} chapters')
            ok = False
        print(f'\u2713 {name} \u2192 {STUDY_URL.format(sid)} '
              f'({made} chapters, {visibility})')
    return ok


def dry_run(paths, visibility):
    for path in paths:
        if path.name.endswith('.pgn.enc'):
            print(f'\u23ed  {path.name}: encrypted collection — skipped (plaintext only)')
            continue
        try:
            games = split_games(path.read_text(encoding='utf-8-sig', errors='replace'))
        except OSError as e:
            print(f'\u2717 {path.name}: cannot read ({e})')
            continue
        if not games:
            print(f'\u2717 {path.name}: no games found')
            continue
        batches = batches_of(games)
        n = len(batches)
        for i, batch in enumerate(batches, 1):
            print(f'would create study "{study_name(path.stem, i, n)}" '
                  f'({visibility}) with {len(batch)} chapters')
        print(f'  {path.name}: {len(games)} games \u2192 {n} stud'
              f'{"y" if n == 1 else "ies"}')


def self_test(token):
    """Throwaway create → import → verify → cleanup; proves study:write works."""
    name = 'solchess-upload self-test (safe to delete)'
    code, body = api('POST', '/api/study', token,
                     {'name': name, 'visibility': 'private', **STUDY_SETTINGS})
    if code != 200:
        die(f'self-test create failed HTTP {code}: {body[:300]}')
    sid = json.loads(body)['id']
    print(f'created study {STUDY_URL.format(sid)}')

    code, body = api('POST', f'/api/study/{sid}/import-pgn', token,
                     {'pgn': SELF_TEST_PGN})
    if code != 200:
        die(f'self-test import failed HTTP {code}: {body[:300]}\n'
            f'(empty study left behind: {STUDY_URL.format(sid)})')
    chapters = json.loads(body).get('chapters', [])
    ok = len(chapters) == 1
    print(f'import verified: {len(chapters)} chapter(s)')

    code, _ = api('DELETE', f'/api/study/{sid}', token)
    if code in (200, 204):
        print('deleted the self-test study')
    else:
        for ch in chapters:
            if ch.get('id'):
                api('DELETE', f'/api/study/{sid}/{ch["id"]}', token)
        print(f'note: no study-delete endpoint (HTTP {code}) — removed its '
              f'chapter; delete the empty study at {STUDY_URL.format(sid)}')

    print('self-test OK: create \u2192 import \u2192 verify \u2192 cleanup'
          if ok else 'self-test FAILED')
    return 0 if ok else 1


def main():
    p = argparse.ArgumentParser(
        description='Upload plaintext PGN collections to Lichess as studies '
                    '(private by default).')
    vis = p.add_mutually_exclusive_group()
    vis.add_argument('--public', action='store_true', help='make studies public')
    vis.add_argument('--unlisted', action='store_true', help='make studies unlisted')
    p.add_argument('--dry-run', action='store_true',
                   help='print the plan without any API writes')
    p.add_argument('--self-test', action='store_true',
                   help='throwaway create/import/verify/cleanup round trip')
    p.add_argument('pgn', nargs='*', help='.pgn collection files')
    args = p.parse_args()

    visibility = 'public' if args.public else 'unlisted' if args.unlisted else 'private'

    if args.self_test:
        token, _ = read_token()
        sys.exit(self_test(token))
    if not args.pgn:
        p.error('need at least one .pgn file (or --self-test)')

    paths = [Path(a) for a in args.pgn]
    for path in paths:
        if not path.is_file():
            die(f'{path} is not a file')

    if args.dry_run:
        dry_run(paths, visibility)
        return

    token, src = read_token()
    print(f'token from {src} \u00b7 {len(paths)} collection(s) \u00b7 {visibility} studies')
    failed = [path for path in paths if not upload_collection(path, token, visibility)]
    if failed:
        die('failed: ' + ', '.join(str(f) for f in failed), 1)


if __name__ == '__main__':
    main()
