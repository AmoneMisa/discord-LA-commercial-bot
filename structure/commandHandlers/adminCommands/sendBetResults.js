import {EmbedBuilder as MessageEmbed} from "@discordjs/builders";

export default async function (interaction, pool, eventId, client) {
    const targetWinner = interaction.options.getString("winner");

    const result = await pool.query(`
        WITH winners AS (SELECT b.user_id,
                                b.server,
                                b.amount,
                                b.odds,
                                (b.amount * b.odds) * 0.9 AS winnings -- Удерживаем 10%
                         FROM bets b
                                  JOIN bet_events e ON b.event_id = e.id
                         WHERE e.id = $1
                           AND b.target = $2 -- Победившая цель
        )
        SELECT u.user_id, w.server, w.amount, w.odds, w.winnings
        FROM winners w
                 JOIN users u ON w.user_id = u.user_id;
    `, [eventId, targetWinner]);

    if (result.rowCount === 0) {
        console.log("❌ Нет победителей в этом событии.");
        return;
    }

    const user = await client.users.fetch(interaction.user.id);
    let embed;
    for (const row of result.rows) {
        embed = new MessageEmbed()
            .setTitle("🎉 Итоги ставок")
            .setDescription(`Победители:`)
            .addFields(
                {name: "Сервер", value: row.server, inline: true},
                {name: "Ставка", value: `${row.amount}💰`, inline: true},
                {name: "Коэффициент", value: `${row.odds.toFixed(2)}x`, inline: true},
                {name: "Чистый выигрыш", value: `${row.winnings.toFixed(2)}💰`, inline: true}
            )
            .setColor("GREEN");
    }
    await user.send({embeds: [embed]}).catch(err => console.error(`Не удалось отправить сообщение: ${err}`));
}