export default {
  command: ['deposit'],
  category: 'economia',
  description: 'Depositar monedas en el banco',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const amount = parseInt(args[0]) || 0;
    
    if (amount <= 0) {
      return ctx.reply('❌ Debes especificar una cantidad válida para depositar.\n💡 *Uso:* /deposit <cantidad>\n📝 *Ejemplo:* /deposit 100');
    }

    const availableCoins = user.coins || 0;
    
    if (amount > availableCoins) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines para depositar.\n💰 Tienes: ${availableCoins} 🌱 Cebollines\n🏦 Intentas depositar: ${amount} 🌱 Cebollines`);
    }

    
    user.coins = availableCoins - amount;
    user.bank = (user.bank || 0) + amount;
    user.usedcommands = (user.usedcommands || 0) + 1;

    const message = `🏦 *DEPÓSITO EXITOSO* 🏦

💰 *Cantidad depositada:* ${amount} 🌱 Cebollines
💳 *Tu billetera:* ${user.coins} 🌱 Cebollines
🏦 *Tu banco:* ${user.bank} 🌱 Cebollines
💎 *Total:* ${(user.coins + user.bank)} 🌱 Cebollines

✅ ¡Dinero seguro en el banco!
🔒 *Tu dinero está protegido en el banco*

💡 *Usa /withdraw para retirar dinero del banco*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
