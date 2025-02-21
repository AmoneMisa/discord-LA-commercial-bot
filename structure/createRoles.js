import {PermissionsBitField} from "discord.js";

export default async function (pool, guild) {
    try {
        console.log("🔄 Проверка и обновление ролей в Discord...");
        const dbRoles = await pool.query('SELECT role_name, role_id FROM roles');
        const roleMap = new Map(dbRoles.rows.map(role => [role.role_name, role.role_id]));
        const discordRoles = await guild.roles.fetch();
        const discordRoleMap = new Map(Array.from(discordRoles.entries()).map(role => [role[1].name, role[1].id]));

        for (const [roleName, roleId] of roleMap) {
            if (!discordRoleMap.has(roleName)) {
                const createdRole = await guild.roles.create({
                    name: roleName,
                    permissions: [PermissionsBitField.Flags.SendMessages], // Базовые права
                    mentionable: true,
                });

                await pool.query('UPDATE roles SET role_id = $1 WHERE role_name = $2', [createdRole.id, roleName]);
                console.log(`✅ Роль создана: ${roleName}`);
            } else if (roleId === null) {
                await pool.query('UPDATE roles SET role_id = $1 WHERE role_name = $2', [discordRoleMap.get(roleName), roleName]);
                console.log(`✅ Роль обновлена: ${roleName}`);
            }
        }

        console.log("🎉 Проверка ролей завершена!");
    } catch (error) {
        console.error("❌ Ошибка при обновлении ролей:", error);
    }
}