/**
 * Updates the roles of users in the guild based on their ratings and reviews.
 *
 * This function fetches roles and users information from the database, and assigns
 * the appropriate role to members in the guild who meet the specified criteria.
 * It ensures that each member has the highest applicable role and removes any
 * conflicting roles that they might have.
 *
 * @param {object} guild - The Discord guild in which the roles will be updated.
 *
 * Steps:
 * - Queries roles and users from the database.
 * - Iterates through each user and evaluates which role they qualify for.
 * - Fetches the corresponding guild member for the user.
 * - Assigns the best applicable role to the user.
 * - Removes any roles that conflict with the newly assigned role.
 * - Ensures the assigned role adheres to the user's rating and review requirements.
 *
 * Notes:
 * - Skips bot users when assigning roles.
 * - Handles scenarios where users or roles may no longer exist in the guild by catching errors.
 * - Relies on the guild's role cache for fetching role objects to assign or remove.
 * - Roles are ordered by `required_rating` in descending order to ensure proper assignment.
 */
export default async function (guild) {
    console.log('🔄 Обновление ролей продавцов...');
    const roles = await pool.query('SELECT * FROM roles ORDER BY required_rating DESC');
    const users = await pool.query('SELECT * FROM users');

    for (const user of users.rows) {
        let bestRole = null;
        for (const role of roles.rows) {
            if (user.rating >= role.required_rating &&
                (user.positive_reviews + user.negative_reviews) >= role.min_reviews &&
                user.positive_reviews >= role.min_positive_reviews &&
                user.negative_reviews >= role.min_negative_reviews) {
                bestRole = role;
                break;
            }
        }

        const member = await guild.members.fetch(user.user_id).catch(() => null);
        if (member && bestRole) {
            if (member.user.bot) {
                continue;
            }

            let roleToAssign = guild.roles.cache.get(bestRole.role_id);

            if (!roleToAssign) {
                continue;
            }

            if (member.roles.cache.has(roleToAssign.id)) {
                continue;
            }

            for (const role of roles.rows) {
                let existingRole = guild.roles.cache.get(role.role_id);
                if (existingRole && member.roles.cache.has(existingRole.id)) {
                    await member.roles.remove(existingRole).catch(() => null);
                }
            }
            await member.roles.add(roleToAssign).catch(() => null);
        }
    }

    console.log(`✅ Обновление ролей окончено!`);
}