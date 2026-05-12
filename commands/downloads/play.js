import ytdl from 'ytdl-core';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
      let duration = 0;
      let views = 0;
      let thumbnailUrl = '';

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
       
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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

📥 *Enlaces de descarga:*
🎵 *Audio:* https://ytmp3.cc/youtube-to-mp3/${videoId}
🎥 *Video:* https://ytmp4.cc/youtube-to-mp4/${videoId}`;

        await ctx.client.sendFile(ctx.chatId, {
          file: thumbnailPath,
          caption: message,
          parseMode: 'markdown'
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

📥 *Enlaces de descarga:*
🎵 *Audio:* https://ytmp3.cc/youtube-to-mp3/${videoId}
🎥 *Video:* https://ytmp4.cc/youtube-to-mp4/${videoId}`;

        await ctx.reply(message, { parseMode: 'markdown' });
      }

    } catch (error) {
      console.error('Error en play:', error);
      await ctx.reply('❌ Error al buscar el video. Intenta con otro término.');
    }
  }
};
