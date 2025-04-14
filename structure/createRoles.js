import {PermissionsBitField} from "discord.js";

/**
 * Synchronizes roles between a Discord server and a database.
 *
 * This asynchronous function ensures that roles present in the database are created or updated
 * in the Discord guild. Roles in the database are checked against those in the Discord guild,
 * and missing roles are created in the guild. Any discrepancies in role IDs are updated in the database.
 *
 * @param {Pool} pool - A database connection pool object to execute queries.
 * @param {Guild} guild - A Discord guild object representing the server to synchronize roles with.
 *
 * Functionality:
 * 1. Fetches all roles from the database along with their names and IDs.
 * 2. Fetches all roles from the Discord server's guild.
 * 3. Creates roles in the Discord server if they exist in the database but not in the server.
 * 4. Updates the role ID in the database if it is null or outdated.
 * 5. Logs progress during the operation and details about created or updated roles.
 *
 * Error Handling:
 * Logs an error message to the console in case of any exceptions during execution.
 */
export default async function (guild) {
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