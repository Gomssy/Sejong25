# sejong25

## 필수
1. nodejs 설치
    - https://nodejs.org/en/download/
2. npm
    - nodejs를 설치하면 함께 설치됨
    - `$ npm install npm -g` 하면 최신 버전으로 업데이트
3. Dependency 모듈 설치
    - `$ npm install`
    - sejong25 디렉토리에서 콘솔을 열고 명령어 실행
    - package.json과 package-lock.json을 참고하여 필요한 모듈들을 자동으로 설치해 줌

## 서버 및 네트워킹
```
$node server.js
```
위 커맨드를 입력하면 서버가 실행됨  
테스트가 하고 싶을 땐 서버를 실행하고 웹브라우저에서 `localhost` 또는 `127.0.0.1`로 접속하면 됨