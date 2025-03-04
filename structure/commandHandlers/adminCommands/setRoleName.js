import { MessageFlags } from 'discord.js';

/**
 * Updates the name of a role in both the database and the guild.
 *
 * @param {Object} interaction - The interaction object used to gather input and send replies.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @param {Object} guild - The guild object representing the Discord server in which the role is located.
 * @return {Promise<void>} Resolves after the role name has been updated in both the database and the guild,
 * or when an error response is sent if the role is not found.
 */
export default async function setRoleName(interaction, pool, guild) {
    const oldName = interaction.options.getString('old_name');
    const newName = interaction.options.getString('new_name');

    const roleData = await pool.query('SELECT * FROM roles WHERE role_name = $1', [oldName]);

    if (roleData.rows.length === 0) {
        return interaction.reply({ content: `❌ Роль **${oldName}** не найдена.`, flags: MessageFlags.Ephemeral });
    }

    const role = guild.roles.cache.get(roleData.rows[0].role_id);
    if (role) await role.setName(newName);

    await pool.query('UPDATE roles SET role_name = $1 WHERE role_name = $2', [newName, oldName]);

    await interaction.reply({ content: `✅ Роль **${oldName}** теперь называется **${newName}**.`, flags: MessageFlags.Ephemeral });
}
