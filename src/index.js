require('dotenv').config()
const { Client, MessageEmbed} = require('discord.js')
require('discord-reply');

//--------------Initialize Bot and Generate the embed message --------------//
const bot = new Client();
const COMMAND_PREFIX = process.env.COMMAND_PREFIX;
const EMBEDDED_HELP_MESSAGE = new MessageEmbed().setTitle('THEC WL BOT').setColor(3447003)
    .setDescription("Welcome to the **THEC WL BOT** for **The Highbrids Evolution Club**.\n\nThis **BOT** will take your **WL+** role and give the **Whitelist** role to another member of this server. You will also get the **Whitelist** role if you use this bot.\n\n**Guide:**")
    .addField(`${COMMAND_PREFIX} <@member>`, 'Mention the member you want to be Whitelisted')
    .addField(`${COMMAND_PREFIX} help`, 'Shows this message')
    .addField(`${COMMAND_PREFIX} mod`, "Ping the admins for help if the **BOT** is malfunctioning (spamming this will result in a **BAN**)")
let wlRole, wl2Role;


//-------------- Check if bot is online --------------//
bot.on('ready', async function () {
    console.log('I am ready!');
});

//-------------- Event handler to update stats of the server when a member joins guild --------------//
bot.on('guildMemberAdd', async function (member){
    let channel = await member.guild.channels.cache.find(channel=>channel.id === process.env.TOTAL_MEMBERS_CHANNEL_ID)
    await channel.setName(`👤┃Members: ${member.guild.memberCount}`)
})

//-------------- Event handler to update stats of the server when a member joins guild --------------//
bot.on('guildMemberRemove', async function (member){
    let channel = await member.guild.channels.cache.find(channel=>channel.id === process.env.TOTAL_MEMBERS_CHANNEL_ID)
    await channel.setName(`👤┃Members: ${member.guild.memberCount}`)
})

//-------------- Event handler to update stats of the server when the !whitelist command is executed --------------//
async function updateChannelStats(guild) {
    console.log('inside updateChannelStats');
    let wl = await guild.channels.cache.find(channel=>channel.id === process.env.WHITELIST_CHANNEL_ID);
    let wl2 = await guild.channels.cache.find(channel=>channel.id === process.env.WHITELIST2_CHANNEL_ID);
    wlRole = await guild.roles.cache.find(role => role.id === process.env.WL_ROLE_ID);
    wl2Role = await guild.roles.cache.find(role => role.id === process.env.WL2_ROLE_ID);
    await wl.setName(`📜│Whitelist: ${(wlRole.members.size)}`);
    await wl2.setName(`📜│WL+: ${wl2Role.members.size}`);
}

//-------------- Update Whitelist+ --------------//
bot.on('guildMemberUpdate', async (oldMember, newMember) => {
    console.log('inside guildMemberUpdate')
    if  (oldMember.roles.cache.size < newMember.roles.cache.size || oldMember.roles.cache.size > newMember.roles.cache.size) {
        let wl2 = await newMember.guild.channels.cache.find(channel=>channel.id === process.env.WHITELIST2_CHANNEL_ID);
        let wl = await newMember.guild.channels.cache.find(channel=>channel.id === process.env.WHITELIST_CHANNEL_ID);
        wlRole = await newMember.guild.roles.cache.find(role => role.id === process.env.WL_ROLE_ID);
        wl2Role = await newMember.guild.roles.cache.find(role => role.id === process.env.WL2_ROLE_ID);
        wl2.setName(`📜│WL+: ${wl2Role.members.size}`);
        wl.setName(`📜│Whitelist: ${(wlRole.members.size)}`)
    }
})

//-------------- Command Handler --------------//

bot.on('message', async function (message) {
    try {
        if (!message || message.content.length === 0 || message.content.substring(0, COMMAND_PREFIX.length) !== COMMAND_PREFIX) {
            return;
        }

        let embed = new MessageEmbed()

        const args = (message.content.substring(COMMAND_PREFIX.length).split(/ |\n/)).filter(n=>n);
        wlRole = message.member.guild.roles.cache.find(role => role.id === process.env.WL_ROLE_ID);
        wl2Role = message.member.guild.roles.cache.find(role => role.id === process.env.WL2_ROLE_ID);

        switch(args[0]){
            // Other commands
            case 'help': {
                console.log("help called");
                await message.lineReply(EMBEDDED_HELP_MESSAGE);
                return;
            }
            case 'mod': {
                // Tag the moderators
                console.log("mod called");
                embed.setDescription(`**Alerting the Administrators**\n <@&${process.env.ADMINISTRATOR_ROLE_ID}> come check this out!`)
                    .setColor(3447003).setTimestamp();
                await message.lineReply(embed);
                return;
            }
        }

        if (args[0] && args[0].startsWith('<@!') && args[0].endsWith('>')){
            let member = await message.guild.members.fetch(args[0].split(/<@!|>/).filter(n=>n)[0]);
            let authorHasRoleFlag = message.member.roles.cache.find(role=>role.id === wl2Role.id);

            if (member.id === message.member.id){
                embed.setDescription(`**Operation Unsuccessful**\n<@!${member.id}> You can't whitelist yourself!`)
                    .setColor(0xFF0000).setTimestamp();
                await message.lineReply(embed);
                return
            }

            if (member.roles.cache.find(role=>role.id === wlRole.id)) {
                embed.setDescription(`**Operation Unsuccessful**\n<@!${member.id}> already has <@&${wlRole.id}>!`)
                    .setColor(0xFF0000).setTimestamp();
                await message.lineReply(embed);
                return
            }

            if ((authorHasRoleFlag)){
                await member.roles.add(await wlRole);
                await message.member.roles.remove(await wl2Role);
                await message.member.roles.add(await wlRole);
                embed.setDescription(`**Operation Successful**\n<@!${member.id}> was given <@&${wlRole.id}> role by <@!${message.author.id}>!`)
                    .setColor(3447003).setTimestamp();
                await message.lineReply(embed);
                await updateChannelStats(message.member.guild);

            } else if (!authorHasRoleFlag){
                embed.setDescription(`**Operation Unsuccessful**\n<@!${message.author.id}> You don't have <@&${wl2Role.id}> therefore you can't whitelist <@!${member.id}>!`)
                    .setColor(0xFF0000).setTimestamp();
                await message.lineReply(embed);
            } else {
                embed.setDescription("**Operation Unsuccessful**\nBot doesn't have permissions to add roles! Please use the `!whitelist mod` command to notify the admins.")
                    .setColor(0xFF0000).setTimestamp();
                await message.lineReply(embed);
            }
        } else {
            embed.setDescription("**Operation Unsuccessful**\nInvalid number of arguments.")
                .setColor(0xFF0000).setTimestamp();
            await message.lineReply(embed);
        }
    } catch (e) {
        console.log(e);
        let embed = new MessageEmbed().setDescription('**Error**\nSomething went wrong. If this continues,' +
            ' please contact the mods of this bot by using command: `!mod`').setColor(0xff1100).setTimestamp();
        await message.lineReply(embed);
    }
});

console.log(process.env.TOKEN)
bot.login(process.env.TOKEN);