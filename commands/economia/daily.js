export default {
  command: ['daily'],
  category: 'economia',
  description: 'Reclamar recompensa diaria',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const now = Date.now();
    const lastDaily = user.lastDaily || 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 horas

    if (now - lastDaily < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastDaily)) / (1000 * 60 * 60));
      return ctx.reply(`⏳ Ya reclamaste tu recompensa diaria.\n⏰ Vuelve en ${remaining} horas para reclamar nuevamente.`);
    }

    // Calcular recompensa basada en nivel
    const level = user.level || 0;
    const baseReward = 50;
    const levelBonus = level * 5;
    const totalReward = baseReward + levelBonus;

    // Bonus aleatorio
    const bonusChance = Math.random();
    let bonus = 0;
    let bonusText = '';

    if (bonusChance < 0.1) { // 10%
      bonus = Math.floor(totalReward * 0.5); // 50% extra
      bonusText = '\n🎉 ¡BONUS DE SUERTE! +' + bonus + ' 🌱 Cebollines';
    } else if (bonusChance < 0.25) { // 15%
      bonus = Math.floor(totalReward * 0.25); // 25% extra
      bonusText = '\n✨ ¡BONUS PEQUEÑO! +' + bonus + ' 🌱 Cebollines';
    }

    const finalReward = totalReward + bonus;

    // Actualizar usuario
    user.coins = (user.coins || 0) + finalReward;
    user.lastDaily = now;
    user.usedcommands = (user.usedcommands || 0) + 1;
    user.exp = (user.exp || 0) + 10;

    const message = `🎁 *RECOMPENSA DIARIA* 🎁

🌅 ¡Buenos días, ${user.name || ctx.from.first_name}!
💰 *Recompensa base:* ${baseReward} 🌱 Cebollines
⭐ *Bonus por nivel:* +${levelBonus} 🌱 Cebollines
🎯 *Total:* +${finalReward} 🌱 Cebollines${bonusText}

💳 *Tu saldo:* ${user.coins} 🌱 Cebollines
⭐ *EXP ganado:* +10 XP

💡 *No olvides reclamar mañana!*
🎮 *Usa /work para ganar más monedas*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
