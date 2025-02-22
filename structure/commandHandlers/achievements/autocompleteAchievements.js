export default async function autocompleteAchievements(interaction, pool) {
    const input = interaction.options.getFocused().toLowerCase();

    const results = await pool.query(`SELECT name FROM achievements WHERE name ILIKE $1 LIMIT 10`, [`%${input}%`]);

    await interaction.respond(results.rows.map(ach => ({ name: ach.name, value: ach.name })));
}
