import {ActionRowBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {getActiveEvent, getMember, translatedMessage} from "../../utils.js";

export default async function (interaction, isContextMenu = false, isMessageContentMenuCommand = false) {
    const event = await getActiveEvent();

    if (!event) {
        return interaction.reply({ content: await translatedMessage(interaction, "errors.noBetEventExist"), flags: MessageFlags.Ephemeral });
    }

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (!member) {
        console.error("createBet interaction isContextMenu, isMessageContentMenuCommand:", interaction, isContextMenu, isMessageContentMenuCommand);
        console.error("Пользователь не найден или не существует", member);
        return await interaction.reply({content: await translatedMessage(interaction, "errors.incorrectMember"), flags: MessageFlags.Ephemeral});
    }

    const betsResult = await pool.query(`SELECT * FROM bets WHERE event_id = $1 AND user_id = $2`, [event.id, member.id]);

    if (betsResult.rows.length) {
        await interaction.reply({content: await translatedMessage(interaction, "errors.betAlreadyExist"), flags: MessageFlags.Ephemeral});
        return ;
    }

    // Проверяем, настроен ли закрытый канал
    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0]?.value;

    if (!channelId) {
        return await interaction.reply({ content: await translatedMessage(interaction, "errors.betChannelDoesntSetup"), flags: MessageFlags.Ephemeral });
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel) {
        return await interaction.reply({ content: await translatedMessage(interaction, "errors.betChannelDoesntExist"), flags: MessageFlags.Ephemeral });
    }

    // Создание модального окна
    const modal = new ModalBuilder()
        .setCustomId("bet_modal")
        .setTitle(await translatedMessage(interaction, "buttons.createBetTitle"));

    const nicknameInput = new TextInputBuilder()
        .setCustomId("bet_nickname")
        .setLabel(await translatedMessage(interaction, "buttons.createBetNicknameField"))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const betAmountInput = new TextInputBuilder()
        .setCustomId("bet_amount")
        .setLabel(await translatedMessage(interaction, "buttons.createBetAmountField"))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(nicknameInput);
    const row2 = new ActionRowBuilder().addComponents(betAmountInput);

    modal.addComponents(row1, row2);

    // Открываем модальное окно
    await interaction.showModal(modal);
}
