/**
 * Autocompletes achievement names based on user input.
 *
 * @param {object} interaction - The interaction object containing user input and methods for responding.
 * @return {Promise<void>} A promise that resolves when the autocomplete response is sent.
 */
export default async function autocompleteAchievements(interaction) {
    const input = interaction.options.getFocused().toLowerCase();

    const results = await pool.query(`SELECT name FROM achievements WHERE name ILIKE $1 LIMIT 10`, [`%${input}%`]);

    await interaction.respond(results.rows.map(ach => ({ name: ach.name, value: ach.name })));
}
