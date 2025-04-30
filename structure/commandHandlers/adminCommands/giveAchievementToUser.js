import {MessageFlags} from "discord.js";
import {givePointsForActivity} from "../../dbUtils.js";
import {translatedMessage} from "../../utils.js";

/**
 * Assigns a specified achievement to a user by interacting with the database.
 *
 * @param {Object} interaction - The Discord interaction object that contains command details and options.
 * @return {Promise<void>} Resolves when the achievement is successfully assigned or an error is handled.
 */
export default async function giveAchievementToUser(interaction) {
    const user = tempInteractionData.getUser('user');
    const achievementName = interaction.values[0];

    const achievement = await pool.query(`SELECT id
                                          FROM achievements
                                          WHERE name = $1`, [achievementName]);

    if (!achievement.rows.length) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.achievementNotFound", {achievementName}),
            flags: MessageFlags.Ephemeral
        });
    }

    await pool.query(
        `INSERT INTO user_achievements (user_id, achievement_id, assigned_by)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [user.id, achievement.rows[0].id, interaction.user.id]
    );

    if (process.env.FACTIONS_MODULE) {
        await givePointsForActivity(user.id, 50);
    }

    await interaction.update({
        content: await translatedMessage(interaction, "info.achievementGrantedToUser", {
            achievementName,
            username: user.username
        }),
        components: [],
        flags: MessageFlags.Ephemeral
    });
}