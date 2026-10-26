# Hội An Quán - Food Guide App (`DoAnCNPM`)

Dự án ứng dụng khám phá ẩm thực Hội An, được chia thành 2 thư mục chính:

```text
DoAnCNPM/
├── frontend/        # Ứng dụng Mobile & Web (Expo / React Native / TypeScript)
├── backend/         # REST API & Admin Dashboard (Node.js / Express / PostgreSQL)
├── .github/         # Cấu hình CI/CD (GitHub Actions)
├── .vscode/         # Thiết lập gợi ý cho VS Code
└── README.md        # Tài liệu hướng dẫn chung
```

---

## 1. Chạy Frontend (`frontend/`)

```bash
cd frontend
npm install
npx expo start
```

- Chạy trên Web: `npm run web`
- Chạy trên Android: `npm run android`
- Chạy trên iOS: `npm run ios`
- Kiểm tra lỗi code (Lint & Typecheck): `npm run lint` và `npx tsc --noEmit`

---

## 2. Chạy Backend (`backend/`)

```bash
cd backend
npm install
npm run migrate
npm run dev
```

- Server mặc định chạy tại `http://localhost:4000`
- Trang quản trị (Admin): `http://localhost:4000/admin`
- Healthcheck API: `http://localhost:4000/api/health`
