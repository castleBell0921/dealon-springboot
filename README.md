# DealOn

DealOn is a secondhand marketplace web application built with Spring Boot and Thymeleaf.
The project includes a separate Flask-based AI server for image category analysis, plus real-time chat, review flow, and admin features.

## Overview

- Server-rendered marketplace service
- Product registration, update, delete, and detail pages
- Search and filtering by category, location, price, and availability
- Wishlist, purchase history, sales history, and my page features
- Seller review and trust score flow
- Real-time chat with WebSocket
- Admin dashboard, user management, product management, and inquiry management
- AI-assisted product category suggestion from uploaded images

## Main Features

### User

- Sign up / login / logout
- Password encryption with `BCrypt`
- Account ID lookup and temporary password email flow
- Kakao and Google social login
- Profile update and avatar upload

### Product

- Create, update, and delete product listings
- Product list and detail view
- Category, location, price, and availability filters
- Search
- Wishlist toggle
- Product status update
- Review creation flow after transaction
- File upload to external object storage

### Chat

- One-to-one chat room per product
- Real-time messaging with WebSocket
- Chat room sorting by latest message
- Leave chat room and room status handling

### Admin

- Dashboard statistics
- User lookup, search, update, and status control
- Product lookup, search, and status control
- Report-related handling
- Inquiry list and detail management

### AI Support

- Separate Flask AI service
- Image-based category prediction for products
- Hugging Face model: `facebook/deit-tiny-patch16-224`

## Tech Stack

### Backend

- Java 21
- Spring Boot 3.5.5
- Spring MVC
- Spring Security
- Thymeleaf
- MyBatis
- WebSocket

### Database and Storage

- Oracle Database
- MongoDB
- Oracle Cloud Object Storage

### External Services

- Kakao OAuth
- Google OAuth
- Google Maps API
- SMTP Mail
- CoolSMS

### AI Server

- Python
- Flask
- Transformers
- PyTorch
- Pillow

## Project Structure

```text
.
|-- src/
|   |-- main/
|   |   |-- java/com/dealOn/         # Spring Boot source
|   |   `-- resources/
|   |       |-- templates/           # Thymeleaf templates
|   |       |-- static/              # CSS, JS, images
|   |       `-- mapper/              # MyBatis XML mappers
|   `-- test/                        # Test code
|-- ai-server/                       # Flask AI category server
|-- build.gradle
`-- README.md
```

## Requirements

### Main Server

- JDK 21
- Oracle DB connection info
- MongoDB connection info

### AI Server

- Python 3.x
- `pip install -r ai-server/requirements.txt`

## Environment Variables

Values referenced from `application.properties` and profile files:

```env
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_DRIVER_CLASS_NAME=

COOLSMS_API_KEY=
COOLSMS_API_SECRET=
COOLSMS_FROM_PHONE=

KAKAO_CLIENT_ID=
KAKAO_REDIRECT_URL_LOCAL=
KAKAO_LOGOUT_REDIRECT_URL_LOCAL=
KAKAO_REDIRECT_URL_PROD=
KAKAO_LOGOUT_REDIRECT_URL_PROD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL_LOCAL=
GOOGLE_REDIRECT_URL_PROD=
GOOGLE_MAPS_API_KEY=

OCI_BUCKETNAME=
OCI_REGION=
OCI_USER_OCID=
OCI_TENANCY_OCID=
OCI_FINGERPRINT=
OCI_PRIVATE_KEY_PATH=

spring.mail.host=
spring.mail.port=
spring.mail.username=
spring.mail.password=

spring.data.mongodb.uri=
spring.data.mongodb.database=

AI_SERVER_URL=

SSL_KEYSTORE_PASSWORD=
```

## Run Locally

### 1. Run the main server

```bash
./gradlew bootRun
```

- Default port: `9090`
- Local SSL settings exist in `application-local.properties`

### 2. Run the AI server

```bash
cd ai-server
pip install -r requirements.txt
python app.py
```

- Default AI server port: `5001`
- Recommended same-host production URL: `http://127.0.0.1:5001/analyze-image`

## Test

```bash
./gradlew test
```

The repository already includes Spring Boot and product-related test classes.

## Deployment

This project was deployed with the following setup:

- AWS EC2 for application hosting
- DuckDNS for domain mapping
- Let's Encrypt SSL certificate
- HTTPS protocol enabled

A typical deployment flow for this project is:

1. Provision an EC2 instance and install the runtime environment.
2. Point the DuckDNS domain to the EC2 public IP.
3. Issue an SSL certificate with Let's Encrypt.
4. Configure a reverse proxy such as Nginx for SSL termination and `80 -> 443` redirect.
5. Run the Spring Boot app on the internal application port `9090`.
6. Run the AI server on port `5001` if deployed on the same host.
7. Set `AI_SERVER_URL=http://127.0.0.1:5001/analyze-image` so the Spring app calls the AI server directly instead of routing the request back through the public domain.

## Notes

- The main service is built with Spring Boot and Thymeleaf.
- Product images are stored in Oracle Cloud Object Storage.
- Chat message data uses MongoDB.
- Oracle Wallet resources are included under `src/main/resources/Wallet`.
- Production SSL keystore settings are intended to be managed outside Git via `application-prod.properties`.
