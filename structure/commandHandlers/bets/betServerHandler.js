import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getActiveEvent, translatedMessage} from "../../utils.js";
import {getUserLanguage} from "../../dbUtils.js";

const serversMap = {
    "kratos": ['kratos', 'Кратос'],
    "alderan": ['alderan', 'Альдеран'],
}

export default async function (interaction) {
    const userId = interaction.user.id;
    const [, , nickname, betAmount, target] = interaction.customId.split("_");
    const server = interaction.values[0];
    const event = await getActiveEvent();

    if (!event) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.noBetEventExist"),
            flags: MessageFlags.Ephemeral
        });
    }

    const lang = await getUserLanguage(userId);

    await interaction.update({
        content: await translatedMessage(interaction, "info.betProcessing", {
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
            content: await translatedMessage(interaction, "errors.betChannelDoesntSetup"),
            flags: MessageFlags.Ephemeral
        });
    }

    const channelId = settings.rows[0].value;

    if (channelId) {
        let adminChannel;
        try {
            adminChannel = await interaction.guild.channels.fetch(channelId);
        } catch (error) {
            console.error(await translatedMessage(interaction, "errors.betChannelDoesntExist", {channelId}), error);
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.betChannelDoesntExist"),
                flags: MessageFlags.Ephemeral
            });
        }

        await adminChannel.send({
            content: await translatedMessage(interaction, "info.betRequestAdminInfo", {
                eventId: event.id,
                userId,
                nickname,
                server: lang === 'ru' ? serversMap[server][1] : serversMap[server][0],
                betAmount,
                target
            }),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bet_accept_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(await translatedMessage(interaction, "buttons.accept")).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`bet_reject_${userId}_${event.id}_${betAmount}_${target}_${server}_${nickname}`).setLabel(await translatedMessage(interaction, "buttons.reject")).setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        throw new Error(`Не найден канал с таким id: ${channelId}`);
    }
}