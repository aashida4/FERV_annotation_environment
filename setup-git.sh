#!/bin/bash

# Git aliases for better productivity
echo "Setting up Git aliases for this project..."

# Basic aliases
git config alias.st status
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.unstage 'reset HEAD --'

# Advanced aliases
git config alias.hist 'log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short'
git config alias.last 'log -1 HEAD'
git config alias.visual '!gitk'

# Project specific aliases
git config alias.add-all '!git add . && git status'
git config alias.feature 'checkout -b feature/'
git config alias.hotfix 'checkout -b hotfix/'

echo "Git aliases configured successfully!"
echo ""
echo "Available aliases:"
echo "  git st        - git status"
echo "  git co        - git checkout"
echo "  git br        - git branch"
echo "  git ci        - git commit"
echo "  git unstage   - git reset HEAD --"
echo "  git hist      - pretty log with graph"
echo "  git last      - show last commit"
echo "  git add-all   - add all files and show status"
echo "  git feature   - create feature branch"
echo "  git hotfix    - create hotfix branch"
echo ""
echo "Usage examples:"
echo "  git feature new-emotion    # creates feature/new-emotion branch"
echo "  git add-all               # adds all files and shows status"
echo "  git hist                  # shows commit history graph"
