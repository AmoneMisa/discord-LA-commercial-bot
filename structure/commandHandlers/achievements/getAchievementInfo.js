import {EmbedBuilder, MessageFlags} from "discord.js";

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
