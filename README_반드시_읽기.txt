# KB클린 최종 클린 프로젝트

이번 버전은 기존 문제가 반복된 원인을 끊기 위해 구조를 완전히 단순화했습니다.

## 핵심 구조

React 앱 → Google Apps Script Web App → Google Drive/Sheet/Slides

이번 버전에는 아래가 없습니다.

- api/submit-report.js 없음
- Vercel 환경변수 없음
- GAS_WEBAPP_URL 없음
- 예전 URL fallback 없음
- PowerShell 자동세팅 없음

## 현재 연결된 Apps Script URL

https://script.google.com/macros/s/AKfycbza5X8I1vWnPgPWftbm7J2mQK3TbzdgQVui_54iwTVAn7hi_zg2fnyrKvfJPnQEGnn-/exec

## 사용 순서

1. 이 ZIP을 바탕화면에 압축 해제합니다.
2. 압축 푼 폴더 이름은 다음이어야 합니다.

   kbclean-final-direct-gas-report

3. 폴더 안에서 `01_TEST_LOCAL.cmd`를 더블클릭합니다.
4. 로컬에서 화면이 뜨면 GitHub Desktop으로 갑니다.
5. GitHub Desktop → File → Add Local Repository
6. 이 폴더를 선택합니다.
7. Publish repository 합니다.

추천 저장소 이름:

kbclean-final-direct-gas-report

8. Vercel → Add New Project → 위 GitHub 저장소 Import
9. Deploy

Vercel에서 환경변수는 넣지 않습니다.

## Vercel 빌드 오류 방지

package.json의 build 명령은 아래처럼 고정되어 있습니다.

node ./node_modules/vite/bin/vite.js build

이 방식은 Vercel의 `vite: Permission denied` 오류를 피하기 위한 설정입니다.

## 테스트 확인

앱에서 실제 제출 후 Google Drive에서 아래 구조가 생겨야 합니다.

KB클린 현장보고_자동생성...
└─ 2026-05-28
   └─ KB-날짜시간_리투의원
      ├─ 01_사진
      ├─ 02_음성
      └─ 03_보고서

그리고 `KB클린 현장보고_데이터` 시트에 새 행이 추가되어야 합니다.

## 주의

브라우저 보안 때문에 앱 화면에서는 Google 응답 링크를 즉시 읽지 않습니다.
우선 Google Drive/Sheet에 실제 저장되는지를 확인하는 안정화 버전입니다.
