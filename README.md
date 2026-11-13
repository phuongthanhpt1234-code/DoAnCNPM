

Ứng dụng bản đồ và thuyết minh ẩm thực Hội An đa ngôn ngữ (Việt, Anh, Trung, Hàn, Nhật).

# công nghệ sử dụng
- **Frontend:** React Native (Expo), TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Cơ sở dữ liệu:** PostgreSQL

## Chạy dự án trên máy cá nhân

Chuẩn bị Node.js 22 và một cơ sở dữ liệu PostgreSQL mà bạn có quyền kết nối.

### Terminal 1 — Backend

Từ thư mục gốc của dự án, chạy trong PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Nếu đã có `.env`, bỏ qua lệnh `Copy-Item`. Mở `backend/.env` và điền
`DATABASE_URL` của PostgreSQL. Sau đó chạy:

```powershell
npm ci
npm run migrate
npm run dev
```

- Kiểm tra API tại `http://localhost:4000/api/health`.
- Mở trang quản trị tại `http://localhost:4000/admin/`.

### Terminal 2 — Frontend

Giữ terminal backend đang chạy. Mở terminal mới tại thư mục gốc:

```powershell
cd frontend
npm ci --legacy-peer-deps
npm run web
```

Mở địa chỉ web mà Expo in trong terminal.

### Thử trên điện thoại

Từ thư mục `frontend`, chạy `npx expo start`. Nếu dùng backend local,
đặt `EXPO_PUBLIC_API_URL` thành `http://IP_MAY_TINH:4000` trong `frontend/.env`
và kết nối điện thoại cùng mạng Wi-Fi với máy tính. Trên điện thoại,
`localhost` trỏ về chính điện thoại.

# link triển khai
- Giao diện người dùng (Web): https://doancnpm-beta.vercel.app/?lang=vi
- Trang quản trị (Admin): https://doancnpm-backend.onrender.com/
