import axios from 'axios';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloads',
  description: 'Descargar videos de TikTok',
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('📱 *USO:* /tiktok <URL de TikTok>\n📝 *Ejemplo:* /tiktok https://vm.tiktok.com/...');
    }

    const url = args[0];
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    
    const cost = 5;
    if ((user?.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user?.coins || 0} 🌱 Cebollines`);
    }

    if (!url.includes('tiktok.com')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de TikTok');
    }

    try {
      await ctx.reply('⏳ *Procesando video de TikTok...*');

      
      const apiUrl = `https://api.tiktokdownload.com/api/download?url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      
      if (!data || !data.video_url) {
        return ctx.reply('❌ No se pudo descargar el video. Intenta con otra URL.');
      }

   
      user.coins = (user.coins || 0) - cost;
      user.usedcommands = (user.usedcommands || 0) + 1;

    
      const videoResponse = await axios.get(data.video_url, {
        responseType: 'stream',
        timeout: 30000
      });

      await ctx.replyWithVideo({ 
        source: videoResponse.data 
      }, {
        caption: `📱 *TikTok Descargado* 📱\n\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Descargado por Hatsune Miku Bot`,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error en tiktok:', error);
      
   
      try {
        await ctx.reply('⏳ *Intentando método alternativo...*');
      
        const altApiUrl = `https://tikmate.online/download?url=${encodeURIComponent(url)}`;
        const altResponse = await axios.get(altApiUrl, { timeout: 30000 });
        
        if (altResponse.data && altResponse.data.video_url) {
          user.coins = (user.coins || 0) - cost;
          user.usedcommands = (user.usedcommands || 0) + 1;
          
          const videoResponse = await axios.get(altResponse.data.video_url, {
            responseType: 'stream',
            timeout: 30000
          });

          await ctx.replyWithVideo({ 
            source: videoResponse.data 
          }, {
            caption: `📱 *TikTok Descargado* 📱\n\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tus Cebollines: ${user.coins} 🌱 Cebollines\n\n💙 Descargado por Hatsune Miku Bot`,
            parse_mode: 'Markdown'
          });
        } else {
          throw new Error('No se encontró video');
        }
      } catch (altError) {
        console.error('Error en método alternativo:', altError);
        await ctx.reply('❌ Error al descargar el video. Intenta con otra URL más tarde.');
      }
    }
  }
};
