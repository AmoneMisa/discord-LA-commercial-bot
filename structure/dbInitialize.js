import dotenv from 'dotenv';

dotenv.config();

export default async function initializeDatabase(pool, guild) {
    let result;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users
        (
            user_id          VARCHAR PRIMARY KEY,
            rating           INTEGER DEFAULT 0,
            positive_reviews INTEGER DEFAULT 0,
            negative_reviews INTEGER DEFAULT 0
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews
        (
            id          SERIAL PRIMARY KEY,
            target_user VARCHAR REFERENCES users (user_id),
            reviewer_id VARCHAR REFERENCES users (user_id),
            is_positive BOOLEAN NOT NULL,
            review_text TEXT,
            "timestamp" TIMESTAMP DEFAULT NOW()
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocked_reviewers
        (
            user_id      VARCHAR REFERENCES users (user_id) PRIMARY KEY,
            unblock_time TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocked_receivers
        (
            user_id      VARCHAR REFERENCES users (user_id) PRIMARY KEY,
            unblock_time TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS settings
        (
            key   VARCHAR PRIMARY KEY,
            value VARCHAR DEFAULT ''
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS rank_criteria
        (
            id           SERIAL PRIMARY KEY,
            top_seller   INTEGER DEFAULT 100,
            great_seller INTEGER DEFAULT 75,
            good_seller  INTEGER DEFAULT 50,
            seller       INTEGER DEFAULT 25
        );
    `);

    result = await pool.query(`SELECT COUNT(*)
                               FROM settings`);

    if (!result.rows[0].count || +result.rows[0].count < 1) {
        await pool.query(`
            INSERT INTO settings ("key", "value")
            VALUES ('cooldown_minutes', '20'),
                   ('cooldown_enabled', 'true'),
                   ('allow_self_voting', 'false'),
                   ('rank_update_frequency', '1d'),
                   ('leaderboard_channel_id', ''),
                   ('leaderboard_message_id', '')
            ON CONFLICT ("key") DO NOTHING;
        `);
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS roles
        (
            id                   SERIAL PRIMARY KEY,
            role_name            VARCHAR UNIQUE NOT NULL,
            role_id              VARCHAR UNIQUE,
            required_rating      INTEGER DEFAULT 0,
            min_reviews          INTEGER DEFAULT 0,
            min_positive_reviews INTEGER DEFAULT 0,
            min_negative_reviews INTEGER DEFAULT 0
        );
    `);

    result = await pool.query(`SELECT COUNT(*)
                               FROM roles`);

    if (!result.rows[0].count || +result.rows[0].count < 1) {
        const defaultRoles = [
            {name: 'Топ-продавец', rating: 100, reviews: 100, positive: 80, negative: 0},
            {name: 'Отличный продавец', rating: 75, reviews: 80, positive: 50, negative: 0},
            {name: 'Хороший продавец', rating: 50, reviews: 30, positive: 15, negative: 0},
            {name: 'Продавец', rating: 0, reviews: 0, positive: 0, negative: 0},
        ];

        for (const role of defaultRoles) {
            let existingRole = await pool.query('SELECT * FROM roles WHERE role_name = $1', [role.name]);

            if (existingRole.rows.length === 0) {
                let createdRole = await guild.roles.create({
                    name: role.name,
                    permissions: [],
                    mentionable: true
                });

                await pool.query(
                    `INSERT INTO roles (role_name, role_id, required_rating, min_reviews, min_positive_reviews,
                                        min_negative_reviews)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [role.name, createdRole.id, role.rating, role.reviews, role.positive, role.negative]
                );
                console.log(`✅ Создана роль: ${role.name}`);
            }
        }
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS raids
                      (
                          id        SERIAL PRIMARY KEY,
                          raid_name VARCHAR NOT NULL
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS raid_roles
                      (
                          id        SERIAL PRIMARY KEY,
                          role_name VARCHAR        NOT NULL,
                          role_id   VARCHAR UNIQUE NOT NULL
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS available_raids
                      (
                          id      SERIAL PRIMARY KEY,
                          raid_id INT REFERENCES raids (id),
                          role_id VARCHAR REFERENCES raid_roles (role_id)
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS subscriptions
                      (
                          id        SERIAL PRIMARY KEY,
                          buyer_id  VARCHAR REFERENCES users (user_id),
                          seller_id VARCHAR REFERENCES users (user_id),
                          raid_id   INT REFERENCES available_raids (id)
                      );`);

    result = await pool.query(`SELECT COUNT(*)
                               FROM raids`);

    if (!result.rows[0].count || +result.rows[0].count < 1) {
        await pool.query(`
            INSERT INTO raids (raid_name)
            VALUES ('Ехидна'),
                   ('Бехемос'),
                   ('Камен 1.0'),
                   ('Эгир (нормал)'),
                   ('Эгир (хард)'),
                   ('Аврельсуд (нормал)'),
                   ('Аврельсуд (хард)'),
                   ('Камен 2.0 (нормал)'),
                   ('Камен 2.0 (хард)');
        `);
    }

    await pool.query(`INSERT INTO settings (key, value)
                      VALUES ('bus_category', '')
                      ON CONFLICT (key) DO NOTHING;`);

    await pool.query(`CREATE TABLE IF NOT EXISTS inventory
                      (
                          id             SERIAL PRIMARY KEY,
                          user_id        VARCHAR REFERENCES users (user_id),
                          type           VARCHAR(3) CHECK (type IN ('WTT', 'WTS', 'WTB')),                          -- Тип сделки
                          item_offer     TEXT NOT NULL,                                                             -- Предмет, который продаётся / обменивается
                          item_request   TEXT,                                                                      -- Только для WTT: предмет, который хотят получить
                          amount_offer   INT CHECK (amount_offer >= 1 AND amount_offer <= 9999),                    -- Количество продаваемого / обмениваемого предмета
                          amount_request INT CHECK (amount_request >= 1 AND amount_request <= 9999),
                          offer_level    INT CHECK (offer_level >= 1 AND offer_level <= 10) NULL,                        -- Количество продаваемого / обмениваемого предмета
                          request_level  INT CHECK (request_level >= 1 AND request_level <= 10) NULL,                    -- Только для WTT
                          price          INT CHECK (price >= 0),                                                    -- Только для WTS и WTB
                          negotiable     BOOLEAN   DEFAULT FALSE,                                                   -- Можно ли торговаться
                          server         VARCHAR(20) CHECK (server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')), -- Сервер сделки
                          expires_at     TIMESTAMP DEFAULT NOW() + INTERVAL '3 days',                               -- Дата истечения лота
                          notified       BOOLEAN   DEFAULT FALSE                                                    -- Было ли уведомление о снятии лота
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trade_deals
                      (
                          id          SERIAL PRIMARY KEY,
                          buyer_id         VARCHAR REFERENCES users (user_id),                                                          -- Покупатель / меняющийся
                          seller_id        VARCHAR REFERENCES users (user_id),
                          type             VARCHAR(3) CHECK (type IN ('WTT', 'WTS', 'WTB')),                                            -- Продавец / меняющийся
                          item_offered     TEXT                                                   NOT NULL,                             -- Предмет, который предложили
                          item_requested   TEXT,                                                                                        -- Только для обмена (WTT)
                          amount_offered   INT                                                    NOT NULL CHECK (amount_offered >= 1), -- Количество предложенного предмета
                          amount_requested INT CHECK (amount_requested >= 1),
                          offer_level      INT CHECK (offer_level >= 1 AND offer_level <= 10)     NULL,                                 -- Количество продаваемого / обмениваемого предмета
                          request_level    INT CHECK (request_level >= 1 AND request_level <= 10) NULL,                                 -- Только для WTT
                          price            INT CHECK (price >= 0),                                                                      -- Цена сделки (только WTS и WTB)
                          trade_type       VARCHAR(3) CHECK (trade_type IN ('WTT', 'WTS', 'WTB')),                                      -- Тип сделки
                          server           VARCHAR(20) CHECK (server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')),                   -- Сервер
                          timestamp        TIMESTAMP DEFAULT NOW()                                                                      -- Дата совершения сделки
                      );`);
    //
    // await pool.query(`CREATE INDEX idx_trade_deals_buyer ON trade_deals (buyer_id);
    // CREATE INDEX idx_trade_deals_seller ON trade_deals (seller_id);
    // CREATE INDEX idx_trade_deals_timestamp ON trade_deals (timestamp);`);

//     await pool.query(`CREATE OR REPLACE FUNCTION remove_expired_lots() RETURNS TRIGGER AS $$
// BEGIN
//     DELETE FROM inventory WHERE expires_at <= NOW();
//     RETURN NULL;
// END;
// $$ LANGUAGE plpgsql;
//
// CREATE TRIGGER remove_expired_lots_trigger
// AFTER INSERT OR UPDATE ON inventory
// FOR EACH ROW EXECUTE FUNCTION remove_expired_lots();`);

    await pool.query(`CREATE TABLE IF NOT EXISTS items
                      (
                          id       SERIAL PRIMARY KEY,
                          name     VARCHAR    NOT NULL,
                          category VARCHAR NOT NULL,
                          level    INT     NULL,
                          grade    VARCHAR NULL, 
                          rolls    INT,
                          slots    INT
                      );`);

    await pool.query(`INSERT INTO items (name, category, level, grade, rolls, slots)
                      VALUES ('Серьга', 'Аксессуар', NULL, 'Реликтовый', 0, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Древний', 0, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Реликтовый', 0, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Древний', 0, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Реликтовый', 0, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Древний', 0, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Реликтовый', 1, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Древний', 1, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Реликтовый', 1, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Древний', 1, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Реликтовый', 1, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Древний', 1, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Реликтовый', 2, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Древний', 2, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Реликтовый', 2, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Древний', 2, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Реликтовый', 2, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Древний', 2, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Реликтовый', 3, NULL),
                             ('Серьга', 'Аксессуар', NULL, 'Древний', 3, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Реликтовый', 3, NULL),
                             ('Кольцо', 'Аксессуар', NULL, 'Древний', 3, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Реликтовый', 3, NULL),
                             ('Ожерелье', 'Аксессуар', NULL, 'Древний', 3, NULL),
                             ('Браслет', 'Аксессуар', NULL, 'Реликтовый', NULL, 1),
                             ('Браслет', 'Аксессуар', NULL, 'Древний', NULL, 2),
                             ('Браслет', 'Аксессуар', NULL, 'Реликтовый', NULL, 2),
                             ('Браслет', 'Аксессуар', NULL, 'Древний', NULL, 3),
                             ('Самоцвет (Урон)', 'Самоцвет', 5, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Урон)', 'Самоцвет', 6, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Урон)', 'Самоцвет', 7, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Урон)', 'Самоцвет', 8, 'Реликтовый', NULL, NULL),
                             ('Самоцвет (Урон)', 'Самоцвет', 9, 'Реликтовый', NULL, NULL),
                             ('Самоцвет (Урон)', 'Самоцвет', 10, 'Древний', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 5, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 6, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 7, 'Легендарный', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 8, 'Реликтовый', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 9, 'Реликтовый', NULL, NULL),
                             ('Самоцвет (Откат)', 'Самоцвет', 10, 'Древний',NULL, NULL)`);

    await pool.query(`CREATE TABLE IF NOT EXISTS accessory_effects
                      (
                          id          SERIAL PRIMARY KEY,
                          category    VARCHAR NOT NULL, -- Категория аксессуара (Общие, Ожерелья, Серьги, Кольца)
                          effect_name TEXT    NOT NULL, -- Название эффекта
                          low_bonus   VARCHAR NOT NULL, -- Минимальный (Low) бонус
                          mid_bonus   VARCHAR NOT NULL, -- Средний (Mid) бонус
                          high_bonus  VARCHAR NOT NULL  -- Максимальный (High) бонус
                      );
    `);

    let accessoryResult = `SELECT COUNT(*)
                               FROM raids`;

    await pool.query(`INSERT INTO accessory_effects (category, effect_name, low_bonus, mid_bonus, high_bonus)
                      VALUES
                          -- Общие эффекты
                          ('Общие', 'Объём здоровья', '1300', '3250', '6500'),
                          ('Общие', 'Сила атаки', '80', '195', '390'),
                          ('Общие', 'Урон оружия', '195', '480', '960'),
                          ('Общие', 'Объём маны', '6', '15', '30'),
                          ('Общие', 'Длительность эффектов контроля', '0.2%', '0.5%', '1%'),
                          ('Общие', 'Восстановление здоровья в бою', '10', '25', '50'),

                          -- Ожерелья
                          ('Ожерелья', 'Дополнительный урон', '0.7%', '1.6%', '2.6%'),
                          ('Ожерелья', 'Наносимый урон', '0.55%', '1.2%', '2%'),
                          ('Ожерелья', 'Набор энергии аккордов/веры/гармонии', '1.6%', '3.6%', '6%'),
                          ('Ожерелья', 'Эффективность стигмы', '2.15%', '4.8%', '8%'),

                          -- Серьги
                          ('Серьги', 'Сила атаки', '0.4%', '0.95%', '1.55%'),
                          ('Серьги', 'Урон оружия', '0.8%', '1.8%', '3%'),
                          ('Серьги', 'Эффективность исцеления союзников', '0.95%', '2.1%', '3.5%'),
                          ('Серьги', 'Эффективность щита для союзников', '0.95%', '2.1%', '3.5%'),

                          -- Кольца
                          ('Кольца', 'Шанс критического удара', '0.4%', '0.95%', '1.55%'),
                          ('Кольца', 'Критический урон', '1.1%', '2.4%', '4%'),
                          ('Кольца', 'Эффективность увеличения силы атаки союзников', '1.35%', '3%', '5%'),
                          ('Кольца', 'Эффективность увеличения урона союзников', '2%', '4.5%', '7.5%');
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS bracelet_effects (
        id SERIAL PRIMARY KEY,
        rarity VARCHAR,
        effect_name VARCHAR NOT NULL,
        min_value VARCHAR,
        max_value VARCHAR);
    `);

    await pool.query(`INSERT INTO bracelet_effects (rarity, effect_name, min_value, max_value) VALUES
    -- 🔹 Реликтовый браслет
    ('Реликтовый', 'Сила', 6400, 12800),
    ('Реликтовый', 'Ловкость', 6400, 12800),
    ('Реликтовый', 'Интеллект', 6400, 12800),
    ('Реликтовый', 'Выносливость', 3000, 5000),
    ('Реликтовый', 'Смертоносность', 41, 100),
    ('Реликтовый', 'Мастерство', 41, 100),
    ('Реликтовый', 'Подавление', 41, 100),
    ('Реликтовый', 'Сноровка', 41, 100),
    ('Реликтовый', 'Стойкость', 41, 100),
    ('Реликтовый', 'Искусность', 41, 100),
    ('Реликтовый', 'Восстановление здоровья в бою', 80, 130),
    ('Реликтовый', 'Защита', 4000, 6000),
    ('Реликтовый', 'Объём здоровья', 8400, 14000),
    ('Реликтовый', 'Скорость восстановления осн. боевого ресурса', 6.00, 10.00),
    ('Реликтовый', 'Сопротивление', 4000, 6000),
    ('Реликтовый', 'Попадание по противнику на 90 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Реликтовый', 'Попадание по противнику на 80 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Реликтовый', 'Попадание по противнику на 70 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Реликтовый', 'Урон противникам типа "редкий" и ниже повышается', 3, 5),
    ('Реликтовый', 'Урон, получаемый от противников типа "редкий" и ниже, снижается', 4, 8),
    ('Реликтовый', 'Время восстановления манёра и подъёма снижается', 6, 10),
    ('Реликтовый', 'Скорость атаки и передвижения повышается', 3, 5),

    -- 🔸 Древний браслет
    ('Древний', 'Сила', 9600, 16000),
    ('Древний', 'Ловкость', 9600, 16000),
    ('Древний', 'Интеллект', 9600, 16000),
    ('Древний', 'Выносливость', 4000, 6000),
    ('Древний', 'Смертоносность', 61, 120),
    ('Древний', 'Мастерство', 61, 120),
    ('Древний', 'Подавление', 61, 120),
    ('Древний', 'Сноровка', 61, 120),
    ('Древний', 'Стойкость', 61, 120),
    ('Древний', 'Искусность', 61, 120),
    ('Древний', 'Восстановление здоровья в бою', 100, 160),
    ('Древний', 'Защита', 5000, 7000),
    ('Древний', 'Объём здоровья', 11200, 16800),
    ('Древний', 'Скорость восстановления осн. боевого ресурса', 8.00, 12.00),
    ('Древний', 'Сопротивление', 5000, 7000),
    ('Древний', 'Попадание по противнику на 80 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Древний', 'Попадание по противнику на 70 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Древний', 'Попадание по противнику на 60 сек даёт неуязвимость к ошеломлению и негативным эффектам.', NULL, NULL),
    ('Древний', 'Урон противникам типа "редкий" и ниже повышается', 4, 6),
    ('Древний', 'Урон, получаемый от противников типа "редкий" и ниже, снижается', 6, 10),
    ('Древний', 'Время восстановления манёра и подъёма снижается', 8, 12),
    ('Древний', 'Скорость атаки и передвижения повышается', 4, 6);
`);
    console.log("✅ Database was successfully initialized!");
}
