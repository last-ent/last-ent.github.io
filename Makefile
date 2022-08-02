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

help:
	less Makefile