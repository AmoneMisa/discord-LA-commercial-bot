import {MessageFlags} from "discord.js";

function hexToInt(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        throw new Error('Invalid HEX color format.');
    }
    return parseInt(hex, 16);
}

export default async function handleProfileSetStyle(interaction) {
    const userId = interaction.user.id;

    try {
        const backgroundHex = interaction.options.getString('background');
        const mainTextHex = interaction.options.getString('main_text');
        const secondaryTextHex = interaction.options.getString('secondary_text');
        const separatorHex = interaction.options.getString('separator');
        const textBackgroundHex = interaction.options.getString('text_background');
        const borderHex = interaction.options.getString('border');

        const color_background = backgroundHex ? hexToInt(backgroundHex) : null;
        const color_text = mainTextHex ? hexToInt(mainTextHex) : null;
        const color_secondary = secondaryTextHex ? hexToInt(secondaryTextHex) : null;
        const color_separator = separatorHex ? hexToInt(separatorHex) : null;
        const color_text_background = textBackgroundHex ? hexToInt(textBackgroundHex) : null;
        const color_border = borderHex ? hexToInt(borderHex) : null;

        await pool.query(`
            UPDATE profiles
            SET
                color_background = COALESCE($1, color_background),
                color_text = COALESCE($2, color_text),
                color_secondary = COALESCE($3, color_secondary),
                color_separator = COALESCE($4, color_separator),
                color_text_background = COALESCE($5, color_text_background),
                color_border = COALESCE($6, color_border)
            WHERE user_id = $7
        `, [
            color_background,
            color_text,
            color_secondary,
            color_separator,
            color_text_background,
            color_border,
            userId
        ]);

        await interaction.reply({
            content: '✅ Стиль анкеты успешно обновлён!',
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error('Ошибка при установке стиля анкеты:', error);
        await interaction.reply({
            content: '❌ Ошибка: проверьте правильность введённых цветов. Используйте формат #000000 или 000000.',
            flags: MessageFlags.Ephemeral
        });
    }
}