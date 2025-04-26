import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles the deletion of a Codex entry based on the provided entry ID.
 *
 * @param {Object} interaction - The interaction object containing details about the user's action.
 * @param {Object} pool - The database connection pool used to execute the query.
 */
export default async function (interaction, pool) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");

    const categoryId = await pool.query(`SELECT id
                                         FROM codex_categories
                                         WHERE name = $1`, [category]);

    try {
        const result = await pool.query(
            `DELETE
             FROM codex_entries
             WHERE category_id = $1
               AND title = $2`,
            [categoryId, title]
        );

        if (result.rowCount === 0) {
            return await interaction.reply({
                content: await translatedMessage(interaction, "errors.entryNotFound"),
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: await translatedMessage(interaction, "info.entryDeletedFromCodex"),
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error("Ошибка при удалении записи кодекса:", error);
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.entryDeletionFailed"),
            flags: MessageFlags.Ephemeral
        });
    }
}