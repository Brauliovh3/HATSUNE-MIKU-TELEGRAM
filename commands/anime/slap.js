import axios from 'axios';

export default {
  command: ['slap', 'bofetada'],
  category: 'anime',
  description: 'Abofetear a alguien',
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
    
      const response = await axios.get('https://api.waifu.im/search/?included_tags=slap', {
        timeout: 5000
      });
      
      const imageUrl = response.data.images[0]?.url || 'https://i.pinimg.com/736x/53/13/9a/53139a45b8a098588a4e1b6557ee8492.jpg';
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      
      const messages = [
        `👋 *¡BOFETADA!* ${senderName} le dio una bofetada a ${targetName}`,
        `🤚 *Golpe aceptado* ${senderName} abofeteó a ${targetName}`,
        `👊 *Momento de tensión* ${senderName} le dio una bofetada a ${targetName}`,
        `👋 *Bofetada virtual* ${senderName} envió una bofetada a ${targetName}`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await ctx.replyWithPhoto(imageUrl, {
        caption: randomMessage,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Error obteniendo imagen de bofetada:', error);
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      const message = `👋 *¡BOFETADA VIRTUAL!* 👋

${senderName} le dio una bofetada a ${targetName} 👊

😅 Las bofetadas son solo en diversión...
🤝 ¡Espero que no haya habido mala intención!`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
    }
  }
};
