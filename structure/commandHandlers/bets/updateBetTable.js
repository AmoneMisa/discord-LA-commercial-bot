import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default async function (pool, channel, page = 1) {
    const messageIdResult = pool.query(`SELECT * FROM settings WHERE key = 'bet_leaderboard_message_id'`);
    const messageId = messageIdResult.rows[0].value;

    const event = await pool.query("SELECT * FROM bets_events");
    if (event.rows[event.rows.length - 1].end_time < new Date().getTime()) {
        return;
    }

    const bets = await pool.query("SELECT user_id, choice, amount FROM bets WHERE event_id = $1 ORDER BY amount DESC", [event.id]);
    const targets = await pool.query("SELECT DISTINCT choice FROM bets WHERE event_id = $1", [event.id]);

    if (bets.rowCount === 0) {
        const emptyMsg = `🎲 **${event.rows[0].name}**\n📅 **Ставки открыты с ${event.rows[0].start_time} по ${event.rows[0].end_time}**\n\n❌ **Пока нет ставок.**`;
        if (messageId) {
            const msg = await channel.messages.fetch(messageId);
            await msg.edit(emptyMsg);
        } else {
            const newMsg = await channel.send(emptyMsg);
            return newMsg.id;
        }
        return;
    }

    let totalBets = bets.rows.reduce((sum, b) => sum + b.amount, 0);
    let targetOdds = {};
    targets.rows.forEach(target => {
        let sumOnTarget = bets.rows.filter(b => b.choice === target.choice).reduce((sum, b) => sum + b.amount, 0);
        targetOdds[target.choice] = (totalBets / sumOnTarget).toFixed(2);
    });

    const perPage = 20;
    const totalPages = Math.ceil(bets.rowCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedBets = bets.rows.slice(startIndex, endIndex);

    let embedContent = `🎲 **${event.rows[0].name}**\n📅 **Ставки открыты с ${event.rows[0].start_time} по ${event.rows[0].end_time}**\n\n`;
    embedContent += "**Текущие коэффициенты:**\n";

    for (const [target, odds] of Object.entries(targetOdds)) {
        embedContent += `🔹 **${target}**: x${odds}\n`;
    }

    embedContent += `\n💰 **Таблица ставок (стр. ${page}/${totalPages})**:\n`;

    paginatedBets.forEach((bet, index) => {
        embedContent += `**${startIndex + index + 1}.** <@${bet.user_id}> поставил **${bet.amount}** на **${bet.choice}** (возможный выигрыш: ${(bet.amount * targetOdds[bet.choice]).toFixed(2)})\n`;
    });

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${eventId}_${page - 1}`)
                .setLabel("⬅️ Назад")
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${eventId}_${page + 1}`)
                .setLabel("➡️ Вперёд")
                .setStyle(ButtonStyle.Primary)
        );
    }

    if (messageId) {
        const msg = await channel.messages.fetch(messageId);
        await msg.edit({ content: embedContent, components: row.components.length ? [row] : [] });
    } else {
        await channel.send({ content: embedContent, components: row.components.length ? [row] : [] });
    }
}
