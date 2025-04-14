import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Associates a specific role with a raid, storing the relationship in the database if it does not already exist.
 *
 * @param {Object} interaction - The interaction object containing user context and options.
 * @param {Object} pool - The database connection pool used for executing queries.
 * @return {Promise<Object>} A promise that resolves with the interaction reply containing the success or error message.
 */
export default async function setRaidRole(interaction, pool) {
    const raidName = interaction.options.getString('raid');
    const role = interaction.options.getRole('role');

    const raid = await pool.query('SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)', [raidName]);

    if (raid.rowCount === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.raidNotFound", {raidName}),
            flags: MessageFlags.Ephemeral
        });
    }

    const raidId = raid.rows[0].id;
    const roleCheck = await pool.query('SELECT * FROM raid_roles WHERE role_id = $1', [role.id]);

    if (roleCheck.rowCount === 0) {
        await pool.query('INSERT INTO raid_roles (role_id, role_name) VALUES ($1, $2)', [role.id, role.name]);
    }

    await pool.query(`
        INSERT INTO available_raids (raid_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `, [raidId, role.id]);

    return interaction.reply({
        content: await translatedMessage(interaction, "info.roleLinkedToRaid", {
            roleName: role.name,
            raidName
        }),
        flags: MessageFlags.Ephemeral
    });
}