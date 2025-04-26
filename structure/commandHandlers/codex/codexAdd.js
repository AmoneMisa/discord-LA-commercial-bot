import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Asynchronous function to handle the addition of a new codex entry.
 *
 * @async
 * @function
 * @param {object} interaction - The interaction object representing the command request.
 * @param {object} pool - The database connection pool for executing queries.
 * @returns {Promise<void>} - Sends a reply to the interaction indicating success or error.
 */
export default async function (interaction) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");
    const language = interaction.options.getString("language");
    const content = interaction.options.getString("content");
    const sourceUrl = interaction.options.getString("source_url");
    const image = interaction.options.getAttachment("image");

    try {
        const categoryResult = await pool.query(
            "SELECT id FROM codex_categories WHERE name = $1",
            [category]
        );

        if (categoryResult.rows.length === 0) {
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.categoryNotFound"),
                flags: MessageFlags.Ephemeral
            });
        }

        const categoryId = categoryResult.rows[0].id;

        const entryResult = await pool.query(
            `INSERT INTO codex_entries (category_id, title, language, content, source_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [categoryId, title, language, content, sourceUrl]
        );

        const entryId = entryResult.rows[0].id;

        if (image) {
            await pool.query(
                "INSERT INTO codex_images (entry_id, image_url) VALUES ($1, $2)",
                [entryId, image.url]
            );
        }

        await interaction.reply({
            content: await translatedMessage(interaction, "info.codexEntryAdded"),
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error("Ошибка при добавлении в кодекс:", error);
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.codexEntryAddError"),
            flags: MessageFlags.Ephemeral
        });
    }
}