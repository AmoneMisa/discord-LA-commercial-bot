import {ButtonStyle, MessageFlags} from "discord.js";
import subcommandsHandlers from './adminCommands/index.js';
import {translatedMessage} from "../utils.js";

const adminCommandMap = {
    // Достижения
    "adm_achievement_give_achievement_to_user": "giveAchievementToUser",
    "adm_achievement_give_achievement_to_role": "giveAchievementToRole",
    "adm_achievement_create_achievement": "createAchievement",
    "adm_achievement_edit_achievement": "editAchievement",
    "adm_achievement_edit_icon": "editAchievementIcon",
    "adm_achievement_delete_achievement": "deleteAchievement",
    "adm_achievement_achievement_give_mentions": "achievementGiveMentions",
    "adm_achievement_achievement_remove_user": "achievementRemoveUser",

    // Кодекс
    "adm_codex_add": "codexAdd",
    "adm_codex_edit": "codexEdit",
    "adm_codex_delete": "codexDelete",

    // Рейтинги
    "adm_ranks_set_cooldown": "setCooldown",
    "adm_ranks_toggle_self_voting": "toggleSelfVoting",
    "adm_ranks_toggle_cooldown": "toggleCooldown",
    "adm_ranks_block_reviewer": "blockReviewer",
    "adm_ranks_block_receiver": "blockReceiver",
    "adm_ranks_remove_user": "removeUser",
    "adm_ranks_reset_stats": "resetStats",
    "adm_ranks_reset_user_stats": "resetUserStats",
    "adm_ranks_view_reviews": "viewReviews",
    "adm_ranks_unblock_receiver": "unblockReceiver",
    "adm_ranks_unblock_reviewer": "unblockReviewer",
    "adm_ranks_temp_block_receiver": "tempBlockReceiver",
    "adm_ranks_temp_block_reviewer": "tempBlockReviewer",
    "adm_ranks_set_rank_criteria": "setRankCriteria",
    "adm_ranks_set_rank_update_frequency": "setRankUpdateFrequency",
    "adm_ranks_create_role": "createRole",
    "adm_ranks_set_role_name": "setRoleName",
    "adm_ranks_delete_role": "deleteRole",

    // Админ настройки
    "adm_settings_remove_bots": "removeBots",
    "adm_settings_set_leaderboard_channel": "setLeaderboardChannel",

    // Подписки
    "adm_subscription_block_subscription": "blockSubscription",
    "adm_subscription_temp_block_subscription": "tempBlockSubscription",
    "adm_subscription_unblock_subscription": "unblockSubscription",
    "adm_subscription_edit_raids": "editRaids",
    "adm_subscription_set_raid_role": "setRaidRole",
    "adm_subscription_set_bus_category": "setBusCategory",

    // Ставки
    "adm_bet_create": "createBetEvent",
    "adm_bet_delete": "deleteBetEvent",
    "adm_bet_channel": "setBetNotificationChannel",
    "adm_bet_info_private_channel": "setBetPrivateChannel",
    "adm_bet_get_winners": "sendBetResults",

    // Регистрация на ивенты
    "adm_event_register": "registerEvent",
    "adm_event_unregister": "unregisterEvent",
    "adm_event_set_channel": "setEventChannel",

    // Включение и выключение модулей
    "adm_modules_toggle": "toggleModule"
};

/**
 * Handles an interaction by executing the appropriate subcommand or returning an error if the subcommand is invalid or the user lacks necessary permissions.
 *
 * @param {Object} interaction - The interaction object containing user inputs and metadata.
 * @returns {Promise<void>} Resolves after processing the interaction and sending a reply.
 */
export default async function (interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (!interaction.member.permissions.has('Administrator')) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.notAdmin"),
            flags: MessageFlags.Ephemeral
        });
    }

    const handlerName = adminCommandMap[interaction.commandName + '_' + subcommand];
    if (typeof subcommandsHandlers[handlerName] === "function") {
        await subcommandsHandlers[handlerName](interaction, pool, interaction.guild);
    } else {
        await interaction.reply({content: await translatedMessage(interaction, "errors.unknownCommand"), flags: MessageFlags.Ephemeral});
    }
}
