import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";

/**
 * Edits an existing Codex entry in the database with the provided updated fields.
 *
 * @param {Object} interaction - The interaction object containing user input and context for the command.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @param {string} interaction.options.entry_id - The unique identifier of the Codex entry to be updated.
 * @param {string} interaction.options.title - The updated title for the Codex entry. Optional.
 * @param {string} interaction.options.content - The updated content for the Codex entry. Optional.
 * @param {string} interaction.options.language - The updated language of the Codex entry. Optional.
 * @param {string} interaction.options.source_url - The updated source URL for the Codex entry. Optional.
 *
 * @return {Promise<void>} A promise that resolves once the entry update is processed. Sends a reply to the interaction about the operation's result.
 */
export default async function editCodexEntry(interaction, pool) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");
    const newContent = interaction.options.getString("content");
    const newLanguage = interaction.options.getString("language");
    const newSourceUrl = interaction.options.getString("source_url");

    const categoryId = await pool.query(`SELECT id FROM codex_categories WHERE name = $1`, [category]);

    try {
        const result = await pool.query(
            `UPDATE codex_entries
             SET content = COALESCE($3, content),
                 language = COALESCE($4, language),
                 source_url = COALESCE($5, source_url),
                 updated_at = NOW()
             WHERE title = $1 and category_id = $2 RETURNING *`,
            [title, categoryId, newContent, newLanguage, newSourceUrl]
        );

        if (result.rowCount === 0) {
            return await interaction.reply({ content: i18n.t("errors.entryNotFound", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: i18n.t("info.entryUpdatedInCodex", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error("Ошибка при редактировании записи кодекса:", error);
        await interaction.reply({ content: i18n.t("errors.entryUpdateFailed", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }
}
