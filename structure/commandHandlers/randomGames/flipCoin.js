/**
 * Simulates a coin flip and sends the result as a reply to the provided interaction.
 *
 * @param {Object} interaction - The interaction object representing the command or event.
 * @return {Promise<void>} A promise that resolves when the reply is successfully sent.
 */
export default async function flipCoin(interaction) {
    const result = Math.random() < 0.5 ? "Орел 🦅" : "Решка 🎭";

    await interaction.reply(`🪙 Результат: **${result}**`);
}
