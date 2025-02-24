export default async function flipCoin(interaction) {
    const result = Math.random() < 0.5 ? "Орел 🦅" : "Решка 🎭";

    await interaction.reply(`🪙 Результат: **${result}**`);
}
