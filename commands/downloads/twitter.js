import axios from 'axios';

export default {
  command: ['twitter', 'x', 'tw'],
  category: 'downloads',
  description: 'Descargar videos/imagenes de Twitter/X',
  middlewares: [],
  cooldown: 5,
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('🐦 **USO:** .twitter <URL de Twitter/X>\n📝 **Ejemplo:** .twitter https://twitter.com/user/status/...');
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
    
    const cost = 6;
    if ((user?.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user?.coins || 0} 🌱 Cebollines`);
    }

    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de Twitter/X');
    }

    try {
      await ctx.reply('⏳ **Procesando contenido de Twitter/X...**');

      const apiUrl = `https://api.twitterdownloader.com/download?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      
      if (!data || (!data.videos && !data.images)) {
        return ctx.reply('❌ No se pudo descargar el contenido. Intenta con otra URL.');
      }

      // Descontar monedas
      user.coins = (user.coins || 0) - cost;
      if (!global.db.data.users[userId]) {
        global.db.data.users[userId] = user;
      }

      if (data.videos && data.videos.length > 0) {
        // Enviar video
        const videoUrl = data.videos[0].url; // Tomar el primer video
        const videoResponse = await axios.get(videoUrl, {
          responseType: 'stream',
          timeout: 30000
        });

        await ctx.client.sendFile(ctx.chatId, {
          file: videoResponse.data,
          caption: `✨ **TWITTER/X DOWNLOAD** ✨\n\n💰 **Costo:** ${cost} ${process.env.CURRENCY || 'Coins'}\n📊 **Saldo:** ${user.coins} ${process.env.CURRENCY || 'Coins'}\n\n💙 **Hatsune Miku Bot**`,
          parseMode: 'markdown'
        });
      } else if (data.images && data.images.length > 0) {
        // Enviar imágenes
        for (let i = 0; i < Math.min(data.images.length, 5); i++) {
          const imageUrl = data.images[i];
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'stream',
            timeout: 30000
          });

          await ctx.client.sendFile(ctx.chatId, {
            file: imageResponse.data,
            caption: i === 0 ? `✨ **TWITTER/X DOWNLOAD** ✨\n\n💰 **Costo:** ${cost} ${process.env.CURRENCY || 'Coins'}\n📊 **Saldo:** ${user.coins} ${process.env.CURRENCY || 'Coins'}\n\n💙 **Hatsune Miku Bot**` : null,
            parseMode: 'markdown'
          });
        }
      }

    } catch (error) {
      console.error('Error en twitter:', error);
      await ctx.reply('❌ Error al descargar el contenido. Intenta con otra URL más tarde.');
    }
  }
};
