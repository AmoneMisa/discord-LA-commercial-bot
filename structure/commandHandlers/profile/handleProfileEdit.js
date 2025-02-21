import {MessageFlags} from "discord.js";
import {saveProfileToDB} from "../../../scrapping/parser.js";
import {toCamelCase} from "../../utils.js";

export default async function handleProfileEdit(interaction, pool) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const userId = interaction.user.id;
    const field = interaction.options.getString('field');
    let value = interaction.options.getString('value');

    if (field === 'main_nickname') {
        value = value.toLowerCase();
        await saveProfileToDB(pool, {userId, [toCamelCase(field)]: value});
    } else {
        await pool.query(`
        UPDATE profiles 
        SET ${field} = $1
        WHERE user_id = $2
    `, [value, userId]);
    }

    await interaction.editReply({ content: `✅ Поле **${field}** успешно обновлено!`, flags: MessageFlags.Ephemeral });
}
