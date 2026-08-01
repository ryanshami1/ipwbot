require('dotenv').config(); // Loads variables from your environment
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ==========================================
// 1. EXPRESS WEB SERVER (For UptimeRobot)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

// Returns a status text when visited in a browser
app.get('/', (req, res) => {
    res.send('Bot is online and running 24/7!');
});

app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// ==========================================
// 2. DISCORD BOT CONFIGURATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers // Crucial intent to spot new users
    ]
});

// Grab the Auto Role ID from your environment settings
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID; 

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Listens for a user completing verification or joining the server
// Fires when a member changes (like passing the rules screening gate)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    console.log(`[Diagnostic] Update event triggered for: ${newMember.user.tag}`);
    console.log(`[Diagnostic] Old pending: ${oldMember.pending} | New pending: ${newMember.pending}`);

    // If your server does NOT have a rules gate, they won't be "pending"
    // Let's make it assign the role if they pass screening OR if they just need the role
    if ((oldMember.pending && !newMember.pending) || (!newMember.pending && !newMember.roles.cache.has(AUTO_ROLE_ID))) {
        try {
            console.log(`[Diagnostic] Attempting to look up Role ID: ${AUTO_ROLE_ID}`);
            const role = newMember.guild.roles.cache.get(AUTO_ROLE_ID);
            
            if (!role) {
                console.error("[Diagnostic Error] Could not find the role in cache! Double check AUTO_ROLE_ID on Render.");
                return;
            }

            console.log(`[Diagnostic] Role found: "${role.name}". Attempting to add...`);
            await newMember.roles.add(role);
            console.log(`[Success] Successfully assigned role to: ${newMember.user.tag}`);
            
        } catch (error) {
            console.error("[Diagnostic Error] Failed to add role. Check if bot role is dragged above this role! Details:", error.message);
        }
    }
});


// Log your bot online using the secure token
client.login(process.env.DISCORD_TOKEN);
