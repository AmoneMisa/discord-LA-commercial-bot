import {MessageFlags} from "discord.js";
import sendCharacterList from "../../generateCharactersListImage.js";
import {getUserAchievements} from "../../dbUtils.js";
import {getMember} from "../../utils.js";

/**
 * Handles the profile view interaction, retrieves profile details and associated characters,
 * and sends back the appropriate response with the profile and character information.
 *
 * @param {object} interaction - The interaction object containing user input and context.
 * @param {object} pool - The database connection pool used to query the database.
 * @param {boolean} [isContextMenu=false] - Indicates if the command was triggered through a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the interaction was invoked through a message content menu command.
 * @return {Promise<void>} Resolves when the interaction has been successfully processed and a response is sent.
 */
export default async function handleProfileView(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (member.bot) {
        return await interaction.reply({content: "Эту команду нельзя применять на ботах", flags: MessageFlags.Ephemeral});
    }

    const userId = member.id;
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
