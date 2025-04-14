import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";
import betServerHandler from "../commandHandlers/bets/betServerHandler.js";

export default async function (interaction) {
    if (interaction.customId.startsWith("bet_target")) {
        await betTargetHandler(interaction);
    }
    if (interaction.customId.startsWith("bet_server")) {
        await betServerHandler(interaction);
    }
}