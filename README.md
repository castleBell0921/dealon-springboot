# DealOn (딜온)
  >중고 상품 거래, 실시간 채팅, AI 이미지 카테고리 추천, 관리자 기능을 포함한 **중고 거래 플랫폼**

  [![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](#)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6DB33F?logo=springboot&logoColor=white)](#)
  [![Thymeleaf](https://img.shields.io/badge/Thymeleaf-Server%20Side-005F0F?logo=thymeleaf&logoColor=white)](#)
  [![Oracle DB](https://img.shields.io/badge/Oracle%20DB-Database-F80000?logo=oracle&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Chat%20Storage-47A248?logo=mongodb&logoColor=white)](#)
  [![Flask](https://img.shields.io/badge/Flask-AI%20Server-000000?logo=flask&logoColor=white)](#)
  [![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)](#)
  [![SSL](https://img.shields.io/badge/SSL-Let's%20Encrypt-003A70?logo=letsencrypt&logoColor=white)](#)

  배포 주소: https://dealon.duckdns.org

  <!-- ## Preview -->

  <!-- ### Main Page -->
  
  <!-- <img width="1200" alt="main page" src="YOUR_IMAGE_URL_HERE" /> -->

  <!-- ### Product Detail -->
  <!-- <img width="1200" alt="product detail" src="YOUR_IMAGE_URL_HERE" />-->

  <!-- ### Chat -->
  <!-- <img width="1200" alt="chat" src="YOUR_IMAGE_URL_HERE" /> -->

  <!-- ### Admin Dashboard -->
  <!-- <img width="1200" alt="admin dashboard" src="YOUR_IMAGE_URL_HERE" /> -->

  중고 거래 상황을 가정하여,
  사용자가 상품을 등록하고 검색하며, 찜/채팅/리뷰를 통해 거래를 진행할 수 있는 웹 서비스입니다.

  단순 CRUD 구현을 넘어서,
  실시간 채팅, 외부 스토리지 연동, 소셜 로그인, 이미지 기반 AI 보조 기능까지 포함한 통합형 서비스를 목표로 개발했습니다.

  ---

  ## 1. 프로젝트 소개

  기존 프로젝트에서 기본적인 게시판형 CRUD나 회원 기능을 구현하는 수준을 넘어서,
  이번 프로젝트에서는 **실제 서비스에 가까운 중고 거래 흐름**을 구성하는 데 집중했습니다.

  사용자는 상품을 등록하고 검색할 수 있으며,
  찜 기능과 실시간 채팅을 통해 판매자와 구매자가 직접 소통할 수 있습니다.

  또한 이미지 업로드, 소셜 로그인, 비밀번호 찾기 메일 발송,
  AI 기반 상품 카테고리 추천, 관리자 기능까지 포함하여
  단순한 데모 수준을 넘는 구조를 목표로 개발했습니다.

  ---

  ## 2. 개발 목표

  - 회원가입 / 로그인 / 로그아웃
  - 일반 로그인 및 소셜 로그인 구현
  - 상품 등록 / 수정 / 삭제 / 조회
  - 검색 및 필터 기반 상품 탐색
  - 찜 기능 및 마이페이지 제공
  - 판매자 후기 및 신뢰도 반영
  - WebSocket 기반 실시간 채팅 구현
  - AI 이미지 분석 기반 카테고리 추천
  - 관리자 페이지 및 운영 기능 구현
  - AWS EC2 기반 배포 및 HTTPS 적용

  ---

  ## 3. 기술 스택

  ### Backend
  - Java 21
  - Spring Boot 3.5.5
  - Spring MVC
  - Spring Security
  - MyBatis
  - Thymeleaf
  - Gradle

  ### Database
  - Oracle Database
  - MongoDB

  ### Storage / Infra
  - Oracle Cloud Object Storage
  - AWS EC2
  - DuckDNS
  - Let's Encrypt SSL

  ### External API
  - Kakao OAuth
  - Google OAuth
  - Google Maps API
  - SMTP Mail
  - CoolSMS

  ### AI Server
  - Python 3.x
  - Flask
  - Transformers
  - PyTorch
  - Pillow

  ### Tool
  - Git / GitHub
  - STS / Eclipse 계열 IDE
  - Gradle Wrapper

  ### Test
  - JUnit
  - Spring Boot Test

  ---

  ## 4. 주요 기능

  ### 사용자 기능
  - 회원가입
  - 로그인 / 로그아웃
  - 카카오 / 구글 소셜 로그인
  - 아이디 찾기
  - 비밀번호 찾기 및 임시 비밀번호 메일 발송
  - 프로필 수정
  - 마이페이지 조회
  - 구매 내역 조회
  - 판매 내역 조회
  - 찜 목록 조회

  ### 상품 기능
  - 상품 등록
  - 상품 수정
  - 상품 삭제
  - 상품 목록 조회
  - 상품 상세 조회
  - 카테고리 / 지역 / 가격 / 판매 가능 여부 필터링
  - 검색 기능
  - 찜 추가 / 해제
  - 판매 상태 변경
  - 리뷰 생성 연계

  ### 채팅 기능
  - 상품 기준 1:1 채팅방 생성
  - 실시간 채팅
  - 채팅 목록 조회
  - 최근 메시지 기준 정렬
  - 채팅방 나가기

  ### 관리자 기능
  - 관리자 대시보드 통계 조회
  - 회원 조회 / 검색 / 상태 변경 / 수정
  - 상품 조회 / 검색 / 상태 변경
  - 신고 처리 관련 기능
  - 문의 목록 및 상세 조회

  ### AI 보조 기능
  - 이미지 업로드 기반 상품 카테고리 추천
  - Flask 서버를 통한 이미지 분석 처리
  - Hugging Face 모델 기반 분류 지원

  ---

  ## 5. 핵심 설계 포인트

  ### 1) 메인 서비스와 AI 서버 분리
  메인 웹 서비스는 Spring Boot로 구성하고,
  이미지 분류 기능은 Flask 기반 별도 서버로 분리했습니다.

  이유는 AI 추론 로직과 웹 서비스 로직의 책임을 분리하고,
  향후 AI 기능만 별도 확장하거나 교체하기 쉽게 만들기 위함입니다.

  ### 2) 상품 거래 흐름 중심 설계
  단순 게시글 구조가 아니라,
  상품 등록 -> 상세 조회 -> 찜 -> 채팅 -> 거래 완료 -> 리뷰 작성 흐름으로 이어지는
  실제 중고 거래 서비스 흐름을 중심으로 구성했습니다.

  ### 3) 채팅 데이터 분리 저장
  일반 서비스 데이터는 Oracle Database에서 관리하고,
  채팅 메시지 데이터는 MongoDB를 활용해 저장하도록 구성했습니다.

  이유는 채팅 메시지가 빈번하게 쌓이는 구조이기 때문에,
  일반 트랜잭션 데이터와 분리하여 관리하는 편이 유리하다고 판단했기 때문입니다.

  ### 4) 이미지 파일은 외부 오브젝트 스토리지 사용
  상품 이미지 및 프로필 이미지는
  서버 로컬 디스크가 아닌 Oracle Cloud Object Storage에 저장하도록 구성했습니다.

  이를 통해 서버와 파일 저장소를 분리하고,
  파일 관리와 배포 구조를 좀 더 안정적으로 운영할 수 있도록 했습니다.

  ### 5) 운영 환경 분리
  환경 설정은 `application.properties`, `application-local.properties`, `application-prod.properties`로 나누어
  로컬 환경과 배포 환경을 분리했습니다.

  운영 환경에서는 EC2 서버에 배포하고,
  DuckDNS 도메인과 Let's Encrypt SSL 인증서를 적용하여 HTTPS로 서비스하도록 구성했습니다.

  ---

  ## 6. 주요 도메인

  - USER
  - PRODUCT
  - CATEGORY
  - WISHLIST
  - CHAT_ROOM
  - CHAT_MESSAGE
  - REVIEW
  - INQUIRY
  - ADMIN

  ### 관계 요약
  ```mermaid
  erDiagram
      USER ||--o{ PRODUCT : registers
      USER ||--o{ WISHLIST : likes
      PRODUCT ||--o{ WISHLIST : liked_by
      USER ||--o{ REVIEW : writes
      PRODUCT ||--o{ REVIEW : has
      USER ||--o{ CHAT_ROOM : joins
      CHAT_ROOM ||--o{ CHAT_MESSAGE : contains
      USER ||--o{ INQUIRY : creates
      ADMIN ||--o{ INQUIRY : manages
```
---




  ## 7. 서비스 처리 흐름

  1. 사용자가 회원가입 또는 로그인한다.
  2. 상품 목록 또는 검색 기능으로 원하는 상품을 탐색한다.
  3. 상품 상세 페이지에서 상품 정보와 판매자 정보를 확인한다.
  4. 사용자는 상품을 찜하거나 채팅방을 생성할 수 있다.
  5. 채팅을 통해 판매자와 구매자가 거래를 진행한다.
  6. 거래 완료 후 상품 상태가 변경된다.
  7. 필요 시 리뷰를 작성하고 판매자 신뢰도에 반영한다.

  ### AI 보조 기능 흐름

  1. 사용자가 상품 등록 시 이미지를 업로드한다.
  2. Spring Boot 서버가 Flask AI 서버로 이미지를 전달한다.
  3. AI 서버가 이미지를 분석해 카테고리를 예측한다.
  4. 예측 결과를 바탕으로 상품 카테고리 추천값을 반환한다.

  ---

  ## 8. 배포 및 운영 전략

  이 프로젝트는 다음과 같은 방식으로 배포했습니다.

  - AWS EC2에 애플리케이션 배포
  - DuckDNS를 사용한 도메인 연결
  - Let's Encrypt SSL 인증서 발급
  - HTTPS 프로토콜 적용

  ### 배포 흐름

  1. EC2 인스턴스에 Java 및 실행 환경을 구성한다.
  2. 애플리케이션을 서버에 배포하고 내부 포트에서 실행한다.
  3. DuckDNS 도메인을 EC2 공인 IP에 연결한다.
  4. Let's Encrypt 인증서를 발급받는다.
  5. HTTPS 통신이 가능하도록 SSL을 적용한다.
  6. 외부에서는 도메인 기반 HTTPS로 접속하고, 내부에서는 애플리케이션 포트로 연결한다.

  ---
```
  ## 9. 프로젝트 구조

  src/main/java/com/dealOn
   ├─ config
   │   ├─ SecurityConfig
   │   ├─ WebMvcConfig
   │   ├─ WebSocketConfig
   │   ├─ OciConfig
   │   └─ TemplatesResolver
   │
   ├─ Auth
   │   ├─ controller
   │   └─ service
   │
   ├─ user
   │   ├─ controller
   │   ├─ model
   │   │   ├─ mapper
   │   │   ├─ service
   │   │   └─ vo
   │
   ├─ product
   │   ├─ controller
   │   ├─ model
   │   │   ├─ mapper
   │   │   ├─ service
   │   │   └─ vo
   │
   ├─ chat
   │   ├─ controller
   │   ├─ model
   │   │   ├─ mapper
   │   │   ├─ repository
   │   │   ├─ service
   │   │   └─ vo
   │   └─ websocket
   │
   ├─ admin
   │   ├─ controller
   │   └─ model
   │       ├─ mapper
   │       ├─ service
   │       └─ vo
   │
   ├─ inquiry
   │   ├─ controller
   │   └─ model
   │       ├─ mapper
   │       ├─ service
   │       └─ vo
   │
   ├─ common
   │   ├─ controller
   │   ├─ interceptor
   │   ├─ model
   │   │   ├─ mapper
   │   │   ├─ service
   │   │   └─ vo
   │   ├─ Pagination
   │   └─ S3Service
   │
   ├─ ajax
   │   └─ AjaxController
   │
   ├─ MainController
   └─ DemoApplication
```
  ---

  ## 10. 실행 환경

  ### 메인 서버

  - JDK 21
  - Oracle Database
  - MongoDB
  - Gradle Wrapper

  ### AI 서버

  - Python 3.x
  - Flask
  - Transformers
  - Torch
  - Pillow

  ---

  ## 11. 기대 효과

  - 실제 중고 거래 서비스 흐름을 기준으로 웹 애플리케이션 구조를 경험할 수 있습니다.
  - 실시간 채팅, 외부 스토리지, 소셜 로그인, 메일 발송 등 다양한 실무형 기능을 통합적으로 다룰 수 있습니다.
  - 메인 서비스와 AI 서버를 분리하여 서비스 확장성과 책임 분리 구조를 학습할 수 있습니다.
  - EC2, DuckDNS, Let's Encrypt 기반 배포를 통해 실제 운영 환경에 가까운 배포 경험을 정리할 수 있습니다.
