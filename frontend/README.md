# SPK SAW WP - Frontend Application

Frontend application untuk Sistem Pendukung Keputusan (SPK) menggunakan metode Simple Additive Weighting (SAW) dan Weighted Product (WP) dengan autentikasi JWT dan integrasi backend API.

## 🚀 Fitur Utama

### 🔐 Autentikasi

- **Login/Register** dengan validasi form lengkap
- **JWT Token Management** dengan auto-refresh
- **Protected Routes** untuk keamanan aplikasi
- **User Profile Management** dengan update data user

### 📊 Dashboard Admin

- **Real-time Statistics** dari backend API
- **User Information** dengan dropdown menu
- **Recent SPK Records** dengan quick access
- **Responsive Design** untuk mobile dan desktop

### 🧮 SPK Calculation

- **Step-by-step Wizard** untuk input data
- **Criteria Management** dengan bobot dan tipe (benefit/cost)
- **Alternative Management** dengan nilai per kriteria
- **Real-time Calculation** menggunakan backend API
- **SAW vs WP Comparison** dengan visualisasi chart
- **Ranking Analysis** dengan detailed comparison

### 📈 Data Management

- **Create/Read/Update/Delete** SPK records
- **History Management** dengan pagination
- **Export/Import** data SPK
- **Real-time Sync** dengan backend database

## 🛠️ Tech Stack

### Core

- **React 18** dengan TypeScript
- **Vite** untuk build tool dan development server
- **TailwindCSS** untuk styling
- **Shadcn/ui** untuk UI components

### State Management & API

- **TanStack Query (React Query)** untuk server state management
- **Context API** untuk authentication state
- **Custom HTTP Client** dengan auto token refresh
- **Fetch API** untuk HTTP requests

### UI/UX

- **Responsive Design** dengan mobile-first approach
- **Loading States** dengan skeleton dan spinners
- **Toast Notifications** untuk user feedback
- **Form Validation** dengan error handling
- **Charts** menggunakan Recharts untuk visualisasi

### Routing & Authentication

- **React Router v6** untuk client-side routing
- **Protected Routes** dengan authentication guards
- **Public Routes** dengan auto-redirect logic
- **JWT Token Management** dengan localStorage

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **npm** atau **yarn** atau **bun**
- **Backend API** running di http://localhost:3000

## 🚀 Instalasi dan Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd spk-saw-wp/frontend
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
bun install
```

### 3. Environment Configuration

Buat file `.env.local` di root folder frontend:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Development Settings
VITE_NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
# atau
yarn dev
# atau
bun dev
```

Aplikasi akan berjalan di: http://localhost:5173

## 🔧 Environment Variables

| Variable            | Description          | Default Value               |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_NODE_ENV`     | Environment mode     | `development`               |

## 📁 Struktur Folder

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn/ui base components
│   │   ├── LoginForm.tsx    # Login form component
│   │   ├── RegisterForm.tsx # Register form component
│   │   ├── AdminSidebar.tsx # Admin sidebar navigation
│   │   ├── CriteriaForm.tsx # SPK criteria input form
│   │   ├── AlternativeForm.tsx # SPK alternative input form
│   │   ├── ReviewData.tsx   # Data review component
│   │   ├── ResultComparison.tsx # SAW vs WP comparison
│   │   └── HistoryList.tsx  # SPK history list
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   └── use-toast.ts    # Toast notification hook
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts          # API client and services
│   │   └── utils.ts        # Common utilities
│   ├── pages/               # Page components
│   │   ├── Index.tsx       # Main dashboard page
│   │   ├── Auth.tsx        # Authentication page
│   │   └── NotFound.tsx    # 404 error page
│   ├── utils/               # Utility functions
│   │   └── calculations.tsx # SPK calculation utilities
│   ├── App.tsx              # Main app component
│   └── main.tsx            # App entry point
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🔗 API Integration

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### SPK Endpoints

- `POST /api/spk` - Create new SPK record
- `GET /api/spk` - Get all SPK records (with pagination)
- `GET /api/spk/:id` - Get SPK record by ID
- `PUT /api/spk/:id` - Update SPK record
- `DELETE /api/spk/:id` - Delete SPK record

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎯 Usage Flow

### 1. Authentication

1. Akses aplikasi di http://localhost:5173
2. Jika belum login, akan diarahkan ke halaman `/auth`
3. Pilih **Login** jika sudah punya akun atau **Register** untuk akun baru
4. Setelah berhasil, akan diarahkan ke dashboard

### 2. Dashboard

1. Lihat statistik dan data terbaru
2. Akses user menu untuk logout atau update profil
3. Pilih **"Buat SPK Baru"** untuk membuat analisis baru
4. Atau pilih **"Riwayat"** untuk melihat SPK yang tersimpan

### 3. Membuat SPK Baru

1. **Step 1**: Input kriteria dengan nama, bobot, dan tipe (benefit/cost)
2. **Step 2**: Input alternatif dengan nilai untuk setiap kriteria
3. **Step 3**: Review data yang telah diinput
4. **Step 4**: Lihat hasil perhitungan SAW vs WP dengan chart dan ranking

### 4. Menyimpan dan Mengelola Data

1. Berikan judul untuk SPK dan simpan ke database
2. Akses riwayat untuk melihat, mengedit, atau menghapus SPK
3. View detail hasil dari SPK yang tersimpan

## 🔒 Security Features

- **JWT Token Management** dengan auto-refresh
- **Protected Routes** mencegah akses tanpa autentikasi
- **Input Validation** pada semua form
- **XSS Protection** dengan proper sanitization
- **CORS** configuration untuk API security

## 📱 Responsive Design

- **Mobile-first** approach dengan breakpoints:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+
- **Touch-friendly** UI untuk mobile devices
- **Optimized Navigation** dengan collapsible sidebar

## 🚀 Build & Deployment

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Available Scripts

| Script              | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run build:dev` | Build for development    |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint               |

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**

   - Pastikan backend server berjalan di http://localhost:3000
   - Check environment variable `VITE_API_BASE_URL`

2. **Authentication Issues**

   - Clear localStorage dan cookies
   - Restart development server

3. **Build Errors**
   - Delete `node_modules` dan reinstall dependencies
   - Check TypeScript errors dengan `npm run lint`

### Error Handling

- **Network Errors**: Auto-retry dengan exponential backoff
- **Authentication Errors**: Auto-redirect ke login page
- **Validation Errors**: Inline form validation dengan user feedback
- **Server Errors**: Toast notifications dengan error details

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika mengalami masalah atau butuh bantuan:

1. Check dokumentasi ini
2. Review error messages di browser console
3. Check backend server logs
4. Create issue di repository

---

**Happy Coding! 🚀**
