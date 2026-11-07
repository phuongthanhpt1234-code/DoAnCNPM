--Xóa cấc cột bảng k cần yêu cầu
ALTER TABLE dishes DROP COLUMN IF EXISTS price_vnd;
ALTER TABLE dishes DROP COLUMN IF EXISTS rating;
ALTER TABLE dishes DROP COLUMN IF EXISTS emoji;
DROP TABLE IF EXISTS users CASCADE;
