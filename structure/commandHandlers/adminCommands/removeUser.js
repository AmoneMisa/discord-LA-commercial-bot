import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Asynchronously removes a user from the database and sends a confirmation reply.
 *
 * @param {Object} interaction - The interaction object containing user information and reply method.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the user is successfully removed and a reply is sent.
 */
export default async function removeUser(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM users WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: i18n.t("info.userRegistrationDeleted", { username: user.username, lng: await getUserLanguage(interaction.user.id, pool)}),
        flags: MessageFlags.Ephemeral
    });
}
