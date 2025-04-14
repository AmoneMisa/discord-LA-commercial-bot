import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Deletes a role from the server and removes its entry from the database.
 *
 * @param {Object} interaction - The interaction object containing information about the user interaction.
 * @param {Object} pool - The database connection pool used to query the roles table.
 * @param {Object} guild - The guild object representing the server where the role exists.
 * @return {Promise<void>} A promise that resolves when the role is deleted and the user is informed.
 */
export default async function deleteRole(interaction, pool, guild) {
    const name = interaction.options.getString('name');

    const roleData = await pool.query('SELECT * FROM roles WHERE role_name = $1', [name]);

    if (roleData.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.roleNotFound", {name}),
            flags: MessageFlags.Ephemeral
        });
    }

    const role = guild.roles.cache.get(roleData.rows[0].role_id);
    if (role) await role.delete();

    await pool.query('DELETE FROM roles WHERE role_name = $1', [name]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.roleDeleted", {name}),
        flags: MessageFlags.Ephemeral
    });
}