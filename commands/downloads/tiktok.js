import axios from 'axios';
import fs from 'fs';
import path from 'path';

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

      const tempPath = path.join('./temp', `tiktok_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempPath);

      const videoResponse = await axios.get(videoData.dl, {
        responseType: 'stream',
        timeout: 30000
      });

      videoResponse.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const caption = `✨ **TIKTOK DOWNLOAD** ✨\n\n` +
                      `📝 **Título:** ${videoData.title || 'Sin título'}\n` +
                      `👤 **Autor:** ${videoData.author?.nickname || 'Desconocido'}\n` +
                      `❤️ **Likes:** ${videoData.stats?.likes?.toLocaleString() || '0'}\n` +
                      `💬 **Comentarios:** ${videoData.stats?.comments?.toLocaleString() || '0'}\n` +
                      `🚀 **Compartidos:** ${videoData.stats?.shares?.toLocaleString() || '0'}\n\n` +
                      `💙 **Hatsune Miku Bot**`;

      await ctx.replyWithVideo(tempPath, {
        mimeType: 'video/mp4',
        fileName: 'tiktok.mp4',
        supportsStreaming: true,
        caption: caption,
        parseMode: 'markdown'
      });

      
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (err) {
        console.error('Error al eliminar temporal:', err);
      }

    } catch (error) {
      console.error('Error en tiktok:', error);
      await ctx.reply('❌ Error al descargar el video. Intenta con otra URL más tarde.');
    }
  }
};
