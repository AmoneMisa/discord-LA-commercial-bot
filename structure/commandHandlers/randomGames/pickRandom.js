export default async function pickRandom(interaction, pool) {
    const participants = interaction.options.getString("participants").split(",").map(p => p.trim());

    if (participants.length < 2) {
        return interaction.reply("❌ Укажите хотя бы двух участников через запятую.");
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];

    await interaction.reply(`🎯 Случайно выбран: **${winner}**`);
}
