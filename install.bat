@echo off
chcp 65001 >nul
title dayeon 설치

cd /d "%~dp0"

echo ========================================
echo   dayeon 프로젝트 설치
echo ========================================
echo.

echo Node.js 버전 확인...
node --version
if errorlevel 1 (
  echo Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 설치 후 다시 실행하세요.
  pause
  exit /b 1
)

echo.
echo 패키지 설치 중...
call npm install --prefix dayeon-web
if errorlevel 1 (
  echo.
  echo 설치에 실패했습니다.
  pause
  exit /b 1
)

if not exist "dayeon-web\.env.local" (
  copy "dayeon-web\.env.local.example" "dayeon-web\.env.local" >nul
  echo.
  echo .env.local 파일을 생성했습니다.
)

echo.
echo ========================================
echo   설치 완료
echo   start.bat 을 실행하면 서버가 시작됩니다.
echo ========================================
pause
