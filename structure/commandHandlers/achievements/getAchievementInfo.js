import {EmbedBuilder, MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Retrieves information about a specific achievement and sends an embedded response to the user.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @return {Promise<void>} A promise that resolves when the reply has been sent to the user.
 */
export default async function getAchievementInfo(interaction) {
    const achievementName = interaction.values[0];

    const result = await pool.query(`
        SELECT a.name, a.description, a.icon, ua.assigned_at, ua.user_id 
        FROM achievements a 
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id 
        WHERE a.name = $1`,
        [achievementName]
    );

    if (!result.rows.length) {
        return interaction.reply({ content: await translatedMessage(interaction, "errors.achievementNotFound", {achievement: achievementName}), flags: MessageFlags.Ephemeral });
    }

    const achievement = result.rows[0];
    const embed = new EmbedBuilder()
        .setTitle(`🏆 ${await translatedMessage(interaction, "info.achievementTitle", {achievement: achievement.name})}`)
        .setDescription(achievement.description)
        .setThumbnail(achievement.icon)
        .addFields(
            {
                name: await translatedMessage(interaction, "info.achievementIssued"),
                value: achievement.assigned_at
                    ? `<@${achievement.user_id}> - ${achievement.assigned_at}`
                    : await translatedMessage(interaction, "info.achievementNotIssued")
            }
        )
        .setColor("#FFD700");

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
