import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent} from "../../utils.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const userId = interaction.user.id;
    const [, , nickname, betAmount, server] = interaction.customId.split("_");
    const target = interaction.values[0];
    const event = await getActiveEvent(pool);

    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", { lng: await getUserLanguage(interaction.user.id, pool) }),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.update({
        content: i18n.t("info.betProcessing", {
            lng: await getUserLanguage(interaction.user.id, pool),
            betAmount,
            nickname,
            server,
            target
        }),
        components: [],
        flags: MessageFlags.Ephemeral
    });

    const settings = await pool.query("SELECT * FROM settings WHERE key = 'bet_info_private_channel_id'");
    if (settings.rowCount === 0 || !settings.rows[0].value) {
        return await interaction.reply({
            content: i18n.t("errors.betChannelDoesntSetup", { lng: await getUserLanguage(interaction.user.id, pool) }),
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
                content: i18n.t("errors.betChannelDoesntExist", { lng: await getUserLanguage(interaction.user.id, pool) }),
                flags: MessageFlags.Ephemeral
            });
        }

        await adminChannel.send({
            content: i18n.t("info.betRequestAdminInfo", {
                    lng: await getUserLanguage(interaction.user.id, pool),
                    eventId: event.id,
                    userId,
                    nickname,
                    server,
                    betAmount,
                    target
                }),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(i18n.t("buttons.accept", { lng: await getUserLanguage(interaction.user.id, pool) })).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(i18n.t("buttons.reject", { lng: await getUserLanguage(interaction.user.id, pool) })).setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}