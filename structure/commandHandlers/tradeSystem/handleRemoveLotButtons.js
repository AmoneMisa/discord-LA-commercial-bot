import {MessageFlags} from "discord.js";

/**
 * Handles the "remove lot" button interaction to delete a specified lot from the inventory.
 *
 * @param {Object} interaction - The interaction object representing the user's action.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export default async function handleRemoveLotButtons(interaction, pool) {
    if (!interaction.customId.startsWith('remove_lot_')) {
        return;
    }

    const lotId = interaction.options.getInteger("lot_id");

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

    // Удаляем связанные характеристики лота (если есть)
    await pool.query("DELETE FROM inventory_characteristics WHERE inventory_id = $1", [lotId]);

    // Удаляем сам лот
    await pool.query("DELETE FROM inventory WHERE id = $1", [lotId]);

    return interaction.reply({
        content: `✅ Лот **${lot.rows[0].item_offer}** успешно удалён!`,
        flags: MessageFlags.Ephemeral
    });
}
