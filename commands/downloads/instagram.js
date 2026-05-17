import axios from 'axios';

export default {
  command: ['instagram', 'ig'],
  category: 'downloads',
  description: 'Descargar posts de Instagram',
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('📷 **USO:** /instagram <URL de Instagram>\n📝 **Ejemplo:** /instagram https://www.instagram.com/p/...');
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

    if (!url.includes('instagram.com')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de Instagram');
    }

    try {
      await ctx.reply('⏳ **Procesando post de Instagram...**');

    
      const apiUrl = `https://api.instagramdownloader.com/download?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      
      if (!data || (!data.video_url && !data.image_url)) {
        return ctx.reply('❌ No se pudo descargar el post. Intenta con otra URL.');
      }

 
      user.coins = (user.coins || 0) - cost;
      user.usedcommands = (user.usedcommands || 0) + 1;

     
      if (data.video_url) {
      
        const videoResponse = await axios.get(data.video_url, {
          responseType: 'stream',
          timeout: 30000
        });

        await ctx.replyWithVideo({ 
          source: videoResponse.data 
        }, {
          caption: `✨ **INSTAGRAM DOWNLOAD** ✨\n\n💰 **Costo:** ${cost} ${process.env.CURRENCY || 'Coins'}\n📊 **Saldo:** ${user.coins} ${process.env.CURRENCY || 'Coins'}\n\n💙 **Hatsune Miku Bot**`,
          parseMode: 'markdown'
        });
      } else if (data.image_url) {
         const imageResponse = await axios.get(data.image_url, {
          responseType: 'stream',
          timeout: 30000
        });

        await ctx.replyWithPhoto({ 
          source: imageResponse.data 
        }, {
          caption: `✨ **INSTAGRAM DOWNLOAD** ✨\n\n💰 **Costo:** ${cost} ${process.env.CURRENCY || 'Coins'}\n📊 **Saldo:** ${user.coins} ${process.env.CURRENCY || 'Coins'}\n\n💙 **Hatsune Miku Bot**`,
          parseMode: 'markdown'
        });
      }

    } catch (error) {
      console.error('Error en instagram:', error);
      await ctx.reply('❌ Error al descargar el post. Intenta con otra URL más tarde.');
    }
  }
};
