import {ActionRowBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {getActiveEvent, translatedMessage} from "../../utils.js";
import {getUserLanguage} from "../../dbUtils.js";

const serversMap = {
    "kratos": ['kratos', 'Кратос'],
    "alderan": ['alderan', 'Альдеран'],
}

export default async function (interaction) {
    const [, , nickname, betAmount] = interaction.customId.split("_");
    const target = interaction.values[0];
    const event = await getActiveEvent();

    if (!event) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.noBetEventExist"),
            flags: MessageFlags.Ephemeral
        });
    }

    const lang = await getUserLanguage(interaction.user.id);
    const availableServers = Object.entries(serversMap).map(([serverKey, serverName]) => ({
        label: lang === 'ru' ? serverName[1] : serverName[0],
        value: serverKey
    }));

    const serverSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_server_${nickname}_${betAmount}_${target}`)
        .setPlaceholder(await translatedMessage(interaction, "buttons.chooseBetServer"))
        .addOptions(availableServers);

    const row = new ActionRowBuilder().addComponents(serverSelect);

    await interaction.update({
        content: await translatedMessage(interaction, "info.selectServer"),
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}