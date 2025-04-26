import updateBetTable from "./updateBetTable.js";

export default async function (interaction) {
    const [_, page] = interaction.customId.split("_");
    await updateBetTable(interaction, parseInt(page));
    await interaction.deferUpdate();
}