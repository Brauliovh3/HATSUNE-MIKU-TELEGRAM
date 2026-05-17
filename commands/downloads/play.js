import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  command: ['play'],
  category: 'downloads',
  description: 'Descargar musica o video de YouTube',
  middlewares: [],
  cooldown: 5,
  async run(ctx, args) {
    const userId = ctx.senderId;
    if (!global.db.data.users[userId]) global.db.data.users[userId] = { coins: 0, usedcommands: 0 };
    const user = global.db.data.users[userId];

    if (!args || args.length === 0) {
      return ctx.reply('**🎵 USO:** .play <titulo o URL>\n**📝 Ejemplo:** .play Despacito\n**💡 Opciones:** Responde con el número de opción.');
    }

    
    if (args.length === 1 && /^[1-4]$/.test(args[0])) {
      const lastId = user.lastVideoId;
      if (!lastId) return ctx.reply('**❌ Primero busca una canción o video.**');
      
      const num = args[0];
      const selectionMap = {
        '1': `audio_${lastId}`,
        '2': `video_${lastId}`,
        '3': `wav_${lastId}`,
        '4': `avi_${lastId}`
      };
      
      return this.callback(ctx, selectionMap[num]);
    }

    const query = args.join(' ');

    try {
      let videoId;
      let title = 'Video encontrado';

      if (query.includes('youtube.com/watch?v=')) {
        videoId = query.split('v=')[1]?.split('&')[0];
      } else if (query.includes('youtu.be/')) {
        videoId = query.split('youtu.be/')[1]?.split('?')[0];
      } else {
        await ctx.reply('🔍 Buscando en YouTube...');
        
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const videoIdMatch = searchResponse.data.match(/"videoId":"([^"]+)"/);
        if (!videoIdMatch) {
          return ctx.reply('❌ No se encontraron resultados para tu búsqueda');
        }
        
        videoId = videoIdMatch[1];
      }

      user.lastVideoId = videoId;

      if (!videoId) {
        return ctx.reply('❌ No se encontró el video');
      }

      try {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        await ctx.replyWithPhoto(thumbnailUrl, {
          caption: `✨ **YOUTUBE PLAY** ✨\n\n🆔 **ID:** ${videoId}\n\n📥 **Selecciona o responde con el número:**\n1️⃣ Audio MP3\n2️⃣ Video MP4\n3️⃣ Audio WAV\n4️⃣ Video AVI\n\n💙 **Hatsune Miku Bot**`,
          parseMode: 'md', 
          ...global.Markup.inlineKeyboard([
            [
              global.Markup.button.callback('🎵 MP3', `audio_${videoId}`), 
              global.Markup.button.callback('🎥 MP4', `video_${videoId}`)
            ],
            [
              global.Markup.button.callback('🎼 WAV', `wav_${videoId}`), 
              global.Markup.button.callback('🎬 AVI', `avi_${videoId}`)
            ]
          ])
        });
      } catch (infoError) {
        const message = `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
🆔 *ID:* ${videoId}

📥 *Elige formato para descargar:*`;

        await ctx.reply({
          message: message,
          parseMode: 'md',
          ...global.Markup.inlineKeyboard([
            [global.Markup.button.callback('🎵 MP3', `audio_${videoId}`), global.Markup.button.callback('🎥 MP4', `video_${videoId}`)],
            [global.Markup.button.callback('🎼 WAV', `wav_${videoId}`), global.Markup.button.callback('🎬 AVI', `avi_${videoId}`)]
          ])
        });
      }

    } catch (error) {
      console.error('Error en play:', error);
      await ctx.reply('❌ Error al buscar el video. Intenta con otro término.');
    }
  },

  async callback(ctx, callbackData) {
    try {
      const data = callbackData.toString();
      const [formatRequested, videoId] = data.split('_');

      const formats = {
        'audio': { name: 'Audio MP3', api: 'ytmp3' },
        'video': { name: 'Video MP4', api: 'ytmp4' },
        'wav': { name: 'Audio WAV', api: 'ytmp3' },
        'avi': { name: 'Video AVI', api: 'ytmp4' }
      };

      const formatInfo = formats[formatRequested];
      if (formatInfo && videoId) {
        
        await ctx.answerCallbackQuery({
          text: `⏳ Preparando ${formatInfo.name}...`,
          showAlert: true
        });

        const apiUrl = `https://api.alyacore.xyz/dl/${formatInfo.api}?url=https://youtu.be/${videoId}&key=DEPOOL-key60015091`;
        
        const apiResponse = await axios.get(apiUrl);
        
        if (apiResponse.data.status) {
          const isVideo = formatInfo.api === 'ytmp4';
          const dlData = isVideo ? apiResponse.data.result : apiResponse.data.data;
          
          const downloadUrl = isVideo ? dlData.downloadUrl : dlData.dl;
          const fileName = isVideo ? `${dlData.title}.mp4` : dlData.fileName;
          
          const fileResponse = await axios.get(downloadUrl, {
            responseType: 'stream'
          });
          
          const cleanFileName = (fileName || `yt_${Date.now()}`).replace(/[^a-zA-Z0-9.]/g, '_');
          const filePath = path.join('./temp', cleanFileName);
          const fileWriter = fs.createWriteStream(filePath);
          fileResponse.data.pipe(fileWriter);
          
          await new Promise((resolve, reject) => {
            fileWriter.on('finish', resolve);
            fileWriter.on('error', reject);
          });
          
          await ctx.client.sendFile(ctx.chatId, {
            file: filePath,
            caption: `✅ **${formatInfo.name} descargado**\n\n💙 **Hatsune Miku Bot**`,
            parseMode: 'markdown',
            supportsStreaming: isVideo
          });
          
          setTimeout(() => {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              
            }
          }, 5000);
          
        } else {
          await ctx.answerCallbackQuery({
            text: `❌ Error al obtener enlace de descarga para ${formatInfo.name}`,
            showAlert: true
          });
        }
      } else {
        await ctx.answerCallbackQuery({
          text: '❌ Error al obtener enlace de descarga',
          showAlert: true
        });
      }
    } catch (error) {
      console.error('Error en callback:', error);
      await ctx.answerCallbackQuery({
        text: '❌ Error en la descarga',
        showAlert: true
      });
    }
  }
};
