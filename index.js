require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const express = require('express');

// ==========================================
// EXPRESS WEB SERVER (For UptimeRobot)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is online and running 24/7!'));
app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));

// ==========================================
// DISCORD BOT CONFIGURATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID;

// Your configured server variables
const STAFF_ROLE_ID = '1532902476292817061'; 
const ADMIN_ROLE_ID = '1532902851293216809'; 
const WEBSITE_URL = 'https://jmtc-wiki.com';

// ==========================================
// SLASH COMMANDS DEFINITIONS
// ==========================================
const commands = [
    // /about command
    new SlashCommandBuilder()
        .setName('about')
        .setDescription('learn more about Islamic Pot Wilayah's bot'),

    // /help command
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('shows all bot commands'),

    // /jmtc-wiki command
    new SlashCommandBuilder()
        .setName('jmtc-wiki')
        .setDescription('go to Jihadist Movement on The Computer's wiki'),

    // /admin command
    new SlashCommandBuilder()
        .setName('admin')
        .setDescription('give admin (only available to high command')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The nigger you want to give admin')
                .setRequired(true))
].map(command => command.toJSON());

// ==========================================
// BOT INITIALIZATION & SETUP
// ==========================================
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Feature 3: Dynamic Member Tracking Activity Status
    const updateActivity = () => {
        const guild = client.guilds.cache.first();
        if (guild) {
            const humanCount = guild.members.cache.filter(m => !m.user.bot).size || guild.memberCount;
            client.user.setActivity(`${humanCount} active humans!`, { type: 3 }); // Type 3 = "Watching"
        }
    };
    updateActivity();
    setInterval(updateActivity, 600000); // Refreshes stats every 10 minutes

    // Automatically register Slash Commands globally across all connected servers
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        console.log('Started refreshing application global (/) commands.');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Successfully reloaded application global (/) commands.');
    } catch (error) {
        console.error('Error deploying slash registries:', error);
    }
});

// ==========================================
// SLASH COMMAND INTERACTION ROUTER
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild } = interaction;

    // 1. /about Command logic
    if (commandName === 'about') {
        await interaction.reply({
            content: `**IPW bot**\nbot ryan made for **ISLAMIC POT WILAYAH**.\n*running on node.js, if you want more commands ask ryan*`,
            ephemeral: false
        });
    }

    // 2. /help Command logic
    if (commandName === 'help') {
        await interaction.reply({
            content: `### available commands\n* \`/about\` - shows stuff about the bot\n* \`/help\` - Opens this\n* \`/jmtc-wiki\` - leads to JMTC's wiki\n* \`/admin [user]\` - makes a fellow nigga admin *(only available for high command)*`,
            ephemeral: true
        });
    }

    // 3. /jmtc-wiki Command logic
    if (commandName === 'jmtc-wiki') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('JMTC Wiki')
                .setURL(WEBSITE_URL)
                .setStyle(ButtonStyle.Link)
        );
        await interaction.reply({
            content: 'click the button below to go to JMTC wiki',
            components: [row]
        });
    }

    // 4. /admin Command logic
    if (commandName === 'admin') {
        // Access Protection: Check if user has the specific staff role
        if (!member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: '❌ **Access Denied:** HAHA NIGGER YOU DONT HAVE HIGH COMMAND LOLZ',
                ephemeral: true
            });
        }

        const targetUser = options.getMember('target');
        if (!targetUser) {
            return interaction.reply({ content: 'Could not resolve the selected target profile.', ephemeral: true });
        }

        try {
            const adminRole = guild.roles.cache.get(ADMIN_ROLE_ID);
            if (!adminRole) {
                return interaction.reply({ content: '❌ Configuration Error: Target Admin Role ID was not found in this guild cache.', ephemeral: true });
            }

            await targetUser.roles.add(adminRole);
            await interaction.reply({
                content: `✅ **ranking complete:** ${targetUser} has been promoted to admin via George Droid Services. Thank you ${member.user}, for using George Droid Services.`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ **Failed Execution:** Ensure the bot's structural placement role is dragged *higher* than the Admin role in Server Settings.`,
                ephemeral: true
            });
        }
    }
});

// ==========================================
// CORE AUTO-ROLE LOGIC BLOCK
// ==========================================
async function assignAutoRole(member) {
    if (member.user.bot || member.pending || member.roles.cache.has(AUTO_ROLE_ID)) return;
    try {
        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
        if (role) {
            await member.roles.add(role);
            console.log(`[Success] Automatically assigned base role to: ${member.user.tag}`);
        }
    } catch (error) {
        console.error('[Error] Base auto-role assignment failed:', error.message);
    }
}

client.on('guildMemberAdd', async (member) => await assignAutoRole(member));
client.on('guildMemberUpdate', async (oldMember, newMember) => await assignAutoRole(newMember));

client.login(process.env.DISCORD_TOKEN);
