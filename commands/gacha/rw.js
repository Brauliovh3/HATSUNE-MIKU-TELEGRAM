export default {
  command: ['rw'],
  category: 'gacha',
  description: 'Invocar waifu aleatoria',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

  
    const cost = 50;
    if ((user.coins || 0) < cost) {
      return ctx.reply(`❌ No tienes suficientes 🌱 Cebollines para invocar.\n💰 Costo: ${cost} 🌱 Cebollines\n📊 Tienes: ${user.coins || 0} 🌱 Cebollines`);
    }

   
    const waifus = {
      'común': [
        { name: 'Sakura', power: 100, skill: 'Curación', skillDesc: 'Cura a aliados' },
        { name: 'Yui', power: 120, skill: 'Canto', skillDesc: 'Aumenta moral' },
        { name: 'Mio', power: 110, skill: 'Danza', skillDesc: 'Evade ataques' },
        { name: 'Rin', power: 105, skill: 'Velocidad', skillDesc: 'Ataque rápido' },
        { name: 'Len', power: 115, skill: 'Duplicación', skillDesc: 'Clon temporal' }
      ],
      'rara': [
        { name: 'Hatsune Miku', power: 200, skill: 'Vocaloid', skillDesc: 'Canto poderoso' },
        { name: 'Kagamine Rin', power: 180, skill: 'Espadas Gemelas', skillDesc: 'Ataque doble' },
        { name: 'Megurine Luka', power: 190, skill: 'Voz Seductora', skillDesc: 'Control mental' },
        { name: 'Meiko', power: 175, skill: 'Fuego', skillDesc: 'Ataque de fuego' },
        { name: 'Kaito', power: 185, skill: 'Hielo', skillDesc: 'Congelar enemigos' }
      ],
      'épica': [
        { name: 'Teto Kasane', power: 250, skill: 'Trompeta Divina', skillDesc: 'Sonido ensordecedor' },
        { name: 'Neru Akita', power: 240, skill: 'Pistola Láser', skillDesc: 'Disparo preciso' },
        { name: 'Haku Yowane', power: 230, skill: 'Melancolía', skillDesc: 'Reduce ataque enemigo' }
      ],
      'ultra rara': [
        { name: 'Miku Append', power: 300, skill: 'Transformación', skillDesc: 'Cambia de forma' },
        { name: 'Miku V4X', power: 320, skill: 'Holograma', skillDesc: 'Ilusiones reales' }
      ],
      'legendaria': [
        { name: 'Hatsune Miku Divina', power: 500, skill: 'Concierto Celestial', skillDesc: 'Cura y daña a todos' },
        { name: 'Miku Origami', power: 450, skill: 'Origami Infinito', skillDesc: 'Crea ejército de papel' }
      ]
    };

 
    const random = Math.random();
    let rarity, waifuPool;
    
    if (random < 0.50) { 
      rarity = 'común';
      waifuPool = waifus['común'];
    } else if (random < 0.80) {
      rarity = 'rara';
      waifuPool = waifus['rara'];
    } else if (random < 0.95) {
      rarity = 'épica';
      waifuPool = waifus['épica'];
    } else if (random < 0.99) { 
      rarity = 'ultra rara';
      waifuPool = waifus['ultra rara'];
    } else { 
      rarity = 'legendaria';
      waifuPool = waifus['legendaria'];
    }

    const selectedWaifu = waifuPool[Math.floor(Math.random() * waifuPool.length)];
    selectedWaifu.rarity = rarity;
    selectedWaifu.img = `https://api.waifu.im/random/?selected_tags=${rarity === 'común' ? 'waifu' : rarity}`;

  
    if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 };
    user.waifu.pending = selectedWaifu;
    user.coins -= cost;
    user.usedcommands = (user.usedcommands || 0) + 1;

    const rarityColors = {
      'común': '⚪',
      'rara': '🔵',
      'épica': '🟣',
      'ultra rara': '🟡',
      'legendaria': '🔴'
    };

    const emoji = rarityColors[rarity] || '💙';

    const message = `${emoji} *¡INVOCACIÓN EXITOSA!* ${emoji}

🎌 *Personaje:* ${selectedWaifu.name}
💎 *Rareza:* ${rarity.toUpperCase()}
⚡ *Poder:* ${selectedWaifu.power}
🎯 *Habilidad:* ${selectedWaifu.skill}
📜 *Descripción:* ${selectedWaifu.skillDesc}

💰 *Costo:* ${cost} 🌱 Cebollines
📊 *Tus Cebollines:* ${user.coins} 🌱 Cebollines

🔘 *¿Qué quieres hacer?*
❤️ /c - Reclamar personaje
🛒 /v - Vender por ${rarity === 'común' ? '10' : rarity === 'rara' ? '25' : rarity === 'épica' ? '50' : rarity === 'ultra rara' ? '100' : '200'} 🌱 Cebollines`;

    await ctx.replyWithPhoto(selectedWaifu.img, {
      caption: message,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('❤️ RECLAMAR', 'waifu_claim_' + userId),
          Markup.button.callback('🛒 VENDER', 'waifu_sell_' + userId)
        ]
      ])
    });
  }
};
