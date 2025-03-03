import {getActiveEvent} from "../../utils.js";

export default async function (pool, channel, eventId) {
    const event = await getActiveEvent(pool);
    if (!event) {
        return;
    }

    const winners = await pool.query(
        "SELECT user_id, target, amount FROM bets WHERE event_id = $1 ORDER BY amount DESC",
        [eventId]
    );

    if (winners.rowCount === 0) {
        await channel.send(`🏆 **Итоговые ставки для ${event.rows[0].name}**\n❌ **Победителей нет.**`);
        return;
    }

    const perPage = 20;
    const totalPages = Math.ceil(winners.rowCount / perPage);

    for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedWinners = winners.rows.slice(startIndex, endIndex);

        let content = `🏆 **Итоговая таблица ставок (стр. ${page}/${totalPages})**:\n`;
        paginatedWinners.forEach((bet, index) => {
            content += `**${startIndex + index + 1}.** <@${bet.user_id}> поставил **${bet.amount}** на **${bet.choice}** и **выиграл!**\n`;
        });

        await channel.send(content);
    }
}
