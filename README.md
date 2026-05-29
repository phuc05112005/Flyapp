# VietFly Agency

Nền tảng web app bán vé máy bay cho đại lý, gồm frontend Next.js và backend NestJS. Bản khởi tạo này tập trung vào nền móng chạy được: tìm kiếm chuyến bay bằng mock airline provider, tính giá có hoa hồng, tạo booking, thanh toán giả lập, dashboard admin và Prisma schema đầy đủ để phát triển production.

## Kiến trúc

- `apps/web`: Next.js 14 App Router, TypeScript, Tailwind CSS, UI tiếng Việt.
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis-ready, Swagger-ready.
- `apps/api/src/common/providers`: lớp tích hợp hãng bay và cổng thanh toán. Hiện có mock provider để chạy dev.
- `apps/api/prisma/schema.prisma`: schema dữ liệu cho user, chuyến bay, booking, vé, thanh toán, hoa hồng, khuyến mãi.

## Chạy development

```bash
npm install
docker compose up -d postgres redis
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

Frontend: `http://localhost:3000`
API: `http://localhost:3001/api`
Swagger: `http://localhost:3001/docs`

## Tài khoản mẫu

- Admin: `admin@vietfly.vn` / `Admin@123456`
- Manager: `manager@vietfly.vn` / `Manager@123456`
- Staff: `staff@vietfly.vn` / `Staff@123456`
- Customer: `customer@test.vn` / `Customer@123456`

## Biến môi trường

Sao chép `.env.example` trong từng app:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

## Ghi chú tích hợp hãng bay thật

Các hãng bay thường không mở API công khai đại trà. Muốn lấy giá và xuất vé chính xác theo thời gian thực, đại lý cần hợp đồng/API key hoặc thông qua GDS/NDC/aggregator. Code hiện tách `IAirlineProvider` để thay `MockAirlineProvider` bằng provider production mà không phá luồng đặt vé.
