const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const fs = require('ytdl-core');
Client = Discord.Client;
Intents = Discord.Intents;
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const music = require('@discordjs/voice');
const { getInfo } = require('discord-ytdl-core');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const token = 'OTAzNTEwMzY4NTQwODM1ODgx.YXuBmg.eLimJU9T1UK0fPQuxh8uCyhg2zY';
const PREFIX = "!";
const player = createAudioPlayer();

let que = [];
let playing = false;
let vc = false;

bot.on('ready', () =>{
    console.log('bot online');
})
bot.on('messageCreate', message => {
        const args = message.content.substring(PREFIX.length).split(" ")
        
        
if(message.content.substring(0, PREFIX.length) == '!')
{
    switch(args[0]){
        case 'play':
            if(!args[1]){
                message.channel.send('give me a yt link dumbass');
                return;
            }
            
            if(message.member.voice.channelId == null){
                message.channel.send('get in a vc mate');
                return;
            }else{
                que.push(args[1]);
                if(!playing)
                {
                    const connection = joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });
                    vc = true;
                    next(connection);
                }       
            }
                 
        break;
        case 'stop':
            if(vc && playing)
            {
                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                connection.destroy();
                vc = false;
                playing = false;
            }
            
        break;

        case 'queue':
            if(vc && playing)
            {
                queue(message);
            }
            
        break;
        
        case 'skip':
            if(que[0] == null && vc)
            {
                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                message.channel.send('nothing to skip to... disconnecting');
                connection.destroy();
                playing = false;
                vc = false;
                return;
            }
            else if(vc && que[0] != null)
            {
                skip();
            }

        break;
}
        
 }
    
});
async function skip()
{
    var stream = await ytdl(que[0], {filter: 'audioonly', type: 'opus'});                            
    const resource = createAudioResource(stream);
    player.play(resource);
    que.shift()
}

async function queue(message)
{
    if(que[0] == null)
    {
        message.channel.send('nothing in que rn');
        return;
    }
    for(i = 0; i < que.length;i++)
    {
        const info = await ytdl.getInfo(que[i]);
        message.channel.send((i + 1) + '. ' + info.videoDetails.title);
    }
    
}


async function next(connection){
    var stream = await ytdl(que[0], {filter: 'audioonly', type: 'opus'});                            
    const resource = createAudioResource(stream);
    if(!playing)
    {
        connection.subscribe(player);
        playing = true;
    } 
    player.play(resource);
    que.shift()
    player.on(music.AudioPlayerStatus.Idle, () =>{
        if(que[0] == null)
        {
            playing = false;
            connection.destroy();
            vc = false;
        }
        else{
            next();
        }
        
    });
}

bot.login(token);
