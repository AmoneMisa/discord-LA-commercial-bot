import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Sets a bus category in the system, ensuring it is a valid category channel.
 *
 * @param {Object} interaction - The interaction object from Discord, used to handle user commands and replies.
 * @param {Object} pool - The database connection pool for executing queries to store the bus category.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export default async function setBusCategory(interaction, pool) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const category = interaction.options.getChannel('category');

    if (category.type !== 4) { // 4 = категория в Discord API
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.mustSelectCategory"),
            flags: MessageFlags.Ephemeral
        });
    }

    await pool.query(`
        INSERT INTO settings (key, value)
        VALUES ('bus_category', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1;
    `, [category.id]);

    await interaction.editReply({
        content: await translatedMessage(interaction, "info.categoryNowTracked", {categoryId: category.id}),
        flags: MessageFlags.Ephemeral
    });
}