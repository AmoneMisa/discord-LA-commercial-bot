import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const target = interaction.options.getUser('target');
    const targetId = target.id;
    const userId = interaction.user.id;

    const result = await pool.query(
        `SELECT type, role
         FROM whitelist_blacklist
         WHERE user_id = $1
           AND target_id = $2`,
        [userId, targetId]
    );

    if (result.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "info.notInList", {
                username: target.username
            }),
            flags: MessageFlags.Ephemeral
        });
    }

    const {type, role} = result.rows[0];

    const typeLabel = await translatedMessage(interaction, `lists.${type}`);
    const roleLabel = await translatedMessage(interaction, `roles.${role}`);

    return interaction.reply({
        content: await translatedMessage(interaction, "info.inList", {
            username: target.username,
            type: typeLabel,
            role: roleLabel
        }),
        flags: MessageFlags.Ephemeral
    });
}