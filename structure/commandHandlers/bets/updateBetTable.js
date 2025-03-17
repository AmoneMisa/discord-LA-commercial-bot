import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {formatDateToCustomString, getActiveEvent} from "../../utils.js";
import errorsHandler from "../../../errorsHandler.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";
import getBetTableMessage from "./getBetTableMessage.js";

export default async function (interaction, pool, page = 1) {
    const messageIdResult = await pool.query(`SELECT *
                                              FROM settings
                                              WHERE key = 'bet_leaderboard_message_id'`);
    const channelIdResult = await pool.query(`SELECT *
                                              FROM settings
                                              WHERE key = 'bet_leaderboard_channel_id'`);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (channelIdResult.rows.length === 0) {
        console.error(`Не установлен id для канала-таблицы ставок!`);
        return interaction.reply({
            content: i18n.t("errors.betLeaderboardChannelDoesntSetup", {lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const channel = await interaction.guild.channels.fetch(channelIdResult.rows[0].value);

    let messageId;

    if (messageIdResult?.rows?.length && messageIdResult?.rows[0]?.value) {
        messageId = messageIdResult.rows[0].value;
    }

    const event = await getActiveEvent(pool);
    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", {lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const bets = await pool.query("SELECT user_id, target, amount, odds FROM bets WHERE event_id = $1 ORDER BY amount DESC", [event.id]);

    if (bets.rowCount === 0) {
        const emptyMsg = i18n.t("info.noBets", {
            lng: lang,
            eventName: event.rows[0].name,
            startTime: formatDateToCustomString(event.rows[0].start_time),
            endTime: formatDateToCustomString(event.rows[0].end_time)
        });
        if (messageId) {
            const msg = await channel.messages.fetch(messageId);
            await msg.edit(emptyMsg);
        } else {
            const newMsg = await channel.send(emptyMsg);
            return newMsg.id;
        }
        return;
    }

    const perPage = 12;
    const totalPages = Math.ceil(bets.rowCount / perPage);

    let isMessageExist;
    try {
        if (messageId) {
            isMessageExist = !!await channel.messages.fetch(messageId);
        }
    } catch (e) {
        console.info(i18n.t("errors.messageNotFound", {
            lng: lang,
            channelId: channelIdResult.rows[0].value,
            messageId: messageId
        }));
    }

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page - 1}`)
                .setLabel(i18n.t("buttons.back", {
                    lng: lang
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page + 1}`)
                .setLabel(i18n.t("buttons.next", {
                    lng: lang
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }

    const message = getBetTableMessage(page, bets, lang, event);
    if (isMessageExist) {
        const msg = await channel.messages.fetch(messageId);
        await msg.edit({content: message, components: row.components.length ? [row] : []});
    } else {
        const newMessage = await channel.send({content: message, components: row.components.length ? [row] : []})
            .catch(e => {
                console.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}`, channel)
                errorsHandler.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}\n\nChannel: ${channel}`);
            });
        await pool.query(`UPDATE settings
                          SET value = $1
                          WHERE key = 'bet_leaderboard_message_id'`, [newMessage.id]);
    }
}