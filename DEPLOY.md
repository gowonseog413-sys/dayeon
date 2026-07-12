# dayeon 배포 (Firebase 전용)

프로젝트 **dayeon-3856e** 에만 배포합니다. (Render / Vercel 사용 안 함)

## 로컬

| 구분 | URL |
|------|-----|
| 쇼핑몰 | http://localhost:3010 |
| ERP | http://localhost:3010/erp |
| API | http://localhost:4010 |

## Firebase 배포

> **필수:** 쇼핑몰·API(Cloud Functions) 배포는 Firebase **Blaze(종량제)** 플랜이 필요합니다.  
> [요금제 업그레이드](https://console.firebase.google.com/project/dayeon-3856e/usage/details) 후 아래 명령을 실행하세요.  
> (Spark 무료 플랜만으로는 Functions·Next.js SSR 호스팅이 되지 않습니다.)

```powershell
.\deploy-shop.bat
```

`deploy-shop.ps1`이 자동으로 처리합니다:

1. `.next/dev` · `.firebase` 캐시 삭제 (SSR 6GB+ 업로드 방지)
2. `shop-web` 프로덕션 `npm run build`
3. `shop-api` Functions 배포
4. `shop-web` Hosting + SSR 배포

> 로컬에서 `npm run dev` 중이면 배포 전에 dev 서버를 끄는 것이 좋습니다.

수동 배포 시에도 **반드시** 빌드 전 캐시 정리:

```powershell
Remove-Item -Recurse -Force shop-web\.next, .firebase -ErrorAction SilentlyContinue
cd shop-web; npm run build; cd ..
firebase deploy --only "functions:shop-api:shopApi",hosting:shop --project dayeon-3856e
```

Hosting 사이트 `dayeon-shop` 은 이미 생성되어 있습니다.

## 배포 후 주소 (dayeon-shop Hosting 사이트)

| 구분 | URL |
|------|-----|
| **쇼핑몰** | https://dayeon-shop.web.app |
| **ERP 대시보드** | https://dayeon-shop.web.app/erp |
| 상품 관리 | https://dayeon-shop.web.app/erp/products |
| 기사 | https://dayeon-shop.web.app/erp/articles |
| 소개·약관 | https://dayeon-shop.web.app/erp/pages |
| FAQ·배송 | https://dayeon-shop.web.app/erp/support |
| 주문 | https://dayeon-shop.web.app/erp/orders |
| 회원 | https://dayeon-shop.web.app/erp/users |
| 포인트/적립금 | https://dayeon-shop.web.app/erp/users/points |
| 내리뷰/포인트 | https://dayeon-shop.web.app/erp/users/reviews |
| 추천인제도 | https://dayeon-shop.web.app/erp/users/referral |
| 테마변경 | https://dayeon-shop.web.app/erp/theme |

관리자: `dayeon@naver.com` / `admin1004`

## 2026-06-06 배포 메모

- 마이페이지: 포인트·등급, 장바구니·위시, 프로필 통합 탭
- ERP: 내리뷰/포인트내역, 주문·테마·이벤트팝업·통계 확장
- 포인트 원장(`pointTransactions`) — 쇼핑몰·ERP 실시간 동기
- 상세 작업: [docs/WORKLOG-2026-06-06.md](docs/WORKLOG-2026-06-06.md)

## 2026-06-05 배포 메모

- 테마 3종: 핑크 / 깔끔 / 인도네시아
- 회원 ERP: 목록·포인트·추천인
- 상세 작업: [docs/WORKLOG-2026-06-05.md](docs/WORKLOG-2026-06-05.md)

동생 사이트(dayeon-web)는 기존과 같이 **https://dayeon-3856e.web.app**

## 구조

- **shop-web** → Firebase Hosting (App Hosting / Frameworks)
- **shop-api** → Cloud Functions `shopApi` (asia-northeast3)
- 쇼핑몰에서 `/api/*` 요청은 Hosting이 Functions로 연결
