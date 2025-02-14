import { MessageFlags } from 'discord.js';

export default async function deleteRole(interaction, pool, guild) {
    const name = interaction.options.getString('name');

    const roleData = await pool.query('SELECT * FROM roles WHERE role_name = $1', [name]);

    if (roleData.rows.length === 0) {
        return interaction.reply({ content: `❌ Роль **${name}** не найдена.`, flags: MessageFlags.Ephemeral });
    }

    const role = guild.roles.cache.get(roleData.rows[0].role_id);
    if (role) await role.delete();

    await pool.query('DELETE FROM roles WHERE role_name = $1', [name]);

    await interaction.reply({ content: `✅ Роль **${name}** удалена.`, flags: MessageFlags.Ephemeral });
}
