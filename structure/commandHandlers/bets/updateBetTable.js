import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {formatDateToCustomString, getActiveEvent, translatedMessage} from "../../utils.js";
import errorsHandler from "../../../errorsHandler.js";

/**
 * Отображает таблицу ставок с возможностью постраничного просмотра.
 *
 * @param {CommandInteraction} interaction
 * @param {number} page
 */
export default async function (interaction, page = 1) {
    const messageIdResult = await pool.query(`SELECT *
                                              FROM settings
                                              WHERE key = 'bet_leaderboard_message_id'`);
    const channelIdResult = await pool.query(`SELECT *
                                              FROM settings
                                              WHERE key = 'bet_leaderboard_channel_id'`);

    if (channelIdResult.rows.length === 0) {
        console.error(`Не установлен id для канала-таблицы ставок!`);
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.betLeaderboardChannelDoesntSetup"),
            flags: MessageFlags.Ephemeral
        });
    }

    const channel = await interaction.guild.channels.fetch(channelIdResult.rows[0].value);

    let messageId;
    if (messageIdResult?.rows?.length && messageIdResult?.rows[0]?.value) {
        messageId = messageIdResult.rows[0].value;
    }

    const event = await getActiveEvent();
    if (!event) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.noBetEventExist"),
            flags: MessageFlags.Ephemeral
        });
    }

    const bets = await pool.query(
        "SELECT user_id, target, amount, odds FROM bets WHERE event_id = $1 ORDER BY amount DESC",
        [event.id]
    );

    if (bets.rowCount === 0) {
        const emptyMsg = await translatedMessage(interaction, "info.noBets", {
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

    let embedContent = await translatedMessage(interaction, "info.betTableHeader", {
        eventId: event.id,
        eventName: event.name,
        startTime: formatDateToCustomString(event.start_time),
        endTime: formatDateToCustomString(event.end_time),
        page: page,
        totalPages: totalPages
    });

    for (const [index, bet] of paginatedBets.entries()) {
        embedContent += await translatedMessage(interaction, "info.betRow", {
            position: startIndex + index + 1,
            userId: bet.user_id,
            amount: bet.amount,
            target: bet.target,
            odds: bet.odds,
            winnings: Math.round(bet.amount * bet.odds * 0.9)
        });
    }

    embedContent += await translatedMessage(interaction, "info.betCommission");

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page - 1}`)
                .setLabel(await translatedMessage(interaction, "buttons.back"))
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page + 1}`)
                .setLabel(await translatedMessage(interaction, "buttons.next"))
                .setStyle(ButtonStyle.Primary)
        );
    }

    let isMessageExist;
    try {
        if (messageId) {
            isMessageExist = !!await channel.messages.fetch(messageId);
        }
    } catch (e) {
        console.info(await translatedMessage(interaction, "errors.messageNotFound", {
            channelId: channelIdResult.rows[0].value,
            messageId
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
            await msg.edit({content: embedContent, components: row.components.length ? [row] : []});
        }
    } else {
        const newMessage = await channel.send({
            content: embedContent,
            components: row.components.length ? [row] : []
        }).catch(e => {
            console.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}`, channel);
            errorsHandler.error(`Ошибка при отправке сообщения-таблицы в канал для ставок: ${e}`, `Канал Id: ${channelIdResult.rows[0].value}\n\nChannel: ${channel}`);
        });

        await pool.query(`UPDATE settings
                          SET value = $1
                          WHERE key = 'bet_leaderboard_message_id'`, [newMessage.id]);
    }
}