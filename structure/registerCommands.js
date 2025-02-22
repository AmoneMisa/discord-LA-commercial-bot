import {REST, Routes} from "discord.js";
import commands from "./commands/index.js";

/**
 * Registers or updates bot commands for the specified guild using the Discord API.
 * This function utilizes the provided bot token and client/guild IDs from environment variables,
 * and updates the commands based on the current configuration.
 *
 * @async
 * @return {Promise<void>} Resolves when the commands are successfully registered or updated,
 * or logs an error if the operation fails.
 */
export default async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Обновление (регистрация) команд...');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands.map(cmd => {
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