import { MessageFlags } from 'discord.js';

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
