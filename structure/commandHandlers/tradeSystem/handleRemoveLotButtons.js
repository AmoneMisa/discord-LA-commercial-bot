export default async function handleRemoveLotButtons(interaction, pool) {
    if (!interaction.customId.startsWith('remove_lot_')) return;

    const lotId = interaction.customId.split('_')[2];

    // Проверяем, существует ли лот
    const lot = await pool.query("SELECT * FROM inventory WHERE id = $1 AND user_id = $2", [lotId, interaction.user.id]);

    if (lot.rows.length === 0) {
        return interaction.reply({ content: "❌ Этот лот уже удалён или не принадлежит вам.", flags: MessageFlags.Ephemeral });
    }

    // Удаляем лот
    await pool.query("DELETE FROM inventory WHERE id = $1", [lotId]);

    return interaction.update({
        content: `🗑 **Лот "${lot.rows[0].item_offer}" снят с продажи!**`,
        components: []
    });
}
