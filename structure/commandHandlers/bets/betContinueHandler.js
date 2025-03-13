import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {parseFormattedNumber} from "../../utils.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const nickname = interaction.fields.getTextInputValue("bet_nickname");
    const betAmount = parseFormattedNumber(interaction.fields.getTextInputValue("bet_amount"));

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (isNaN(betAmount)) {
        await interaction.reply({content: i18n.t("errors.incorrectBetAmount", { lng: lang }), flags: MessageFlags.Ephemeral});
        console.error("Update bet Incorrect amount:", betAmount );
        return ;
    }

    if (betAmount < 200) {
        return await interaction.reply({ content: i18n.t("errors.betAmountTooLow", { lng: lang }), flags: MessageFlags.Ephemeral });
    }

    const result = await pool.query("SELECT * FROM bet_events");
    const activeEvent = result.rows.find(_event => _event.end_time > new Date().getTime());

    if (!JSON.parse(activeEvent.participants).length) {
        await interaction.reply({ content: i18n.t("errors.noBetParticipants", { lng: lang }), flags: MessageFlags.Ephemeral });
        throw new Error("⚠ Ошибка: Не указаны участники для ставки");
    }

    const availableTargets = JSON.parse(activeEvent.participants).map(nick => ({
        label: nick,
        value: nick
    }));

    const targetSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_target_${nickname}_${betAmount}`)
        .setPlaceholder(i18n.t("buttons.chooseBetTarget", { lng: lang }))
        .addOptions(availableTargets);

    const row = new ActionRowBuilder().addComponents(targetSelect);

    await interaction.reply({
        content: i18n.t("info.selectTarget", { targets: JSON.parse(activeEvent.participants).join(", "), lng: lang }),
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}