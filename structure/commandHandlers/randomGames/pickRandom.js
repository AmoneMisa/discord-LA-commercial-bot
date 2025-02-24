/**
 * Selects a random participant from a list provided in the interaction options and replies with the chosen participant.
 *
 * @param {object} interaction - The interaction object containing the command details and user input.
 * @return {Promise<void>} A promise that resolves after the reply is sent to the interaction.
 */
export default async function pickRandom(interaction) {
    const participants = interaction.options.getString("participants").split(",").map(p => p.trim());

    if (participants.length < 2) {
        return interaction.reply("❌ Укажите хотя бы двух участников через запятую.");
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];

    await interaction.reply(`🎯 Случайно выбран: **${winner}**`);
}
