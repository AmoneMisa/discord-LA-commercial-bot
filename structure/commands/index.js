import adminRankCommands from "./adminRankCommands.js";
import adminSettingsCommands from "./adminSettingsCommands.js";
import adminBetsCommands from "./adminBetsCommands.js";
import userRanksCommands from "./userRanksCommands.js";
import userBetsCommands from "./userBetsCommands.js";
import userTradeCommands from "./userTradeCommands.js";
import userSubscriptionCommands from "./userSubscriptionCommands.js";
import adminSubscriptionCommands from "./adminSubscriptionCommands.js";
import userProfileCommands from "./userProfileCommands.js";
import adminRegistrationCommands from "./adminRegistrationCommands.js";
import adminAchievementsCommands from "./adminAchievementsCommands.js";
import adminCodexCommands from "./adminCodexCommands.js";
import userCodexCommands from "./userCodexCommands.js";
import {getModulesSettings} from "../dbUtils.js";

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

        if (module.name === 'trade') {
            commandsArray = [...commandsArray, ...userTradeCommands];
        }

        if (module.name === 'bets') {
            commandsArray = [...commandsArray, ...adminBetsCommands, ...userBetsCommands];
        }

        if (module.name === 'subscriptions') {
            commandsArray = [...commandsArray, ...userSubscriptionCommands, ...adminSubscriptionCommands];
        }

        if (module.name === 'profiles') {
            commandsArray = [...commandsArray, ...userProfileCommands];
        }

        if (module.name === 'registration') {
            commandsArray = [...commandsArray, ...adminRegistrationCommands];
        }

        if (module.name === 'achievements') {
            commandsArray = [...commandsArray, ...adminAchievementsCommands];
        }

        if (module.name === 'codex') {
            commandsArray = [...commandsArray, ...adminCodexCommands, ...userCodexCommands];
        }
    }

    return commandsArray;
}