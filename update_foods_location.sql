-- 更新 foods 表的 location 字段，将英文转换为中文

-- 1. 将 'refrigerated' 更新为 '冰箱冷藏'
UPDATE `food_recipe`.`foods` 
SET `location` = '冰箱冷藏' 
WHERE `location` = 'refrigerated';

-- 2. 将 'frozen' 更新为 '冰箱冷冻'
UPDATE `food_recipe`.`foods` 
SET `location` = '冰箱冷冻' 
WHERE `location` = 'frozen';

-- 3. 将 'room' 更新为 '常温'
UPDATE `food_recipe`.`foods` 
SET `location` = '常温' 
WHERE `location` = 'room';

-- 4. 将其他英文值更新为 '其他'
UPDATE `food_recipe`.`foods` 
SET `location` = '其他' 
WHERE `location` IN ('other', 'fridge', 'freezer', 'pantry', 'cabinet');

-- 5. 如果 location 为空，默认设为 '冰箱冷藏'
UPDATE `food_recipe`.`foods` 
SET `location` = '冰箱冷藏' 
WHERE `location` IS NULL OR `location` = '';
