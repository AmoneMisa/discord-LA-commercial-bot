import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Asynchronously removes a user from the database and sends a confirmation reply.
 *
 * @param {Object} interaction - The interaction object containing user information and reply method.
 * @return {Promise<void>} A promise that resolves when the user is successfully removed and a reply is sent.
 */
export default async function removeUser(interaction) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM users WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.userRegistrationDeleted"),
        flags: MessageFlags.Ephemeral
    });
}
