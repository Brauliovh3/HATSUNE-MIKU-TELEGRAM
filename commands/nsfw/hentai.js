import axios from 'axios';

export default {
  command: ['hentai'],
  category: 'nsfw',
  description: 'Obtener imágenes hentai',
  isNSFW: true,
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    
    if (!user.verified18) {
      return ctx.reply('🔞 *VERIFICACIÓN REQUERIDA* 🔞\n\nEste contenido es exclusivo para mayores de 18 años.\n\n💡 Usa /verify18 para verificar tu edad');
    }

    
    if (ctx.message.chat.type.includes('group')) {
      const chatId = ctx.chat.id.toString();
      const chat = global.db.data.chats[chatId] || {};
      
      if (!chat.nsfw) {
        return ctx.reply('🔞 *CONTENIDO NSFW DESACTIVADO* 🔞\n\nEl contenido +18 está desactivado en este grupo.\n\n💡 Un administrador puede activarlo con: /enable nsfw');
      }
    }

    
    const cost = 25;
    if ((user.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user.coins || 0} 🌱 Cebollines`);
    }

    try {
      await ctx.reply('🔍 *Buscando contenido hentai...*');

      
      const categories = ['hentai', 'anal', 'pussy', 'boobs', 'ass'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const apiUrl = `https://api.nekos.life/api/v2/img/${randomCategory}`;
      
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      const data = response.data;
      
      if (!data || !data.url) {
        return ctx.reply('❌ No se encontró ninguna imagen. Intenta nuevamente.');
      }

     
      user.coins = (user.coins || 0) - cost;
      user.usedcommands = (user.usedcommands || 0) + 1;

      
      await ctx.replyWithPhoto(data.url, {
        caption: `🔞 *HENTAI* 🔞\n\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Disfruta responsablemente 💙`,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error en hentai:', error);
      await ctx.reply('❌ Error al obtener la imagen. Intenta nuevamente más tarde.');
    }
  }
};
