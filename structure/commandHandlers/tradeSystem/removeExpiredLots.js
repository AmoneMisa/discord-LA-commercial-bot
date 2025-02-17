async function removeExpiredLots(pool, client) {
    const expiredLots = await pool.query(`
        SELECT id, user_id, item_offer 
        FROM inventory 
        WHERE expires_at <= NOW()
    `);

    for (const lot of expiredLots.rows) {
        const user = await client.users.fetch(lot.user_id).catch(() => null);
        if (user) {
            await user.send(`❌ **Ваш лот "${lot.item_offer}" был снят с продажи!**`);
        }

        await pool.query("DELETE FROM inventory WHERE id = $1", [lot.id]);
    }
}
