import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Сохранение иконки достижения из команды
 * @param {string} achievementName - Название достижения
 * @param {string} imageUrl - URL загруженного изображения
 * @returns {string} - Путь к сохранённому файлу
 */
export async function saveAchievementIcon(achievementName, imageUrl) {
    try {
        // Проверяем формат файла (разрешаем только PNG)
        if (!imageUrl.endsWith('.png')) {
            throw new Error('❌ Файл должен быть в формате PNG.');
        }

        // Создаём папку achievements, если её нет
        const achievementsDir = path.resolve('static/achievements');
        if (!fs.existsSync(achievementsDir)) {
            fs.mkdirSync(achievementsDir, { recursive: true });
        }

        // Преобразуем название достижения в snake_case
        const fileName = achievementName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '') + '.png';

        // Полный путь к файлу
        const filePath = path.join(achievementsDir, fileName);

        // Скачиваем изображение
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        console.log(`✅ Иконка достижения сохранена: ${filePath}`);
        return filePath;
    } catch (err) {
        console.error('❌ Ошибка при сохранении иконки:', err);
        return null;
    }
}
