-- Xóa toàn bộ các món ăn khác trên CSDL, chỉ giữ nguyên 6 món: 4, 6, 7, 8, 9, 11
DELETE FROM dish_translations WHERE dish_id NOT IN (4, 6, 7, 8, 9, 11);
DELETE FROM favorites WHERE dish_id NOT IN (4, 6, 7, 8, 9, 11);
DELETE FROM check_ins WHERE dish_id NOT IN (4, 6, 7, 8, 9, 11);
DELETE FROM dishes WHERE id NOT IN (4, 6, 7, 8, 9, 11);
SELECT setval(pg_get_serial_sequence('dishes', 'id'), COALESCE((SELECT MAX(id) FROM dishes), 1));
