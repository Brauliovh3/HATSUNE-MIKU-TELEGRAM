import axios from 'axios';

export default {
  command: ['facebook', 'fb'],
  category: 'downloads',
  description: 'Descargar videos de Facebook',
  middlewares: [],
  cooldown: 5,
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('📘 *USO:* .facebook <URL de Facebook>\n📝 *Ejemplo:* .facebook https://www.facebook.com/watch/...');
    }

    const url = args[0];
    const userId = ctx.senderId;
    
    // Ensure database is initialized
    if (!global.db.data) {
      global.db.data = { users: {}, chats: {}, settings: {}, cooldowns: {} };
    }
    if (!global.db.data.users) {
      global.db.data.users = {};
    }
    
    const user = global.db.data.users[userId] || { coins: 0 };
    
    const cost = 8;
    if ((user?.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user?.coins || 0} 🌱 Cebollines`);
    }

    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de Facebook');
    }

    try {
      await ctx.reply('⏳ *Procesando video de Facebook...*');

      const apiUrl = `https://api.facebookdownloader.com/download?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      
      if (!data || (!data.hd_url && !data.sd_url)) {
        return ctx.reply('❌ No se pudo descargar el video. Intenta con otra URL.');
      }

      // Descontar monedas
      user.coins = (user.coins || 0) - cost;
      if (!global.db.data.users[userId]) {
        global.db.data.users[userId] = user;
      }

      const videoUrl = data.hd_url || data.sd_url;
      const quality = data.hd_url ? 'HD' : 'SD';

      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 30000
      });

      await ctx.client.sendFile(ctx.chatId, {
        file: videoResponse.data,
        caption: `📘 *Facebook Descargado* 📘\n\n🎥 *Calidad:* ${quality}\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Descargado por Hatsune Miku Bot`,
        parseMode: 'markdown'
      });

    } catch (error) {
      console.error('Error en facebook:', error);
      await ctx.reply('❌ Error al descargar el video. Intenta con otra URL más tarde.');
    }
  }
};
