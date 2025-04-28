import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Assigns an achievement to users mentioned in a specific message within the same channel.
 *
 * @async
 * @function
 * @param {Object} interaction - The command interaction object.
 * @returns {Promise<void>}
 */
export default async function (interaction) {
    const messageId = tempInteractionData.getString("message_id");
    const achievement = interaction.values[0];
    const channel = interaction.channel;

    try {
        // Проверка: существует ли достижение
        const achievementCheck = await pool.query(
            `SELECT name
             FROM achievements
             WHERE name = $1`,
            [achievement]
        );

        if (achievementCheck.rowCount === 0) {
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.achievementNotFound", {achievement}),
                flags: MessageFlags.Ephemeral
            });
        }

        // Получаем сообщение по ID
        const message = await channel.messages.fetch(messageId);
        if (!message) {
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.messageNotFound"),
                flags: MessageFlags.Ephemeral
            });
        }

        // Получаем всех упомянутых пользователей
        const mentionedUsers = message.mentions.users;
        if (mentionedUsers.size === 0) {
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.noMentions"),
                flags: MessageFlags.Ephemeral
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
            content: await translatedMessage(interaction, "info.achievementGranted", {
                achievement,
                count: successCount
            })
        });
    } catch (err) {
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.unexpectedError"),
            flags: MessageFlags.Ephemeral
        });
        throw new Error(`❌ Ошибка при обработке команды achievement_give_mentions: ${err}`);
    }
}