import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags} from "discord.js";
import {updateUsersOdds} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool) {
    const targetWinner = interaction.options.getString("winner");
    const eventId = interaction.options.getString("event_id");
    await updateUsersOdds(pool, eventId);

    const result = await pool.query(`
        WITH winners AS (SELECT b.user_id,
                                b.nickname,
                                b.server,
                                b.amount,
                                b.odds,
                                (b.amount * b.odds) * 0.9 AS winnings -- Удерживаем 10%
                         FROM bets b
                                  JOIN bet_events e ON b.event_id = e.id
                         WHERE e.id = $1
                           AND LOWER(b.target) = LOWER($2) -- Победившая цель
        )
        SELECT u.user_id, w.nickname, w.server, w.amount, w.odds, w.winnings
        FROM winners w
                 JOIN users u ON w.user_id = u.user_id;
    `, [eventId, targetWinner.toLowerCase()]);

    if (result.rowCount === 0) {
        await interaction.reply({content: i18n.t("errors.noWinners", { lng: interaction.client.language[interaction.user.id] }), flags: MessageFlags.Ephemeral});
        throw new Error(`Произошла ошибка при попытке получить победителей. EventId: ${eventId}\nTargetWinner: ${targetWinner}\nResult: ${result.rows}`);
    }

    const user = await interaction.guild.members.fetch(interaction.user.id);
    let currentPage = 0;
    const itemsPerPage = 15;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("prev_page")
                .setLabel(i18n.t("buttons.back", { lng: interaction.client.language[interaction.user.id] }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),

            new ButtonBuilder()
                .setCustomId("next_page")
                .setLabel(i18n.t("buttons.next", { lng: interaction.client.language[interaction.user.id] }))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage >= Math.ceil(result.rows.length / itemsPerPage) - 1)
        );

    const message = await user.send({embeds: [generateEmbed(currentPage, result.rows, eventId, targetWinner, itemsPerPage, interaction)], components: [row], flags: MessageFlags.Ephemeral})
        .catch(err => console.error(`Не удалось отправить сообщение: ${err}`));
    const collector = message.createMessageComponentCollector();

    collector.on("collect", async (i) => {
        if (i.customId === "prev_page" && currentPage > 0) {
            currentPage--;
        } else if (i.customId === "next_page" && currentPage < Math.ceil(result.rows.length / itemsPerPage) - 1) {
            currentPage++;
        }

        await i.update({
            embeds: [generateEmbed(currentPage, result.rows, eventId, targetWinner, itemsPerPage, interaction)],
            components: [row]
        });
    });
}

function generateEmbed(page, result, eventId, targetWinner, itemsPerPage, interaction) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = result.slice(start, end);

    const embed = new EmbedBuilder()
        .setTitle(i18n.t("info.betResultsTitle", { eventId, lng: interaction.client.language[interaction.user.id] }))
        .setDescription(i18n.t("info.betResultsDescription", { targetWinner, lng: interaction.client.language[interaction.user.id] }))
        .setColor("#1396e7")
        .setFooter({ text: i18n.t("info.pageFooter", { page: page + 1, totalPages: Math.ceil(result.length / itemsPerPage), lng: interaction.client.language[interaction.user.id] }) });

    for (const row of pageData) {
        embed.addFields(
            { name: i18n.t("info.nickname", { lng: interaction.client.language[interaction.user.id] }), value: row.nickname, inline: true },
            { name: i18n.t("info.server", { lng: interaction.client.language[interaction.user.id] }), value: row.server, inline: true },
            { name: i18n.t("info.winnings", { lng: interaction.client.language[interaction.user.id] }), value: `${Math.ceil(row.winnings)}💰`, inline: true }
        );
    }

    return embed;
}