-- 更新菜谱食材分类
-- 为现有菜谱的 ingredients 添加 category 字段

-- 1. 番茄炒蛋
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "番茄", "unit": "个", "quantity": 2, "category": "vegetable"}, {"name": "鸡蛋", "unit": "个", "quantity": 3, "category": "egg"}, {"name": "葱花", "unit": "把", "quantity": 1, "category": "vegetable"}]'
WHERE `id` = 1;

-- 2. 青椒肉丝
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "青椒", "unit": "个", "quantity": 2, "category": "vegetable"}, {"name": "猪肉", "unit": "克", "quantity": 200, "category": "meat"}, {"name": "姜蒜", "unit": "份", "quantity": 1, "category": "seasoning"}]'
WHERE `id` = 2;

-- 3. 清炒西兰花
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "西兰花", "unit": "颗", "quantity": 1, "category": "vegetable"}, {"name": "蒜", "unit": "瓣", "quantity": 3, "category": "seasoning"}]'
WHERE `id` = 3;

-- 4. 红烧排骨
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "排骨", "unit": "克", "quantity": 500, "category": "meat"}, {"name": "姜葱", "unit": "份", "quantity": 1, "category": "seasoning"}, {"name": "冰糖", "unit": "克", "quantity": 20, "category": "seasoning"}]'
WHERE `id` = 4;

-- 5. 蒜蓉空心菜
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "空心菜", "unit": "把", "quantity": 1, "category": "vegetable"}, {"name": "蒜", "unit": "瓣", "quantity": 5, "category": "seasoning"}]'
WHERE `id` = 5;

-- 6. 清蒸鲈鱼
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "鲈鱼", "unit": "条", "quantity": 1, "category": "seafood"}, {"name": "姜葱", "unit": "份", "quantity": 1, "category": "seasoning"}, {"name": "蒸鱼豉油", "unit": "勺", "quantity": 2, "category": "seasoning"}]'
WHERE `id` = 6;

-- 7. 麻婆豆腐
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "嫩豆腐", "unit": "盒", "quantity": 1, "category": "staple"}, {"name": "肉末", "unit": "克", "quantity": 100, "category": "meat"}, {"name": "豆瓣酱", "unit": "勺", "quantity": 1, "category": "seasoning"}]'
WHERE `id` = 7;

-- 8. 蛋炒饭
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "米饭", "unit": "碗", "quantity": 1, "category": "staple"}, {"name": "鸡蛋", "unit": "个", "quantity": 2, "category": "egg"}, {"name": "葱花", "unit": "把", "quantity": 1, "category": "vegetable"}]'
WHERE `id` = 8;

-- 9. 宫保鸡丁
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "鸡胸肉", "unit": "克", "quantity": 300, "category": "meat"}, {"name": "花生米", "unit": "克", "quantity": 50, "category": "other"}, {"name": "干辣椒", "unit": "个", "quantity": 5, "category": "seasoning"}]'
WHERE `id` = 9;

-- 10. 蒜蓉粉丝虾
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "虾", "unit": "只", "quantity": 10, "category": "seafood"}, {"name": "粉丝", "unit": "把", "quantity": 1, "category": "staple"}, {"name": "蒜", "unit": "头", "quantity": 1, "category": "seasoning"}]'
WHERE `id` = 10;

-- 11. 醋溜白菜
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "白菜", "unit": "颗", "quantity": 1, "category": "vegetable"}, {"name": "醋", "unit": "勺", "quantity": 2, "category": "seasoning"}, {"name": "干辣椒", "unit": "个", "quantity": 3, "category": "seasoning"}]'
WHERE `id` = 11;

-- 12. 可乐鸡翅
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "鸡翅", "unit": "个", "quantity": 10, "category": "meat"}, {"name": "可乐", "unit": "罐", "quantity": 1, "category": "drink"}, {"name": "姜葱", "unit": "份", "quantity": 1, "category": "seasoning"}]'
WHERE `id` = 12;

-- 13. 西红柿鸡蛋汤
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "番茄", "unit": "个", "quantity": 2, "category": "vegetable"}, {"name": "鸡蛋", "unit": "个", "quantity": 2, "category": "egg"}, {"name": "葱花", "unit": "把", "quantity": 1, "category": "vegetable"}]'
WHERE `id` = 13;

-- 14. 红烧鱼（用户新增的，保留原样但添加 category）
UPDATE `food_recipe`.`recipes` 
SET `ingredients` = '[{"name": "鱼", "unit": "条", "quantity": "1", "category": "seafood"}]'
WHERE `id` = 14;
