import {MessageFlags} from "discord.js";
import {getSubscriptions, getUserLanguage} from "../../dbUtils.js";
import {getMember} from "../../utils.js";
import i18n from "../../../locales/i18n.js";

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
    const lang = await getUserLanguage(interaction.user.id, pool);

    if (categoryResult.rows.length === 0) {
        console.error("Не выбрана категория для отслеживания рейдов.");
        return interaction.reply("Администратор не выбрал категорию для отслеживания рейдов. Пожалуйста, свяжитесь с ним.");
    }

    let seller =  getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (seller.bot) {
        return await interaction.reply({content: i18n.t("errors.userIsBot", { lng: lang}), flags: MessageFlags.Ephemeral});
    }

    if (seller.id === interaction.user.id) {
        return await interaction.reply({content: i18n.t("errors.selfSubscription", { lng: lang }), flags: MessageFlags.Ephemeral});
    }

    const buyerId = interaction.user.id;
    const raid = interaction.options.getString('raid');

    const blockedBuyer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [buyerId]);
    if (blockedBuyer.rowCount > 0) {
        return await interaction.reply({
            content: i18n.t("errors.subscriptionBlocked", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    const raidData = await pool.query('SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)', [raid]);
    const result = await pool.query('SELECT id FROM available_raids WHERE raid_id = $1', [raidData.rows[0].id]);

    if (result.rows.length === 0) {
        console.error("Выбранный рейд не имеет связи с ролью. Пожалуйста, установите роль.", raid);

        return await interaction.reply({
            content: i18n.t("errors.raidNotLinked", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    for (const availableRaid of result.rows) {
        if (await getSubscriptions(pool, buyerId, seller.id, availableRaid.id).length > 0) {
            await interaction.reply({
                content: i18n.t("errors.duplicateSubscription", { lng: lang }),
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
        content: i18n.t("info.subscriptionSuccess", { sellerId: seller.id, raid, lng: lang }),
        flags: MessageFlags.Ephemeral
    });
}
