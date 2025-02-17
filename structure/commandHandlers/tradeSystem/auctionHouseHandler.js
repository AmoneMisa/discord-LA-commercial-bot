export default async function auctionHouseHandler(interaction, pool) {
    const page = interaction.options.getInteger('page') || 1;
    const offset = (page - 1) * 10;

    const lots = await pool.query(`
        SELECT * FROM inventory 
        ORDER BY expires_at ASC 
        LIMIT 10 OFFSET $1
    `, [offset]);

    if (lots.rows.length === 0) {
        return interaction.reply({ content: "📭 Аукционный дом пуст.", ephemeral: true });
    }

    let message = "🏪 **Аукционный дом** (Страница " + page + ")\n";
    lots.rows.forEach((lot, index) => {
        message += `**${index + 1}.** ${lot.item_offer} (${lot.amount}) - ${lot.price || "Обмен"} | ${lot.server}\n`;
    });

    return interaction.reply({ content: message, ephemeral: true });
}
