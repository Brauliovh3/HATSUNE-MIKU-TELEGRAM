export default {
  command: ['comprar', 'buy'],
  category: 'economia',
  description: 'Comprar artículos de la tienda',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    const itemNumber = parseInt(args[0]) || 0;
    
    if (itemNumber <= 0) {
      return ctx.reply('❌ Debes especificar un número de artículo válido.\n💡 *Uso:* /comprar <número>\n📝 *Ejemplo:* /comprar 1\n🛍️ Usa /shop para ver la tienda');
    }

    const coins = user.coins || 0;
    const level = user.level || 0;

    const shopItems = [
      { id: 'work_boost', name: '💪 Boost de Trabajo x2', price: 100, description: 'Duplica ganancias por 1 hora', level: 0 },
      { id: 'gacha_discount', name: '🎯 Descuento Gacha 50%', price: 50, description: 'Mitad de precio en próxima invocación', level: 0 },
      { id: 'exp_boost', name: '⭐ Boost EXP x3', price: 150, description: 'Triple EXP por 30 minutos', level: 5 },
      { id: 'lucky_charm', name: '🍀 Amuleto de Suerte', price: 200, description: 'Mejora rareza en gacha por 5 invocaciones', level: 10 },
      { id: 'premium_pack', name: '💎 Pack Premium', price: 500, description: '5 invocaciones garantizadas raras+', level: 15 },
      { id: 'mystery_box', name: '📦 Caja Misteriosa', price: 300, description: 'Premio aleatorio especial', level: 0 }
    ];

    if (itemNumber > shopItems.length) {
      return ctx.reply(`❌ Ese artículo no existe. Hay ${shopItems.length} artículos disponibles.\n🛍️ Usa /shop para ver la tienda`);
    }

    const item = shopItems[itemNumber - 1];

    if (coins < item.price) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines.\n💰 Necesitas: ${item.price} 🌱 Cebollines\n📊 Tienes: ${coins} 🌱 Cebollines`);
    }

    if (level < item.level) {
      return ctx.reply(`❌ No tienes el nivel suficiente.\n⭐ Necesitas: Nivel ${item.level}\n📊 Tienes: Nivel ${level}`);
    }


    user.coins = coins - item.price;
    user.usedcommands = (user.usedcommands || 0) + 1;

    
    if (!user.inventory) user.inventory = {};
  
    let effectMessage = '';
    switch (item.id) {
      case 'work_boost':
        user.workBoost = Date.now() + (60 * 60 * 1000); 
        effectMessage = '\n✅ *Boost de Trabajo activado por 1 hora!*';
        break;
      case 'gacha_discount':
        user.gachaDiscount = true;
        effectMessage = '\n✅ *Descuento Gacha aplicado a próxima invocación!*';
        break;
      case 'exp_boost':
        user.expBoost = Date.now() + (30 * 60 * 1000); 
        effectMessage = '\n✅ *Boost EXP activado por 30 minutos!*';
        break;
      case 'lucky_charm':
        user.luckyCharm = 5;
        effectMessage = '\n✅ *Amuleto de Suerte activado por 5 invocaciones!*';
        break;
      case 'premium_pack':
        user.inventory.premiumPack = (user.inventory.premiumPack || 0) + 5;
        effectMessage = '\n✅ *Pack Premium añadido a tu inventario!*';
        break;
      case 'mystery_box':
        const prizes = [
          { name: '100 🌱 Cebollines', amount: 100, type: 'coins' },
          { name: 'Boost EXP x3', amount: 1, type: 'exp_boost' },
          { name: 'Invocación Gratuita', amount: 1, type: 'free_gacha' },
          { name: '50 🌱 Cebollines', amount: 50, type: 'coins' },
          { name: 'Amuleto de Suerte', amount: 3, type: 'lucky_charm' }
        ];
        const prize = prizes[Math.floor(Math.random() * prizes.length)];
        
        if (prize.type === 'coins') {
          user.coins += prize.amount;
        } else if (prize.type === 'exp_boost') {
          user.expBoost = Date.now() + (30 * 60 * 1000);
        } else if (prize.type === 'free_gacha') {
          user.freeGacha = (user.freeGacha || 0) + 1;
        } else if (prize.type === 'lucky_charm') {
          user.luckyCharm = (user.luckyCharm || 0) + prize.amount;
        }
        
        effectMessage = `\n🎁 *¡Premio de la Caja Misteriosa!* 🎁\n🏆 Ganaste: ${prize.name}`;
        break;
    }

    const message = `🛍️ *COMPRA EXITOSA* 🛍️

📦 *Artículo:* ${item.name}
💰 *Precio:* ${item.price} 🌱 Cebollines
📝 *Descripción:* ${item.description}

💳 *Tu saldo:* ${user.coins} 🌱 Cebollines${effectMessage}

💡 *Usa /inventory para ver tus artículos activos*`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
