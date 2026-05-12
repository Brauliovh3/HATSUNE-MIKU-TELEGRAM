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
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        
        await ctx.client.sendFile(ctx.chatId, {
          file: thumbnailUrl,
          caption: `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
🆔 *ID:* ${videoId}

📥 *Elige formato para descargar:*`,
          parseMode: 'markdown',
          buttons: [
            [
              {
                text: '🎵 Audio MP3',
                data: Buffer.from(`audio_${videoId}`)
              },
              {
                text: '🎥 Video MP4',
                data: Buffer.from(`video_${videoId}`)
              }
            ],
            [
              {
                text: '🎼 Audio WAV',
                data: Buffer.from(`wav_${videoId}`)
              },
              {
                text: '🎬 Video AVI',
                data: Buffer.from(`avi_${videoId}`)
              }
            ],
            [
              {
                text: '📹 Video MOV',
                data: Buffer.from(`mov_${videoId}`)
              },
              {
                text: '🎞️ Video MKV',
                data: Buffer.from(`mkv_${videoId}`)
              },
              {
                text: '🎧 Audio FLAC',
                data: Buffer.from(`flac_${videoId}`)
              },
              {
                text: '🎵 Audio AAC',
                data: Buffer.from(`aac_${videoId}`)
              }
            ],
            [
              {
                text: '📽️ Video WEBM',
                data: Buffer.from(`webm_${videoId}`)
              },
              {
                text: '🎥 Video 3GP',
                data: Buffer.from(`3gp_${videoId}`)
              },
              {
                text: '🎵 Audio OGG',
                data: Buffer.from(`ogg_${videoId}`)
              },
              {
                text: '🎥 Video M4V',
                data: Buffer.from(`m4v_${videoId}`)
              }
            ]
          ]
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
      const data = callbackData.toString();
      
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
          
          // Reply to original message
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
