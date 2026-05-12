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
      return ctx.reply('🎵 *USO:* .play <URL de YouTube>\n📝 *Ejemplo:* .play https://youtube.com/watch?v=...');
    }

    const query = args.join(' ');

    try {
      await ctx.reply('🔍 *Procesando video...*');

      let videoInfo;
      if (query.includes('youtube.com/watch?v=')) {
        const videoId = query.split('v=')[1]?.split('&')[0];
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      } else if (query.includes('youtu.be/')) {
        const videoId = query.split('youtu.be/')[1]?.split('?')[0];
        videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      } else {
        return ctx.reply('❌ *Por favor usa una URL directa de YouTube*\n📝 *Ejemplo:* .play https://youtube.com/watch?v=...');
      }

      if (!videoInfo) {
        return ctx.reply('❌ No se encontró el video');
      }

      const title = videoInfo.videoDetails.title;
      const duration = videoInfo.videoDetails.lengthSeconds;
      const thumbnail = videoInfo.videoDetails.thumbnails[0]?.url;
      const videoId = videoInfo.videoDetails.videoId;

      const message = `🎵 *VIDEO ENCONTRADO* 🎵

📝 *Título:* ${title}
⏱️ *Duración:* ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}
👁️ *Vistas:* ${parseInt(videoInfo.videoDetails.viewCount).toLocaleString()}

🔘 *Selecciona formato para descargar:*`;

      await ctx.client.sendFile(ctx.chatId, {
        file: thumbnail,
        caption: message,
        parseMode: 'markdown'
      });

    
      await ctx.reply({
        message: '📥 *Elige formato de descarga:*',
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

    } catch (error) {
      console.error('Error en play:', error);
      await ctx.reply('❌ Error al procesar el video. Asegúrate de que la URL sea correcta.');
    }
  }
};
