-- 家庭食材菜谱管理小程序数据库脚本
-- 数据库: food_recipe
-- 字符集: utf8mb4

CREATE DATABASE IF NOT EXISTS food_recipe 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE food_recipe;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(64) NOT NULL COMMENT '微信openid',
    unionid VARCHAR(64) DEFAULT NULL COMMENT '微信unionid',
    nickname VARCHAR(64) DEFAULT NULL COMMENT '昵称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_openid (openid),
    KEY idx_unionid (unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 食材表
CREATE TABLE IF NOT EXISTS foods (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '食材ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    name VARCHAR(64) NOT NULL COMMENT '食材名称',
    category VARCHAR(32) NOT NULL COMMENT '分类：vegetable蔬菜/meat肉类/seafood海鲜/egg蛋奶/staple主食/seasoning调料/drink酒水',
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '数量',
    unit VARCHAR(16) NOT NULL DEFAULT '个' COMMENT '单位：个/斤/克/千克/升/毫升/盒/袋/瓶',
    image_url VARCHAR(500) DEFAULT NULL COMMENT '食材图片URL',
    creator_id BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    creator_name VARCHAR(50) DEFAULT NULL COMMENT '创建人名称',
    location VARCHAR(32) DEFAULT '冰箱冷藏' COMMENT '存放位置：冰箱冷藏/冰箱冷冻/常温/其他',
    expire_date DATE DEFAULT NULL COMMENT '过期日期',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0新鲜/1临期/2过期',
    is_finished TINYINT NOT NULL DEFAULT 0 COMMENT '是否用完：0否/1是',
    finished_at DATETIME DEFAULT NULL COMMENT '用完时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_category (category),
    KEY idx_status (status),
    KEY idx_expire_date (expire_date),
    KEY idx_user_category (user_id, category),
    CONSTRAINT fk_food_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食材表';

-- 菜谱表
CREATE TABLE IF NOT EXISTS recipes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '菜谱ID',
    name VARCHAR(128) NOT NULL COMMENT '菜名',
    type VARCHAR(32) NOT NULL DEFAULT 'vegetarian' COMMENT '荤素类型：vegetarian全素/semi_meat半荤/meat全荤',
    duration VARCHAR(32) NOT NULL DEFAULT '15min' COMMENT '烹饪时长：10min/15min/20min/30min_plus',
    image VARCHAR(500) DEFAULT NULL COMMENT '菜品图片URL',
    images JSON DEFAULT NULL COMMENT '菜谱图片数组 ["url1","url2"]',
    ingredients JSON NOT NULL COMMENT '所需食材 [{"name":"番茄","quantity":2,"unit":"个"}]',
    steps JSON NOT NULL COMMENT '烹饪步骤 ["步骤1","步骤2"]',
    tips VARCHAR(500) DEFAULT NULL COMMENT '小贴士',
    is_preset TINYINT NOT NULL DEFAULT 0 COMMENT '是否预设：0否/1是',
    user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '创建用户ID（预设为null）',
    view_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_type (type),
    KEY idx_duration (duration),
    KEY idx_is_preset (is_preset),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜谱表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    recipe_id BIGINT UNSIGNED NOT NULL COMMENT '菜谱ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_recipe (user_id, recipe_id),
    KEY idx_user_id (user_id),
    KEY idx_recipe_id (recipe_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 购物清单表（购买食材）
CREATE TABLE IF NOT EXISTS shopping_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '清单项ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    food_name VARCHAR(64) NOT NULL COMMENT '食材名称',
    quantity VARCHAR(32) NOT NULL COMMENT '数量（如：2个）',
    category VARCHAR(20) DEFAULT NULL COMMENT '分类：vegetable/meat/seafood/egg/fruit/seasoning/staple/other',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未购买 1-已购买 2-已入库',
    storage_location VARCHAR(20) DEFAULT NULL COMMENT '存放位置：refrigerated/frozen/room',
    expire_date DATE DEFAULT NULL COMMENT '过期日期',
    purchased_at DATETIME DEFAULT NULL COMMENT '购买时间',
    archived_at DATETIME DEFAULT NULL COMMENT '归档时间',
    is_purchased TINYINT NOT NULL DEFAULT 0 COMMENT '是否已购买：0否/1是',
    from_recipe_id BIGINT UNSIGNED DEFAULT NULL COMMENT '来源菜谱ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_category (category),
    KEY idx_is_purchased (is_purchased),
    KEY idx_from_recipe (from_recipe_id),
    CONSTRAINT fk_shop_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_recipe FOREIGN KEY (from_recipe_id) REFERENCES recipes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物清单表';

-- 购物历史表
CREATE TABLE IF NOT EXISTS shopping_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '历史ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    total_items INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '商品总数',
    total_amount DECIMAL(10,2) DEFAULT 0 COMMENT '总金额',
    items JSON COMMENT '商品明细',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物历史表';

-- 插入预设菜谱数据
INSERT INTO recipes (name, type, duration, image, ingredients, steps, tips, is_preset, view_count) VALUES
('番茄炒蛋', 'vegetarian', '15min', NULL, 
 '[{"name":"番茄","quantity":2,"unit":"个"},{"name":"鸡蛋","quantity":3,"unit":"个"},{"name":"葱花","quantity":1,"unit":"把"}]',
 '["番茄洗净切块","鸡蛋打散备用","热锅下油，倒入蛋液炒散盛出","锅中留底油，放入番茄炒出汁","倒入鸡蛋，加盐调味，撒上葱花即可"]',
 '番茄要炒出汁才好吃', 1, 100),

('青椒肉丝', 'meat', '20min', NULL,
 '[{"name":"青椒","quantity":2,"unit":"个"},{"name":"猪肉","quantity":200,"unit":"克"},{"name":"姜蒜","quantity":1,"unit":"份"}]',
 '["猪肉切丝，加生抽、料酒、淀粉腌制10分钟","青椒切丝","热锅下油，放入肉丝滑散变色盛出","锅中留底油，爆香姜蒜，放入青椒翻炒","倒入肉丝，加盐调味炒匀即可"]',
 '肉丝要顺纹切', 1, 95),

('清炒西兰花', 'vegetarian', '10min', NULL,
 '[{"name":"西兰花","quantity":1,"unit":"颗"},{"name":"蒜","quantity":3,"unit":"瓣"}]',
 '["西兰花切小朵，洗净","锅中烧水，加少许盐和油，放入西兰花焯水1分钟捞出","热锅下油，爆香蒜末","放入西兰花翻炒，加盐调味即可"]',
 '焯水时加盐和油能保持翠绿', 1, 90),

('红烧排骨', 'meat', '30min_plus', NULL,
 '[{"name":"排骨","quantity":500,"unit":"克"},{"name":"姜葱","quantity":1,"unit":"份"},{"name":"冰糖","quantity":20,"unit":"克"}]',
 '["排骨洗净焯水去血沫","热锅下油，放入冰糖炒出糖色","放入排骨翻炒上色","加入生抽、老抽、料酒、姜片","加水没过排骨，大火烧开转小火炖30分钟","大火收汁，撒上葱花即可"]',
 '糖色不要炒焦', 1, 88),

('蒜蓉空心菜', 'vegetarian', '10min', NULL,
 '[{"name":"空心菜","quantity":1,"unit":"把"},{"name":"蒜","quantity":5,"unit":"瓣"}]',
 '["空心菜洗净切段","蒜切末","热锅下油，爆香蒜末","放入空心菜大火快炒","加盐调味，炒至断生即可"]',
 '大火快炒保持脆嫩', 1, 85),

('清蒸鲈鱼', 'seafood', '20min', NULL,
 '[{"name":"鲈鱼","quantity":1,"unit":"条"},{"name":"姜葱","quantity":1,"unit":"份"},{"name":"蒸鱼豉油","quantity":2,"unit":"勺"}]',
 '["鲈鱼处理干净，两面划几刀","鱼身抹上料酒和盐，塞入姜片葱段","水开后上锅蒸8-10分钟","取出倒掉蒸出的水，铺上葱丝","淋上蒸鱼豉油，浇上热油即可"]',
 '蒸鱼时间根据鱼大小调整', 1, 82),

('麻婆豆腐', 'semi_meat', '20min', NULL,
 '[{"name":"嫩豆腐","quantity":1,"unit":"盒"},{"name":"肉末","quantity":100,"unit":"克"},{"name":"豆瓣酱","quantity":1,"unit":"勺"}]',
 '["豆腐切小块，焯水去豆腥味","热锅下油，炒香肉末","加入豆瓣酱炒出红油","加水烧开，放入豆腐","勾芡收汁，撒上花椒粉即可"]',
 '豆腐要轻推不要翻炒', 1, 80),

('蛋炒饭', 'vegetarian', '15min', NULL,
 '[{"name":"米饭","quantity":1,"unit":"碗"},{"name":"鸡蛋","quantity":2,"unit":"个"},{"name":"葱花","quantity":1,"unit":"把"}]',
 '["鸡蛋打散，热锅下油炒熟盛出","锅中留底油，放入米饭炒散","倒入鸡蛋，加盐调味","撒上葱花炒匀即可"]',
 '用隔夜饭更香', 1, 78),

('宫保鸡丁', 'meat', '20min', NULL,
 '[{"name":"鸡胸肉","quantity":300,"unit":"克"},{"name":"花生米","quantity":50,"unit":"克"},{"name":"干辣椒","quantity":5,"unit":"个"}]',
 '["鸡肉切丁，加生抽、料酒、淀粉腌制","热锅下油，放入鸡丁滑散变色盛出","锅中留底油，爆香干辣椒","放入鸡丁、花生米翻炒","倒入宫保汁，炒匀即可"]',
 '花生米最后放保持酥脆', 1, 75),

('蒜蓉粉丝虾', 'seafood', '20min', NULL,
 '[{"name":"虾","quantity":10,"unit":"只"},{"name":"粉丝","quantity":1,"unit":"把"},{"name":"蒜","quantity":1,"unit":"头"}]',
 '["粉丝泡软铺在盘底","虾开背去虾线，摆在粉丝上","蒜切末，加生抽、蚝油、糖拌匀","将蒜蓉铺在虾上","水开后上锅蒸8分钟即可"]',
 '虾开背更易入味', 1, 72);

-- 继续添加更多预设菜谱
INSERT INTO recipes (name, type, duration, image, ingredients, steps, tips, is_preset, view_count) VALUES
('醋溜白菜', 'vegetarian', '10min', NULL,
 '[{"name":"白菜","quantity":1,"unit":"颗"},{"name":"醋","quantity":2,"unit":"勺"},{"name":"干辣椒","quantity":3,"unit":"个"}]',
 '["白菜洗净切片","热锅下油，爆香干辣椒","放入白菜大火翻炒","加入醋、盐调味","炒至断生即可"]',
 '大火快炒保持脆爽', 1, 70),

('可乐鸡翅', 'meat', '30min_plus', NULL,
 '[{"name":"鸡翅","quantity":10,"unit":"个"},{"name":"可乐","quantity":1,"unit":"罐"},{"name":"姜葱","quantity":1,"unit":"份"}]',
 '["鸡翅划几刀，加料酒、姜片腌制","热锅下油，放入鸡翅煎至两面金黄","倒入可乐，大火烧开","转小火炖15分钟","大火收汁即可"]',
 '收汁时要不停翻动防止糊锅', 1, 68),

('西红柿鸡蛋汤', 'vegetarian', '15min', NULL,
 '[{"name":"番茄","quantity":2,"unit":"个"},{"name":"鸡蛋","quantity":2,"unit":"个"},{"name":"葱花","quantity":1,"unit":"把"}]',
 '["番茄洗净切块","锅中加水烧开，放入番茄煮5分钟","鸡蛋打散，慢慢倒入锅中","加盐调味，撒上葱花即可"]',
 '蛋液要慢慢倒入形成蛋花', 1, 65);

