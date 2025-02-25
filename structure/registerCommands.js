import {REST, Routes} from "discord.js";
import commands from "./commands/index.js";
import contextMenuCommands from "./contextMenuCommands.js";

/**
 * Registers and updates application commands (slash commands and context menu commands) for the Discord bot.
 *
 * @param {Object} pool - A database connection pool or a similar resource manager, not explicitly used in the current implementation.
 * @return {Promise<void>} A promise that resolves when the commands are successfully registered or updated, or rejects with an error if the process fails.
 */
export default async function registerCommands(pool) {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {
        console.log('Обновление (регистрация) команд...');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [...commands, ...contextMenuCommands].map(cmd => {
            try {
                return cmd.toJSON();
            } catch (e) {
                console.log(cmd.options);
                throw e;
            }
            }) });
        console.log('Команды успешно обновлены!');
    } catch (error) {
        console.error('Ошибка при обновлении команд:', error);
    }
}