import ytdl from 'ytdl-core';
import axios from 'axios';

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
      let videoInfo;
      let videoId;

      if (query.includes('youtube.com/watch?v=')) {
        videoId = query.split('v=')[1]?.split('&')[0];
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      } else if (query.includes('youtu.be/')) {
        videoId = query.split('youtu.be/')[1]?.split('?')[0];
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
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
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      }

      if (!videoInfo) {
        return ctx.reply('❌ No se encontró el video');
      }

      const title = videoInfo.videoDetails.title;
      const duration = videoInfo.videoDetails.lengthSeconds;
      const thumbnail = videoInfo.videoDetails.thumbnails[0]?.url;

      const message = `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
⏱️ *Duración:* ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}
👁️ *Vistas:* ${parseInt(videoInfo.videoDetails.viewCount).toLocaleString()}

� *Enlaces de descarga:*
🎵 *Audio:* https://ytmp3.cc/youtube-to-mp3/${videoId}
🎥 *Video:* https://ytmp4.cc/youtube-to-mp4/${videoId}`;

      await ctx.client.sendFile(ctx.chatId, {
        file: thumbnail,
        caption: message,
        parseMode: 'markdown'
      });

    } catch (error) {
      console.error('Error en play:', error);
      await ctx.reply('❌ Error al buscar el video. Intenta con otro término.');
    }
  }
};
