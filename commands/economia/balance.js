export default {
  command: ['balance', 'bal'],
  category: 'economia',
  description: 'Ver tu balance de monedas',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const coins = user.coins || 0;
    const bank = user.bank || 0;
    const total = coins + bank;
    const level = user.level || 0;
    const exp = user.exp || 0;
    const expNeeded = level * 1000;

    const message = `💰 *TU BALANCE ECONÓMICO* 💰

👤 *Usuario:* ${user.name || 'Desconocido'}
💳 *Billetera:* ${coins.toLocaleString()} 🌱 Cebollines
🏦 *Banco:* ${bank.toLocaleString()} 🌱 Cebollines
💎 *Total:* ${total.toLocaleString()} 🌱 Cebollines

📊 *NIVEL Y EXPERIENCIA*
⭐ *Nivel:* ${level}
📈 *EXP:* ${exp}/${expNeeded}
🎯 *Progreso:* ${Math.min((exp / expNeeded) * 100, 100).toFixed(1)}%

💡 *Consejos:*
• Usa /work para ganar más monedas
• Usa /deposit para guardar en el banco
• Usa /withdraw para retirar del banco`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
