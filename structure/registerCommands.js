import {REST, Routes} from "discord.js";
import contextMenuCommands from "./contextMenuCommands.js";
import getCommands from "./commands/index.js";

/**
 * Registers and updates application commands (slash commands and context menu commands) for the Discord bot.
 *
 * @return {Promise<void>} A promise that resolves when the commands are successfully registered or updated, or rejects with an error if the process fails.
 */
export default async function registerCommands() {
    const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);

    console.log('Обновление (регистрация) команд...');
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: [...getCommands(), ...contextMenuCommands].map(cmd => {
            try {
                return cmd.toJSON();
            } catch (e) {
                console.log(cmd.options);
                throw e;
            }
        })
    });
    console.log('Команды успешно обновлены!');
}