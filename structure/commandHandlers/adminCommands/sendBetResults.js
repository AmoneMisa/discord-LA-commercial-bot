import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags} from "discord.js";

export default async function (interaction, pool) {
    const targetWinner = interaction.options.getString("winner");
    const eventId = interaction.options.getString("event_id");

    const result = await pool.query(`
        WITH winners AS (SELECT b.user_id,
                                b.server,
                                b.amount,
                                b.odds,
                                (b.amount * b.odds) * 0.9 AS winnings -- Удерживаем 10%
                         FROM bets b
                                  JOIN bet_events e ON b.event_id = e.id
                         WHERE e.id = $1
                           AND LOWER(b.target) = LOWER($2) -- Победившая цель
        )
        SELECT u.user_id, w.server, w.amount, w.odds, w.winnings
        FROM winners w
                 JOIN users u ON w.user_id = u.user_id;
    `, [eventId, targetWinner.toLowerCase()]);

    if (result.rowCount === 0) {
        await interaction.reply({content: "❌ Нет победителей в этом событии. Проверьте консоль на наличие ошибок.", flags: MessageFlags.Ephemeral});
        throw new Error(`Произошла ошибка при попытке получить победителей. EventId: ${eventId}\nTargetWinner: ${targetWinner}\nResult: ${result.rows}`);
    }

    const user = await interaction.guild.members.fetch(interaction.user.id);
    let currentPage = 0;
    const itemsPerPage = 15;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("prev_page")
                .setLabel("⬅ Назад")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),

            new ButtonBuilder()
                .setCustomId("next_page")
                .setLabel("Вперёд ➡")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage >= Math.ceil(result.rows.length / itemsPerPage) - 1)
        );

    const message = await user.send({embeds: [generateEmbed(currentPage, result, eventId, targetWinner, itemsPerPage)], components: [row], flags: MessageFlags.Ephemeral})
        .catch(err => console.error(`Не удалось отправить сообщение: ${err}`));
    const collector = message.createMessageComponentCollector();

    collector.on("collect", async (i) => {
        if (i.customId === "prev_page" && currentPage > 0) {
            currentPage--;
        } else if (i.customId === "next_page" && currentPage < Math.ceil(result.rows.length / itemsPerPage) - 1) {
            currentPage++;
        }

        await i.update({
            embeds: [generateEmbed(currentPage)],
            components: [row]
        });
    });
}

function generateEmbed(page, result, eventId, targetWinner, itemsPerPage) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = result.rows.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(`🎉 Итоги ставок | #${eventId}`)
        .setDescription(`Победители\n📌 **Цель-победитель**: ${targetWinner}`)
        .setColor("#1396e7")
        .setFooter({ text: `Страница ${page + 1} из ${Math.ceil(result.rows.length / itemsPerPage)}` });

    for (const row of pageData) {
        embed.addFields(
            { name: 'Ник', value: `${row.nickname}`, inline: true },
            { name: "Сервер", value: row.server, inline: true },
            { name: "Выигрыш", value: `${row.winnings.toFixed(2)}💰`, inline: true },
        );
    }

    return embed;
}