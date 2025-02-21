export async function getLeaderboardChannelId(pool) {
    const result = await pool.query(`SELECT value
                                     FROM settings
                                     WHERE key = 'leaderboard_channel_id'`);
    return result.rows[0]?.value || null;
}

export async function setLeaderboardChannelId(pool, channelId) {
    await pool.query(`UPDATE settings
                      SET value = $1
                      WHERE key = 'leaderboard_channel_id'`, [channelId]);
}

export async function getLeaderboardMessageId(pool) {
    const result = await pool.query(`SELECT value
                                     FROM settings
                                     WHERE key = 'leaderboard_message_id'`);
    return result.rows[0]?.value || null;
}

export async function setLeaderboardMessageId(pool, messageId) {
    await pool.query(`UPDATE settings
                      SET value = $1
                      WHERE key = 'leaderboard_message_id'`, [messageId]);
}

export async function getTopSellers(pool) {
    const topUsers = await pool.query(
        `SELECT user_id, rating, positive_reviews, negative_reviews
         FROM users
         WHERE user_id IN (SELECT DISTINCT target_user
                           FROM reviews
                           WHERE timestamp >= NOW() - INTERVAL '30 days')
         ORDER BY rating DESC
         LIMIT 30`
    );

    return topUsers.rows;
}

export async function addUserIfNotExists(pool, user) {
    if (!user || user.bot) {
        return;
    } // Игнорируем ботов

    const checkUser = await pool.query('SELECT * FROM users WHERE user_id = $1', [user.id]);

    if (checkUser.rowCount === 0) {
        await pool.query(
            `INSERT INTO users (user_id, rating, positive_reviews, negative_reviews)
             VALUES ($1, 0, 0, 0)`,
            [user.id]
        );
        console.log(`✅ Пользователь ${user.username}#${user.discriminator} добавлен в базу.`);
    }
}