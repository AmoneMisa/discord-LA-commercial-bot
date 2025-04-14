import {MessageFlags} from "discord.js";

/**
 * Handles the deletion of a Codex entry based on the provided entry ID.
 *
 * This function interacts with a database to delete a specific entry by ID.
 * If the entry is not found, an appropriate reply is sent to the interaction.
 * In the case of an error, logs the error and sends an error message as a reply.
 *
 * @param {Object} interaction - The interaction object containing details about the user's action.
 */
export default async function (interaction) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");

    const categoryId = await pool.query(`SELECT id FROM codex_categories WHERE name = $1`, [category]);

    try {
        const result = await pool.query(
            `DELETE FROM codex_entries WHERE category_id = $1 AND title = $2`,
            [categoryId, title]
        );

        if (result.rowCount === 0) {
            return interaction.reply({ content: "❌ Запись не найдена.", flags: MessageFlags.Ephemeral });
        }

        interaction.reply({ content: "🗑️ Запись успешно удалена!", flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error("Ошибка при удалении записи кодекса:", error);
        interaction.reply({ content: "❌ Ошибка при удалении записи.", flags: MessageFlags.Ephemeral });
    }
}
