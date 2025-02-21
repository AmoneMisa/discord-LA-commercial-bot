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
    let result = await pool.query(`SELECT buyer_id, seller_id, raid_id
                                   FROM subscriptions
                                   WHERE buyer_id = $1
                                     AND seller_id = $2
                                     AND raid_id = $3`, [buyerId, sellerId, raidId]);

    return result.rows;
}

export async function createNewWTSLot(pool, userId, {
    type,
    itemOffer,
    price,
    negotiable,
    server,
    rarity,
    offerLevel
}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_offer, price, negotiable,
                                                                server, offer_rarity, offer_level)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                                         RETURNING id`, [userId, type, itemOffer, price, negotiable, server, rarity, offerLevel]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const {effectName, effectValue} = characteristic;
            await setInventoryCharacteristics(pool, inventoryId, effectName, effectValue);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

export async function createNewWTBLot(pool, userId, {
    type,
    itemRequest,
    price,
    negotiable,
    server,
    rarity,
    requestLevel
}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_request, price, negotiable,
                                                                server, request_rarity, request_level)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                                         RETURNING id`, [userId, type, itemRequest, price, negotiable, server, rarity, requestLevel]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const {effectName, effectValue} = characteristic;
            await setInventoryCharacteristics(pool, inventoryId, effectName, effectValue);
        }
    } catch
        (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

export async function createNewWTTLot(pool, userId, {
    type,
    itemRequest,
    itemOffer,
    server,
    requestLevel,
    offerLevel,
    offerRarity,
    requestRarity,
}, characteristics = []) {
    try {
        const result = await pool.query(`INSERT INTO inventory (user_id, trade_type, item_offer, item_request, server,
                                                                offer_rarity, request_rarity, request_level,
                                                                offer_level)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                         RETURNING id`, [userId, type, itemOffer, itemRequest, server, offerRarity,
            requestRarity, requestLevel, offerLevel]);

        const inventoryId = result.rows[0].id;

        for (const characteristic of characteristics) {
            const {effectName, effectValue} = characteristic;
            await setInventoryCharacteristics(pool, inventoryId, effectName, effectValue);
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

        items.push({value: item.id.toString(), label: item.name});
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

export async function setInventoryCharacteristics(pool, inventoryId, effectName, effectValue) {
    return await pool.query(`
        INSERT INTO inventory_characteristics (inventory_id, effect_name, effect_value)
        SELECT $1, $2, $3
        WHERE EXISTS (SELECT 1
                      FROM accessory_effects
                      WHERE effect_name = $2
                        AND ($3 = low_bonus OR $3 = mid_bonus OR $3 = high_bonus));
    `, [inventoryId, effectName, effectValue]);
}

export async function getWTBtoWTSMatching(pool) {
    return await pool.query(`SELECT buyer.user_id        AS buyer_id,
                                    seller.user_id       AS seller_id,
                                    buyer.item_request   AS buyer_item,
                                    seller.item_offer    AS seller_item,
                                    buyer.request_level  AS buyer_level,
                                    seller.offer_level   AS seller_level,
                                    buyer.request_rarity AS buyer_rarity,
                                    seller.offer_rarity  AS seller_rarity,
                                    buyer.price          AS buyer_price,
                                    seller.price         AS seller_price,
                                    seller.negotiable    AS seller_negotiable,
                                    buyer.server
                             FROM inventory buyer
                                      JOIN inventory seller
                                           ON buyer.item_request = seller.item_offer
                                               AND buyer.trade_type = 'WTB'
                                               AND seller.trade_type = 'WTS'
                                               AND
                                              (buyer.request_level IS NULL OR buyer.request_level = seller.offer_level)
                                               AND (buyer.request_rarity IS NULL OR
                                                    buyer.request_rarity = seller.offer_rarity)
                                               AND (buyer.price >= seller.price OR seller.negotiable = TRUE)
                                               AND buyer.server = seller.server;
    `);
}

export async function getWTTMatching(pool) {
    return await pool.query(`SELECT seller.user_id AS seller_id, buyer.user_id AS buyer_id,
                                    seller.item_offer AS seller_item, buyer.item_request AS buyer_item,
                                    seller.offer_level AS seller_level, buyer.request_level AS buyer_level,
                                    seller.offer_rarity AS seller_rarity, buyer.request_rarity AS buyer_rarity,
                                    seller.price AS seller_price, buyer.price AS buyer_price,
                                    seller.negotiable AS seller_negotiable, seller.server
                             FROM inventory seller
                                      JOIN inventory buyer
                                           ON seller.item_offer = buyer.item_request
                                               AND seller.trade_type = 'WTS'
                                               AND buyer.trade_type = 'WTB'
                                               AND (seller.offer_level IS NULL OR seller.offer_level = buyer.request_level)
                                               AND (seller.offer_rarity IS NULL OR seller.offer_rarity = buyer.request_rarity)
                                               AND (buyer.price >= seller.price OR seller.negotiable = TRUE)
                                               AND seller.server = buyer.server;
    `);
}