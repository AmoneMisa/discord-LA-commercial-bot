import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {formatDateToCustomString, getActiveEvent} from "../../utils.js";

export default async function (interaction, pool, page = 1) {
    const messageIdResult = await pool.query(`SELECT * FROM settings WHERE key = 'bet_leaderboard_message_id'`);
    const channelIdResult = await pool.query(`SELECT * FROM settings WHERE key = 'bet_leaderboard_channel_id'`);
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
        const emptyMsg = `🎲 **${event.name}**\n📅 **Ставки открыты с ${formatDateToCustomString(event.start_time)} по ${formatDateToCustomString(event.end_time)}**\n\n❌ **Пока нет ставок.**`;
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

    let embedContent = `🎲 **${event.name}**\n📅 **Ставки открыты с ${formatDateToCustomString(event.start_time)} по ${formatDateToCustomString(event.end_time)}**\n\n`;

    embedContent += `\n💰 **Таблица ставок (стр. ${page}/${totalPages})**:\n`;
    paginatedBets.forEach((bet, index) => {
        console.log(bet)
        embedContent += `**${startIndex + index + 1}.** <@${bet.user_id}> поставил **${bet.amount}** на **${bet.target}** (возможный выигрыш: ${(Math.ceil(bet.amount * bet.odds))})\n`;
    });

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page - 1}`)
                .setLabel("⬅️ Назад")
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page + 1}`)
                .setLabel("➡️ Вперёд")
                .setStyle(ButtonStyle.Primary)
        );
    }

    let isMessageExist;
    try {
        isMessageExist = !!await channel.messages.fetch(messageId);
    } catch (e) {
        console.error(`В канале: ${channelIdResult.rows[0].value} не найдено сообщение: ${messageId}`);
    }

    if (messageId && isMessageExist) {
        const msg = await channel.messages.fetch(messageId);
        await msg.edit({ content: embedContent, components: row.components.length ? [row] : [] });
    } else {
        const newMessage = await channel.send({ content: embedContent, components: row.components.length ? [row] : [] });
        await pool.query(`UPDATE settings SET value = $1 WHERE key = 'bet_leaderboard_message_id'`, [newMessage.id]);
    }
}
