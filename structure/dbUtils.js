import {saveProfileToDB} from "../scrapping/parser.js";

/**
 * Retrieves the leaderboard channel ID from the settings table.
 *
 * @param {Object} pool - The database connection pool used to execute the query.
 * @return {Promise<string|null>} The leaderboard channel ID if found, or null if not present.
 */
export async function getLeaderboardChannelId() {
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
export async function setLeaderboardChannelId( channelId) {
    await pool.query(`UPDATE settings
                      SET value = $1
                      WHERE key = 'leaderboard_channel_id'`, [channelId]);
}

/**
 * Retrieves the message ID for the leaderboard from the database.
 *
 * @return {Promise<string|null>} A promise that resolves to the leaderboard message ID as a string,
 * or null if the message ID is not found.
 */
export async function getLeaderboardMessageId() {
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
export async function setLeaderboardMessageId( messageId) {
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
export async function getTopSellers() {
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
 * Retrieves the raid name associated with a given ID from the database.
 *
 * @param {Object} pool - The database connection pool used to execute queries.
 * @param {number} id - The ID used to find the associated raid name.
 * @return {Promise<string>} A promise that resolves to the raid name as a string.
 */
export async function getRaidName( id) {
    let result = await pool.query(`SELECT raid_id
                                   FROM available_raids
                                   WHERE id = $1`, [id]);
    result = await pool.query(`SELECT raid_name
                               FROM raids
                               WHERE id = $1`, [result.rows[0].raid_id]);
    return result.rows[0].raid_name;
}

/**
 * Retrieves subscriptions from the database that match the specified buyer ID, seller ID, and raid ID.
 *
 * @param {Object} pool - The database connection pool to perform the query.
 * @param {number} buyerId - The ID of the buyer associated with the subscription.
 * @param {} sellerId - The ID of the seller associated with the subscription.
 * @param {number} raidId - The ID of the raid associated with the subscription.
 * @return {Promise<Array>} A promise that resolves to an array of rows containing the subscription details.
 */
export async function getSubscriptions( buyerId, sellerId, raidId) {
    let result = await pool.query(`SELECT buyer_id, seller_id, raid_id
                                   FROM subscriptions
                                   WHERE buyer_id = $1
                                     AND seller_id = $2
                                     AND raid_id = $3`, [buyerId, sellerId, raidId]);

    return result.rows;
}

/**
 * Creates a new "WTS" (Want to Sell) lot in the inventory.
 *
 * @param {object} pool - The database connection pool for executing queries.
 * @param {number} userId - The ID of the user creating the lot.
 * @param {object} details - The details of the item to be listed in the lot.
 * @param {string} details.type - The trade type (e.g., "WTS").
 * @param {string} details.itemOffer - The item being offered for trade or sale.
 * @param {number} details.price - The price of the item.
 * @param {boolean} details.negotiable - Indicates if the price is negotiable.
 * @param {string} details.server - The server associated with the trade.
 * @param {string} details.rarity - The rarity of the offered item.
 * @param {number} details.offerLevel - The level of the offered item.
 * @param {Array} [characteristics] - An optional list of additional characteristics for the offered item.
 * @param {object} characteristics[] - Each characteristic of the item.
 * @param {string} characteristics[].effectName - The name of the characteristic or effect.
 * @param {number} characteristics[].effectValue - The value of the characteristic or effect.
 * @return {Promise<void>} A promise that resolves when the lot is created or rejects with an error.
 */
export async function createNewWTSLot( userId, {
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
            await setInventoryCharacteristics( inventoryId, effectName, effectValue);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

/**
 * Creates a new "Want To Buy" (WTB) lot for the user and inserts it into the inventory database.
 * The method also allows adding characteristics associated with the new lot.
 *
 * @param {Object} pool - The database connection pool to execute the queries.
 * @param {number} userId - ID of the user who is creating the WTB lot.
 * @param {Object} lotDetails - Details of the lot to be created.
 * @param {string} lotDetails.type - The type of trade for the lot.
 * @param {string} lotDetails.itemRequest - The requested item description.
 * @param {number} lotDetails.price - The price of the lot.
 * @param {boolean} lotDetails.negotiable - Indicates if the price is negotiable.
 * @param {string} lotDetails.server - The server where the transaction will take place.
 * @param {string} lotDetails.rarity - The rarity of the requested item.
 * @param {number} lotDetails.requestLevel - The required level for the requested item.
 * @param {Array} [characteristics=[]] - A list of characteristics to attach to the inventory lot.
 * @param {Object} characteristics[].effectName - Name of the characteristic effect.
 * @param {any} characteristics[].effectValue - Value of the characteristic effect.
 * @return {Promise<void>} - Returns a Promise that resolves with no value if successful, or logs an error if the operation fails.
 */
export async function createNewWTBLot( userId, {
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
            await setInventoryCharacteristics( inventoryId, effectName, effectValue);
        }
    } catch
        (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

/**
 * Creates a new WTT (Want To Trade) lot in the inventory for the specified user.
 *
 * @param {Object} pool - The database connection pool used to execute queries.
 * @param {number} userId - The ID of the user creating the WTT lot.
 * @param {Object} tradeDetails - An object containing details of the trade.
 * @param {string} tradeDetails.type - The type of trade (e.g., WTT, WTB).
 * @param {string} tradeDetails.itemRequest - The item being requested in the trade.
 * @param {string} tradeDetails.itemOffer - The item being offered in the trade.
 * @param {string} tradeDetails.server - The server on which the trade occurs.
 * @param {number} tradeDetails.requestLevel - The level of the requested item.
 * @param {number} tradeDetails.offerLevel - The level of the offered item.
 * @param {string} tradeDetails.offerRarity - The rarity of the offered item.
 * @param {string} tradeDetails.requestRarity - The rarity of the requested item.
 * @param {Array<Object>} [characteristics=[]] - Optional array of characteristic objects for the lot. Each object contains:
 * - {string} effectName - The name of the characteristic effect.
 * - {string} effectValue - The value of the characteristic effect.
 *
 * @return {Promise<void>} A promise that resolves once the new WTT lot has been created and characteristics (if any) have been set.
 */
export async function createNewWTTLot( userId, {
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
            await setInventoryCharacteristics( inventoryId, effectName, effectValue);
        }
    } catch (e) {
        console.error("Ошибка при добавлении лота для пользователя:", userId, e);
    }
}

/**
 * Removes expired lots from the inventory based on their expiration time.
 *
 * @param {Object} pool - The database connection pool object used to execute the query.
 * @return {Promise<void>} Resolves when the expired lots have been successfully removed.
 */
export async function removeLotByExpiresTime() {
    await pool.query(`DELETE
                      FROM inventory
                      WHERE expires_at <= NOW();`);
}

/**
 * Inserts a new trade record into the trade_deals database.
 *
 * @param {object} pool - The database connection pool used to execute the query.
 * @param {number} buyerId - The unique identifier of the buyer in the trade.
 * @param {number} sellerId - The unique identifier of the seller in the trade.
 * @param {string} itemOffered - The item being offered in the trade deal.
 * @param {number} price - The price of the item being traded.
 * @param {string} tradeType - The type of trade being conducted (e.g., barter, sale).
 * @param {string} server - The server associated with the trade transaction.
 * @return {Promise<void>} A promise that resolves when the trade record is successfully added to the database.
 */
export async function addTradeRecord( buyerId, sellerId, itemOffered, price, tradeType, server) {
    await pool.query(`INSERT INTO trade_deals (buyer_id, seller_id, item_offered, price, trade_type, server)
                      VALUES ($1, $2, $3, $4, $5, $6);`, buyerId, sellerId, itemOffered, price, tradeType, server);
}

/**
 * Fetches a list of unique items from the database and formats them for use.
 * @return {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of objects, each containing a `value` and `label` property representing the ID and name of an item, respectively.
 */
export async function getItemsList() {
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

/**
 * Retrieves the name of an item based on its ID from the database.
 *
 * @param {number} id - The unique identifier of the item.
 * @return {Promise<string>} A promise that resolves to the name of the item.
 */
export async function getItemName( id) {
    let result = await pool.query(`SELECT *
                                   FROM items
                                   WHERE id = $1`, [id]);
    return result.rows[0].name;
}

/**
 * Adds a user to the database if they do not already exist and are not a bot.
 *
 * @param {Object} user - The user object containing details about the user. Must include `id`, `bot`, `username`, and `discriminator` properties.
 * @return {Promise<void>} A Promise that resolves when the operation is complete or if the user already exists or is a bot.
 */
export async function addUserIfNotExists( user) {
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

/**
 * Retrieves the count of active lots for a specified user from the inventory database.
 *
 * @param {number} userId - The unique identifier of the user whose active lots are to be counted.
 * @return {Promise<number>} A promise that resolves to the count of active lots for the given user.
 */
export async function getActiveLotsCount(userId) {
    return await pool.query(`SELECT COUNT(*)
                             FROM inventory
                             WHERE user_id = $1`, [userId]);
}

/**
 * Sets the inventory characteristics by inserting a new record into the inventory_characteristics table
 * if the specified effect exists in the accessory_effects table with a matching effect value.
 *
 * @param {number} inventoryId - The ID of the inventory item to associate with the effect.
 * @param {string} effectName - The name of the effect to be added.
 * @param {string|number} effectValue - The value of the effect that must match the low_bonus, mid_bonus, or high_bonus.
 * @return {Promise<Object>} A promise that resolves to the result of the database query.
 */
export async function setInventoryCharacteristics( inventoryId, effectName, effectValue) {
    return await pool.query(`
        INSERT INTO inventory_characteristics (inventory_id, effect_name, effect_value)
        SELECT $1, $2, $3
        WHERE EXISTS (SELECT 1
                      FROM accessory_effects
                      WHERE effect_name = $2
                        AND ($3 = low_bonus OR $3 = mid_bonus OR $3 = high_bonus));
    `, [inventoryId, effectName, effectValue]);
}

/**
 * Retrieves matching records between buyer (WTB - Want To Buy) and seller (WTS - Want To Sell) from the inventory pool.
 *
 * @return {Promise<Object[]>} A promise resolving to a list of matching records between buyers and sellers,
 * including details such as user IDs, items, levels, rarity, price, negotiation status, and server.
 */
export async function getWTBtoWTSMatching() {
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

/**
 * Retrieves a list of matching "Want To Sell" (WTS) and "Want To Buy" (WTB) trade entries
 * from the inventory database based on specific criteria such as item, level, rarity,
 * price, negotiability, and server.
 *
 * @return {Promise<Object[]>} A promise that resolves to an array of trade matches, where each match
 * consists of details about the seller and buyer, including user IDs, item details, levels, rarity, price,
 * negotiability, and server.
 */
export async function getWTTMatching() {
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

/**
 * Retrieves the user profile along with associated character information from the database.
 *
 * @param {number} userId - The unique identifier of the user whose profile is being retrieved.
 * @return {Promise<Object|null>} A promise that resolves to an object representing the user's profile
 *                                including the associated characters data, or null if the user profile
 *                                is not found.
 */
export async function getUserProfile( userId) {
    const profile = await pool.query(
        `SELECT p.*,
                COALESCE(
                                JSON_AGG(
                                JSON_BUILD_OBJECT(
                                        'id', c.id,
                                        'profile_id', c.profile_id,
                                        'class_name', c.class_name,
                                        'char_name', c.char_name,
                                        'gear_score', c.gear_score
                                )
                                        ) FILTER (WHERE c.id IS NOT NULL),
                                '[]'::json
                ) AS characters
         FROM profiles p
                  LEFT JOIN characters c ON p.id = c.profile_id
         WHERE p.user_id = $1
         GROUP BY p.id;
        `,
        [userId]
    );

    return profile.rows[0] || null;
}

/**
 * Retrieves the list of achievements for a specific user from the database.
 *
 * @param {} userId - The ID of the user whose achievements are to be retrieved.
 * @return {Promise<Array>} A promise that resolves to an array of user achievements. Each achievement contains properties such as id, name, description, icon, and assigned_at. Returns an empty array if an error occurs.
 */
export async function getUserAchievements(userId) {
    try {
        const result = await pool.query(`
            SELECT a.id, a.name, a.description, a.icon, ua.assigned_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = $1
            ORDER BY ua.assigned_at DESC;
        `, [userId]);

        return result.rows;
    } catch (err) {
        console.error('❌ Ошибка получения достижений пользователя:', err);
        return [];
    }
}

/**
 * Determines whether a user can join a specified faction based on the faction's current membership
 * and a predefined threshold of maximum allowed members.
 *
 * @param {string} userId - The unique identifier of the user attempting to join the faction.
 * @param {string} factionId - The unique identifier of the faction the user wants to join.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the user is allowed to join the faction.
 */
export async function canJoinFaction(userId, factionId) {
    const { rows: totalUsers } = await pool.query(`SELECT COUNT(*) FROM users_factions`);
    const { rows: factionUsers } = await pool.query(`SELECT COUNT(*) FROM users_factions WHERE faction_id = $1`, [factionId]);

    const total = totalUsers[0].count;
    const factionCount = factionUsers[0].count;
    const maxAllowed = total * 1.05; // 5% разница

    return factionCount < maxAllowed;
}

/**
 * Allows a user to join a specific faction. Updates the faction if the user is already a member of another one.
 *
 * @param {string} userId - The unique identifier of the user attempting to join a faction.
 * @param {string} factionId - The unique identifier of the faction the user wants to join.
 * @return {Promise<object>} Returns an object containing the success status and a message indicating the result of the action.
 */
export async function joinFaction(userId, factionId) {
    if (!(await canJoinFaction(userId, factionId))) {
        return { success: false, message: "Эта фракция переполнена, выберите другую." };
    }

    await pool.query(`
        INSERT INTO users_factions (user_id, faction_id, joined_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET faction_id = EXCLUDED.faction_id, joined_at = NOW();
    `, [userId, factionId]);

    return { success: true, message: "Вы успешно вступили во фракцию!" };
}

/**
 * Adds activity points to a user's account. If the user already has an entry,
 * their points will be updated by adding the new points to the existing total.
 * If the user does not have an entry, a new record will be created.
 *
 * @param {string} userId - The unique ID of the user to add activity points to.
 * @param {number} points - The number of activity points to add to the user's account.
 * @return {Promise<void>} A promise that resolves when the points have been successfully added or updated.
 */
export async function addActivityPoints(userId, points) {
    await pool.query(`
        INSERT INTO activity_points (user_id, points, last_reset)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET points = activity_points.points + EXCLUDED.points;
    `, [userId, points]);
}

/**
 * Retrieves the faction leaderboard, which consists of the top users in each faction
 * according to their activity points, ordered by faction name and points in descending order.
 *
 * @return {Promise<Array>} A promise that resolves to an array of leaderboard records. Each record includes the faction name, user ID, and activity points.
 */
export async function getFactionLeaderboard() {
    const { rows } = await pool.query(`
        SELECT f.name AS faction, u.user_id, ap.points
        FROM users_factions uf
        JOIN factions f ON uf.faction_id = f.id
        JOIN users u ON uf.user_id = u.user_id
        JOIN activity_points ap ON u.user_id = ap.user_id
        ORDER BY f.name, ap.points DESC
        LIMIT 5;
    `);

    return rows;
}

/**
 * Resets the activity points for all users by setting the `points` to 0
 * and updating the `last_reset` timestamp to the current time.
 *
 * @return {Promise<void>} A promise that resolves when the activity points
 * have been successfully reset.
 */
export async function resetActivityPoints() {
    await pool.query(`UPDATE activity_points SET points = 0, last_reset = NOW()`);
}

/**
 * Resets the activity points to 0 and updates the last reset timestamp in the database.
 *
 * @return {Promise<void>} - A promise that resolves when the operation is completed.
 */
export async function cleanOldData() {
    try {
        await pool.query(`
            UPDATE activity_points
            SET points = 0, last_reset = NOW()
        `);
        console.log("✅ Очки активности сброшены.");
    } catch (err) {
        console.error("❌ Ошибка при сбросе очков активности:", err);
    }
}

/**
 * Awards activity points to a user. Adds points if the user exists in the faction.
 *
 * @param {} userId - The ID of the user to whom points are awarded.
 * @param {number} points - The number of points to be awarded to the user.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function givePointsForActivity( userId, points) {
    try {
        const isExist = await pool.query(`SELECT * FROM users_factions WHERE user_id = $1`, [userId]);

        if (!isExist.rows.length) {
            console.log("У пользователя не выбрана фракция", userId);
            return ;
        }

        await pool.query(`
            INSERT INTO activity_points (user_id, points)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
                SET points = activity_points.points + EXCLUDED.points
        `, [userId, points]);

        console.log(`✅ Игроку ${userId} начислено ${points} очков активности.`);
    } catch (err) {
        console.error("❌ Ошибка при начислении очков:", err);
    }
}

/**
 * Updates the faction leaderboard by fetching the top players from the database
 * and displaying the leaderboard in a designated Discord channel.
 * @return {Promise<void>} Resolves when the leaderboard is successfully updated or if an error occurs.
 */
export async function updateFactionLeaderboard() {
    try {
        // Получаем ID канала для вывода статистики
        const channelRes = await pool.query(`
            SELECT value FROM settings WHERE key = 'faction_leaderboard_channel_id'
        `);

        if (channelRes.rows.length === 0) {
            console.error("❌ Канал для таблицы лидеров фракций не установлен!");
            return;
        }

        const channelId = channelRes.rows[0].value;
        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            console.error("❌ Канал не найден!");
            return;
        }

        // Получаем ТОП-5 игроков каждой фракции
        const leaderboardRes = await pool.query(`
            SELECT u.user_id, f.name AS faction_name, ap.points
            FROM activity_points ap
            JOIN users_factions uf ON ap.user_id = uf.user_id
            JOIN factions f ON uf.faction_id = f.id
            ORDER BY f.name, ap.points DESC
            LIMIT 5
        `);

        if (leaderboardRes.rows.length === 0) {
            await channel.send("📊 Таблица лидеров пуста. Очки активности еще не начислялись.");
            return;
        }

        let message = "**🏆 Топ-5 игроков по фракциям:**\n";
        let currentFaction = null;

        for (const row of leaderboardRes.rows) {
            if (currentFaction !== row.faction_name) {
                message += `\n🛡 **${row.faction_name}**\n`;
                currentFaction = row.faction_name;
            }
            message += `👤 <@${row.user_id}> — **${row.points}** очков\n`;
        }

        await channel.send(message);
        console.log("✅ Таблица лидеров обновлена.");
    } catch (err) {
        console.error("❌ Ошибка при обновлении таблицы лидеров:", err);
    }
}

export async function getTotalBank( eventId) {
    const result = await pool.query(`SELECT * FROM bets WHERE event_id = $1`, [eventId]);
    let totalBank = 0;

    result.rows.forEach(bet => totalBank += parseInt(bet.amount));
    return totalBank;
}

export async function getTotalBankByUser( eventId, target) {
    const result = await pool.query(`SELECT * FROM bets WHERE event_id = $1 AND target = $2`, [eventId, target]);
    let totalBank = 0;

    result.rows.forEach(bet => totalBank += parseInt(bet.amount));
    return totalBank;
}

export async function getCurrentUserOdd( eventId, userId, target) {
    const totalBank = await getTotalBank( eventId);
    const totalTargetBets = await getTotalBankByUser( eventId, target);

    return totalTargetBets === 0 ? 1 : Math.max(totalBank / totalTargetBets, 1.0);
}

export async function updateUsersOdds( eventId) {
    await pool.query(`
        WITH total_bank AS (
            SELECT SUM(amount) AS total FROM bets WHERE event_id = $1
        ),
             target_bets AS (
                 SELECT target, SUM(amount) AS total_bets
                 FROM bets
                 WHERE event_id = $1
                 GROUP BY target
             )
        UPDATE bets
        SET odds = 1.0 * tb.total / tbets.total_bets
        FROM total_bank tb, target_bets tbets
        WHERE bets.event_id = $1
          AND bets.target = tbets.target;
    `, [eventId]);
}

export async function getUserLanguage(userId) {
    const result = await pool.query("SELECT language FROM users WHERE user_id = $1", [userId]);
    return result.rowCount > 0 ? result.rows[0].language : "ru";
}

export async function updateProfileCharacters() {
    try {
        const profiles = await pool.query('SELECT user_id, main_nickname FROM profiles');

        for (const profile of profiles.rows) {
            try {
                await saveProfileToDB({
                    userId: profile.user_id,
                    mainNickname: profile.main_nickname,
                });
                console.log(`✅ Профиль обновлен: ${profile.main_nickname}`);
            } catch (err) {
                console.error(`❌ Ошибка при обновлении профиля ${profile.main_nickname}:`, err);
            }
        }

        console.log('✅ Все профили обработаны.');
    } catch (err) {
        console.error('❌ Ошибка запроса профилей:', err);
    }
}