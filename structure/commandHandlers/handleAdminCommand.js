import {ButtonStyle, MessageFlags} from "discord.js";

import subcommands from './adminCommands/index.js';
import {toCamelCase} from "../utils.js";

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
