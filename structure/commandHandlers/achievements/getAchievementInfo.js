import {EmbedBuilder, MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Retrieves information about a specific achievement and sends an embedded response to the user.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @param {Object} pool - The database connection pool for querying achievement data.
 * @return {Promise<void>} A promise that resolves when the reply has been sent to the user.
 */
export default async function getAchievementInfo(interaction, pool) {
    const achievementName = interaction.options.getString('achievement');

    const result = await pool.query(`
        SELECT a.name, a.description, a.icon, ua.assigned_at, ua.user_id 
        FROM achievements a 
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id 
        WHERE a.name = $1`,
        [achievementName]
    );

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!result.rows.length) {
        return interaction.reply({ content: i18n.t("errors.achievementNotFound", { lng: lang, achievement: achievementName }), flags: MessageFlags.Ephemeral });
    }

    const achievement = result.rows[0];

    const embed = new EmbedBuilder()
        .setTitle(`🏆 ${i18n.t("info.achievementTitle", { lng: lang, achievement: achievement.name })}`)
        .setDescription(achievement.description)
        .setThumbnail(achievement.icon)
        .addFields(
            {
                name: i18n.t("info.achievementIssued", { lng: lang }),
                value: achievement.assigned_at
                    ? `<@${achievement.user_id}> - ${achievement.assigned_at}`
                    : i18n.t("info.achievementNotIssued", { lng: lang })
            }
        )
        .setColor("#FFD700");

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
