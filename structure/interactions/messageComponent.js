import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";
import betServerHandler from "../commandHandlers/bets/betServerHandler.js";
import subscribeToBuy from "../commandHandlers/subscribe/subscribeToBuy.js";
import manualSendNotificationsToBuyers from "../commandHandlers/subscribe/manualSendNotificationsToBuyers.js";
import subcommandsHandlers from "../commandHandlers/adminCommands/index.js";
import getAchievementInfo from "../commandHandlers/achievements/getAchievementInfo.js";

export default async function (interaction, guild) {
    if (interaction.customId.startsWith("bet_target")) {
        await betTargetHandler(interaction);
    }

    if (interaction.customId.startsWith("bet_server")) {
        await betServerHandler(interaction);
    }

    if (interaction.customId.startsWith("select_raid_for_subscription")) {
        const selectedRaid = interaction.values[0];

        await subscribeToBuy(interaction, selectedRaid);
    }

    if (interaction.customId.startsWith("select_raid_for_notification")) {
        const selectedRaid = interaction.values[0];

        await manualSendNotificationsToBuyers(interaction, selectedRaid);
    }

    if (interaction.customId.includes("_select_achievement")) {
        const [handler, ,] = interaction.customId.split("_");

        if (handler.includes("info")) {
            await getAchievementInfo(interaction);
        } else {
            await subcommandsHandlers[handler](interaction, guild);
        }
    }
}