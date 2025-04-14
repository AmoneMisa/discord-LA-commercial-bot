import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export async function removeFromList(interaction) {
    const target = interaction.options.getUser('target');
    const userId = interaction.user.id;
    const targetId = target.id;

    const result = await pool.query(
        `DELETE
         FROM whitelist_blacklist
         WHERE user_id = $1
           AND target_id = $2
         RETURNING *`,
        [userId, targetId]
    );

    if (result.rowCount === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.notInList", {
                username: target.username
            }),
            flags: MessageFlags.Ephemeral
        });
    }

    return interaction.reply({
        content: await translatedMessage(interaction, "info.removedFromList", {
            username: target.username
        }),
        flags: MessageFlags.Ephemeral
    });
}