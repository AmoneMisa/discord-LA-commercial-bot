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

export async function getRaidName(pool, id) {
    let result = await pool.query(`SELECT raid_id FROM available_raids WHERE id = $1`, [id]);
    result = await pool.query(`SELECT raid_name
                                   FROM raids
                                   WHERE id = $1`, [result.rows[0].raid_id]);
    return result.rows[0].raid_name;
}

export async function getSubscriptions(pool, buyerId, sellerId, raidId) {
    let result = await pool.query(`SELECT buyer_id AND seller_id AND raid_id FROM subscriptions WHERE buyer_id = $1 AND seller_id = $2 AND raid_id = $3`, [buyerId, sellerId, raidId]);

    return result.rows;
}

export async function createNewWTSLot(pool, userId, type, itemOffer, price, negotiable, server, amountOffer) {
    await pool.query(`INSERT INTO inventory (user_id, type, item_offer, price, negotiable, server, amount_offer)
VALUES ($1, $2, $3, $4, $5, $6, $7);`, [userId, type, itemOffer, price, negotiable, server, amountOffer]);
}

export async function removeLot(pool) {
    await pool.query(`DELETE FROM inventory WHERE expires_at <= NOW();`);
}

export async function addTradeRecord(pool, buyerId, sellerId, itemOffered, price, tradeType, server) {
    await pool.query(`INSERT INTO trade_deals (buyer_id, seller_id, item_offered, price, trade_type, server) VALUES ($1, $2, $3, $4, $5, $6);`, buyerId, sellerId, itemOffered, price, tradeType, server);
}

export async function getItemsList(pool) {
    let result = await pool.query(`SELECT *
                                   FROM items`);
    let items = [];

    for (let item of result.rows) {
        if (items.find(_item => _item.name === item.name)) {
            continue;
        }

        items.push({id: item.id, name: item.name});
    }

    return items;
}

export async function getItemName(pool, id) {
    let result = await pool.query(`SELECT *
                                   FROM items WHERE id = $1`, [id]);
    return result.rows[0].name;
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