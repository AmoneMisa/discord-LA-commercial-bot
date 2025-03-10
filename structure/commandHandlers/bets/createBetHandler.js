import {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags} from "discord.js";
import {getActiveEvent, getMember} from "../../utils.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    const event = await getActiveEvent(pool);
    if (!event) {
        return interaction.reply({ content: i18n.t("errors.noBetEventExist", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (!member) {
        console.error("createBet interaction isContextMenu, isMessageContentMenuCommand:", interaction, isContextMenu, isMessageContentMenuCommand);
        console.error("Пользователь не найден или не существует", member);
        return await interaction.reply({content: i18n.t("errors.incorrectMember", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral});
    }

    const betsResult = await pool.query(`SELECT * FROM bets WHERE event_id = $1 AND user_id = $2`, [event.id, member.id]);

    if (betsResult.rows.length) {
        await interaction.reply({content: i18n.t("errors.betAlreadyExist", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral});
        return ;
    }

    // Проверяем, настроен ли закрытый канал
    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0]?.value;

    if (!channelId) {
        return await interaction.reply({ content: i18n.t("errors.betChannelDoesntSetup", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel) {
        return await interaction.reply({ content: i18n.t("errors.betChannelDoesntExist", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    // Создание модального окна
    const modal = new ModalBuilder()
        .setCustomId("bet_modal")
        .setTitle(i18n.t("buttons.createBetTitle", { lng: await getUserLanguage(interaction.user.id, pool)}));

    const nicknameInput = new TextInputBuilder()
        .setCustomId("bet_nickname")
        .setLabel(i18n.t("buttons.createBetNicknameField", { lng: await getUserLanguage(interaction.user.id, pool)}))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const betAmountInput = new TextInputBuilder()
        .setCustomId("bet_amount")
        .setLabel(i18n.t("buttons.createBetAmountField", { lng: await getUserLanguage(interaction.user.id, pool)}))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const serverInput = new TextInputBuilder()
        .setCustomId("bet_server")
        .setLabel(i18n.t("buttons.createBetServerField", { lng: await getUserLanguage(interaction.user.id, pool)}))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(nicknameInput);
    const row2 = new ActionRowBuilder().addComponents(betAmountInput);
    const row3 = new ActionRowBuilder().addComponents(serverInput);

    modal.addComponents(row1, row2, row3);

    // Открываем модальное окно
    await interaction.showModal(modal);
}
