import {removeLotByExpiresTime} from "../../dbUtils.js";

/**
 * Removes expired lots from the system and notifies respective users if applicable.
 *
 * @return {Promise<void>} Resolves when all expired lots have been processed and removed.
 */
export default async function removeExpiredLots() {
    for (const lot of await removeLotByExpiresTime().rows) {
        const user = await client.users.fetch(lot.user_id).catch(() => null);
        if (user) {
            await user.send(`❌ **Ваш лот "${lot.item_offer}" был снят с продажи!**`);
        }

        await pool.query("DELETE FROM inventory WHERE id = $1", [lot.id]);
    }
}
