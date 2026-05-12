export default {
  command: ['shop', 'tienda'],
  category: 'economia',
  description: 'Ver tienda de artículos',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
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

    let shopMessage = `🛍️ *TIENDA HATSUNE MIKU* 🛍️

💰 *Tus Cebollines:* ${coins} 🌱 Cebollines
⭐ *Tu Nivel:* ${level}

📦 *ARTÍCULOS DISPONIBLES:*
`;

    shopItems.forEach((item, index) => {
      const canBuy = coins >= item.price && level >= item.level;
      const status = canBuy ? '✅' : '❌';
      const levelReq = item.level > 0 ? ` (Niv. ${item.level})` : '';
      
      shopMessage += `\n${status} ${index + 1}. ${item.name} - ${item.price} 🌱 Cebollines${levelReq}\n   📝 ${item.description}`;
    });

    shopMessage += `\n\n💡 *Para comprar:* /comprar <número>\n📝 *Ejemplo:* /comprar 1`;

    await ctx.reply(shopMessage, {
      parse_mode: 'Markdown'
    });
  }
};
