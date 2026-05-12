export default {
  command: ['hug', 'abrazar'],
  category: 'anime',
  description: 'Dar abrazos a alguien',
  async run(ctx, args) {
   
    let targetUser = null;
    let targetName = 'al aire';
    
    if (ctx.message.reply_to_message) {
      targetUser = ctx.message.reply_to_message.from;
      targetName = targetUser.first_name || targetUser.username || 'alguien';
    } else if (args.length > 0) {
      targetName = args.join(' ');
    }

    try {
     
      const response = await axios.get('https://api.waifu.im/search/?included_tags=hug', {
        timeout: 5000
      });
      
      const imageUrl = response.data.images[0]?.url || 'https://i.pinimg.com/736x/53/13/9a/53139a45b8a098588a4e1b6557ee8492.jpg';
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      
      const messages = [
        `🤗 *¡Qué tierno!* ${senderName} le dio un abrazo a ${targetName}`,
        `💕 *Abrazo aceptado* ${senderName} abrazó cálidamente a ${targetName}`,
        `🫂 *Momento tierno* ${senderName} le dio un abrazo a ${targetName}`,
        `🤗 *Abrazo virtual* ${senderName} envió un abrazo a ${targetName}`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await ctx.replyWithPhoto(imageUrl, {
        caption: randomMessage,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Error obteniendo imagen de abrazo:', error);
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      const message = `🤗 *¡ABRAZO VIRTUAL!* 🤗

${senderName} le dio un gran abrazo a ${targetName} 🫂

💕 Los abrazos son el mejor remedio para el alma...
🤗 ¡Comparte amor y alegría!`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
    }
  }
};
