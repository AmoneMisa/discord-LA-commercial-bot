import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Edits an achievement in the database by updating a specified field with a new value.
 *
 * @param {Interaction} interaction - The interaction object containing user input data.
 * @param {Pool} pool - The database connection pool used to execute the query.
 * @param {string} interaction.options.getString('name') - The name of the achievement to update.
 * @param {string} interaction.options.getString('field') - The field to update ('name', 'description', or 'icon').
 * @param {string} interaction.options.getString('value') - The new value for the specified field.
 *
 * @return {Promise<void>} Resolves after updating the achievement and sending a confirmation reply to the user.
 */
export default async function editAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const field = interaction.options.getString('field'); // 'name' | 'description' | 'icon'
    const value = interaction.options.getString('value');

    await pool.query(`UPDATE achievements SET ${field} = $1 WHERE name = $2`, [value, name]);

    await interaction.reply({ content: i18n.t("info.achievementUpdated", { lng: await getUserLanguage(interaction.user.id, pool), name }), flags: MessageFlags.Ephemeral });
}
