import adminRankCommands from "./adminRankCommands.js";
import adminSettingsCommands from "./adminSettingsCommands.js";
import adminBetsCommands from "./adminBetsCommands.js";
import userRanksCommands from "./userRanksCommands.js";
import {getModulesSettings} from "../dbUtils.js";
import userBetsCommands from "./userBetsCommands.js";

/***
 ('ranks', 'Система рейтинга', true),
 ('fastResponses', 'Кнопки быстрой связи с продавцом в канале для продаж', false),
 ('factions', 'Система фракций и борьбы за активность', false),
 ('bets', 'Система ставок', false),
 ('subscriptions', 'Система подписок', false),
 ('profiles', 'Система профилей', false),
 ('randomGames', 'Рандомайзер', false),
 ('registration', 'Система регистрации на ивенты', false),
 ('achievements', 'Система достижений', false),
 ('codex', 'Кодекс - система знаний', false)`);
 ***/

export default async function getCommands(pool) {
    let commandsArray = [...adminSettingsCommands];
    const settings = await getModulesSettings(pool);

    for (const module of settings.rows) {
        if (module.name === 'ranks') {
            commandsArray = [...commandsArray, ...adminRankCommands, ...userRanksCommands];
        }

        if (module.name === 'bets') {
            commandsArray = [...commandsArray, ...adminBetsCommands, ...userBetsCommands];
        }
    }

    return commandsArray;
}