import {MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Sets a bus category in the system, ensuring it is a valid category channel.
 * Stores the category's ID in the database and updates existing data if necessary.
 * Replies and edits the interaction context based on the outcome of the operation.
 *
 * @param {Object} interaction - The interaction object from Discord, used to handle user commands and replies.
 * @param {Object} pool - The database connection pool for executing queries to store the bus category.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export default async function setBusCategory(interaction, pool) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const category = interaction.options.getChannel('category');

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (category.type !== 4) { // 4 = категория в Discord API
        return interaction.reply({
            content: i18n.t("errors.mustSelectCategory", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    await pool.query(`
        INSERT INTO settings (key, value) VALUES ('bus_category', $1)
            ON CONFLICT (key) DO UPDATE SET value = $1;
    `, [category.id]);

    await interaction.editReply({
        content: i18n.t("info.categoryNowTracked", { categoryId: category.id, lng: lang }),
        flags: MessageFlags.Ephemeral
    });
}
