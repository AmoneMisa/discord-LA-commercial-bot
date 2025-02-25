import {MessageFlags} from "discord.js";
import {getSubscriptions} from "../../dbUtils.js";
import {getMember} from "../../utils.js";

/**
 * Handles the user's subscription to notifications for a specific seller and raid.
 * The method interacts with the database to ensure the subscription is valid, checks for restrictions,
 * and prevents duplicates. Triggered by a Discord interaction.
 *
 * @param {Object} interaction - The Discord interaction object representing the user's action.
 * @param {Object} pool - The database connection pool to execute queries.
 * @param {boolean} [isContextMenu=false] - Indicates if the method is triggered via a context menu interaction.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the method is triggered via a message content menu command.
 * @return {Promise<Object>} Resolves with the interaction reply, indicating the subscription status.
 *                           Returns an error message in case of issues or restrictions.
 */
export default async function subscribeToBuy(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    const categoryResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['bus_category']);

    if (categoryResult.rows.length === 0) {
        console.error("Не выбрана категория для отслеживания рейдов.");
        return interaction.reply("Администратор не выбрал категорию для отслеживания рейдов. Пожалуйста, свяжитесь с ним.");
    }

    let seller =  getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (seller.bot) {
        return await interaction.reply({content: "Эту команду нельзя применять на ботах", flags: MessageFlags.Ephemeral});
    }

    const buyerId = interaction.user.id;
    const raid = interaction.options.getString('raid');

    const blockedBuyer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [buyerId]);
    if (blockedBuyer.rowCount > 0) {
        return await interaction.reply({
            content: '🚫 Вам запрещено подписываться на продавцов.',
            flags: MessageFlags.Ephemeral
        });
    }

    const raidData = await pool.query('SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)', [raid]);
    const result = await pool.query('SELECT id FROM available_raids WHERE raid_id = $1', [raidData.rows[0].id]);

    if (result.rows.length === 0) {
        console.error("Выбранный рейд не имеет связи с ролью. Пожалуйста, установите роль.", raid);

        return await interaction.reply({
            content: '🚫 Произошла ошибка при попытке подписаться на этот рейд. Свяжитесь с администратором.',
            flags: MessageFlags.Ephemeral
        });
    }

    for (const availableRaid of result.rows) {
        console.log(buyerId, seller.id, availableRaid.id);

        if (await getSubscriptions(pool, buyerId, seller.id, availableRaid.id).length > 0) {
            await interaction.reply({
                content: '🚫 Вы не можете подписаться на одного и того же продавца повторно, на один и тот же рейд.',
                flags: MessageFlags.Ephemeral
            });
            continue;
        }

        await pool.query(`
            INSERT INTO subscriptions (buyer_id, seller_id, raid_id)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING
        `, [buyerId, seller.id, availableRaid.id]);
    }

    return interaction.reply({
        content: `✅ Вы подписались на уведомления от **<@${seller.id}>** по рейдам: ${raid}.`,
        flags: MessageFlags.Ephemeral
    });
}
