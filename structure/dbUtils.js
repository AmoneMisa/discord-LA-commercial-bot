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
    let result = await pool.query(`SELECT raid_id
                                   FROM available_raids
                                   WHERE id = $1`, [id]);
    result = await pool.query(`SELECT raid_name
                               FROM raids
                               WHERE id = $1`, [result.rows[0].raid_id]);
    return result.rows[0].raid_name;
}

export async function getSubscriptions(pool, buyerId, sellerId, raidId) {
    let result = await pool.query(`SELECT buyer_id AND seller_id AND raid_id
                                   FROM subscriptions
                                   WHERE buyer_id = $1
                                     AND seller_id = $2
                                     AND raid_id = $3`, [buyerId, sellerId, raidId]);

    return result.rows;
}

export async function createNewWTSLot(pool, userId, {type, itemOffer, price, negotiable, server, rarity, offerLevel}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_offer, price, negotiable, server, rarity, offer_level)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                                         RETURNING id`, [userId, type, itemOffer, price, negotiable, server, rarity, offerLevel]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const { effectName, effectValue } = characteristic;
            await pool.query(`
                INSERT INTO inventory_characteristics (inventory_id, effect_name, effect_value)
                SELECT $1, $2, $3
                WHERE EXISTS (
                    SELECT 1 FROM accessory_effects 
                    WHERE effect_name = $2 
                    AND (low_bonus = $3 OR mid_bonus = $3 OR high_bonus = $3)
                )
            `, [inventoryId, effectName, effectValue]);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

export async function createNewWTBLot(pool, userId, {type, itemRequest, price, negotiable, server, rarity, requestLevel}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_request, price, negotiable, server, rarity, request_level)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                                         RETURNING id`, [userId, type, itemRequest, price, negotiable, server, rarity, requestLevel]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const { effectName, effectValue } = characteristic;
            await pool.query(`
                INSERT INTO inventory_characteristics (inventory_id, effect_name, effect_value)
                SELECT $1, $2, $3
                WHERE EXISTS (
                    SELECT 1 FROM accessory_effects 
                    WHERE effect_name = $2 
                    AND (low_bonus = $3 OR mid_bonus = $3 OR high_bonus = $3)
                )
            `, [inventoryId, effectName, effectValue]);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

export async function createNewWTTLot(pool, userId, {type, itemRequest, itemOffer, server, requestLevel, offerLevel, negotiable}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_offer, item_request, server, rarity, request_level, offer_level, negotiable)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`, [userId, type, itemRequest, itemOffer, server, requestLevel, offerLevel, negotiable]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const { effectName, effectValue } = characteristic;
            await pool.query(`
                INSERT INTO inventory_characteristics (inventory_id, effect_name, effect_value)
                SELECT $1, $2, $3
                WHERE EXISTS (
                    SELECT 1 FROM accessory_effects 
                    WHERE effect_name = $2 
                    AND (low_bonus = $3 OR mid_bonus = $3 OR high_bonus = $3)
                )
            `, [inventoryId, effectName, effectValue]);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

export async function removeLotByExpiresTime(pool) {
    await pool.query(`DELETE
                      FROM inventory
                      WHERE expires_at <= NOW();`);
}

export async function addTradeRecord(pool, buyerId, sellerId, itemOffered, price, tradeType, server) {
    await pool.query(`INSERT INTO trade_deals (buyer_id, seller_id, item_offered, price, trade_type, server)
                      VALUES ($1, $2, $3, $4, $5, $6);`, buyerId, sellerId, itemOffered, price, tradeType, server);
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
                                   FROM items
                                   WHERE id = $1`, [id]);
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

export async function getActiveLotsCount(pool, userId) {
    return await pool.query(`SELECT COUNT(*)
                             FROM inventory
                             WHERE user_id = $1`, [userId]);
}