export default {
  command: ['profile'],
  category: 'profile',
  description: 'Ver tu perfil completo',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const name = user.name || ctx.from.first_name || 'Desconocido';
    const username = user.username || ctx.from.username || 'No definido';
    const level = user.level || 0;
    const exp = user.exp || 0;
    const expNeeded = level * 1000;
    const coins = user.coins || 0;
    const bank = user.bank || 0;
    const genre = user.genre || 'No definido';
    const birth = user.birth || 'No definida';
    const description = user.description || 'Sin descripción';
    const pasatiempo = user.pasatiempo || 'Sin hobby';
    const marry = user.marry || 'Soltero/a';
    const usedCommands = user.usedcommands || 0;
    const waifus = user.waifu?.characters?.length || 0;

    const message = `👤 *PERFIL COMPLETO* 👤

📝 *INFORMACIÓN BÁSICA*
👤 *Nombre:* ${name}
🏷️ *Username:* @${username}
⚥ *Género:* ${genre}
🎂 *Fecha de Nacimiento:* ${birth}
💍 *Estado Civil:* ${marry}

📄 *DESCRIPCIÓN PERSONAL*
📝 *Descripción:* ${description}
🎮 *Hobby:* ${pasatiempo}

💰 *ECONOMÍA*
💳 *Billetera:* ${coins.toLocaleString()} 🌱 Cebollines
🏦 *Banco:* ${bank.toLocaleString()} 🌱 Cebollines
💎 *Total:* ${(coins + bank).toLocaleString()} 🌱 Cebollines

📊 *ESTADÍSTICAS*
⭐ *Nivel:* ${level}
📈 *EXP:* ${exp}/${expNeeded} (${Math.min((exp / expNeeded) * 100, 100).toFixed(1)}%)
🎯 *Comandos Usados:* ${usedCommands}
🎌 *Waifus:* ${waifus} personajes

💡 *COMANDOS ÚTILES*
• /setgenre - Cambiar género
• /setbirth - Cambiar fecha de nacimiento
• /setdesc - Cambiar descripción
• /sethobby - Cambiar hobby
• /marry - Casarse con alguien`;

    await ctx.replyWithPhoto('https://i.pinimg.com/736x/cf/4f/bd/cf4fbdccb346330efd7f02c60f52c6d0.jpg', {
      caption: message,
      parse_mode: 'Markdown'
    });
  }
};
