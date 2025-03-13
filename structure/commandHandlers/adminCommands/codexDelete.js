import i18n from "../../../locales/i18n.js";
import {MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Handles the deletion of a Codex entry based on the provided entry ID.
 *
 * This function interacts with a database to delete a specific entry by ID.
 * If the entry is not found, an appropriate reply is sent to the interaction.
 * In the case of an error, logs the error and sends an error message as a reply.
 *
 * @param {Object} interaction - The interaction object containing details about the user's action.
 * @param {Object} pool - The database connection pool used to execute the query.
 */
export default async function (interaction, pool) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");

    const categoryId = await pool.query(`SELECT id FROM codex_categories WHERE name = $1`, [category]);

    const lang = await getUserLanguage(interaction.user.id, pool);
    try {
        const result = await pool.query(
            `DELETE FROM codex_entries WHERE category_id = $1 AND title = $2`,
            [categoryId, title]
        );

        if (result.rowCount === 0) {
            return await interaction.reply({ content: i18n.t("errors.entryNotFound", { lng: lang}), flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: i18n.t("info.entryDeletedFromCodex", { lng: lang}), flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error("Ошибка при удалении записи кодекса:", error);
        await interaction.reply({ content: i18n.t("errors.entryDeletionFailed", { lng: lang}), flags: MessageFlags.Ephemeral });
    }
}
