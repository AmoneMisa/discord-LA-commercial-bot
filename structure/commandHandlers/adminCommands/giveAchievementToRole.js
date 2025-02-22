import {MessageFlags} from "discord.js";

export default async function giveAchievementToRole(interaction, pool, guild) {
    const role = interaction.options.getRole('role');
    const achievementName = interaction.options.getString('achievement');

    const achievement = await pool.query(`SELECT id FROM achievements WHERE name = $1`, [achievementName]);

    if (!achievement.rows.length) {
        return interaction.reply({ content: `🚫 Достижение **${achievementName}** не найдено!`, flags: MessageFlags.Ephemeral });
    }

    const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));

    for (const member of membersWithRole.values()) {
        await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [member.id, achievement.rows[0].id, interaction.user.id]
        );
    }

    await interaction.reply({ content: `✅ Достижение **${achievementName}** выдано всем с ролью ${role.name}!`, flags: MessageFlags.Ephemeral });
}
