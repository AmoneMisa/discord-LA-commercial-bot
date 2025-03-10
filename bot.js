import {ButtonStyle, Client, GatewayIntentBits, InteractionType, MessageFlags, TextInputStyle} from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
import registerCommands from "./structure/registerCommands.js";
import updateRatings from "./structure/updateRatings.js";
import updateLeaderboard from "./structure/commandHandlers/updateLeaderboard.js";
import setRolesByRanks from "./structure/setRolesByRanks.js";
import removeBots from "./structure/commandHandlers/adminCommands/removeBots.js";
import {schedulersList} from "./structure/shedullers/scheduleUpdates.js";
import buttons from "./structure/interactions/buttons.js";
import modals from "./structure/interactions/modals.js";
import commands from "./structure/interactions/commands.js";
import {addUserIfNotExists} from "./structure/commandHandlers/dbUtils.js";
import createRoles from "./structure/createRoles.js";
import errorsHandler from "./errorsHandler.js";

const {Pool} = pkg;
const pool = new Pool({connectionString: process.env.DATABASE_URL});

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]});

client.once('ready', async () => {
    try{
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Guild not found. Проверьте GUILD_ID в .env');
            return;
        }

        await registerCommands();
        schedulersList(pool, client, guild);

        await updateRatings(pool);
        await setRolesByRanks(pool, guild);
        await updateLeaderboard(client, pool);
        await createRoles(pool, guild);
    } catch (e) {
        console.error('ready:',e);
        errorsHandler.error(e.message);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        const targetUser = interaction?.options?.getUser('member');
        await addUserIfNotExists(pool, interaction.user);

        if (interaction.isCommand() && interaction.commandName === 'admin_settings' && interaction.options.getSubcommand() === 'remove_bots') {
            await removeBots(interaction, pool);
        }

        if (targetUser && targetUser.bot) {
            return await interaction.reply({
                content: '🚫 Вы не можете использовать эту команду на боте!',
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.isCommand()) {
            await commands(interaction, pool);
        } else if (interaction.isButton()) {
            await buttons(interaction, pool, client);
        } else if (interaction.isModalSubmit()) {
            await modals(interaction, pool, client);
        }
    } catch (e) {
        console.error('interactionCreate:',e);
        errorsHandler.error(e.message);
    }
});

client.login(process.env.BOT_TOKEN);
