import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
  command: ['play'],
  category: 'downloads',
  description: 'Descargar música o video de YouTube',
  middlewares: [],
  cooldown: 5,
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('🎵 *USO:* .play <título o URL de YouTube>\n📝 *Ejemplo:* .play Despacito\n📝 *Ejemplo:* .play https://youtube.com/watch?v=...');
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
        await ctx.reply('🔍 *Buscando en YouTube...*');
        
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
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const thumbnailPath = path.join('./temp', `thumb_${videoId}.jpg`);
        
        const thumbnailResponse = await axios.get(thumbnailUrl, {
          responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(thumbnailPath);
        thumbnailResponse.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        const message = `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
🆔 *ID:* ${videoId}

📥 *Elige formato para descargar:*`;

        await ctx.client.sendFile(ctx.chatId, {
          file: thumbnailPath,
          caption: message,
          parseMode: 'markdown'
        });

        
        await ctx.reply({
          message: '📥 *Selecciona el formato:*',
          parseMode: 'markdown',
          replyMarkup: {
            inlineKeyboard: [
              [
                { text: '🎵 Descargar Audio MP3', callbackData: `download_audio_${videoId}` }
              ],
              [
                { text: '🎥 Descargar Video MP4', callbackData: `download_video_${videoId}` }
              ]
            ]
          }
        });
        
        setTimeout(() => {
          try {
            fs.unlinkSync(thumbnailPath);
          } catch (e) {
            
          }
        }, 5000);
        
      } catch (infoError) {
        const message = `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
🆔 *ID:* ${videoId}

📥 *Elige formato para descargar:*`;

        await ctx.reply({
          message: message,
          parseMode: 'markdown',
          replyMarkup: {
            inlineKeyboard: [
              [
                { text: '🎵 Descargar Audio MP3', callbackData: `download_audio_${videoId}` }
              ],
              [
                { text: '🎥 Descargar Video MP4', callbackData: `download_video_${videoId}` }
              ]
            ]
          }
        });
      }

    } catch (error) {
      console.error('Error en play:', error);
      await ctx.reply('❌ Error al buscar el video. Intenta con otro término.');
    }
  },

  async callback(ctx, callbackData) {
    try {
      const [action, videoId] = callbackData.split('_');
      
      if (action === 'download' && (videoId.startsWith('audio') || videoId.startsWith('video'))) {
        const [format, actualVideoId] = videoId.split('_');
        
        await ctx.answerCallbackQuery({
          text: `⏳ *Preparando descarga de ${format === 'audio' ? 'Audio MP3' : 'Video MP4'}...*`,
          showAlert: true
        });

      
        const apiUrl = format === 'audio' 
          ? `${process.env.YOUTUBE_API_URL}/dl/ytmp3?url=https://youtu.be/${actualVideoId}&key=${process.env.YOUTUBE_API_KEY}`
          : `${process.env.YOUTUBE_API_URL}/dl/ytmp4?url=https://youtu.be/${actualVideoId}&key=${process.env.YOUTUBE_API_KEY}`;

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
            caption: `✅ *${format === 'audio' ? 'Audio MP3' : 'Video MP4'} descargado*`
          });
          
         
          setTimeout(() => {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              
            }
          }, 5000);
          
        } else {
          await ctx.answerCallbackQuery({
            text: '❌ Error al obtener enlace de descarga',
            showAlert: true
          });
        }
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
