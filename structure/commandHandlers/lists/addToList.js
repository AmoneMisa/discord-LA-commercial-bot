import {MessageFlags} from "discord.js";
import {getMember, translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const target = getMember(interaction, false, false, 'user');
    const listType = interaction.options.getString('type'); // whitelist или blacklist
    const role = interaction.options.getString('role'); // driver или buyer
    const userId = interaction.user.id;
    const targetId = target.id;

    if (userId === targetId) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.cannotSelfAssign"),
            flags: MessageFlags.Ephemeral
        });
    }

    const existing = await pool.query(
        `SELECT *
         FROM whitelist_blacklist
         WHERE user_id = $1
           AND target_id = $2`,
        [userId, targetId]
    );

    const typeLabel = await translatedMessage(interaction, `lists.${listType}`);
    const roleLabel = await translatedMessage(interaction, `roles.${role}`);

    if (existing.rows.length > 0) {
        if (existing.rows[0].type === listType) {
            return interaction.reply({
                content: await translatedMessage(interaction, "errors.alreadyInList", {type: typeLabel}),
                flags: MessageFlags.Ephemeral
            });
        } else {
            await pool.query(
                `UPDATE whitelist_blacklist
                 SET type = $1,
                     role = $2,
                     created_at = NOW()
                 WHERE user_id = $3
                   AND target_id = $4`,
                [listType, role, userId, targetId]
            );
            return interaction.reply({
                content: await translatedMessage(interaction, "info.movedToList", {
                    type: typeLabel,
                    role: roleLabel
                }),
                flags: MessageFlags.Ephemeral
            });
        }
    }

    await pool.query(
        `INSERT INTO whitelist_blacklist (user_id, target_id, type, role)
         VALUES ($1, $2, $3, $4)`,
        [userId, targetId, listType, role]
    );

    return interaction.reply({
        content: await translatedMessage(interaction, "info.addedToList", {
            username: target.username,
            type: typeLabel,
            role: roleLabel
        }),
        flags: MessageFlags.Ephemeral
    });
}