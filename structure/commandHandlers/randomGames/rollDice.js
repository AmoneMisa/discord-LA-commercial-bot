/**
 * Rolls a dice with a specified number of sides and replies with the result.
 *
 * @param {Object} interaction - The interaction object containing user input and methods to handle replies.
 * @return {Promise<void>} Resolves when the reply to the interaction is sent.
 */
export default async function rollDice(interaction) {
    const sides = interaction.options.getInteger("sides") || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.reply(`🎲 Выпало: **${result}** (из ${sides})`);
}
