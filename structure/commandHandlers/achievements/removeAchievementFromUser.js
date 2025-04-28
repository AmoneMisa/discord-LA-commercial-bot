import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Removes a specified achievement from a user by interacting with the database.
 *
 * @param {Object} interaction - The Discord interaction object that contains command details and options.
 * @return {Promise<void>} Resolves when the achievement is successfully removed or an error is handled.
 */
export default async function (interaction) {
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
        `DELETE FROM user_achievements
         WHERE user_id = $1
           AND achievement_id = $2`,
        [user.id, achievement.rows[0].id]
    );

    await interaction.reply({
        content: await translatedMessage(interaction, "info.achievementRemovedFromUser", {
            achievementName,
            username: user.username
        }),
        flags: MessageFlags.Ephemeral
    });
}
