import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Asynchronous function to handle the addition of a new codex entry.
 * It retrieves and validates input data, checks the existence of the category,
 * inserts a new codex entry into the database, and associates an image if provided.
 *
 * @async
 * @function
 * @param {object} interaction - The interaction object representing the command request.
 * @param {object} pool - The database connection pool for executing queries.
 * @returns {Promise<void>} - Sends a reply to the interaction indicating success or error.
 *
 * @throws {Error} - Logs the error and sends an error response in case of failure during any operation.
 */
export default async function (interaction, pool) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");
    const language = interaction.options.getString("language");
    const content = interaction.options.getString("content");
    const sourceUrl = interaction.options.getString("source_url");
    const image = interaction.options.getAttachment("image");

    try {
        // Проверяем, существует ли категория
        const categoryResult = await pool.query(
            "SELECT id FROM codex_categories WHERE name = $1",
            [category]
        );

        if (categoryResult.rows.length === 0) {
            return interaction.reply({ content: i18n.t("errors.categoryNotFound", { lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });
        }

        const categoryId = categoryResult.rows[0].id;

        // Добавляем запись в кодекс
        const entryResult = await pool.query(
            `INSERT INTO codex_entries (category_id, title, language, content, source_url)
            VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [categoryId, title, language, content, sourceUrl]
        );

        const entryId = entryResult.rows[0].id;

        // Сохраняем изображение, если оно было загружено
        if (image) {
            await pool.query(
                "INSERT INTO codex_images (entry_id, image_url) VALUES ($1, $2)",
                [entryId, image.url]
            );
        }

        await interaction.reply({ content: i18n.t("info.codexEntryAdded", { lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });

    } catch (error) {
        console.error("Ошибка при добавлении в кодекс:", error);
        await interaction.reply({ content: i18n.t("errors.codexEntryAddError", { lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });
    }
}