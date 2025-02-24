/**
 * Generates a random number within a specified range and sends it as a reply to the interaction.
 *
 * @param {Object} interaction - The interaction object that contains options and methods to interact with the user.
 * @return {Promise<void>} Resolves when the reply to the interaction is successfully sent.
 */
export default async function randomNumber(interaction) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    if (min >= max) {
        return interaction.reply("❌ Минимальное число должно быть меньше максимального.");
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    await interaction.reply(`🔢 Случайное число: **${result}** (из диапазона ${min}-${max})`);
}
