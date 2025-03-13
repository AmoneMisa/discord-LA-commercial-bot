import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Creates a new role in the specified guild and stores its details in the database.
 *
 * @param {Object} interaction - The interaction object containing user inputs and methods to reply.
 * @param {Object} pool - The database connection pool used to execute SQL queries.
 * @param {Object} guild - The guild object where the role will be created.
 * @return {Promise<void>} A promise that resolves when the role is created and stored in the database and a reply is sent.
 */
export default async function createRole(interaction, pool, guild) {
    const name = interaction.options.getString('name');
    const requiredRating = interaction.options.getInteger('required_rating');
    const minReviews = interaction.options.getInteger('min_reviews');
    const minPositive = interaction.options.getInteger('min_positive_reviews');
    const minNegative = interaction.options.getInteger('min_negative_reviews');

    let existingRole = await pool.query('SELECT * FROM roles WHERE role_name = $1', [name]);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (existingRole.rows.length > 0) {
        return await interaction.reply({ content: i18n.t("errors.roleAlreadyExists", { lng: lang, name }), flags: MessageFlags.Ephemeral });
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

    await interaction.reply({ content: i18n.t("info.roleCreated", { lng: lang, name }), flags: MessageFlags.Ephemeral });
}
