import {getItemsList} from "../dbUtils.js";
import autocompleteAchievements from "../commandHandlers/achievements/autocompleteAchievements.js";

/**
 * Handles interaction events for Discord commands related to `inventory` and achievements.
 *
 * This function processes command interactions from Discord, supporting autocompletion
 * for inventory-related commands and delegation to a separate handler for achievement-related
 * commands. When the command name includes 'inventory', it filters and formats a list of
 * items from the database for autocompletion suggestions. Commands matching `adm_achievement_`
 * or `achievement_` patterns are routed to a dedicated handler function for achievements.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object representing the user command from Discord.
 * @returns {Promise<void>} A promise that resolves when interaction responses are successfully processed.
 */
export default async function (interaction) {
    if (interaction.commandName.includes('inventory')) {
        const focusedOption = interaction.options.getFocused(true);
        const items = await getItemsList(); // Получаем предметы из базы

        /**
         * An array containing a filtered subset of items.
         *
         * This variable is the result of filtering the `items` array by checking if
         * each item's `label` property includes the `focusedOption.value`. Once the
         * filtering is complete, the array is truncated to include only the first 25
         * items.
         *
         * @type {Array}
         */
        const filtered = items
            .filter(item => item.label.includes(focusedOption.value))
            .slice(0, 25); // Discord ограничивает до 25 вариантов

        await interaction.respond(
            filtered.map(item => ({name: item.label, value: item.value.toString()}))
        );
    } else if (/^(adm_achievement_|achievement_)/.test(interaction.commandName)) {
        await autocompleteAchievements(interaction);
    }
}