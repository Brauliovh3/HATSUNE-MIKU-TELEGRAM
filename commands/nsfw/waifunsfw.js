import axios from 'axios';

export default {
  command: ['waifunsfw', 'calata'],
  category: 'nsfw',
  description: 'Obtener waifu NSFW',
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

 
    const cost = 20;
    if ((user.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user.coins || 0} 🌱 Cebollines`);
    }

    try {
      await ctx.reply('🔍 *Buscando waifu NSFW...*');

      
      const tags = ['waifu', 'nsfw', 'ecchi', 'lewd'];
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      
      const apiUrl = `https://api.waifu.im/search/?included_tags=${randomTag}&is_nsfw=true`;
      
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      const data = response.data;
      
      if (!data || !data.images || data.images.length === 0) {
        return ctx.reply('❌ No se encontró ninguna imagen. Intenta nuevamente.');
      }

      const image = data.images[0];
      const imageUrl = image.url;

      user.coins = (user.coins || 0) - cost;
      user.usedcommands = (user.usedcommands || 0) + 1;

      
      await ctx.replyWithPhoto(imageUrl, {
        caption: `🔞 *WAIFU NSFW* 🔞\n\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Disfruta responsablemente 💙`,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error en waifunsfw:', error);
      
  
      try {
        const fallbackUrl = 'https://api.nekos.life/api/v2/img/nsfw_neko';
        const fallbackResponse = await axios.get(fallbackUrl, { timeout: 10000 });
        
        if (fallbackResponse.data && fallbackResponse.data.url) {
          user.coins = (user.coins || 0) - cost;
          user.usedcommands = (user.usedcommands || 0) + 1;

          await ctx.replyWithPhoto(fallbackResponse.data.url, {
            caption: `🔞 *WAIFU NSFW* 🔞\n\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Disfruta responsablemente 💙`,
            parse_mode: 'Markdown'
          });
        } else {
          throw new Error('No se encontró imagen');
        }
      } catch (fallbackError) {
        console.error('Error en método alternativo:', fallbackError);
        await ctx.reply('❌ Error al obtener la imagen. Intenta nuevamente más tarde.');
      }
    }
  }
};
