export default {
  command: ['slots', 'slot'],
  category: 'economia',
  description: 'Jugar a la máquina tragamonedas',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const bet = parseInt(args[0]) || 10;
    
    if (bet < 10) {
      return ctx.reply('❌ La apuesta mínima es de 10 🌱 Cebollines.\n💡 *Uso:* /slots <cantidad>\n📝 *Ejemplo:* /slots 50');
    }

    const availableCoins = user.coins || 0;
    
    if (bet > availableCoins) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines para apostar.\n💰 Tienes: ${availableCoins} 🌱 Cebollines\n🎰 Apuesta: ${bet} 🌱 Cebollines`);
    }

    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '💰', '🌟', '💙'];
    
    
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

  
    let winnings = 0;
    let result = '';

    if (reel1 === reel2 && reel2 === reel3) {
    
      if (reel1 === '7️⃣') {
        winnings = bet * 10;
        result = '🎊 ¡JACKPOT! 🎊';
      } else if (reel1 === '💎') {
        winnings = bet * 8;
        result = '💎 ¡DIAMANTES! 💎';
      } else if (reel1 === '💰') {
        winnings = bet * 6;
        result = '💰 ¡RICO! 💰';
      } else if (reel1 === '💙') {
        winnings = bet * 5;
        result = '💙 ¡MIKU! 💙';
      } else {
        winnings = bet * 3;
        result = '🎉 ¡TRIPLE! 🎉';
      }
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      
      winnings = bet * 2;
      result = '✨ ¡DOBLE! ✨';
    } else {
      
      winnings = 0;
      result = '😔 Sin premio...';
    }

    user.coins = availableCoins - bet + winnings;
    user.usedcommands = (user.usedcommands || 0) + 1;

    const message = `🎰 *MÁQUINA TRAGAMONEDAS* 🎰

💰 *Apuesta:* ${bet} 🌱 Cebollines
🎰 *Tirada:* [ ${reel1} | ${reel2} | ${reel3} ]

${result}

${winnings > 0 ? `🏆 *Ganancias:* +${winnings} 🌱 Cebollines` : '❌ *Perdiste:* -' + bet + ' 🌱 Cebollines'}

💳 *Tu saldo:* ${user.coins} 🌱 Cebollines

🎲 *¡Vuelve a jugar! Usa /slots <cantidad>*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
