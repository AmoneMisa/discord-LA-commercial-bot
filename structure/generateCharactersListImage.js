import {createCanvas, loadImage, registerFont} from 'canvas';
import fs from 'fs';
import path from 'path';
import {MessageFlags} from "discord.js";

// 📌 Пути к папкам
const ICONS_DIR = path.resolve('static/classIcons'); // Папка с иконками классов
const OUTPUT_DIR = path.resolve('static/generated'); // Папка для временных изображений
const FONT_PATH = path.resolve('static/fonts/NotoSans-VariableFont_wdth,wght.ttf');
console.log("FONT_PATH", FONT_PATH)
registerFont(FONT_PATH, { family: 'Noto Sans', weight: '400', style: 'normal' });
// 🎨 Функция отрисовки
export async function drawCharacterList(characters) {
    const WIDTH = 800;
    const HEIGHT = 450;
    const PADDING = 12;
    const INNER_PADDING = 8; // Новый паддинг слева и справа
    const BOX_HEIGHT = 40;
    const ICON_SIZE = 30;
    const FONT_SIZE = 15;
    const ROWS = 5;
    const COLS = 3;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#413241';
    drawRoundedRect(ctx, 0, 0, WIDTH + 15, HEIGHT + 15, 8);

    // Рамка
    ctx.fillStyle = '#604b60';
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

    ctx.fillStyle = '#ffe176';
    ctx.font = '18px Noto Sans';
    ctx.fillText(`${characters[0].char_name}`,
        headerX, headerY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Noto Sans';
    ctx.fillText(characters[0].gear_score,
        WIDTH - PADDING - INNER_PADDING - 70, headerY);

    // Разделительная линия
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING + INNER_PADDING, PADDING + 40);
    ctx.lineTo(WIDTH - PADDING - INNER_PADDING, PADDING + 40);
    ctx.stroke();

    // Отрисовка персонажей в колонках
    for (let i = 0; i < Math.min(characters.length, ROWS * COLS); i++) {
        const char = characters[i];

        const col = i % COLS;
        const row = Math.floor(i / COLS);

        const x = PADDING + INNER_PADDING + col * ((WIDTH - 2 * PADDING - INNER_PADDING) / COLS);
        const y = PADDING + 60 + row * (BOX_HEIGHT + 10);

        // Фон для текста
        ctx.fillStyle = '#2f242f';
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
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${FONT_SIZE}px Noto Sans`;
        ctx.fillText(`${char.char_name} - ${char.gear_score}`, x + 50, y + 25);
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
export default async function sendCharacterList(interaction, messageText, characters, user) {
    const filePath = await drawCharacterList(characters);

    if (user) {
        await user.send({
            content: messageText,
            files: [filePath],
            flags: MessageFlags.Ephemeral});
    } else {
        await interaction.reply({
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
