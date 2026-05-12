import axios from 'axios';

export default {
  command: ['mediafire', 'mf'],
  category: 'downloads',
  description: 'Descargar archivos de MediaFire',
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply('📁 *USO:* /mediafire <URL de MediaFire>\n📝 *Ejemplo:* /mediafire https://www.mediafire.com/file/...');
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
    
    
    const cost = 15;
    if ((user?.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user?.coins || 0} 🌱 Cebollines`);
    }

    if (!url.includes('mediafire.com')) {
      return ctx.reply('❌ Por favor proporciona una URL válida de MediaFire');
    }

    try {
      await ctx.reply('⏳ *Procesando archivo de MediaFire...*');

      
      const fileId = url.match(/\/file\/([a-zA-Z0-9]+)/)?.[1];
      if (!fileId) {
        return ctx.reply('❌ URL de MediaFire no válida');
      }

      
      const apiUrl = `https://api.mediafiredl.com/download/${fileId}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const data = response.data;
      
      if (!data || !data.download_url) {
        return ctx.reply('❌ No se pudo obtener el enlace de descarga. El archivo puede haber sido eliminado.');
      }

      // Descontar monedas
      user.coins = (user.coins || 0) - cost;
      user.usedcommands = (user.usedcommands || 0) + 1;

      const message = `📁 *ARCHIVO ENCONTRADO* 📁

📝 *Nombre:* ${data.filename || 'Archivo MediaFire'}
📦 *Tamaño:* ${data.filesize || 'Desconocido'}
🔗 *Descarga:* ${data.download_url}

💰 Costo: ${cost} 🌱 Cebollines
📊 Tus Cebollines: ${user.coins} 🌱 Cebollines

⚠️ *Nota:* Para archivos muy grandes, es posible que no se puedan enviar directamente por Telegram. Usa el enlace de descarga.`;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.url('📥 DESCARGAR DIRECTO', data.download_url)
          ]
        ])
      });

    } catch (error) {
      console.error('Error en mediafire:', error);
      await ctx.reply('❌ Error al procesar el archivo. Intenta con otra URL más tarde.');
    }
  }
};
