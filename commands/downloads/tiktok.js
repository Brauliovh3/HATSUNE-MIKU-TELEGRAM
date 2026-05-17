import axios from 'axios';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloads',
  description: 'Descargar videos de TikTok',
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('📱 **USO:** /tiktok <URL de TikTok>\n📝 **Ejemplo:** /tiktok https://vm.tiktok.com/...');
    }

    const url = args[0];
    const userId = ctx.senderId;
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[userId]) global.db.data.users[userId] = { coins: 0, usedcommands: 0 };
    
    const user = global.db.data.users[userId];

    if (!url.includes('tiktok.com')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de TikTok');
    }

    try {
      await ctx.reply('⏳ **Procesando video de TikTok...**');

     
      const apiUrl = `https://api.alyacore.xyz/dl/tiktok?url=${encodeURIComponent(url)}&key=DEPOOL-key60015091`;
      
      const response = await axios.get(apiUrl, {
        timeout: 30000
      });

      const res = response.data;
      
      if (!res || !res.status || !res.data || !res.data.dl) {
        return ctx.reply('❌ No se pudo descargar el video. Verifica el enlace o intenta con otra URL.');
      }

      const videoData = res.data;
      user.usedcommands = (user.usedcommands || 0) + 1;

      
      const videoResponse = await axios.get(videoData.dl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const caption = `✨ **TIKTOK DOWNLOAD** ✨\n\n` +
                      `📝 **Título:** ${videoData.title || 'Sin título'}\n` +
                      `👤 **Autor:** ${videoData.author?.nickname || 'Desconocido'}\n` +
                      `❤️ **Likes:** ${videoData.stats?.likes?.toLocaleString() || '0'}\n` +
                      `💬 **Comentarios:** ${videoData.stats?.comments?.toLocaleString() || '0'}\n` +
                      `🚀 **Compartidos:** ${videoData.stats?.shares?.toLocaleString() || '0'}\n\n` +
                      `💙 **Hatsune Miku Bot**`;

      await ctx.replyWithVideo({ 
        source: Buffer.from(videoResponse.data) 
      }, {
        mimeType: 'video/mp4',
        fileName: 'tiktok_video.mp4',
        supportsStreaming: true,
        caption: caption,
        parseMode: 'markdown'
      });

    } catch (error) {
      console.error('Error en tiktok:', error);
      await ctx.reply('❌ Error al descargar el video. Intenta con otra URL más tarde.');
    }
  }
};
