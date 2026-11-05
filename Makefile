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

help:
	less Makefile