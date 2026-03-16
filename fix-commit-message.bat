@echo off
REM Run this from Command Prompt or Git Bash *outside* Cursor to remove "Made with Cursor" from the commit.
cd /d "%~dp0"
git checkout feature/premium-ui-and-game-features 2>nul
git commit --amend -F msg_clean.txt
git push --force-with-lease origin feature/premium-ui-and-game-features
echo Done. Refresh your GitHub commit page to see the updated message.
pause
