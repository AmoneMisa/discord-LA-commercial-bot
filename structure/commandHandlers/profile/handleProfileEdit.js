import {MessageFlags} from "discord.js";
import {saveProfileToDB} from "../../../scrapping/parser.js";
import {toCamelCase} from "../../utils.js";

/**
 * Handles the user's request to edit fields in their profile.
 * Performs validations for specific fields and updates the profile in the database.
 *
 * @param {Object} interaction - The interaction object representing the user's request.
 * @return {Promise<void>} A promise that resolves when the profile update has been successfully processed.
 */
export default async function handleProfileEdit(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const field = interaction.options.getString('field');
    let value = interaction.options.getString('value');

    if (field === 'server') {
        value = value.toLowerCase();

        if (!['кратос', 'альдеран'].includes(value)) {
            return await interaction.reply('Сервер должен быть одним из: Кратос, Альдеран');
        }
    }

    if (field === 'main_nickname') {
        value = value.toLowerCase();
        await saveProfileToDB({userId, [toCamelCase(field)]: value});
    } else {
        await pool.query(`
        UPDATE profiles 
        SET ${field} = $1
        WHERE user_id = $2
    `, [value, userId]);
    }

    await interaction.editReply({ content: `✅ Поле **${field}** успешно обновлено!`, flags: MessageFlags.Ephemeral });
}
