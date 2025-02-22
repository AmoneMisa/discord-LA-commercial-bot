import {getItemsList} from "../dbUtils.js";
import autocompleteAchievements from "../commandHandlers/achievements/autocompleteAchievements.js";

/**
 * Handles an interaction event by responding with data dynamically based on the subcommand provided in the interaction options.
 *
 * If the subcommand includes 'create', the function filters and provides an autocomplete response for items that match
 * the input text. If the subcommand includes 'give_user', 'give_role', or 'achievement_give_mentions', it triggers
 * the corresponding autocomplete logic for achievements.
 *
 * @async
 * @param {Object} interaction - The interaction object received from the Discord API.
 * @param {Object} interaction.options - Contains options related to the interaction.
 * @param {Function} interaction.options.getSubcommand - Retrieves the subcommand associated with the interaction.
 * @param {Function} interaction.options.getFocused - Returns the currently focused option in the autocomplete input.
 * @param {Function} interaction.respond - Sends a response back to complete the interaction.
 * @param {Object} pool - The database connection pool used to fetch data.
 */
export default async function (interaction, pool) {
    if (interaction.options.getSubcommand().includes('create')) {
        const focusedOption = interaction.options.getFocused(true);
        const items = await getItemsList(pool); // Получаем предметы из базы

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
    } else if (interaction.options.getSubcommand().includes('give_user') ||
        interaction.options.getSubcommand().includes('give_role')||
        interaction.options.getSubcommand().includes('achievement_give_mentions')) {
        await autocompleteAchievements(interaction, pool);
    }
}