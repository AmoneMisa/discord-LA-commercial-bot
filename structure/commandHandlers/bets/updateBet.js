import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent, getMember, parseFormattedNumber} from "../../utils.js";

export default async function updateBet(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    const event = await getActiveEvent(pool);
    if (!event) {
        return await interaction.reply({
            content: "❌ Это событие либо не существует, либо уже завершилось.",
            flags: MessageFlags.Ephemeral
        });
    }

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        console.error("updateBet interaction", interaction, isContextMenu, isMessageContentMenuCommand);
        console.error("Пользователь не найден или не существует", member);
        return await interaction.reply({content: "Пользователь не найден или не существует", flags: MessageFlags.Ephemeral});
    }

    let amount;

    if (isContextMenu) {
        amount = parseFormattedNumber(interaction.fields.getTextInputValue("amount"));
    } else {
        amount = interaction.options.getInteger("amount");
    }

    if (isNaN(amount)) {
        await interaction.reply({content: "Введённое вами число содержит недопустимые символы или формат ввода."});
        console.error("Update bet Incorrect amount:", amount);
        return;
    }

    const bet = await pool.query(`SELECT *
                                  FROM bets
                                  WHERE event_id = $1
                                    AND user_id = $2`, [event.id, interaction.user.id]);
    if (!bet.rows.length) {
        await interaction.reply({
            content: "❌ У вас нет активных ставок на это событие.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (amount <= bet.rows[0].amount) {
        return await interaction.reply({
            content: "❌ Вы можете только увеличить свою ставку!",
            flags: MessageFlags.Ephemeral
        });
    }

    if (amount === bet.rows[0].amount) {
        return await interaction.reply({
            content: "❌ Вы не можете поставить ставку, равную предыдущей!",
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.reply({
        content: `:bangbang: **ATTENTION**\nЧтобы Ваша ставка была успешно обновлена, отправьте **камни судьбы** на один из **банков**, в зависимости от Вашего сервера.\nБанк Кратос: **Xzbit**\nБанк Альдеран: **QQbite**\n\n✅ Ваша ставка отправлена на утверждение. Вы хотите увеличить её с ${bet.rows[0].amount} до **${amount}**\nВам необходимо отправить дополнительно ${amount - bet.rows[0].amount} **камней судьбы** на выбранный ранее банк.`,
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (channelId) {
        const adminChannel = await interaction.guild.channels.fetch(channelId);

        await adminChannel.send({
            content: `🔔 Событие #${event.id} | **Обновление ставки!**\n\n**Игрок:** <@${member.id}>\n**Ник:** ${bet.rows[0].nickname}\n**Сервер:** ${bet.rows[0].server}\n**Ставка:** ${amount}\n**Цель:** ${bet.rows[0].target}`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${member.id}_${event.id}_${amount}_${bet.rows[0].target}_${bet.rows[0].server}_${bet.rows[0].nickname}_update`).setLabel("✅ Принять").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${member.id}_${event.id}_${amount}_${bet.rows[0].target}_${bet.rows[0].server}_${bet.rows[0].nickname}_update`).setLabel("❌ Отклонить").setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}