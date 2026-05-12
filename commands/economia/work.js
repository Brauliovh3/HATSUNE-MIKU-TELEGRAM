export default {
  command: ['work', 'w', 'chamba'],
  category: 'economia',
  description: 'Trabajar para ganar monedas',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

    
    const cooldown = 60000; 
    const lastWork = user.lastWork || 0;
    
    if (Date.now() - lastWork < cooldown) {
      const remaining = Math.ceil((cooldown - (Date.now() - lastWork)) / 1000);
      return ctx.reply(`⏳ Debes esperar ${remaining} segundos antes de volver a trabajar.`);
    }

    
    const jobs = [
      { name: 'Programador', emoji: '💻', min: 50, max: 200 },
      { name: 'Diseñador', emoji: '🎨', min: 40, max: 180 },
      { name: 'Músico', emoji: '🎵', min: 30, max: 150 },
      { name: 'Chef', emoji: '👨‍🍳', min: 35, max: 160 },
      { name: 'Mecánico', emoji: '🔧', min: 45, max: 190 },
      { name: 'Escritor', emoji: '✍️', min: 25, max: 140 },
      { name: 'Streamer', emoji: '🎮', min: 60, max: 250 }
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
    
    user.coins = (user.coins || 0) + earnings;
    user.lastWork = Date.now();
    user.usedcommands = (user.usedcommands || 0) + 1;
    user.exp = (user.exp || 0) + Math.floor(earnings / 10);

    const message = `${job.emoji} *¡TRABAJO COMPLETADO!*

💼 *Trabajo:* ${job.name}
💰 *Ganancias:* +${earnings} 🌱 Cebollines
📊 *Total:* ${user.coins} 🌱 Cebollines
⭐ *EXP:* +${Math.floor(earnings / 10)} XP

🎉 ¡Sigue trabajando para aumentar tu fortuna!`;

    await ctx.reply(message, {
      parse_mode: 'Markdown'
    });
  }
};
