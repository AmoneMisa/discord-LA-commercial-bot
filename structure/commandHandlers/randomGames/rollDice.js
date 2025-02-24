export default async function rollDice(interaction, pool) {
    const sides = interaction.options.getInteger("sides") || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.reply(`🎲 Выпало: **${result}** (из ${sides})`);
}
