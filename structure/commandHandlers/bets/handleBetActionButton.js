import updateBetTable from "./updateBetTable.js";
import {getCurrentUserOdd, getUserLanguage, updateUsersOdds} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getActiveEvent, reply} from "../../utils.js";

export default async function (interaction, pool) {
    const [, action, userId, eventId, amount, target, server, nickname, isUpdate] = interaction.customId.split("_");
    if (!["accept", "reject"].includes(action)) {
        return;
    }

    const lang = await getUserLanguage(interaction.user.id, pool);

    const event = await getActiveEvent(pool);
    if (!event) {
        await reply(interaction, i18n.t("errors.noBetEventExist", {lng: lang}), null, true);
        return;
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) {
        await reply(interaction, i18n.t("errors.incorrectMember", {lng: lang}), null, true);
        return;
    }

    await interaction.deferUpdate();
    if (action === "accept") {
        if (isUpdate) {
            const betResult = await pool.query("SELECT amount FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);
            if (betResult.rows[0].amount === parseInt(amount)) {
                await interaction.reply({
                    content: i18n.t("errors.betAlreadyAccepted", {lng: lang}),
                    flags: MessageFlags.Ephemeral
                });

                await updateBetTable(interaction, pool, 1);
                return;
            }

            await pool.query("UPDATE bets SET amount = $1, odds = $2 WHERE user_id = $3", [amount, await getCurrentUserOdd(pool, eventId, userId, target), userId]);
        } else {
            const betResult = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

            if (betResult.rowCount > 0) {
                await reply(interaction, i18n.t("errors.betAlreadyAccepted", {lng: lang}), null, true);

                await updateBetTable(interaction, pool, 1);
                return;
            }

            let translatedServer = server === "alderan" ? "Альдеран" : "Кратос";
            await pool.query(`INSERT INTO bets (event_id, user_id, nickname, amount, server, target, odds)
                              VALUES ($1, $2, $3, $4, LOWER($5), $6, $7)`,
                [eventId, userId, nickname, amount, translatedServer.toLowerCase(), target, await getCurrentUserOdd(pool, eventId, target)]);
        }
        await updateUsersOdds(pool, eventId);
        await updateBetTable(interaction, pool, 1);
        await interaction.editReply({
            content: i18n.t("info.betAccepted", {
                lng: lang,
                eventId,
                userId,
                nickname,
                amount,
                server,
                target,
            }),
            components: [],
            flags: MessageFlags.Ephemeral
        });
        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: i18n.t("info.betAcceptedUser", {
                lng: lang,
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });

        return;
    }

    if (action === "reject") {
        await interaction.editReply({
            content: i18n.t("info.betRejected", {
                lng: lang,
                eventId,
                userId,
                nickname,
                amount,
                server,
                target,
            }),
            components: [],
            flags: MessageFlags.Ephemeral
        });

        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: i18n.t("info.betRejectedUser", {
                lng: lang,
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });
    }
}
