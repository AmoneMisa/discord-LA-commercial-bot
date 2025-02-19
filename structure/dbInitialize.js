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
                          buyer_id  VARCHAR REFERENCES users (user_id) ON DELETE CASCADE,
                          seller_id VARCHAR REFERENCES users (user_id) ON DELETE CASCADE,
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
                          name     VARCHAR NOT NULL,
                          category VARCHAR NOT NULL
                      );`);

    result = await pool.query(`SELECT COUNT(*)
                               FROM items`);

    if (!result.rows || !result.rows[0].count || +result.rows[0].count < 1) {
        await pool.query(`INSERT INTO items (name, category)
                          VALUES ('Серьга', 'Аксессуар'),
                                 ('Кольцо', 'Аксессуар'),
                                 ('Ожерелье', 'Аксессуар'),
                                 ('Самоцвет (Урон)', 'Самоцвет'),
                                 ('Самоцвет (КД)', 'Самоцвет')`);
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS accessory_effects
                      (
                          id          SERIAL PRIMARY KEY,
                          category    VARCHAR NOT NULL, -- Категория аксессуара (Общие, Ожерелья, Серьги, Кольца)
                          effect_name VARCHAR NOT NULL UNIQUE, -- Название эффекта
                          low_bonus   VARCHAR NOT NULL, -- Минимальный (Low) бонус
                          mid_bonus   VARCHAR NOT NULL, -- Средний (Mid) бонус
                          high_bonus  VARCHAR NOT NULL  -- Максимальный (High) бонус
                      );
    `);

    result = await pool.query(`SELECT COUNT(*)
                               FROM accessory_effects`);

    if (!result.rows || !result.rows[0].count || +result.rows[0].count < 1) {
        await pool.query(`INSERT INTO accessory_effects (category, effect_name, low_bonus, mid_bonus, high_bonus)
                          VALUES
                              -- Общие эффекты
                              ('Общие', 'Объём здоровья', '1300', '3250', '6500'),
                              ('Общие', 'Сила атаки', '80', '195', '390'),
                              ('Общие', 'Урон оружия', '195', '480', '960'),

                              -- Ожерелья
                              ('Ожерелье', 'Дополнительный урон', '0.7%', '1.6%', '2.6%'),
                              ('Ожерелье', 'Наносимый урон', '0.55%', '1.2%', '2%'),
                              ('Ожерелье', 'Набор энергии аккордов/веры/гармонии', '1.6%', '3.6%', '6%'),
                              ('Ожерелье', 'Эффективность стигмы', '2.15%', '4.8%', '8%'),

                              -- Серьги
                              ('Серьга', 'Сила атаки %', '0.4%', '0.95%', '1.55%'),
                              ('Серьга', 'Урон оружия %', '0.8%', '1.8%', '3%'),
                              ('Серьга', 'Эффективность исцеления союзников', '0.95%', '2.1%', '3.5%'),
                              ('Серьга', 'Эффективность щита для союзников', '0.95%', '2.1%', '3.5%'),

                              -- Кольца
                              ('Кольцо', 'Шанс критического удара', '0.4%', '0.95%', '1.55%'),
                              ('Кольцо', 'Критический урон', '1.1%', '2.4%', '4%'),
                              ('Кольцо', 'Эффективность увеличения силы атаки союзников', '1.35%', '3%', '5%'),
                              ('Кольцо', 'Эффективность увеличения урона союзников', '2%', '4.5%', '7.5%');
        `);
    }

    pool.query(`CREATE TABLE IF NOT EXISTS profiles
                (
                    id               SERIAL PRIMARY KEY,
                    user_id          VARCHAR UNIQUE REFERENCES users (user_id) ON DELETE CASCADE,
                    name             VARCHAR                                                           NULL,
                    main_nickname    VARCHAR UNIQUE                                                    NOT NULL,
                    role             VARCHAR(20) CHECK (role IN ('покупатель', 'продавец', 'нейтрал')) NULL,
                    prime_start      TIME                                                              NULL,
                    prime_end        TIME                                                              NULL,
                    raid_experience  VARCHAR[],
                    sales_experience VARCHAR                                                           NULL,
                    achievements     VARCHAR[]
                );`);

    pool.query(`CREATE TABLE IF NOT EXISTS characters
                (
                    id         SERIAL PRIMARY KEY,
                    profile_id INT REFERENCES profiles (id) ON DELETE CASCADE,
                    class_name VARCHAR        NOT NULL,
                    char_name  VARCHAR UNIQUE NOT NULL,
                    gear_score FLOAT          NOT NULL
                );`);


    await pool.query(`CREATE TABLE IF NOT EXISTS inventory
                      (
                          id             SERIAL PRIMARY KEY,
                          user_id        VARCHAR REFERENCES users (user_id) ON DELETE CASCADE,
                          trade_type     VARCHAR(3) CHECK (trade_type IN ('WTT', 'WTS', 'WTB')),                    -- Тип сделки
                          item_offer     TEXT                                                   NOT NULL,           -- Предмет, который продаётся / обменивается
                          item_request   TEXT,                                                                      -- Только для WTT: предмет, который хотят получить
                          offer_level    INT CHECK (offer_level >= 1 AND offer_level <= 10)     NULL,               -- Количество продаваемого / обмениваемого предмета
                          request_level  INT CHECK (request_level >= 1 AND request_level <= 10) NULL,               -- Только для WTT
                          price          INT CHECK (price >= 0),                                                    -- Только для WTS и WTB
                          negotiable     BOOLEAN   DEFAULT FALSE,                                                   -- Можно ли торговаться
                          server         VARCHAR(20) CHECK (server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')), -- Сервер сделки
                          offer_rarity   VARCHAR(20) CHECK (offer_rarity IN ('Реликтовый', 'Древний')),             -- Сервер сделки
                          request_rarity VARCHAR(20) CHECK (request_rarity IN ('Реликтовый', 'Древний')),           -- Сервер сделки
                          expires_at     TIMESTAMP DEFAULT NOW() + INTERVAL '3 days',                               -- Сервер
                          notified       BOOLEAN   DEFAULT FALSE                                                    -- Было ли уведомление о снятии лота
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS inventory_characteristics
                      (
                          id           SERIAL PRIMARY KEY,
                          inventory_id INT REFERENCES inventory (id) ON DELETE CASCADE,         -- Связь с лотом
                          effect_name  VARCHAR NOT NULL,
                          effect_value VARCHAR NOT NULL,
                          CONSTRAINT fk_effect_name FOREIGN KEY (effect_name) REFERENCES accessory_effects (effect_name),
                          CONSTRAINT unique_inventory_effect UNIQUE (inventory_id, effect_name) -- Запрещаем дубли effect_name для одного inventory_id
                      )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trade_deals
                      (
                          id             SERIAL PRIMARY KEY,
                          buyer_id       VARCHAR REFERENCES users (user_id),                                        -- Покупатель / меняющийся
                          seller_id      VARCHAR REFERENCES users (user_id),                                        -- Продавец / меняющийся
                          item_offered   VARCHAR                                                NOT NULL,           -- Предмет, который предложили
                          item_requested VARCHAR,
                          offer_level    INT CHECK (offer_level >= 1 AND offer_level <= 10)     NULL,               -- Количество продаваемого / обмениваемого предмета
                          request_level  INT CHECK (request_level >= 1 AND request_level <= 10) NULL,               -- Только для WTT
                          price          INT CHECK (price >= 0),                                                    -- Цена сделки (только WTS и WTB)
                          trade_type     VARCHAR(3) CHECK (trade_type IN ('WTT', 'WTS', 'WTB')),                    -- Тип сделки
                          server         VARCHAR(20) CHECK (server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')), -- Сервер
                          offer_rarity   VARCHAR(20) CHECK (offer_rarity IN ('Реликтовый', 'Древний')),             -- Сервер сделки
                          request_rarity VARCHAR(10) CHECK (request_rarity IN ('Реликтовый', 'Древний')),
                          timestamp      TIMESTAMP DEFAULT NOW()                                                    -- Дата совершения сделки
                      );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trade_deals_characteristics
                      (
                          id           SERIAL PRIMARY KEY,
                          trade_id     INT REFERENCES trade_deals (id) ON DELETE CASCADE, -- Связь со сделкой
                          effect_name  VARCHAR NOT NULL,
                          effect_value VARCHAR NOT NULL,
                          CONSTRAINT fk_effect_name FOREIGN KEY (effect_name) REFERENCES accessory_effects (effect_name),
                          CONSTRAINT unique_trade_deals_effect UNIQUE (trade_id, effect_name) -- Запрещаем дубли effect_name для одного trade_id
                      );`);

    console.log("✅ Database was successfully initialized!");
}
