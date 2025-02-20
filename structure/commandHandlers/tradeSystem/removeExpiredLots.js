import {removeLotByExpiresTime} from "../../dbUtils.js";

export default async function removeExpiredLots(pool, client) {
    for (const lot of await removeLotByExpiresTime(pool).rows) {
        const user = await client.users.fetch(lot.user_id).catch(() => null);
        if (user) {
            await user.send(`❌ **Ваш лот "${lot.item_offer}" был снят с продажи!**`);
        }

        await pool.query("DELETE FROM inventory WHERE id = $1", [lot.id]);
    }
}
