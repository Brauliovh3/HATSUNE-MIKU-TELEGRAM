import axios from 'axios';

export default {
  command: ['pat', 'acariciar'],
  category: 'anime',
  description: 'Acariciar la cabeza de alguien',
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
      
      const response = await axios.get('https://api.waifu.im/search/?included_tags=pat', {
        timeout: 5000
      });
      
      const imageUrl = response.data.images[0]?.url || 'https://i.pinimg.com/736x/53/13/9a/53139a45b8a098588a4e1b6557ee8492.jpg';
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      
      const messages = [
        `🤲 *¡Qué tierno!* ${senderName} acaricia la cabeza de ${targetName}`,
        `💕 *Caricia aceptada* ${senderName} acarició dulcemente a ${targetName}`,
        `🫂 *Momento tierno* ${senderName} le dio una caricia a ${targetName}`,
        `🤲 *Caricia virtual* ${senderName} envió una caricia a ${targetName}`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await ctx.replyWithPhoto(imageUrl, {
        caption: randomMessage,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Error obteniendo imagen de caricia:', error);
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      const message = `🤲 *¡CARICIA VIRTUAL!* 🤲

${senderName} acaricia tiernamente la cabeza de ${targetName} 🫂

💕 Las caricias transmiten paz y cariño...
🤲 ¡Comparte amor y ternura!`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
    }
  }
};
