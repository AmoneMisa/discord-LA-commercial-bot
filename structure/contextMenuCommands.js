import {ContextMenuCommandBuilder, ApplicationCommandType} from "discord.js";

export default [
    new ContextMenuCommandBuilder()
        .setName("Получить инфо или оставить отзыв")
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName("Получить инфо или оставить отзыв")
        .setType(ApplicationCommandType.User),
    new ContextMenuCommandBuilder()
        .setName("Просмотреть профиль игрока")
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName("Просмотреть профиль игрока")
        .setType(ApplicationCommandType.User),
    new ContextMenuCommandBuilder()
        .setName("Поставить ставку")
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName("Изменить ставку")
        .setType(ApplicationCommandType.Message),
];