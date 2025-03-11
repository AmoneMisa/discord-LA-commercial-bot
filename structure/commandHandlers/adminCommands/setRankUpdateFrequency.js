import { MessageFlags } from 'discord.js';
import {scheduleRankUpdates} from "../../cron/scheduleUpdates.js";
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Updates the rank update frequency setting for the application and schedules rank updates accordingly.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves once the operation is completed.
 */
export default async function setRankUpdateFrequency(interaction, pool) {
    const frequency = interaction.options.getString('frequency');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'rank_update_frequency\'', [frequency]);

    await scheduleRankUpdates(frequency, pool, interaction.guild);

    await interaction.reply({
        content: i18n.t("info.roleUpdateFrequencySet", {
            frequency,
            lng: await getUserLanguage(interaction.user.id, pool)
        }),
        flags: MessageFlags.Ephemeral
    });
}
