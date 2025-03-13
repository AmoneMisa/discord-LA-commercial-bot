import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent} from "../../utils.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

const serversMap = {
    "kratos": ['kratos', 'Кратос'],
    "alderan": ['alderan', 'Альдеран'],
}

export default async function (interaction, pool) {
    const userId = interaction.user.id;
    const [, , nickname, betAmount, target] = interaction.customId.split("_");
    const server = interaction.values[0];
    const event = await getActiveEvent(pool);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.update({
        content: i18n.t("info.betProcessing", {
            lng: lang,
            betAmount,
            nickname,
            server: lang === 'ru' ? serversMap[server][1] : serversMap[server][0],
            target
        }),
        components: [],
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    if (settings.rowCount === 0 || !settings.rows[0].value) {
        return await interaction.reply({
            content: i18n.t("errors.betChannelDoesntSetup", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    const channelId = settings.rows[0].value;

    if (channelId) {
        let adminChannel;
        try {
            adminChannel = await interaction.guild.channels.fetch(channelId);
        } catch (error) {
            console.error(i18n.t("errors.betChannelDoesntExist", { channelId }), error);
            return interaction.reply({
                content: i18n.t("errors.betChannelDoesntExist", { lng: lang }),
                flags: MessageFlags.Ephemeral
            });
        }

        await adminChannel.send({
            content: i18n.t("info.betRequestAdminInfo", {
                    lng: lang,
                    eventId: event.id,
                    userId,
                    nickname,
                    server: lang === 'ru' ? serversMap[server][1] : serversMap[server][0],
                    betAmount,
                    target
                }),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(i18n.t("buttons.accept", { lng: lang })).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(i18n.t("buttons.reject", { lng: lang })).setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}