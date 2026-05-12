export default {
  command: ['withdraw'],
  category: 'economia',
  description: 'Retirar monedas del banco',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const amount = parseInt(args[0]) || 0;
    
    if (amount <= 0) {
      return ctx.reply('❌ Debes especificar una cantidad válida para retirar.\n💡 *Uso:* /withdraw <cantidad>\n📝 *Ejemplo:* /withdraw 100');
    }

    const availableBank = user.bank || 0;
    
    if (amount > availableBank) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines en el banco.\n🏦 Tienes en banco: ${availableBank} 🌱 Cebollines\n💰 Intentas retirar: ${amount} 🌱 Cebollines`);
    }

   
    user.bank = availableBank - amount;
    user.coins = (user.coins || 0) + amount;
    user.usedcommands = (user.usedcommands || 0) + 1;

    const message = `💰 *RETIRO EXITOSO* 💰

💰 *Cantidad retirada:* ${amount} 🌱 Cebollines
💳 *Tu billetera:* ${user.coins} 🌱 Cebollines
🏦 *Tu banco:* ${user.bank} 🌱 Cebollines
💎 *Total:* ${(user.coins + user.bank)} 🌱 Cebollines

✅ ¡Dinero retirado del banco!
💸 *Ahora puedes usar tus cebollines*

💡 *Usa /deposit para guardar dinero en el banco*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
