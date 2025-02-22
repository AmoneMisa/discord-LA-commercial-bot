/**
 * Autocompletes achievement names based on user input.
 *
 * @param {object} interaction - The interaction object containing user input and methods for responding.
 * @param {object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the autocomplete response is sent.
 */
export default async function autocompleteAchievements(interaction, pool) {
    const input = interaction.options.getFocused().toLowerCase();

    const results = await pool.query(`SELECT name FROM achievements WHERE name ILIKE $1 LIMIT 10`, [`%${input}%`]);

    await interaction.respond(results.rows.map(ach => ({ name: ach.name, value: ach.name })));
}
