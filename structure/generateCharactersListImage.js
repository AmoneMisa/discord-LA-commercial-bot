import {createCanvas, loadImage, registerFont} from 'canvas';
import fs from 'fs';
import path from 'path';
import {MessageFlags} from "discord.js";

// 📌 Пути к папкам
const ICONS_DIR = path.resolve('static/classIcons'); // Папка с иконками классов
const OUTPUT_DIR = path.resolve('static/generated'); // Папка для временных изображений
const FONTS_DIR = path.resolve('static/fonts'); // Папка для шрифтов
const ACHIEVEMENTS_DIR = path.resolve('static/achievements'); // Папка с иконками достижений

registerFont(path.resolve(FONTS_DIR + '/NotoSans-VariableFont_wdth_wght.ttf'), { family: 'NotoSans', weight: '400', style: 'normal' });
// 🎨 Функция отрисовки
/**
 * Draws a list of characters and their details on a canvas, including their class icons, gear scores,
 * and relevant achievements. The resulting canvas is saved as an image file.
 *
 * @param {Array} characters - An array of character objects, each containing `char_name`, `class_name`, and `gear_score`.
 * @param {Array} achievements - An array of achievement objects, each containing `name`.
 * @return {Promise<string>} A promise that resolves with the file path of the generated image.
 */
export async function drawCharacterList(characters = [], achievements = []) {
    const WIDTH = 800;
    const HEIGHT = 500;
    const PADDING = 12;
    const INNER_PADDING = 8; // Новый паддинг слева и справа
    const BOX_HEIGHT = 40;
    const ICON_SIZE = 30;
    const FONT_SIZE = 15;
    const ROWS = 5;
    const COLS = 3;
    const ACHIEVEMENT_ICON_SIZE = 30;
    const ACHIEVEMENT_SPACING = 10; // Расстояние между иконками достижений
    const ACHIEVEMENT_ROW_Y = HEIGHT - 50; // Позиция достижений

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    let colorsInt;

    for (const char of characters) {
        colorsInt = await getProfileSettings(char.char_name);

        if (colorsInt) {
            break;
        }
    }

    for (let [key, color] of Object.entries(colorsInt)) {
        colorsInt[key] = convertIntToHexColor(color);
    }
    // Рамка
    ctx.fillStyle = colorsInt.color_border;
    drawRoundedRect(ctx, 0, 0, WIDTH + 15, HEIGHT + 15, 8);

    // Фон
    ctx.fillStyle = colorsInt.color_background;
    drawRoundedRect(ctx, PADDING, PADDING, WIDTH - 2 * PADDING, HEIGHT - 2 * PADDING, 10);

    // Заголовок
    const headerX = PADDING + INNER_PADDING + ICON_SIZE + 10; // Смещение на иконку + отступ
    const headerY = PADDING + 30;
    let classIconPath = path.join(ICONS_DIR, `${characters[0].class_name.toLowerCase()}.png`);
    try {
        const file = fs.readFileSync(classIconPath);
        const classIcon = await loadImage(file);
        ctx.drawImage(classIcon, PADDING + INNER_PADDING, headerY - ICON_SIZE + 5, ICON_SIZE, ICON_SIZE);
    } catch (err) {
        console.error(`❌ Ошибка загрузки иконки класса: ${classIconPath}`, err);
    }

    ctx.fillStyle = colorsInt.color_text;
    ctx.font = '18px NotoSans';
    ctx.fillText(`${characters[0].char_name}`,
        headerX, headerY);

    ctx.fillStyle = colorsInt.color_secondary;
    ctx.font = '18px NotoSans';
    ctx.fillText(characters[0].gear_score,
        WIDTH - PADDING - INNER_PADDING - 70, headerY);

    // Разделительная линия
    ctx.strokeStyle = colorsInt.color_separator;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING + INNER_PADDING, PADDING + 40);
    ctx.lineTo(WIDTH - PADDING - INNER_PADDING, PADDING + 40);
    ctx.stroke();

    if (characters.length > 24) {
        characters = characters.slice(0, 24);
    }
    // Отрисовка персонажей в колонках
    for (let i = 0; i < Math.min(characters.length, ROWS * COLS); i++) {
        const char = characters[i];

        const col = i % COLS;
        const row = Math.floor(i / COLS);

        const x = PADDING + INNER_PADDING + col * ((WIDTH - 2 * PADDING - INNER_PADDING) / COLS);
        const y = PADDING + 60 + row * (BOX_HEIGHT + 10);

        // Фон для текста
        ctx.fillStyle = colorsInt.color_text_background;
        drawRoundedRect(ctx, x, y, (WIDTH - 2 * PADDING - INNER_PADDING) / COLS - 10, BOX_HEIGHT, 6);

        // Загружаем иконку класса
        const iconPath = path.join(ICONS_DIR, `${char.class_name.toLowerCase()}.png`);

        try {
            const file = fs.readFileSync(iconPath);
            const icon = await loadImage(file);
            ctx.drawImage(icon, x + 5, y + 5, ICON_SIZE, ICON_SIZE);
        } catch (err) {
            console.error(`Ошибка загрузки иконки: ${iconPath}`, err);
        }

        // Текст персонажа
        ctx.fillStyle = colorsInt.color_secondary;
        ctx.font = `${FONT_SIZE}px NotoSans`;
        ctx.fillText(`${char.char_name} - ${char.gear_score}`, x + 50, y + 25);
    }

    // Разделительная линия
    ctx.strokeStyle = colorsInt.color_separator;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING + INNER_PADDING, PADDING + 433);
    ctx.lineTo(WIDTH - PADDING - INNER_PADDING, PADDING + 433);
    ctx.stroke();

    let achievementX = PADDING + INNER_PADDING;
    if (achievements.length) {
        for (const achievement of achievements) {
            const achievementPath = path.join(ACHIEVEMENTS_DIR, `${achievement.name.replaceAll(/\s/g, '_')}.png`);

            try {
                const file = fs.readFileSync(achievementPath);
                const icon = await loadImage(file);
                ctx.drawImage(icon, achievementX, ACHIEVEMENT_ROW_Y, ACHIEVEMENT_ICON_SIZE, ACHIEVEMENT_ICON_SIZE);
            } catch (err) {
                console.error(`Ошибка загрузки иконки достижения: ${achievementPath}`, err);
            }

            achievementX += ACHIEVEMENT_ICON_SIZE + ACHIEVEMENT_SPACING;
        }
    }

    // Сохранение изображения
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outputFile = path.join(OUTPUT_DIR, `profile_${Date.now()}.png`);
    const out = fs.createWriteStream(outputFile);
    const stream = canvas.createPNGStream();

    stream.pipe(out);
    return new Promise((resolve) => {
        out.on('finish', () => resolve(outputFile));
    });
}

// 🚀 Отправка изображения в Discord и автоматическое удаление
/**
 * Sends a list of characters to either a user directly or as a reply to an interaction, along with their achievements and a generated file attachment.
 *
 * @param {Object} interaction - The interaction object used to reply if the user is not provided.
 * @param {string} messageText - The text message to accompany the character list.
 * @param {Array} characters - The list of characters to include in the generated file.
 * @param {Object|null} user - The user object to send the message to, if specified.
 * @param {Array} [achievements=[]] - Optional list of achievements related to the characters being sent.
 * @return {Promise<void>} A promise that resolves once the message is sent and the file is scheduled for deletion.
 */
export default async function sendCharacterList(interaction, messageText, characters, user, achievements = []) {
    const filePath = await drawCharacterList(characters, achievements);

    if (user) {
        await user.send({
            content: messageText,
            files: [filePath],
            flags: MessageFlags.Ephemeral});
    } else {
        await interaction.editReply({
            content: messageText,
            files: [filePath],
            flags: MessageFlags.Ephemeral
        });
    }

    // Удаляем файл через 5 секунд
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) console.error('❌ Ошибка при удалении файла:', err);
            else console.log(`🗑️ Файл удалён: ${filePath}`);
        });
    }, 5000);
}

/**
 * Draws a rounded rectangle on a given canvas rendering context.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {number} radius - The radius of the rectangle's corners.
 * @return {void} Does not return a value.
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
}

async function getProfileSettings(mainNickname) {
   const result = await pool.query(`
    SELECT color_background, color_border, color_text, color_secondary, color_separator, color_text_background
    FROM profiles
    WHERE LOWER(main_nickname) = LOWER($1)
    `, [mainNickname]);

   return result.rows[0];
}

function convertIntToHexColor(color) {
    return '#' + color.toString(16).padStart(6, '0');
}