export async function getLeaderboardChannelId(pool) {
    const result = await pool.query(`SELECT value FROM settings WHERE key = 'leaderboard_channel_id'`);
    return result.rows[0]?.value || null;
}

export async function setLeaderboardChannelId(pool, channelId) {
    await pool.query(`UPDATE settings SET value = $1 WHERE key = 'leaderboard_channel_id'`, [channelId]);
}

export async function getLeaderboardMessageId(pool) {
    const result = await pool.query(`SELECT value FROM settings WHERE key = 'leaderboard_message_id'`);
    return result.rows[0]?.value || null;
}

export async function setLeaderboardMessageId(pool, messageId) {
    await pool.query(`UPDATE settings SET value = $1 WHERE key = 'leaderboard_message_id'`, [messageId]);
}

export async function getTopSellers(pool) {
    const topUsers = await pool.query(
        `SELECT user_id, rating, positive_reviews, negative_reviews
         FROM users
         WHERE user_id IN (
             SELECT DISTINCT target_user 
             FROM reviews 
             WHERE timestamp >= NOW() - INTERVAL '14 days'
         )
         ORDER BY rating DESC, (positive_reviews + negative_reviews) DESC
         LIMIT 30`
    );

    return topUsers.rows;
}
