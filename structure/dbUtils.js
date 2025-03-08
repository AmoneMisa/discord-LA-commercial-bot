/**
 * Retrieves the leaderboard channel ID from the settings table.
 *
 * @param {Object} pool - The database connection pool used to execute the query.
 * @return {Promise<string|null>} The leaderboard channel ID if found, or null if not present.
 */
export async function getLeaderboardChannelId(pool) {
    const result = await pool.query(`SELECT value
                                     FROM settings
                                     WHERE key = 'leaderboard_channel_id'`);
    return result.rows[0]?.value || null;
}

/**
 * Sets the leaderboard channel ID in the database.
 *
 * @param {Object} pool - The database connection pool used to execute the query.
 * @param {string} channelId - The ID of the channel to be set as the leaderboard channel.
 * @return {Promise<void>} A promise that resolves when the leaderboard channel ID has been successfully updated in the database.
 */
export async function setLeaderboardChannelId(pool, channelId) {
    await pool.query(`UPDATE settings
                      SET value = $1
                      WHERE key = 'leaderboard_channel_id'`, [channelId]);
}

/**
 * Retrieves the message ID for the leaderboard from the database.
 *
 * @param {object} pool - The database connection pool used to query the database.
 * @return {Promise<string|null>} A promise that resolves to the leaderboard message ID as a string,
 * or null if the message ID is not found.
 */
export async function getLeaderboardMessageId(pool) {
    const result = await pool.query(`SELECT value
                                     FROM settings
                                     WHERE key = 'leaderboard_message_id'`);
    return result.rows[0]?.value || null;
}

/**
 * Updates the leaderboard message ID in the database settings.
 *
 * @param {Object} pool - The database connection pool object.
 * @param {string} messageId - The new leaderboard message ID to be stored in the database.
 * @return {Promise<void>} A promise that resolves when the update operation is complete.
 */
export async function setLeaderboardMessageId(pool, messageId) {
    await pool.query(`UPDATE settings
                      SET value = $1
                      WHERE key = 'leaderboard_message_id'`, [messageId]);
}

/**
 * Fetches the top sellers based on their rating from the database.
 *
 * @param {Object} pool - The database connection pool to execute the query.
 * @return {Promise<Array>} A promise that resolves to an array of top sellers, including their user_id, rating, positive_reviews, and negative_reviews.
 */
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
/**
 * Adds a user to the database if they do not already exist and are not a bot.
 *
 * @param {Object} pool - The database connection pool to perform queries.
 * @param {Object} user - The user object containing details about the user. Must include `id`, `bot`, `username`, and `discriminator` properties.
 * @return {Promise<void>} A Promise that resolves when the operation is complete or if the user already exists or is a bot.
 */
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

export async function getTotalBank(pool, eventId) {
    const result = await pool.query(`SELECT * FROM bets WHERE event_id = $1`, [eventId]);
    let totalBank = 0;

    result.rows.forEach(bet => totalBank += parseInt(bet.amount));
    return totalBank;
}

export async function getTotalBankByUser(pool, eventId, target) {
    const result = await pool.query(`SELECT * FROM bets WHERE event_id = $1 AND target = $2`, [eventId, target]);
    let totalBank = 0;

    result.rows.forEach(bet => totalBank += parseInt(bet.amount));
    return totalBank;
}

export async function getCurrentUserOdd(pool, eventId, userId, target) {
    const totalBank = await getTotalBank(pool, eventId);
    const totalTargetBets = await getTotalBankByUser(pool, eventId, target);

    return totalTargetBets === 0 ? 1 : Math.max(totalBank / totalTargetBets, 1.0);
}

export async function updateUsersOdds(pool, eventId) {
    await pool.query(`
        WITH total_bank AS (
            SELECT SUM(amount) AS total FROM bets WHERE event_id = $1 -- Удерживаем 10%
        ),
             target_bets AS (
                 SELECT target, SUM(amount) AS total_bets
                 FROM bets
                 WHERE event_id = $1
                 GROUP BY target
             )
        UPDATE bets
        SET odds = tb.total / tbets.total_bets
        FROM total_bank tb, target_bets tbets
        WHERE bets.event_id = $1
          AND bets.target = tbets.target;
    `, [eventId]);
}