import {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags} from "discord.js";
import {getActiveEvent, getMember} from "../../utils.js";

export default async function (interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    const event = await getActiveEvent(pool);
    if (!event) {
        return interaction.reply({ content: "❌ Это событие либо не существует, либо уже завершилось.", flags: MessageFlags.Ephemeral });
    }

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        console.error("Пользователь не найден или не существует", member);
        return await interaction.reply({content: "Пользователь не найден или не существует", flags: MessageFlags.Ephemeral});
    }

    const betsResult = await pool.query(`SELECT * FROM bets WHERE event_id = $1 AND user_id = $2`, [event.id, member.id]);

    if (betsResult.rows.length) {
        await interaction.reply({content: "Ставка уже создана!", flags: MessageFlags.Ephemeral});
        return ;
    }

    // Проверяем, настроен ли закрытый канал
    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0]?.value;

    if (!channelId) {
        return await interaction.reply({ content: "⚠️ Канал для ставок не настроен администратором.", flags: MessageFlags.Ephemeral });
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel) {
        return await interaction.reply({ content: "⚠️ Ошибка: не найден канал для ставок.", flags: MessageFlags.Ephemeral });
    }

    // Создание модального окна
    const modal = new ModalBuilder()
        .setCustomId("bet_modal")
        .setTitle("🎲 Создание ставки");

    const nicknameInput = new TextInputBuilder()
        .setCustomId("bet_nickname")
        .setLabel("Введите ваш ник")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const betAmountInput = new TextInputBuilder()
        .setCustomId("bet_amount")
        .setLabel("Введите сумму ставки (от 200)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const serverInput = new TextInputBuilder()
        .setCustomId("bet_server")
        .setLabel("Введите ваш сервер (Кратос / Альдеран)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(nicknameInput);
    const row2 = new ActionRowBuilder().addComponents(betAmountInput);
    const row3 = new ActionRowBuilder().addComponents(serverInput);

    modal.addComponents(row1, row2, row3);

    // Открываем модальное окно
    await interaction.showModal(modal);
}
