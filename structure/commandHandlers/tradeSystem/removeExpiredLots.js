import {removeLotByExpiresTime} from "../../dbUtils.js";

/**
 * Removes expired lots from the system and notifies respective users if applicable.
 *
 * @param {object} pool - The database connection pool used for querying the database.
 * @param {object} client - The client object used for user interactions and notifications.
 * @return {Promise<void>} Resolves when all expired lots have been processed and removed.
 */
export default async function removeExpiredLots(pool, client) {
    for (const lot of await removeLotByExpiresTime(pool).rows) {
        const user = await client.users.fetch(lot.user_id).catch(() => null);
        if (user) {
            await user.send(`❌ **Ваш лот "${lot.item_offer}" был снят с продажи!**`);
        }

        await pool.query("DELETE FROM inventory WHERE id = $1", [lot.id]);
    }
}
