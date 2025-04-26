import {MessageFlags} from "discord.js";

/**
 * Edits an existing Codex entry in the database with the provided updated fields.
 *
 * @param {Object} interaction - The interaction object containing user input and context for the command.
 * @param {string} interaction.options.entry_id - The unique identifier of the Codex entry to be updated.
 * @param {string} interaction.options.title - The updated title for the Codex entry. Optional.
 * @param {string} interaction.options.content - The updated content for the Codex entry. Optional.
 * @param {string} interaction.options.language - The updated language of the Codex entry. Optional.
 * @param {string} interaction.options.source_url - The updated source URL for the Codex entry. Optional.
 *
 * @return {Promise<void>} A promise that resolves once the entry update is processed. Sends a reply to the interaction about the operation's result.
 */
export default async function editCodexEntry(interaction) {
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
            return interaction.reply({ content: "❌ Запись не найдена.", flags: MessageFlags.Ephemeral });
        }

        interaction.reply({ content: "✅ Запись в кодексе обновлена!", flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error("Ошибка при редактировании записи кодекса:", error);
        interaction.reply({ content: "❌ Ошибка при обновлении записи.", flags: MessageFlags.Ephemeral });
    }
}
