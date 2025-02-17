import { MessageFlags } from 'discord.js';

export default async function createRole(interaction, pool, guild) {
    const name = interaction.options.getString('name');
    const requiredRating = interaction.options.getInteger('required_rating');
    const minReviews = interaction.options.getInteger('min_reviews');
    const minPositive = interaction.options.getInteger('min_positive_reviews');
    const minNegative = interaction.options.getInteger('min_negative_reviews');

    let existingRole = await pool.query('SELECT * FROM roles WHERE role_name = $1', [name]);

    if (existingRole.rows.length > 0) {
        return interaction.reply({ content: `❌ Роль **${name}** уже существует.`, flags: MessageFlags.Ephemeral });
    }

    let createdRole = await guild.roles.create({
        name,
        permissions: [],
        mentionable: true
    });

    await pool.query(
        `INSERT INTO roles (role_name, role_id, required_rating, min_reviews, min_positive_reviews, min_negative_reviews) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, createdRole.id, requiredRating, minReviews, minPositive, minNegative]
    );

    await interaction.reply({ content: `✅ Создана новая роль **${name}**.`, flags: MessageFlags.Ephemeral });
}
