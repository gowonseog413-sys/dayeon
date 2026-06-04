@echo off
chcp 65001 >nul
title dayeon Git 연결

cd /d "%~dp0"

echo ========================================
echo   dayeon GitHub 연결
echo ========================================
echo.
echo 저장소: https://github.com/gowonseog413-sys/dayeon.git
echo.

git status >nul 2>&1
if errorlevel 1 (
  git init -b main
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin https://github.com/gowonseog413-sys/dayeon.git
  echo remote origin 연결 완료
) else (
  git remote set-url origin https://github.com/gowonseog413-sys/dayeon.git
  echo remote origin URL 확인 완료
)

echo.
echo 현재 remote:
git remote -v
echo.
echo 다음 단계 (처음 푸시):
echo   git add .
echo   git commit -m "Initial commit"
echo   git push -u origin main
echo.
pause
