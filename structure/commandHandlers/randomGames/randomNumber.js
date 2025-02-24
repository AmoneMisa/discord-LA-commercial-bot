export default async function randomNumber(interaction, pool) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    if (min >= max) {
        return interaction.reply("❌ Минимальное число должно быть меньше максимального.");
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    await interaction.reply(`🔢 Случайное число: **${result}** (из диапазона ${min}-${max})`);
}
