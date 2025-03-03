import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";

export default async function (interaction, pool) {
    if (interaction.customId.startsWith("bet_target")) {
        await betTargetHandler(interaction, pool);
    }
}