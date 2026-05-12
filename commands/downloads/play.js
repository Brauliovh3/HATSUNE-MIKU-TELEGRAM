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
      return ctx.reply('🎵 *USO:* .play <título o URL de YouTube>\n📝 *Ejemplo:* .play Despacito');
    }

    const query = args.join(' ');
    const userId = ctx.senderId;
    const user = global.db.data?.users?.[userId];
    
    const cost = 10;
    if ((user?.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user?.coins || 0} 🌱 Cebollines`);
    }

    try {
      await ctx.reply('🔍 *Buscando en YouTube...*');

      let videoInfo;
      if (query.includes('youtube.com/watch?v=')) {
        const videoId = query.split('v=')[1]?.split('&')[0];
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      } else {
        videoInfo = await ytdl.getInfo(query);
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

🔘 *Selecciona formato:*
🎵 *Audio MP3* - 10 🌱 Cebollines
🎥 *Video MP4* - 15 🌱 Cebollines`;

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
