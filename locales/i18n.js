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
        preload: ["ru", "ua", "by", "ch", "en"], // Принудительная загрузка всех языков
        load: "languageOnly",
        nonExplicitSupportedLngs: true
    });

export default i18next;
