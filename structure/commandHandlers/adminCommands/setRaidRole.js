import {MessageFlags} from "discord.js";

export default async function setRaidRole(interaction, pool) {
    const raidName = interaction.options.getString('raid');
    const role = interaction.options.getRole('role');

    const raid = await pool.query('SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)', [raidName]);

    if (raid.rowCount === 0) {
        return interaction.reply({
            content: `🚫 Рейд "${raidName}" не найден!`,
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
        content: `✅ Роль ${role.name} теперь связана с рейдом "${raidName}"!`,
        flags: MessageFlags.Ephemeral
    });
}
