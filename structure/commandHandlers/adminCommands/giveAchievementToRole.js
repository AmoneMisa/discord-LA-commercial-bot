import {MessageFlags} from "discord.js";
import {getUserLanguage, givePointsForActivity} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Assigns an achievement to all members with a specified role in a guild.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - The database connection pool for executing SQL queries.
 * @param {Object} guild - The guild object where the role and members are retrieved from.
 * @return {Promise<void>} Resolves when the achievement has been assigned or an appropriate message has been sent to the interaction.
 */
export default async function giveAchievementToRole(interaction, pool, guild) {
    const role = interaction.options.getRole('role');
    const achievementName = interaction.options.getString('achievement');

    const achievement = await pool.query(`SELECT id FROM achievements WHERE name = $1`, [achievementName]);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!achievement.rows.length) {
        return interaction.reply({ content: i18n.t("errors.achievementNotFound", { achievementName, lng: lang }), flags: MessageFlags.Ephemeral });
    }

    const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));

    for (const member of membersWithRole.values()) {
        await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [member.id, achievement.rows[0].id, interaction.user.id]
        );

        await givePointsForActivity(pool, member.id, 50);
    }

    await interaction.reply({ content: i18n.t("info.achievementGrantedToRole", { achievementName, roleName: role.name, lng: lang}), flags: MessageFlags.Ephemeral });
}
