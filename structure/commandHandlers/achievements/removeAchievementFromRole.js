import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Removes an achievement from all members with a specified role in a guild.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} guild - The guild object where the role and members are retrieved from.
 * @return {Promise<void>} Resolves when the achievement has been removed or an appropriate message has been sent to the interaction.
 */
export default async function removeAchievementFromRole(interaction, guild) {
    const role = tempInteractionData.getRole('role');
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

    const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));

    for (const member of membersWithRole.values()) {
        await pool.query(
            `DELETE FROM user_achievements
             WHERE user_id = $1
               AND achievement_id = $2`,
            [member.id, achievement.rows[0].id]
        );
    }

    await interaction.reply({
        content: await translatedMessage(interaction, "info.achievementRemovedFromRole", {
            achievementName,
            roleName: role.name
        }),
        flags: MessageFlags.Ephemeral
    });
}
