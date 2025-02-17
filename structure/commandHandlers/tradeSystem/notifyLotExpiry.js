async function notifyLotExpiry(pool, client) {
    const expiringLots = await pool.query(`
        SELECT id, user_id, item_offer 
        FROM inventory 
        WHERE expires_at <= NOW() + INTERVAL '2 hours' 
        AND notified = FALSE
    `);

    for (const lot of expiringLots.rows) {
        const user = await client.users.fetch(lot.user_id).catch(() => null);
        if (!user) continue;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`extend_lot_${lot.id}`)
                .setLabel("🔄 Продлить на 3 дня")
                .setStyle(ButtonStyle.Primary)
        );

        await user.send({
            content: `⚠️ **Ваш лот "${lot.item_offer}" будет удалён через 2 часа!**\nНажмите "Продлить", если хотите оставить его в продаже.`,
            components: [row]
        });

        // Помечаем как уведомлённый
        await pool.query("UPDATE inventory SET notified = TRUE WHERE id = $1", [lot.id]);
    }
}
