import dotenv from 'dotenv';

dotenv.config();

export default async function initializeDatabase(pool, guild) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users
        (
            user_id
            TEXT
            PRIMARY
            KEY,
            rating
            INTEGER
            DEFAULT
            0,
            positive_reviews
            INTEGER
            DEFAULT
            0,
            negative_reviews
            INTEGER
            DEFAULT
            0
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews
        (
            id
            SERIAL
            PRIMARY
            KEY,
            target_user
            TEXT
            REFERENCES
            users
        (
            user_id
        ),
            reviewer_id TEXT NOT NULL,
            is_positive BOOLEAN NOT NULL,
            review_text TEXT,
            "timestamp" TIMESTAMP DEFAULT NOW
        (
        )
            );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocked_reviewers
        (
            user_id
            TEXT
            PRIMARY
            KEY,
            "unblock_time"
            TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocked_receivers
        (
            user_id
            TEXT
            PRIMARY
            KEY,
            "unblock_time"
            TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS settings
        (
            "key"
            TEXT
            PRIMARY
            KEY,
            "value"
            TEXT
            NOT
            NULL
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS rank_criteria
        (
            id
            SERIAL
            PRIMARY
            KEY,
            top_seller
            INTEGER
            DEFAULT
            100,
            great_seller
            INTEGER
            DEFAULT
            75,
            good_seller
            INTEGER
            DEFAULT
            50,
            seller
            INTEGER
            DEFAULT
            25
        );
    `);

    await pool.query(`
        INSERT INTO settings ("key", "value")
        VALUES ('cooldown_minutes', '20'),
               ('cooldown_enabled', 'true'),
               ('allow_self_voting', 'false'),
               ('rank_update_frequency', '1d') ON CONFLICT ("key") DO NOTHING;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS roles
        (
            id
            SERIAL
            PRIMARY
            KEY,
            role_name
            TEXT
            UNIQUE
            NOT
            NULL,
            role_id
            TEXT
            UNIQUE,
            required_rating
            INTEGER
            DEFAULT
            0,
            min_reviews
            INTEGER
            DEFAULT
            0,
            min_positive_reviews
            INTEGER
            DEFAULT
            0,
            min_negative_reviews
            INTEGER
            DEFAULT
            0
        );
    `);

    const defaultRoles = [
        {name: 'Топ-продавец', rating: 500, reviews: 200, positive: 150, negative: 0},
        {name: 'Отличный продавец', rating: 350, reviews: 100, positive: 70, negative: 0},
        {name: 'Хороший продавец', rating: 125, reviews: 50, positive: 30, negative: 0},
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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT DEFAULT ''
        );
    `);

    await pool.query(`
        INSERT INTO settings (key, value)
        VALUES ('leaderboard_channel_id', '') ON CONFLICT (key) DO NOTHING;
    `);

    await pool.query(`
        INSERT INTO settings (key, value)
        VALUES ('leaderboard_message_id', '') ON CONFLICT (key) DO NOTHING;
    `);

    console.log("✅ Database was successfully initialized!");
}
