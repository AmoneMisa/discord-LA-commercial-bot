import {ContextMenuCommandBuilder, ApplicationCommandType} from "discord.js";

export default [
    new ContextMenuCommandBuilder()
        .setName("Получить инфо или оставить отзыв")
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName("Получить инфо или оставить отзыв")
        .setType(ApplicationCommandType.User),
];