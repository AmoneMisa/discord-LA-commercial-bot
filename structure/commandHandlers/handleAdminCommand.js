import {ButtonStyle, MessageFlags} from "discord.js";
import subcommands from './adminCommands/index.js';
import {toCamelCase} from "../utils.js";

/**
 * Handles an interaction by executing the appropriate subcommand or returning an error if the subcommand is invalid or the user lacks necessary permissions.
 *
 * @param {Object} interaction - The interaction object containing user inputs and metadata.
 * @param {Object} pool - The database connection pool for executing database queries.
 * @param {Object} guild - The guild object representing the server where the interaction occurred.
 * @returns {Promise<void>} Resolves after processing the interaction and sending a reply.
 */
export default async function (interaction, pool, guild) {
    const subcommand = interaction.options.getSubcommand();
    if (!interaction.member.permissions.has('Administrator')) {
        return await interaction.reply({
            content: '🚫 У вас нет прав администратора для выполнения этой команды.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (subcommands[toCamelCase(subcommand)]) {
        await subcommands[toCamelCase(subcommand)](interaction, pool, guild);
    } else {
        await interaction.reply({ content: '❌ Неизвестная команда.', flags: MessageFlags.Ephemeral });
    }
}
