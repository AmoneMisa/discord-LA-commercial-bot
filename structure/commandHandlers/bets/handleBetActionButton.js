import updateBetTable from "./updateBetTable.js";
import {getCurrentUserOdd, updateUsersOdds} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool) {
    const [, action, userId, eventId, amount, target, server, nickname, isUpdate] = interaction.customId.split("_");
    if (!["accept", "reject"].includes(action)) {
        return;
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) {
        return interaction.reply({content: i18n.t("errors.incorrectMember", { lng: interaction.client.language[interaction.user.id]}), flags: MessageFlags.Ephemeral});
    }

    if (action === "accept") {
        if (isUpdate) {
            const betResult = await pool.query("SELECT amount FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);
            if (betResult.rows[0].amount === parseInt(amount)) {
                await interaction.reply({
                    content: i18n.t("errors.betAlreadyAccepted", { lng: interaction.client.language[interaction.user.id] }),
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            await pool.query("UPDATE bets SET amount = $1, odds = $2 WHERE user_id = $3", [amount, await getCurrentUserOdd(pool, eventId, userId, target), userId]);
        } else {
            const betResult = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

            if (betResult.rowCount > 0) {
                return await interaction.reply({
                    content: i18n.t("errors.betAlreadyAccepted", { lng: interaction.client.language[interaction.user.id] }),
                    flags: MessageFlags.Ephemeral
                });
            }

            await pool.query(`INSERT INTO bets (event_id, user_id, nickname, amount, server, target, odds) VALUES ($1, $2, $3, $4, LOWER($5), $6, $7)`,
                [eventId, userId, nickname, amount, server.toLowerCase(), target, await getCurrentUserOdd(pool, eventId, target)]);
        }
        await updateUsersOdds(pool, eventId);
        await updateBetTable(interaction, pool, 1);
        await interaction.reply({
            content: i18n.t("info.betAccepted", { lng: interaction.client.language[interaction.user.id] }),
            flags: MessageFlags.Ephemeral
        });
        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: i18n.t("info.betAcceptedUser", {
                lng: interaction.client.language[userId],
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });

        return;
    }

    if (action === "reject") {
        await interaction.reply({
            content: i18n.t("info.betRejected", { lng: interaction.client.language[interaction.user.id] }),
            flags: MessageFlags.Ephemeral
        });

        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: i18n.t("info.betRejectedUser", {
                lng: interaction.client.language[userId],
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });
    }
}
