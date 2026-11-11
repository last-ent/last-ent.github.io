default:
	pipenv run nikola 
todo:
	@echo "TODO: Write reusable function that is used by all of these commands."

auto:
	pipenv run nikola auto

build:
	pipenv run nikola build

clean:
	pipenv run nikola clean

deploy:
	pipenv run nikola github_deploy

newpage:
	pipenv run nikola new_page

newpost:
	pipenv run nikola new_post
	
install:
	pipenv install $(pkgs)

# ── solchess encrypted collections ──
# Wrap a plaintext PGN in a password-protected envelope served by files/solchess.html:
#   make encrypt IN=local-pgn/Secret.pgn OUT=files/collections/Secret.pgn.enc PASSWORD=hunter2
# PASSWORD unset → the script prompts on stdin. Also honored: SOLCHESS_PASSWORD directly.
encrypt:
	SOLCHESS_PASSWORD="$(PASSWORD)" node scripts/encrypt-pgn.mjs "$(IN)" "$(OUT)"

# ── lichess study upload ──
# Upload plaintext PGN collections as private Lichess studies (one study per
# collection, games → chapters; big sets split every 64 chapters). Token comes
# from $LICHESS_TOKEN or the gitignored local-pgn/.lichess-token:
#   make lichess-upload ARGS='"files/collections/Spassky.pgn"'
#   make lichess-upload ARGS='--self-test'
#   make lichess-upload ARGS='--dry-run files/collections/*.pgn'
# Encrypted (.pgn.enc) collections are skipped — plaintext only.
lichess-upload:
	python3 scripts/lichess_upload.py $(ARGS)

help:
	less Makefile