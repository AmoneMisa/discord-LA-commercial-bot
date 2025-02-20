import {MessageFlags} from "discord.js";

export default async function handleExtendLot(interaction, pool) {
    if (!interaction.customId.startsWith('extend_lot_')) return;

    const lotId = interaction.customId.split('_')[2];

// Проверяем, существует ли лот
    const lot = await pool.query(
        "SELECT * FROM inventory WHERE id = $1 AND user_id = $2",
        [lotId, interaction.user.id]
    );

    if (lot.rows.length === 0) {
        return interaction.reply({
            content: "❌ Лот не найден или уже удалён.",
            flags: MessageFlags.Ephemeral
        });
    }

// Продлеваем лот
    await pool.query(
        "UPDATE inventory SET expires_at = NOW() + INTERVAL '3 days', notified = FALSE WHERE id = $1",
        [lotId]
    );

// Обновляем сообщение, удаляя кнопки
    return interaction.update({
        content: `✅ **Лот "${lot.rows[0].item_offer}" продлён на 3 дня!**`,
        components: [] // Убираем кнопки, так как продление уже выполнено
    });
}
