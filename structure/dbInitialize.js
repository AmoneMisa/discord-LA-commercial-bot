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
            negative_reviews INTEGER DEFAULT 0,
            review_notifications_enabled BOOLEAN DEFAULT TRUE
        );
    `);

    await pool.query(`ALTER TABLE users ADD COLUMN review_notifications_enabled BOOLEAN DEFAULT TRUE;`);

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

    console.log("✅ Database was successfully initialized!");
}
