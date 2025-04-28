import {MessageFlags} from "discord.js";
import {givePointsForActivity} from "../../dbUtils.js";
import {translatedMessage} from "../../utils.js";

/**
 * Assigns an achievement to all members with a specified role in a guild.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} guild - The guild object where the role and members are retrieved from.
 * @return {Promise<void>} Resolves when the achievement has been assigned or an appropriate message has been sent to the interaction.
 */
export default async function giveAchievementToRole(interaction, guild) {
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
            `INSERT INTO user_achievements (user_id, achievement_id, assigned_by)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [member.id, achievement.rows[0].id, interaction.user.id]
        );

        if (process.env.FACTIONS_MODULE) {
            await givePointsForActivity(member.id, 50);
        }

    }

    await interaction.reply({
        content: await translatedMessage(interaction, "info.achievementGrantedToRole", {
            achievementName,
            roleName: role.name
        }),
        flags: MessageFlags.Ephemeral
    });
}