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
    if (!args || args.length === 0) {
      return ctx.reply('🎵 USO: .play <titulo o URL de YouTube>\n📝 Ejemplo:* .play Despacito\n📝 Ejemplo: .play https://youtube.com/watch?v=...');
    }


    if (args.length === 1 && /^[1-4]$/.test(args[0])) {
      return ctx.reply('📋 *Opciones de descarga:*\n\n1️⃣ *Audio MP3*\n2️⃣ *Video MP4*\n3️⃣ *Audio WAV*\n4️⃣ *Video AVI*\n\n💡 *Responde con un numero o busca con texto!*');
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

      if (!videoId) {
        return ctx.reply('❌ No se encontró el video');
      }

      try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const response = await axios.get(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const titleMatch = response.data.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          title = titleMatch[1].replace(' - YouTube', '');
        }
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
       
        await ctx.replyWithPhoto(thumbnailUrl, {
          caption: `🎵 *VIDEO ENCONTRADO* 🎵\n\n📝 *Título:* ${title}\n🆔 *ID:* ${videoId}\n\n📥 *Elige formato para descargar:*`,
          parseMode: 'md',
          ...global.Markup.inlineKeyboard([
            [global.Markup.button.callback('🎵 MP3', `audio_${videoId}`), global.Markup.button.callback('🎥 MP4', `video_${videoId}`), global.Markup.button.callback('🎼 WAV', `wav_${videoId}`)],
            [global.Markup.button.callback('🎬 AVI', `avi_${videoId}`), global.Markup.button.callback('📹 MOV', `mov_${videoId}`), global.Markup.button.callback('🎞️ MKV', `mkv_${videoId}`)],
            [global.Markup.button.callback('🎧 FLAC', `flac_${videoId}`), global.Markup.button.callback('🎵 AAC', `aac_${videoId}`), global.Markup.button.callback('📽️ WEBM', `webm_${videoId}`)],
            [global.Markup.button.callback('🎥 3GP', `3gp_${videoId}`), global.Markup.button.callback('🎵 OGG', `ogg_${videoId}`), global.Markup.button.callback('🎥 M4V', `m4v_${videoId}`)]
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
      
      
      if (/^[1-4]$/.test(data)) {
        const formatMap = {
          '1': { name: 'Audio MP3', api: 'ytmp3', format: 'audio' },
          '2': { name: 'Video MP4', api: 'ytmp4', format: 'video' },
          '3': { name: 'Audio WAV', api: 'ytmp3', format: 'wav' },
          '4': { name: 'Video AVI', api: 'ytmp4', format: 'avi' }
        };
        
        const selectedFormat = formatMap[data];
        if (selectedFormat) {
         
          const simulatedData = `${selectedFormat.format}_${ctx.lastVideoId || 'default'}`;
          return this.callback(ctx, simulatedData);
        }
      }
      
      
      if (data.includes('_')) {
        const parts = data.split('_');
        ctx.lastVideoId = parts[1];
      }
      
      const formats = {
        'audio': { name: 'Audio MP3', api: 'ytmp3' },
        'video': { name: 'Video MP4', api: 'ytmp4' },
        'wav': { name: 'Audio WAV', api: 'ytmp3' },
        'avi': { name: 'Video AVI', api: 'ytmp4' },
        'mov': { name: 'Video MOV', api: 'ytmp4' },
        'mkv': { name: 'Video MKV', api: 'ytmp4' },
        'flac': { name: 'Audio FLAC', api: 'ytmp3' },
        'aac': { name: 'Audio AAC', api: 'ytmp3' },
        'webm': { name: 'Video WEBM', api: 'ytmp4' },
        '3gp': { name: 'Video 3GP', api: 'ytmp4' },
        'ogg': { name: 'Audio OGG', api: 'ytmp3' },
        'm4v': { name: 'Video M4V', api: 'ytmp4' }
      };
      
      let formatFound = null;
      let actualVideoId = null;
      
      for (const [format, info] of Object.entries(formats)) {
        if (data.startsWith(`${format}_`)) {
          formatFound = format;
          actualVideoId = data.replace(`${format}_`, '');
          ctx.lastVideoId = actualVideoId;
          break;
        }
      }
      
      if (formatFound && formats[formatFound]) {
        const formatInfo = formats[formatFound];
        
        await ctx.answerCallbackQuery({
          text: `⏳ *Preparando descarga de ${formatInfo.name}...*`,
          showAlert: true
        });

        const apiUrl = `${process.env.YOUTUBE_API_URL}/dl/${formatInfo.api}?url=https://youtu.be/${actualVideoId}&key=${process.env.YOUTUBE_API_KEY}`;
        
        const apiResponse = await axios.get(apiUrl);
        
        if (apiResponse.data.status && apiResponse.data.data) {
          const downloadUrl = apiResponse.data.data.dl;
          const fileName = apiResponse.data.data.fileName;
          
          const fileResponse = await axios.get(downloadUrl, {
            responseType: 'stream'
          });
          
          const filePath = path.join('./temp', fileName);
          const fileWriter = fs.createWriteStream(filePath);
          fileResponse.data.pipe(fileWriter);
          
          await new Promise((resolve, reject) => {
            fileWriter.on('finish', resolve);
            fileWriter.on('error', reject);
          });
          
       
          await ctx.client.sendFile(ctx.chatId, {
            file: filePath,
            caption: `✅ *${formatInfo.name} descargado*`,
            replyTo: ctx.message
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
