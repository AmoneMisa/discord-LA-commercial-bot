import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Deletes an achievement from the database and notifies the user of the deletion.
 *
 * @param {Object} interaction - The interaction object containing user input.
 * @param {Object} pool - The database connection pool to execute queries.
 * @return {Promise<void>} Resolves when the achievement is successfully deleted and a response is sent.
 */
export default async function deleteAchievement(interaction, pool) {
    const name = interaction.options.getString('name');

    await pool.query(`DELETE FROM achievements WHERE name = $1`, [name]);

    await interaction.reply({ content: i18n.t("info.achievementDeleted", { lng: await getUserLanguage(interaction.user.id, pool), name }), flags: MessageFlags.Ephemeral });
}
