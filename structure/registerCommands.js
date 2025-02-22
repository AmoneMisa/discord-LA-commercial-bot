import {REST, Routes} from "discord.js";
import commands from "./commands/index.js";

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