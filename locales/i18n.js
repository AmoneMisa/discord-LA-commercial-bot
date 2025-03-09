import i18next from "i18next";
import Backend from "i18next-fs-backend";

i18next
    .use(Backend)
    .init({
        lng: "ru", // язык по умолчанию
        fallbackLng: "ru",
        backend: {
            loadPath: "./locales/{{lng}}/translation.json",
        },
        interpolation: {
            escapeValue: false, // Разрешает вставку HTML в строки
        },
    });

export default i18next;
