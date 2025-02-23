import {MessageFlags} from "discord.js";
import {givePointsForActivity} from "../../dbUtils.js";

/**
 * Assigns a specified achievement to a user by interacting with the database.
 *
 * @param {Object} interaction - The Discord interaction object that contains command details and options.
 * @param {Object} pool - The database connection pool used to interact with the database.
 * @return {Promise<void>} Resolves when the achievement is successfully assigned or an error is handled.
 */
export default async function giveAchievementToUser(interaction, pool) {
    const user = interaction.options.getUser('user');
    const achievementName = interaction.options.getString('achievement');

    const achievement = await pool.query(`SELECT id FROM achievements WHERE name = $1`, [achievementName]);

    if (!achievement.rows.length) {
        return interaction.reply({ content: `🚫 Достижение **${achievementName}** не найдено!`, flags: MessageFlags.Ephemeral });
    }

    await pool.query(
        `INSERT INTO user_achievements (user_id, achievement_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [user.id, achievement.rows[0].id, interaction.user.id]
    );

    await givePointsForActivity(pool, user.id, 50);

    await interaction.reply({ content: `✅ Достижение **${achievementName}** выдано **${user.username}**!`, flags: MessageFlags.Ephemeral });
}
