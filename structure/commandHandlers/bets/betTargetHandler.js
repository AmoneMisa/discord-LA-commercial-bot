import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent} from "../../utils.js";

export default async function (interaction, pool) {
    const userId = interaction.user.id;
    const [, , nickname, betAmount, server] = interaction.customId.split("_");
    const target = interaction.values[0];
    const event = await getActiveEvent(pool);

    await interaction.update({
        content: `:bangbang:  **ATTENTION**\nЧтобы Ваша ставка была успешно зачислена, отправьте **камни судьбы** на один из **банков**, в зависимости от Вашего сервера.\nБанк Кратос: **Xzbit**\nБанк Альдеран: **QQbite**\n\n✅ Ваша ставка в **${betAmount}** с персонажа **${nickname}** (сервер **${server}**) на игрока ${target} отправлена в обработку!`,
        components: [],
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (channelId) {
        const adminChannel = await interaction.guild.channels.fetch(channelId);

        await adminChannel.send({
            content: `🔔 Событие #${event.id} | **Новая ставка!**\n\n**Игрок:** <@${userId}>\n**Ник:** ${nickname}\n**Сервер:** ${server}\n**Ставка:** ${betAmount}\n**Цель:** ${target}`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel("✅ Принять").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel("❌ Отклонить").setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}