import {EmbedBuilder, MessageFlags} from "discord.js";

/**
 * Retrieves information about a specific achievement and sends an embedded response to the user.
 *
 * @param {CommandInteraction} interaction - The interaction object containing user input and context.
 * @param {Pool} pool - The database connection pool for querying achievement data.
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

    if (!result.rows.length) {
        return interaction.reply({ content: `🚫 Достижение **${achievementName}** не найдено!`, flags: MessageFlags.Ephemeral });
    }

    const achievement = result.rows[0];

    const embed = new EmbedBuilder()
        .setTitle(`🏆 Достижение: ${achievement.name}`)
        .setDescription(achievement.description)
        .setThumbnail(achievement.icon)
        .addFields(
            { name: "Выдано", value: achievement.assigned_at ? `<@${achievement.user_id}> - ${achievement.assigned_at}` : "Не выдавалось" }
        )
        .setColor("#FFD700");

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
