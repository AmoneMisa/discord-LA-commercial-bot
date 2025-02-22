import {MessageFlags} from "discord.js";
import sendCharacterList from "../../generateCharactersListImage.js";
import {getUserAchievements} from "../../dbUtils.js";

/**
 * Handles the profile view for a specified user, retrieving and displaying their profile, associated characters, and achievements.
 *
 * @param {Object} interaction - The interaction object associated with the command, used to retrieve user input and respond to the user.
 * @param {Object} pool - The database connection pool to query user profiles, characters, and achievements.
 *
 * @return {Promise<void>} A promise that resolves when the profile view is handled and the response is sent.
 *                          Returns early if the user does not have a profile.
 */
export default async function handleProfileView(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const profile = await pool.query(`SELECT *
                                      FROM profiles
                                      WHERE user_id = $1`, [userId]);

    if (!profile.rows.length) {
        return interaction.reply({content: '🚫 У пользователя нет анкеты!', flags: MessageFlags.Ephemeral});
    }

    const characters = await pool.query(`SELECT *
                                         FROM characters
                                         WHERE profile_id = $1`, [profile.rows[0].id])

    const achievements = await getUserAchievements(pool, userId);

    if (characters.rows.length) {
        const data = profile.rows[0];
        await sendCharacterList(interaction,
            `📜 Профиль ${interaction.options.getUser('user').username}\n\n :peacock: **Имя:** ${data.name || 'Не указано'}\n**Роль:** ${data.role}\n**Прайм:** ${data.prime_start || 'Не указан'} - ${data.prime_end || 'Не указан'}\n**Рейдовый опыт:** ${data.raid_experience.join(', ') || 'Не указан'}\n**Опыт в продажах:** ${data.sales_experience || 'Не указан'}`,
            characters.rows, null, achievements);
    }
}
