import {
    ButtonStyle,
    Client,
    Events,
    GatewayIntentBits,
    InteractionType,
    MessageFlags,
    TextInputStyle
} from 'discord.js';
import dotenv from 'dotenv';
import pkg from 'pg';
import registerCommands from "./structure/registerCommands.js";
import updateRatings from "./structure/updateRatings.js";
import updateLeaderboard from "./structure/commandHandlers/updateLeaderboard.js";
import setRolesByRanks from "./structure/setRolesByRanks.js";
import removeBots from "./structure/commandHandlers/adminCommands/removeBots.js";
import {schedulersList} from "./structure/cron/scheduleUpdates.js";
import buttons from "./structure/interactions/buttons.js";
import modals from "./structure/interactions/modals.js";
import commands from "./structure/interactions/commands.js";
import {addUserIfNotExists, givePointsForActivity} from "./structure/dbUtils.js";
import createRoles from "./structure/createRoles.js";
import errorsHandler from "./errorsHandler.js";
import messageComponent from "./structure/interactions/messageComponent.js";
import handleMessageSubscription from "./structure/commandHandlers/subscribe/handleMessageSubscription.js";
import sendRaidResponse from "./structure/commandHandlers/responses/sendRaidResponse.js";
import autocomplete from "./structure/interactions/autocomplete.js";
import {translatedMessage} from "./structure/utils.js";

dotenv.config();

const {Pool} = pkg;
/**
 * Represents a database connection pool.
 *
 * This instance is used to manage multiple connections to the database defined
 * by the connection string from the `DATABASE_URL` environment variable.
 * It allows efficient connection pooling for executing queries and managing resources.
 *
 * @type {Pool}
 */
global.pool = new Pool({connectionString: process.env.DATABASE_URL});

/**
 * Represents an instance of a Discord client.
 * The client is used to interact with the Discord API and manage bot functionality.
 * It is instantiated with specific intents to define the events and data the bot can access.
 *
 * Intents included:
 * - Guilds: Access to guild-level events and data.
 * - GuildMembers: Access to member-related events and data within guilds.
 * - GuildMessages: Access to messages sent in guild channels.
 *
 * This instance serves as the core for handling and interacting with Discord's gateway and REST API.
 */
global.client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]});

client.once('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}`);
        /**
         * Represents a Discord guild (server) fetched from the client's guild cache.
         * The guild is retrieved using the unique identifier specified in the
         * `GUILD_ID` environment variable.
         *
         * This variable is used to interact with the specific guild, enabling various
         * guild-related operations such as fetching members, channels, roles, and other
         * server-specific data once it is successfully retrieved.
         *
         * Note: Ensure that the `GUILD_ID` environment variable contains a valid
         * guild ID and that the bot is a member of the respective guild.
         *
         * @type {Guild | undefined}
         */
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Guild not found. Проверьте GUILD_ID в .env');
            return;
        }

        await registerCommands();
        schedulersList(guild);

        await updateRatings();
        await setRolesByRanks(guild);
        await updateLeaderboard();
        await createRoles(guild);
    } catch (e) {
        console.error('ready:', e);
        errorsHandler.error(e);
    }
})

client.on('interactionCreate', /**
 * Handles different types of interactions in a Discord bot client.
 *
 * Based on the type of interaction (command, button, modal, or autocomplete),
 * it processes the interaction and executes the corresponding logic. It also
 * ensures that certain commands or actions are not applicable to bots and handles
 * them accordingly.
 *
 * Interaction types supported:
 * - Command: Processes commands issued by users.
 * - Button: Handles button interactions.
 * - ModalSubmit: Manages modal submissions.
 * - Autocomplete: Handles autocomplete suggestions.
 * - MessageComponent: Reserved for future implementations.
 *
 * If the interaction type is unknown, it throws an error with the interaction type.
 * Errors during execution are logged to the console for debugging purposes.
 *
 * @async
 * @param {Object} interaction - The interaction object received from Discord's API.
 * @returns {Promise<void>} Resolves after processing the interaction.
 * @throws {Error} Throws an error for unsupported or unknown interaction types.
 */
async interaction => {
    try {
        const targetUser = interaction?.options?.getUser('member');
        await addUserIfNotExists(interaction.user);

        if (interaction.isCommand() && interaction.commandName === 'adm_settings' && interaction.options.getSubcommand() === 'remove_bots') {
            await removeBots(interaction);
        }

        if (targetUser && targetUser.bot) {
            return await interaction.reply({
                content: await translatedMessage(interaction, "errors.userIsBot"),
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.isCommand()) {
            await commands(interaction);
        } else if (interaction.isButton()) {
            await buttons(interaction);
        } else if (interaction.isModalSubmit()) {
            await modals(interaction);
        } else if (interaction.isAutocomplete()) {
            await autocomplete(interaction);
        } else if (interaction.isMessageComponent()) {
            await messageComponent(interaction);
            // console.log(interaction);
        } else {
            throw new Error(`Unknown type of interaction: ${interaction.type}`);
        }
    } catch (e) {
        console.error('interactionCreate:', e);
        errorsHandler.error(e);
    }
});

client.on(Events.MessageCreate, /**
 * Handles the incoming message event, performing several operations such as awarding points for activity,
 * managing message-based subscriptions, and sending raid response if applicable.
 *
 * @param {Object} message - The message object from the client, representing the user's message.
 * @throws Logs an error to the console if any of the internal operations fail.
 *
 * @async
 */
async message => {
    try {
        if (message.author.bot) {
            return
        }

        if (process.env.FACTIONS_MODULE) {
            await givePointsForActivity(message.author.id, 1);
        }

        if (process.env.SUBSCRIPTION_MODULE) {
            await handleMessageSubscription(message);
        }

        if (process.env.FAST_RESPONSE) {
            await sendRaidResponse(message);
        }

    } catch (e) {
        console.error('messageCreate:', e);
        errorsHandler.error(e.message);
    }
});


client.login(process.env.BOT_TOKEN);
