import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent, getMember, parseFormattedNumber} from "../../utils.js";
import errorsHandler from "../../../errorsHandler.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function updateBet(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    const event = await getActiveEvent(pool);
    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", { lng: await getUserLanguage(interaction.user.id, pool)}),
            flags: MessageFlags.Ephemeral
        });
    }

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (!member) {
        console.error("updateBet interaction isContextMenu, isMessageContentMenuCommand:", interaction, isContextMenu, isMessageContentMenuCommand);
        console.error("Пользователь не найден или не существует", member);
        await interaction.reply({content: i18n.t("errors.incorrectMember", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral});
        errorsHandler.error(`updateBet interaction isContextMenu, isMessageContentMenuCommand: ${interaction}\n${isContextMenu}\n${isMessageContentMenuCommand}`);
    }

    let amount;

    if (isContextMenu) {
        amount = parseFormattedNumber(interaction.fields.getTextInputValue("amount"));
    } else {
        amount = interaction.options.getInteger("amount");
    }

    if (isNaN(amount)) {
        await interaction.reply({content: i18n.t("errors.incorrectBetAmount", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral});
        console.error("Update bet Incorrect amount:", amount);
        return;
    }

    const bet = await pool.query(`SELECT *
                                  FROM bets
                                  WHERE event_id = $1
                                    AND user_id = $2`, [event.id, interaction.user.id]);
    if (!bet.rows.length) {
        await interaction.reply({
            content: i18n.t("errors.incorrectBetAmount", { lng: await getUserLanguage(interaction.user.id, pool)}),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (amount <= bet.rows[0].amount) {
        return await interaction.reply({
            content: i18n.t("errors.incorrectBetAmount", { lng: await getUserLanguage(interaction.user.id, pool)}),
            flags: MessageFlags.Ephemeral
        });
    }

    if (amount === bet.rows[0].amount) {
        return await interaction.reply({
            content: i18n.t("errors.incorrectBetAmount", { lng: await getUserLanguage(interaction.user.id, pool)}),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.reply({
        content: i18n.t("info.updateBetRequestUserInfo", { lng: await getUserLanguage(interaction.user.id, pool), amount, oldAmount: bet.rows[0].amount, newAmount: amount - bet.rows[0].amount}),
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (channelId) {
        const adminChannel = await interaction.guild.channels.fetch(channelId);

        await adminChannel.send({
            content: i18n.t("info.updateBetRequestAdminInfo", { lng: await getUserLanguage(interaction.user.id, pool), amount, eventId: event.id, nickname: bet.rows[0].nickname, server: bet.rows[0].server, target: bet.rows[0].target, memberId: member.id}),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${member.id}_${event.id}_${amount}_${bet.rows[0].target}_${bet.rows[0].server}_${bet.rows[0].nickname}_update`).setLabel(i18n.t("buttons.accept", { lng: await getUserLanguage(interaction.user.id, pool)})).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${member.id}_${event.id}_${amount}_${bet.rows[0].target}_${bet.rows[0].server}_${bet.rows[0].nickname}_update`).setLabel(i18n.t("buttons.reject", { lng: await getUserLanguage(interaction.user.id, pool)})).setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}