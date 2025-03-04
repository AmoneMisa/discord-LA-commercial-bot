import updateBetTable from "./updateBetTable.js";

export default async function (interaction, pool) {
    const [_, page] = interaction.customId.split("_");
    await updateBetTable(interaction, pool, parseInt(page));
    await interaction.deferUpdate();
}