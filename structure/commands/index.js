import adminAchievementsCommands from "./adminAchievementsCommands.js";
import adminRankCommands from "./adminRankCommands.js";
import adminSettingsCommands from "./adminSettingsCommands.js";
import adminSubscriptionCommands from "./adminSubscriptionCommands.js";
import userProfileCommands from "./userProfileCommands.js";
import userSubscriptionCommands from "./userSubscriptionCommands.js";
import adminCodexCommands from "./adminCodexCommands.js";
import adminBetsCommands from "./adminBetsCommands.js";
import adminRegistrationCommands from "./adminRegistrationCommands.js";
import userRanksCommands from "./userRanksCommands.js";
import userTradeCommands from "./userTradeCommands.js";
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
            commandsArray.push([...adminRankCommands, ...userRanksCommands]);
        }

        if (module.name === 'trade') {
            commandsArray.push([...userTradeCommands]);
        }

        if (module.name === 'bets') {
            commandsArray.push([...adminBetsCommands]);
        }

        if (module.name === 'subscriptions') {
            commandsArray.push([...userSubscriptionCommands, ...adminSubscriptionCommands]);
        }

        if (module.name === 'profiles') {
            commandsArray.push([...userProfileCommands]);
        }

        if (module.name === 'registration') {
            commandsArray.push([...adminRegistrationCommands]);
        }

        if (module.name === 'achievements') {
            commandsArray.push([...adminAchievementsCommands]);
        }

        if (module.name === 'codex') {
            commandsArray.push([...adminCodexCommands, ...userCodexCommands]);
        }
    }

    return commandsArray;
}