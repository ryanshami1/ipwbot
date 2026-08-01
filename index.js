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
const STAFF_ROLE_ID = '1532902389022064640'; // High Command authorized role
const ADMIN_ROLE_ID = '1532902851293216809'; // The Admin role being awarded
const WEBSITE_URL = 'https://jmtc-wiki.com';
// Configure your 4 documentation links here
const TRCU_DOC_1 = 'https://docs.google.com/document/d/1nk08hQ5W-rxIt7KQ23tZ7YlKLExBq1bzptFTk4tddL8/edit?tab=t.0';
const TRCU_DOC_2 = 'https://docs.google.com/document/d/1tYe4GnR7gJ-QrY0-aC-_DQFpQcBlSb6kRN_mmdFBNoE/edit?tab=t.0';
const TRCU_DOC_3 = 'https://docs.google.com/document/d/159G05XWyb1yj_YEBhcM879XnGwPcRAyKwplcImhS5sI/edit?tab=t.0';
const TRCU_DOC_4 = 'https://docs.google.com/document/d/12OI81zFtmZPslRN3o4viy6sfVwQVCs2ew3ev-i37_6k/edit?tab=t.0';


// Add the Role ID you want the /get-role command to give out
const GET_ROLE_COMMAND_ID = '1532931861821657129'; 

// ==========================================
// MULTIPLE CHOICES DATA ARRAYS
// ==========================================
const GIF_CHOICES = [
    'https://tenor.com/view/man-earth-rotation-control-gif-820168416650185793',
    'https://cdn.discordapp.com/attachments/1514283667122421893/1514346265444614264/togif.gif',
    'https://cdn.discordapp.com/attachments/1514283667122421893/1514318906335170700/togif.gif'
];

const VIDEO_CHOICES = [
    'https://youtu.be/W7qRjZ7pYdI',
    'https://youtu.be/PAYkRnHi1Zo',
    'https://youtu.be/YgiyWGyJcIc'
];

// ==========================================
// SLASH COMMANDS DEFINITIONS
// ==========================================
const commands = [
    new SlashCommandBuilder()
        .setName('about')
        .setDescription('learn more about Islamic Pot Wilayah\'s bot'), 

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('shows all bot commands'),

    new SlashCommandBuilder()
        .setName('jmtc-wiki')
        .setDescription('go to Jihadist Movement on The Computer's wiki'), 

    new SlashCommandBuilder()
        .setName('admin')
        .setDescription('give admin (only available to high command)')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user you want to give admin')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('random-gif')
        .setDescription('Sends a random GIF chosen from multiple options'),

    new SlashCommandBuilder()
        .setName('get-role')
        .setDescription('Claim your designated community role instantly'),

    new SlashCommandBuilder()
        .setName('random-video')
        .setDescription('Sends a random video link chosen from multiple options')

    new SlashCommandBuilder()
        .setName('trcu-docs')
        .setDescription('access trcu classified docs😂'),
].map(command => command.toJSON());

// ==========================================
// BOT INITIALIZATION & SETUP
// ==========================================
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const updateActivity = () => {
        const guild = client.guilds.cache.first();
        if (guild) {
            const humanCount = guild.members.cache.filter(m => !m.user.bot).size || guild.memberCount;
            client.user.setActivity(`${humanCount} active humans!`, { type: 3 }); 
        }
    };
    updateActivity();
    setInterval(updateActivity, 600000); 

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

    // 1. /about command logic
    if (commandName === 'about') {
        await interaction.reply({
            content: `**IPW bot**\nbot ryan made for **ISLAMIC POT WILAYAH**.\n*running on node.js, if you want more commands ask ryan*`,
            ephemeral: false
        });
    }

    // 2. /help command logic
  if (commandName === 'help') {
    await interaction.reply({
        content: `### available commands
* \`/about\` - shows stuff about the bot
* \`/help\` - Opens this menu
* \`/jmtc-wiki\` - leads to JMTC's wiki
* \`/random-gif\` - drops a random GIF out of multiple choices
* \`/get-role\` - gives you the community role
* \`/random-video\` - posts a random video link
* \`/admin [user]\` - makes someone admin *(only available for high command)*
* \`/trcu-docs\` - opens trcu docs`,
        ephemeral: true
    });
}

    // 3. /jmtc-wiki command logic
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

    // 4. /admin command logic
    if (commandName === 'admin') {
        if (!member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ **Access Denied:** HAHA NIGGER YOU DONT HAVE HIGH COMMAND LOLZ', ephemeral: true });
        }
        const targetUser = options.getMember('target');
        if (!targetUser) return interaction.reply({ content: 'Could not resolve target profile.', ephemeral: true });

        try {
            const adminRole = guild.roles.cache.get(ADMIN_ROLE_ID);
            if (!adminRole) return interaction.reply({ content: '❌ Configuration Error: Target Admin Role ID missing.', ephemeral: true });
            await targetUser.roles.add(adminRole);
            await interaction.reply({ content: `✅ **ranking complete:** ${targetUser} has been promoted to admin via George Droid Services. Thank you ${member.user}, for using George Droid Services.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `❌ **Failed Execution:** Check bot hierarchy placement.`, ephemeral: true });
        }
    }

    // 5. /random-gif logic
    if (commandName === 'random-gif') {
        const randomGif = GIF_CHOICES[Math.floor(Math.random() * GIF_CHOICES.length)];
        await interaction.reply({ content: randomGif });
    }

    // 6. /get-role logic
    if (commandName === 'get-role') {
        try {
            const roleToGive = guild.roles.cache.get(GET_ROLE_COMMAND_ID);
            if (!roleToGive) {
                return interaction.reply({ content: '❌ Configuration Error: The specified role ID was not found in this server.', ephemeral: true });
            }
            if (member.roles.cache.has(GET_ROLE_COMMAND_ID)) {
                return interaction.reply({ content: 'You already have this role nigger', ephemeral: true });
            }
            await member.roles.add(roleToGive);
            await interaction.reply({ content: `✅ you got the **${roleToGive.name}** role.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ System Error: Unable to assign your role. Check bot hierarchy restrictions.', ephemeral: true });
        }
    }

     // 7. /random-video logic
    if (commandName === 'random-video') {
        const randomVideo = VIDEO_CHOICES[Math.floor(Math.random() * VIDEO_CHOICES.length)];
        await interaction.reply({ content: randomVideo });
    }

    // 8. /trcu-docs command logic
    if (commandName === 'trcu-docs') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('airforce access list')
                .setURL(TRCU_DOC_1)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('commissioner order 001')
                .setURL(TRCU_DOC_2)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('government building access info')
                .setURL(TRCU_DOC_3)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('aerospace engineering handbook')
                .setURL(TRCU_DOC_4)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({
            content: 'Select a link token below to view the requested documentation:',
            components: [row]
        });
    }
}); // This closing bracket marks the actual end of the interaction router!


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
