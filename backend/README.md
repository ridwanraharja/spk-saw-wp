# SPK SAW WP Backend API

Sistem Pendukung Keputusan (Decision Support System) menggunakan metode SAW (Simple Additive Weighting) dan WP (Weighted Product) dengan autentikasi JWT.

## 🚀 Features

- **JWT Authentication** - Access & refresh tokens dengan bcrypt password hashing
- **User Management** - Registration, login, profile management
- **SPK Calculations** - Implementasi metode SAW dan WP
- **Protected Routes** - Semua SPK endpoints dilindungi dengan autentikasi
- **Rate Limiting** - Perlindungan dari spam dan brute force attacks
- **Input Validation** - Validasi data menggunakan Joi
- **API Documentation** - Swagger/OpenAPI documentation
- **Database** - PostgreSQL dengan Prisma ORM
- **Security** - Helmet.js, CORS, dan security headers
- **Error Handling** - Centralized error handling middleware
- **Database Transactions** - ACID compliance untuk operasi kompleks

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet.js, express-rate-limit
- **Language**: TypeScript

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 atau lebih tinggi)
- PostgreSQL (v12 atau lebih tinggi)
- npm atau yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy file `env.example` ke `.env` dan isi dengan konfigurasi Anda:

```bash
cp env.example .env
```

Contoh konfigurasi `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/spk_db?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (PENTING: Ganti dengan secret keys yang kuat!)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-here-make-it-long-and-complex
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here-make-it-different-from-access
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_LOGIN_ATTEMPTS=5
```

### 3. Database Setup

Buat database PostgreSQL dan jalankan migration:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### 4. Generate JWT Secrets

**PENTING**: Untuk production, generate JWT secrets yang kuat:

```bash
# Generate access token secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Masukkan hasil generate ke file `.env` Anda.

### 5. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 6. Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

Setelah server berjalan, akses dokumentasi API di:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON Schema**: `http://localhost:3000/api-docs.json`

## 🔐 Authentication

API menggunakan JWT Bearer Token authentication:

```http
Authorization: Bearer <your-jwt-token>
```

### Login Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Use Access Token**: Include dalam Authorization header
4. **Refresh Token**: `POST /api/auth/refresh` (ketika access token expired)
5. **Logout**: `POST /api/auth/logout`

## 📖 API Endpoints

### Authentication

| Method | Endpoint             | Description          | Auth Required |
| ------ | -------------------- | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register user baru   | ❌            |
| POST   | `/api/auth/login`    | Login user           | ❌            |
| POST   | `/api/auth/refresh`  | Refresh access token | ❌            |
| POST   | `/api/auth/logout`   | Logout user          | ❌            |
| GET    | `/api/auth/profile`  | Get user profile     | ✅            |
| PUT    | `/api/auth/profile`  | Update user profile  | ✅            |

### SPK (Sistem Pendukung Keputusan)

| Method | Endpoint       | Description            | Auth Required |
| ------ | -------------- | ---------------------- | ------------- |
| POST   | `/api/spk`     | Create SPK record baru | ✅            |
| GET    | `/api/spk`     | Get semua SPK records  | ✅            |
| GET    | `/api/spk/:id` | Get SPK record by ID   | ✅            |
| PUT    | `/api/spk/:id` | Update SPK record      | ✅            |
| DELETE | `/api/spk/:id` | Delete SPK record      | ✅            |

### Dashboard

| Method | Endpoint               | Description              | Auth Required |
| ------ | ---------------------- | ------------------------ | ------------- |
| GET    | `/api/dashboard/stats` | Get dashboard statistics | ✅            |

## 🧮 SPK Calculation Methods

### SAW (Simple Additive Weighting)

Metode SAW menghitung nilai preferensi berdasarkan:

1. Normalisasi matriks keputusan
2. Perkalian dengan bobot kriteria
3. Penjumlahan hasil perkalian

### WP (Weighted Product)

Metode WP menghitung nilai preferensi berdasarkan:

1. Perhitungan bobot relatif
2. Perpangkatan nilai dengan bobot
3. Perkalian hasil perpangkatan

## 📝 Example Usage

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "Password123!"
  }'
```

### Create SPK Record

```bash
curl -X POST http://localhost:3000/api/spk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Pemilihan Smartphone",
    "criteria": [
      {
        "id": "c1",
        "name": "Harga",
        "weight": 0.3,
        "type": "cost"
      },
      {
        "id": "c2",
        "name": "Kualitas",
        "weight": 0.7,
        "type": "benefit"
      }
    ],
    "alternatives": [
      {
        "id": "a1",
        "name": "iPhone 14",
        "values": {
          "c1": 15000000,
          "c2": 9
        }
      },
      {
        "id": "a2",
        "name": "Samsung S23",
        "values": {
          "c1": 12000000,
          "c2": 8
        }
      }
    ]
  }'
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client configuration
│   │   ├── jwt.ts            # JWT utilities
│   │   └── swagger.ts        # API documentation config
│   ├── controllers/
│   │   ├── authController.ts # Authentication logic
│   │   └── spkController.ts  # SPK business logic
│   ├── middlewares/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── errorHandler.ts   # Error handling
│   │   └── validation.ts     # Input validation
│   ├── routes/
│   │   ├── authRoutes.ts     # Authentication routes
│   │   ├── spkRoutes.ts      # SPK routes
│   │   └── dashboardRoutes.ts # Dashboard routes
│   ├── utils/
│   │   ├── passwordUtils.ts   # Password hashing utilities
│   │   ├── spkCalculations.ts # SAW & WP calculations
│   │   └── validationSchemas.ts # Joi schemas
│   └── index.ts              # Main application file
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: bcrypt dengan 12 salt rounds
- **JWT Tokens**: Separate access (15min) & refresh (7 days) tokens
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured untuk frontend domains
- **Helmet.js**: Security headers
- **Input Validation**: Joi validation schemas
- **SQL Injection Protection**: Prisma ORM dengan parameterized queries

## 🐛 Error Handling

API menggunakan konsisten error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (DEV ONLY)

# Code Quality
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Environment Variables for Production

Pastikan semua environment variables sudah diset dengan benar:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_ACCESS_SECRET=your-production-access-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
PORT=3000
```

### Docker Deployment (Optional)

Jika menggunakan Docker, buat `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Support

Jika ada pertanyaan atau issues:

1. Check dokumentasi API di `/api-docs`
2. Pastikan environment variables sudah benar
3. Check database connection
4. Verify JWT secrets sudah di-generate dengan benar

## 📄 License

This project is licensed under the ISC License.

---

**Happy Coding! 🎉**
