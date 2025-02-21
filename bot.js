import {ButtonStyle, Client, GatewayIntentBits, InteractionType, MessageFlags, TextInputStyle} from 'discord.js';
import dotenv from 'dotenv';
import pkg from 'pg';
import registerCommands from "./structure/registerCommands.js";
import updateRatings from "./structure/updateRatings.js";
import updateLeaderboard from "./structure/commandHandlers/updateLeaderboard.js";
import setRolesByRanks from "./structure/setRolesByRanks.js";
import removeBots from "./structure/commandHandlers/adminCommands/removeBots.js";
import handleMessageSubscription from "./structure/commandHandlers/subscribe/handleMessageSubscription.js";
import {schedulersList} from "./structure/cron/scheduleUpdates.js";
import buttons from "./structure/interactions/buttons.js";
import modals from "./structure/interactions/modals.js";
import commands from "./structure/interactions/commands.js";
import autocomplete from "./structure/interactions/autocomplete.js";
import {addUserIfNotExists} from "./structure/dbUtils.js";
import sendRaidResponse from "./structure/commandHandlers/responses/sendRaidResponse.js";

const {Pool} = pkg;
const pool = new Pool({connectionString: process.env.DATABASE_URL});

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
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
});

client.on('interactionCreate', async interaction => {
    try {
        const targetUser = interaction?.options?.getUser('member');
        await addUserIfNotExists(pool, interaction.user);

        if (interaction.isCommand() && interaction.commandName === 'adm_settings' && interaction.options.getSubcommand() === 'remove_bots') {
            await removeBots(interaction, pool);
        }

        if (targetUser && targetUser.bot) {
            return await interaction.reply({
                content: '🚫 Вы не можете использовать эту команду на боте!',
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.isCommand()) {
            await commands(interaction, pool, client);
        } else if (interaction.isButton()) {
            await buttons(interaction, pool, client);
        } else if (interaction.isModalSubmit()) {
            await modals(interaction, pool, client);
        } else if (interaction.isAutocomplete()) {
            await autocomplete(interaction, pool);
        } else if (interaction.isMessageComponent()) {
            // console.log(interaction);
        } else {
            throw new Error(`Unknown type of interaction: ${interaction.type}`);
        }
    } catch (e) {
        console.error('interactionCreate:',e);
    }
});

client.on(Events.MessageCreate, async message => {
    try {
        await handleMessageSubscription(message, pool, client);
        await sendRaidResponse(message, pool);
    } catch (e) {
        console.error('messageCreate:', e);
    }
});

client.login(process.env.BOT_TOKEN);
