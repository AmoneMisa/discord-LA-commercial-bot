import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent} from "../../utils.js";
import {getCurrentUserOdd} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const userId = interaction.user.id;
    const [, , nickname, betAmount, server] = interaction.customId.split("_");
    const target = interaction.values[0];
    const event = await getActiveEvent(pool);
    await pool.query(`INSERT INTO bets (event_id, user_id, nickname, amount, server, target, odds) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [event.id, userId, nickname, betAmount, server, target, await getCurrentUserOdd(pool, event.id, userId)]);

    await interaction.update({
        content: `✅ Ваша ставка в **${betAmount}** с персонажа **${nickname}** (сервер **${server}**) на игрока ${target} отправлена в обработку!`,
        components: [],
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (channelId) {
        const adminChannel = interaction.guild.channels.fetch(channelId);

        await adminChannel.send({
            content: `🔔 **Новая ставка!**\n\n**Игрок:** <@${userId}>\n**Ник:** ${nickname}\n**Сервер:** ${server}\n**Ставка:** ${betAmount}\n**Цель:** ${target}`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${userId}_${event.id}`).setLabel("✅ Принять").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${userId}_${event.id}`).setLabel("❌ Отклонить").setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error("Не найден канал с таким id:", channelId);
    }
}