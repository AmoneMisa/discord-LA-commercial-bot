import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Unblocks a user's subscription by removing their entries from the blocked subscriptions tables.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @return {Promise<void>} Resolves when the user's subscription is successfully unblocked and the reply is sent.
 */
export default async function unblockSubscription(interaction) {
    const userId = interaction.options.getUser('user').id;

    await pool.query('DELETE FROM blocked_subscriptions WHERE user_id = $1', [userId]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.userCanSubscribe"),
        flags: MessageFlags.Ephemeral
    });
}