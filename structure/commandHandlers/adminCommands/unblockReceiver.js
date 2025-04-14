import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Unblocks a user, allowing them to receive feedback again.
 *
 * @param {Object} interaction - The interaction object containing user information and methods to handle replies.
 * @return {Promise<void>} Resolves when the user is successfully unblocked and a reply is sent.
 */
export default async function unblockReceiver(interaction) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM blocked_receivers WHERE user_id = $1', [user.id]);
    await interaction.reply({
        content: await translatedMessage(interaction, "info.userCanReceiveReviews", {username: user.username})
        ,
        flags: MessageFlags.Ephemeral
    });
}
