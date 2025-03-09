import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {formatDateToCustomString, getActiveEvent} from "../../utils.js";
import errorsHandler from "../../../errorsHandler.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool, page = 1) {
    const messageIdResult = await pool.query(`SELECT * FROM settings WHERE key = 'bet_leaderboard_message_id'`);
    const channelIdResult = await pool.query(`SELECT * FROM settings WHERE key = 'bet_leaderboard_channel_id'`);

    if (channelIdResult.rows.length === 0) {
        console.error(`Не установлен id для канала-таблицы ставок!`);
        return interaction.reply({content: i18n.t("errors.betLeaderboardChannelDoesntSetup", { lng: interaction.client.language[interaction.user.id]}), flags: MessageFlags.Ephemeral });
    }

    const channel = await interaction.guild.channels.fetch(channelIdResult.rows[0].value);

    let messageId;

    if (messageIdResult?.rows?.length && messageIdResult?.rows[0]?.value) {
        messageId = messageIdResult.rows[0].value;
    }

    const event = await getActiveEvent(pool);
    if (!event) {
        return;
    }

    const bets = await pool.query("SELECT user_id, target, amount, odds FROM bets WHERE event_id = $1 ORDER BY amount DESC", [event.id]);

    if (bets.rowCount === 0) {
        const emptyMsg = i18n.t("info.noBets", {
            lng: interaction.client.language[interaction.user.id],
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

    const perPage = 20;
    const totalPages = Math.ceil(bets.rowCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedBets = bets.rows.slice(startIndex, endIndex);

    let embedContent = i18n.t("info.betTableHeader", {
        lng: interaction.client.language[interaction.user.id],
        eventId: event.rows[0].id,
        eventName: event.rows[0].name,
        startTime: formatDateToCustomString(event.rows[0].start_time),
        endTime: formatDateToCustomString(event.rows[0].end_time),
        page: page,
        totalPages: totalPages
    });;

    embedContent += `\n💰 **Таблица ставок | (стр. ${page}/${totalPages})**:\n`;
    paginatedBets.forEach((bet, index) => {
        embedContent += i18n.t("info.betRow", {
            lng: interaction.client.language[interaction.user.id],
            position: startIndex + index + 1,
            userId: bet.user_id,
            amount: bet.amount,
            target: bet.target,
            odds: bet.odds,
            winnings: (Math.ceil(bet.amount * bet.odds * 0.9))
        });
    });

    embedContent += i18n.t("info.betCommission", {
        lng: interaction.client.language[interaction.user.id]
    });

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page - 1}`)
                .setLabel(i18n.t("buttons.back", {
                    lng: interaction.client.language[interaction.user.id]
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page + 1}`)
                .setLabel(i18n.t("buttons.next", {
                    lng: interaction.client.language[interaction.user.id]
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }

    let isMessageExist;
    try {
        if (messageId) {
            isMessageExist = !!await channel.messages.fetch(messageId);
        }
    } catch (e) {
        console.info(i18n.t("errors.messageNotFound", {
            lng: interaction.client.language[interaction.user.id],
            channelId: channelIdResult.rows[0].value,
            messageId: messageId
        }));
    }

    if (isMessageExist) {
        if (page > 1) {
            await interaction.reply({
                content: embedContent,
                flags: MessageFlags.Ephemeral,
                components: row.components.length ? [row] : []
            });
        } else {
            const msg = await channel.messages.fetch(messageId);
            await msg.edit({ content: embedContent, components: row.components.length ? [row] : [] });
        }
    } else {
        const newMessage = await channel.send({ content: embedContent, components: row.components.length ? [row] : [] })
            .catch(e => {
                console.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}`, channel)
                errorsHandler.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}\n\nChannel: ${channel}`);
            });
        await pool.query(`UPDATE settings SET value = $1 WHERE key = 'bet_leaderboard_message_id'`, [newMessage.id]);
    }
}
