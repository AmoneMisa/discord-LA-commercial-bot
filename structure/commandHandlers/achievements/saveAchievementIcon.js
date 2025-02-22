import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Сохранение иконки достижения из команды
 * @param {string} achievementName - Название достижения
 * @param image - Объект картинки
 * @returns {string} - Путь к сохранённому файлу
 */
export default async function (achievementName, image) {
    try {
        // Проверяем формат файла (разрешаем только PNG)
        if (!image.contentType.includes('png')) {
            throw new Error('❌ Файл должен быть в формате PNG.');
        }

        // Создаём папку achievements, если её нет
        const achievementsDir = path.resolve('static/achievements');
        if (!fs.existsSync(achievementsDir)) {
            fs.mkdirSync(achievementsDir, { recursive: true });
        }

        console.log(achievementName);
        // Преобразуем название достижения в snake_case
        const fileName = achievementName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^а-яёa-z0-9_]/g, '') + '.png';

        // Полный путь к файлу
        const filePath = path.join(achievementsDir, fileName);

        // Скачиваем изображение
        const response = await axios.get(image.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        console.log(`✅ Иконка достижения сохранена: ${filePath}`);
        return filePath;
    } catch (err) {
        console.error('❌ Ошибка при сохранении иконки:', err);
        return null;
    }
}
