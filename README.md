

Ứng dụng bản đồ và thuyết minh ẩm thực Hội An đa ngôn ngữ (Việt, Anh, Trung, Hàn, Nhật).

# công nghệ sử dụng
- **Frontend:** React Native (Expo), TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Cơ sở dữ liệu:** PostgreSQL

# 1. chạy Backend
Tạo file `backend/.env` dựa trên `backend/.env.example`, sau đó chạy:

```bash
cd backend
npm install
npm run migrate
npm run dev
```
- API & Trang quản trị Admin chạy tại: `http://localhost:4000`

# 2. chạy Frontend
```bash
cd frontend
npm install
npx expo start
```
- Chạy Web: `npm run web`

# link triển khai
- Giao diện người dùng (Web): https://doancnpm-beta.vercel.app/?lang=vi
- Trang quản trị (Admin): https://doancnpm-backend.onrender.com/
