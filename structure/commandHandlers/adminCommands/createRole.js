import { MessageFlags } from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Creates a new role in the specified guild and stores its details in the database.
 *
 * @param {Object} interaction - The interaction object containing user inputs and methods to reply.
 * @param {Object} pool - The database connection pool used to execute SQL queries.
 * @param {Object} guild - The guild object where the role will be created.
 * @return {Promise<void>} A promise that resolves when the role is created and stored in the database and a reply is sent.
 */
export default async function createRole(interaction, guild) {
    const name = interaction.options.getString('name');
    const requiredRating = interaction.options.getInteger('required_rating');
    const minReviews = interaction.options.getInteger('min_reviews');
    const minPositive = interaction.options.getInteger('min_positive_reviews');
    const minNegative = interaction.options.getInteger('min_negative_reviews');

    let existingRole = await pool.query('SELECT * FROM roles WHERE role_name = $1', [name]);

    if (existingRole.rows.length > 0) {
        return await interaction.reply({ content: await translatedMessage(interaction, "errors.roleAlreadyExists", {name}), flags: MessageFlags.Ephemeral });
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

    await interaction.reply({ content:  await translatedMessage(interaction, "info.roleCreated", {name}), flags: MessageFlags.Ephemeral });
}
