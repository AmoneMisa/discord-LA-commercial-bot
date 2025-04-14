import updateBetTable from "./updateBetTable.js";
import {getCurrentUserOdd, updateUsersOdds} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";
import {getActiveEvent, translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const [, action, userId, eventId, amount, target, server, nickname, isUpdate] = interaction.customId.split("_");
    if (!["accept", "reject"].includes(action)) {
        return;
    }

    const event = await getActiveEvent();
    if (!event) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.noBetEventExist"),
            flags: MessageFlags.Ephemeral
        });
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.incorrectMember"),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferUpdate();
    if (action === "accept") {
        if (isUpdate) {
            const betResult = await pool.query("SELECT amount FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);
            if (betResult.rows[0].amount === parseInt(amount)) {
                await interaction.reply({
                    content: await translatedMessage(interaction, "errors.betAlreadyAccepted"),
                    flags: MessageFlags.Ephemeral
                });

                await updateBetTable(interaction, 1);

                return;
            }

            await pool.query("UPDATE bets SET amount = $1, odds = $2 WHERE user_id = $3", [amount, await getCurrentUserOdd(eventId, userId, target), userId]);
        } else {
            const betResult = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

            if (betResult.rowCount > 0) {
                await interaction.reply({
                    content: await translatedMessage(interaction, "errors.betAlreadyAccepted"),
                    flags: MessageFlags.Ephemeral
                });
                await updateBetTable(interaction, 1);
                return;
            }

            let translatedServer = server === "alderan" ? "Альдеран" : "Кратос";
            await pool.query(`INSERT INTO bets (event_id, user_id, nickname, amount, server, target, odds)
                              VALUES ($1, $2, $3, $4, LOWER($5), $6, $7)`,
                [eventId, userId, nickname, amount, translatedServer.toLowerCase(), target, await getCurrentUserOdd(eventId, userId, target)]);
        }


        await updateUsersOdds(eventId);
        await updateBetTable(interaction, 1);
        await interaction.editReply({
            content: await translatedMessage(interaction, "info.betAccepted", {
                eventId,
                userId,
                nickname,
                amount,
                server,
                target
            }),
            components: [],
            flags: MessageFlags.Ephemeral
        });

        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: await translatedMessage(interaction, "info.betAcceptedUser", {
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });

        return;
    }

    if (action === "reject") {
        await interaction.editReply({
            content: await translatedMessage(interaction, "info.betRejected", {
                eventId,
                userId,
                nickname,
                amount,
                server,
                target
            }),
            components: [],
            flags: MessageFlags.Ephemeral
        });

        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: await translatedMessage(interaction, "info.betRejectedUser", {
                target,
                amount
            }),
            flags: MessageFlags.Ephemeral
        });
    }
}
