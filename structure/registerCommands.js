import {REST, Routes} from "discord.js";
import commands from "./commands/index.js";
import contextMenuCommands from "./contextMenuCommands.js";

/**
 * Registers and updates commands for the bot in the specified guild.
 * This function uses the Discord REST API to push the commands defined
 * in the `commands` and `contextMenuCommands` collections to the Discord server.
 *
 * @return {Promise<void>} A promise that resolves when the commands have been successfully registered
 * or rejects with an error if the update fails.
 */
export default async function registerCommands() {
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