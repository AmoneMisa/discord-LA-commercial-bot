import getBetTableMessage from "./getBetTableMessage.js";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";
import {formatDateToCustomString, getActiveEvent, reply} from "../../utils.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool) {
    const [_, page] = interaction.customId.split("_");
    const lang = await getUserLanguage(interaction.user.id, pool);
    const event = await getActiveEvent(pool);

    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", { lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const bets = await pool.query("SELECT user_id, target, amount, odds FROM bets WHERE event_id = $1 ORDER BY amount DESC", [event.id]);
    if (bets.rowCount === 0) {
        await interaction.reply({
            content:i18n.t("info.noBets", {
                lng: lang,
                eventName: event.rows[0].name,
                startTime: formatDateToCustomString(event.rows[0].start_time),
                endTime: formatDateToCustomString(event.rows[0].end_time)
            }),
            flags: MessageFlags.Ephemeral
        });
        return ;
    }

    const perPage = 10;
    const totalPages = Math.ceil(bets.rowCount / perPage);

    const row = new ActionRowBuilder();
    if (page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page - 1}`)
                .setLabel(i18n.t("buttons.back", {
                    lng: lang
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (page < totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`bet_page_${page + 1}`)
                .setLabel(i18n.t("buttons.next", {
                    lng: lang
                }))
                .setStyle(ButtonStyle.Primary)
        );
    }

    await reply(interaction, getBetTableMessage(parseInt(page), bets, lang, event), [row], true);
}