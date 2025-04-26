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
import userSettingsCommands from "./userSettingsCommands.js";
import adminMarketCommands from "./adminMarketCommands.js";
import dotenv from 'dotenv';
import userRandomCommands from "./userRandomCommands.js";
import userMarketCommands from "./userMarketCommands.js";
import userListsCommands from "./userListsCommands.js";
dotenv.config();
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

export default function getCommands() {
    let commandsArray = [...adminSettingsCommands, ...userSettingsCommands];

        if (process.env.RANKS_MODULE) {
            commandsArray = [...commandsArray, ...adminRankCommands, ...userRanksCommands];
        }

        if (process.env.TRADE_MODULE) {
            commandsArray = [...commandsArray, ...userTradeCommands];
        }

        if (process.env.BET_MODULE) {
            commandsArray = [...commandsArray, ...adminBetsCommands, ...userBetsCommands];
        }

        if (process.env.SUBSCRIPTION_MODULE) {
            commandsArray = [...commandsArray, ...userSubscriptionCommands, ...adminSubscriptionCommands];
        }

        if (process.env.PROFILES_MODULE) {
            commandsArray = [...commandsArray, ...userProfileCommands];
        }

        if (process.env.REGISTRATION_MODULE) {
            commandsArray = [...commandsArray, ...adminRegistrationCommands];
        }

        if (process.env.ACHIEVEMENTS_MODULE) {
            commandsArray = [...commandsArray, ...adminAchievementsCommands];
        }

        if (process.env.CODEX_MODULE) {
            commandsArray = [...commandsArray, ...adminCodexCommands, ...userCodexCommands];
        }

        if (process.env.RANDOM_GAMES_MODULE) {
            commandsArray = [...commandsArray, ...userRandomCommands];
        }

        if (process.env.MARKET_MODULE) {
            commandsArray = [...commandsArray, ...adminMarketCommands, ...userMarketCommands];
        }

        if (process.env.WHITE_BLACK_LIST_MODULE) {
            commandsArray = [...commandsArray, ...userListsCommands];
        }

    return commandsArray;
}