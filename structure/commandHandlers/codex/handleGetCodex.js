import { EmbedBuilder } from "discord.js";

/**
 * Handles the retrieval of codex entries based on category and title, and sends the resulting information as an embedded message.
 *
 * @param {Object} interaction - The interaction object containing user's input data.
 * @param {Object} pool - The database connection pool used for querying data.
 * @return {Promise<void>} A promise that resolves when the interaction reply is sent, or rejects if an error occurs during processing.
 */
export async function handleGetCodex(interaction, pool) {
    const category = interaction.options.getString("category");
    const title = interaction.options.getString("title");

    try {
        const codexResult = await pool.query(
            `SELECT ce.*, cc.name AS category_name 
            FROM codex_entries ce
            JOIN codex_categories cc ON ce.category_id = cc.id
            WHERE cc.name = $1 AND ce.title = $2`,
            [category, title]
        );

        if (codexResult.rows.length === 0) {
            return interaction.reply({ content: "❌ Запись не найдена!", ephemeral: true });
        }

        const entry = codexResult.rows[0];

        const imagesResult = await pool.query(
            "SELECT image_url FROM codex_images WHERE entry_id = $1",
            [entry.id]
        );

        const embed = new EmbedBuilder()
            .setTitle(entry.title)
            .setDescription(entry.content)
            .setColor("#49f106")
            .setFooter({ text: `Категория: ${entry.category_name} | Язык: ${entry.language}` });

        if (entry.source_url) {
            embed.setURL(entry.source_url);
        }

        if (imagesResult.rows.length > 0) {
            embed.setImage(imagesResult.rows[0].image_url);
        }

        interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Ошибка при получении данных из кодекса:", error);
        interaction.reply({ content: "❌ Ошибка при получении данных!", ephemeral: true });
    }
}
