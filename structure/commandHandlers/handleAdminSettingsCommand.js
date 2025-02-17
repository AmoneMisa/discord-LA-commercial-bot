import {ButtonStyle, MessageFlags} from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

import subcommands from './adminCommands/index.js';
import {toCamelCase} from "../utils.js";

export default async function (interaction, pool, guild) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommands[toCamelCase(subcommand)]) {
        await subcommands[toCamelCase(subcommand)](interaction, pool, guild);
    } else {
        await interaction.reply({ content: '❌ Неизвестная команда.', flags: MessageFlags.Ephemeral });
    }
}
