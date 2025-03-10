import {MessageFlags} from "discord.js";
import saveAchievementIcon from "../achievements/saveAchievementIcon.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Creates a new achievement with the provided name, description, and icon.
 * Validates the inputs and ensures the achievement does not already exist.
 * Saves the achievement icon and inserts the achievement into the database.
 *
 * @param {Object} interaction - The interaction object containing command options and reply methods.
 * @param {Object} interaction.options - Provides methods to retrieve command options.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @return {Promise<void>} A promise that resolves when the achievement is successfully created or the appropriate error message is sent as a reply.
 */
export default async function createAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const icon = interaction.options.getAttachment('icon');

    if (!icon) {
        return await interaction.reply({ content: i18n.t("errors.attachmentMustBePng", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    const isAchievementExist = await pool.query(`SELECT * FROM achievements WHERE name = $1`, [name]);

    if (isAchievementExist.rows.length) {
        return await interaction.reply({ content: i18n.t("errors.achievementAlreadyExists", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    const savedPath = await saveAchievementIcon(name, icon);

    if (savedPath) {
        await interaction.reply({ content: i18n.t("info.achievementCreated", { lng: await getUserLanguage(interaction.user.id, pool), name, savedPath}), flags: MessageFlags.Ephemeral });
    } else {
        return await interaction.reply({ content: i18n.t("errors.achievementIconSaveFailed", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    await pool.query(
        `INSERT INTO achievements (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, description, icon.url]
    );
}
