@echo off
chcp 65001 >nul
title dayeon 서버

cd /d "%~dp0"

echo ========================================
echo   dayeon 동생사이트 서버 시작
echo ========================================
echo.

if not exist "dayeon-web\node_modules\" (
  echo [1/2] 패키지 설치 중...
  call npm install --prefix dayeon-web
  if errorlevel 1 (
    echo.
    echo 패키지 설치에 실패했습니다.
    pause
    exit /b 1
  )
  echo.
) else (
  echo [1/2] 패키지 확인 완료
)

if not exist "dayeon-web\.env.local" (
  echo.
  echo .env.local 파일이 없습니다. 예시 파일을 복사합니다...
  copy "dayeon-web\.env.local.example" "dayeon-web\.env.local" >nul
  echo dayeon-web\.env.local 파일을 열어 Firebase / Slack 설정을 확인하세요.
  echo.
)

echo [2/2] 개발 서버 시작...
echo.
echo   브라우저: http://localhost:3000
echo   종료: Ctrl + C
echo.

cd dayeon-web
call npm run dev

pause
