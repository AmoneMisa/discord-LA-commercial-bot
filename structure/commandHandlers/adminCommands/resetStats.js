import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Resets user statistics by truncating the relevant database table and restarting identity sequence.
 * Sends a confirmation reply to the interaction.
 *
 * @param {Object} interaction - The interaction object used to send a reply.
 * @param {Object} pool - The database connection pool.
 * @return {Promise<void>} A promise that resolves once the operation is completed.
 */
export default async function resetStats(interaction, pool) {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

    await interaction.reply({
        content: i18n.t("info.resetStats", { lng: await getUserLanguage(interaction.user.id, pool)}),
        flags: MessageFlags.Ephemeral
    });
}
