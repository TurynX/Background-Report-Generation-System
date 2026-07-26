# 📊 Background Report Generation System

A highly scalable, asynchronous background report generation service built on **NestJS**, **TypeScript**, **BullMQ**, and **Prisma**. It processes heavy data queries in isolated background workers, exports reports to CSV format, uploads them to S3/MinIO cloud storage, and features automatic retention policies.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** NestJS (Node.js) with DDD / Clean Architecture layout
- **Database ORM:** Prisma with PostgreSQL
- **Task Queue:** BullMQ powered by Redis (Asynchronous background processing)
- **Object Storage:** MinIO / AWS S3 (CSV storage)
- **Authentication:** JWT (JSON Web Tokens) with Argon2 hashing
- **Scheduling:** NestJS Schedule (Cron jobs for data retention)
- **Styling & Standards:** ESLint, Prettier

### Data Flow Overview

```mermaid
graph TD
    Client[Client / Frontend] -->|1. Request Auth/Report| API[NestJS API Gateway]
    API -->|2. Queue Job| Redis[Redis / BullMQ]
    Redis -->|3. Consume Job| Worker[Background Worker]
    Worker -->|4. Query Data| DB[PostgreSQL Database]
    Worker -->|5. Convert to CSV & Upload| S3[S3 / MinIO Storage]
    Worker -->|6. Update Status & URL| DB
    API -->|7. Query Report Status/Download URL| DB
```

---

## 🚀 Key Features

* **Asynchronous Processing:** Long-running data fetches and file exports are offloaded to BullMQ background workers, keeping the API gateway responsive.
* **JWT Protected APIs:** Strict authentication utilizing JSON Web Tokens with client IP tracking and password hashing via Argon2.
* **Flexible Filtering:** Generate customized reports by passing raw filters dynamically mapped to Prisma database queries.
* **Cloud File Export:** Automatically generates clean CSVs and stores them in isolated object buckets (MinIO locally / AWS S3 in production).
* **Automated Data Retention:** Daily background cron job automatically handles report lifecycle management:
  * Marks `COMPLETED` reports older than 7 days as `EXPIRED`.
  * Purges expired reports permanently from the database after another 7 days.

---

## ⚙️ Project Setup

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker & Docker Compose](https://www.docker.com/)

### 1. Start Services (PostgreSQL, Redis, MinIO)

Run the following command to start all dockerized services defined in the `docker-compose.yml`:

```bash
docker compose up -d
```

This launches:
- **PostgreSQL** on port `5433` (Test database on port `5434`)
- **Redis** on port `6379`
- **MinIO** on ports `9000` (API) and `9001` (Web Console)

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the environment variables:

```env
DATABASE_URL="postgresql://postgres:root@localhost:5433/background_report_generation_system_db?schema=public"
JWT_SECRET="your-super-secure-secret-key"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Object Storage / MinIO Settings
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="rootadmin"
S3_SECRET_KEY="rootpassword123"
S3_BUCKET_NAME="reports"
S3_REGION="us-east-1"
```

### 3. Database Migrations & Seeding

Sync your database schema with Prisma and apply migrations:

```bash
npx prisma migrate dev
```

*(Optional) Start Prisma Studio to inspect database records:*

```bash
npx prisma studio
```

### 4. Running the Application

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```

---

## 🔌 API Endpoints

### 🔐 Authentication

#### **Register User**
* **Endpoint:** `POST /auth/register`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "Jane Doe",
    "password": "strongpassword123"
  }
  ```

#### **Login User**
* **Endpoint:** `POST /auth/login`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
* **Response:**
  ```json
  {
    "message": "User logged in successfully",
    "data": {
      "access_token": "eyJhbGciOi..."
    }
  }
  ```

---

### 📊 Report Management
*All report endpoints require the `Authorization: Bearer <access_token>` header.*

#### **Initiate Report Generation**
Triggers an asynchronous generation task added to the processing queue.
* **Endpoint:** `POST /reports/create`
* **Request Body:**
  ```json
  {
    "type": "SALES_SUMMARY", 
    "filters": {
      "amount": { "gt": 100 }
    }
  }
  ```
  *(Supported types: `SALES_SUMMARY`, `USER_ACTIVITY`, `FINANCIAL_AUDIT`)*
* **Response:**
  ```json
  {
    "data": {
      "id": "e9ef6928-86d1-4ad9-a78b-d7d8f3ec29a4",
      "type": "SALES_SUMMARY",
      "status": "PENDING",
      "filters": { "amount": { "gt": 100 } },
      "userId": "d7b9736c-9477-40b4-a212-32a1ebcb180c",
      "createdAt": "2026-07-26T16:27:00.000Z"
    },
    "message": "Report is being generated"
  }
  ```

#### **Get Report Status & Download URL**
Fetch details and download links for a specific report.
* **Endpoint:** `GET /reports/getReport/:id`
* **Response (In Progress):**
  ```json
  {
    "data": {
      "id": "e9ef6928-86d1-4ad9-a78b-d7d8f3ec29a4",
      "status": "PROCESSING"
    },
    "message": "Report retrieved successfully"
  }
  ```
* **Response (Completed):**
  ```json
  {
    "data": {
      "id": "e9ef6928-86d1-4ad9-a78b-d7d8f3ec29a4",
      "status": "COMPLETED",
      "fileUrl": "http://localhost:9000/reports/sales_summary/e9ef6928-86d1-4ad9-a78b-d7d8f3ec29a4.csv"
    },
    "message": "Report retrieved successfully"
  }
  ```

---

## 🧪 Testing

The codebase includes Jest unit and end-to-end (e2e) tests. Run them using:

```bash
# Unit tests
npm run test

# End-to-end (e2e) tests
npm run test:e2e

# Test coverage reports
npm run test:cov
```

---

## 🕒 Retention Policy & Lifecycle

The reports have a built-in automated maintenance cron job that triggers **every day at midnight**:
1. **Completion to Expiration:** Any report with a status of `COMPLETED` created **more than 7 days ago** is marked as `EXPIRED`.
2. **Expiration to Deletion:** Any report marked as `EXPIRED` that was modified **more than 7 days ago** is permanently deleted from the database.
