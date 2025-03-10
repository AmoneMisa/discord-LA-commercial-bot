import { MessageFlags } from 'discord.js';
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Toggles the cooldown state for voting in the database and sends a response to the interaction.
 *
 * @param {Object} interaction - The interaction object containing user input data.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the cooldown state is updated and the reply is sent.
 */
export default async function toggleCooldown(interaction, pool) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_enabled\'', [enabled]);

    await interaction.reply({
        content: i18n.t("info.votingCooldown", {
            lng: await getUserLanguage(interaction.user.id, pool),
            status: enabled ? i18n.t("common.enabled", { lng: await getUserLanguage(interaction.user.id, pool) }) : i18n.t("common.disabled", { lng: await getUserLanguage(interaction.user.id, pool) })
        }),
        flags: MessageFlags.Ephemeral
    });
}
