import {MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Assigns an achievement to users mentioned in a specific message within the same channel.
 *
 * The function processes a command interaction wherein it validates the achievement,
 * fetches the target message by its ID, and assigns the specified achievement to all
 * users mentioned within the message. If the process completes successfully, a status
 * response is sent back to the interaction. Any errors encountered during the process
 * are handled gracefully with appropriate responses or logged to the console.
 *
 * @async
 * @function
 * @param {Object} interaction - The command interaction object. Contains user input values
 *                               such as message ID and achievement name, and provides methods
 *                               for replying to the user.
 * @param {Object} pool - The database connection object for executing queries. Used for
 *                        verifying the existence of the achievement and maintaining user
 *                        achievements data.
 *
 * @throws Will respond to the interaction with appropriate error messages in case of issues
 *         such as:
 *         - Achievement not found in the database.
 *         - Invalid or non-existent message ID.
 *         - No users mentioned in the target message.
 *         - Database insertion errors.
 *
 * @returns {Promise<void>} Resolves once the interaction reply is sent, indicating successful
 *                          processing or an error message to the user.
 */
export default async function (interaction, pool) {
    const messageId = interaction.options.getString("message_id");
    const achievement = interaction.options.getString("achievement");
    const channel = interaction.channel;

    try {
        // 🔎 Проверяем, существует ли достижение
        const achievementCheck = await pool.query(
            `SELECT name
             FROM achievements
             WHERE name = $1`,
            [achievement]
        );

        if (achievementCheck.rowCount === 0) {
            return interaction.reply({
                content: i18n.t("errors.achievementNotFound", { lng: await getUserLanguage(interaction.user.id, pool), achievement }),
                flags: MessageFlags.Ephemeral,
            });
        }

        // 🔍 Получаем сообщение по ID
        const message = await channel.messages.fetch(messageId);
        if (!message) {
            return interaction.reply({
                content: i18n.t("errors.messageNotFound", { lng: await getUserLanguage(interaction.user.id, pool) }),
                flags: MessageFlags.Ephemeral,
            });
        }

        // 🔎 Получаем всех упомянутых пользователей
        const mentionedUsers = message.mentions.users;
        if (mentionedUsers.size === 0) {
            return interaction.reply({
                content: i18n.t("errors.noMentions", { lng: await getUserLanguage(interaction.user.id, pool) }),
                flags: MessageFlags.Ephemeral,
            });
        }

        let successCount = 0;
        for (const user of mentionedUsers.values()) {
            try {
                await pool.query(
                    `INSERT INTO user_achievements (user_id, name, created_at)
                     VALUES ($1, $2, NOW())
                     ON CONFLICT (user_id, name) DO NOTHING`,
                    [user.id, achievement]
                );
                successCount++;
            } catch (err) {
                console.error(`❌ Ошибка при выдаче ачивки пользователю ${user.id}:`, err);
            }
        }

        await interaction.reply({
            content: i18n.t("info.achievementGranted", { lng: await getUserLanguage(interaction.user.id, pool), achievement, count: successCount })
        });
    } catch (err) {
        await interaction.reply({
            content: i18n.t("errors.unexpectedError", { lng: await getUserLanguage(interaction.user.id, pool) }),
            flags: MessageFlags.Ephemeral,
        });
        throw new Error(`❌ Ошибка при обработке команды achievement_give_mentions: ${err}`);
    }
}