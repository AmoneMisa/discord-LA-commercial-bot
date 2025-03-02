import updateBetTable from "./updateBetTable.js";

export default async function (interaction, pool) {
    const [_, eventId, page] = interaction.customId.split("_");
    await updateBetTable(pool, interaction.channel, eventId, parseInt(page), interaction.message.id);
    await interaction.deferUpdate();
}