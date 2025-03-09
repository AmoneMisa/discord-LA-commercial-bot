import adminRankCommands from "./adminRankCommands.js";
import adminSettingsCommands from "./adminSettingsCommands.js";
import adminBetsCommands from "./adminBetsCommands.js";
import userRanksCommands from "./userRanksCommands.js";
import userBetsCommands from "./userBetsCommands.js";
import userSettingsCommands from "./userSettingsCommands.js";

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

export default async function getCommands() {
    return [
        ...adminSettingsCommands,
        ...adminRankCommands,
        ...userRanksCommands,
        ...adminBetsCommands,
        ...userBetsCommands,
        ...userSettingsCommands
    ];
}