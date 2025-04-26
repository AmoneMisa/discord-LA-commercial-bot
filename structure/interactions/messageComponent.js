import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";
import betServerHandler from "../commandHandlers/bets/betServerHandler.js";
import subscribeToBuy from "../commandHandlers/subscribe/subscribeToBuy.js";

export default async function (interaction) {
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
}