import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {getActiveEvent} from "../../utils.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

const serversMap = {
    "kratos": ['kratos', 'Кратос'],
    "alderan": ['alderan', 'Альдеран'],
}

export default async function (interaction, pool) {
    const [, , nickname, betAmount] = interaction.customId.split("_");
    const target = interaction.values[0];
    const event = await getActiveEvent(pool);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", {lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const availableServers = Object.entries(serversMap).map(([serverKey, serverName]) => ({
        label: lang === 'ru' ? serverName[1] : serverName[0],
        value: serverKey
    }));

    const serverSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_server_${nickname}_${betAmount}_${target}`)
        .setPlaceholder(i18n.t("buttons.chooseBetServer", {lng: lang}))
        .addOptions(availableServers);

    const row = new ActionRowBuilder().addComponents(serverSelect);

    await interaction.update({
        content: i18n.t("info.selectServer", {lng: lang}),
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}