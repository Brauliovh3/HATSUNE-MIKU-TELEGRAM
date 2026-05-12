import axios from 'axios';

export default {
  command: ['kiss', 'besar', 'muak', 'blowkiss', 'besito'],
  category: 'anime',
  description: 'Dar besos a alguien',
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
      
      const response = await axios.get('https://api.waifu.im/search/?included_tags=kiss', {
        timeout: 5000
      });
      
      const imageUrl = response.data.images[0]?.url || 'https://i.pinimg.com/736x/53/13/9a/53139a45b8a098588a4e1b6557ee8492.jpg';
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      
      const messages = [
        `😘 *¡Qué romántico!* ${senderName} le dio un beso a ${targetName}`,
        `💕 *Beso aceptado* ${senderName} besó dulcemente a ${targetName}`,
        `💋 *Momento especial* ${senderName} le dio un beso a ${targetName}`,
        `😘 *Beso virtual* ${senderName} envió un beso a ${targetName}`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await ctx.replyWithPhoto(imageUrl, {
        caption: randomMessage,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Error obteniendo imagen de beso:', error);
      
      const senderName = ctx.from.first_name || ctx.from.username || 'Alguien';
      const message = `😘 *¡BESO VIRTUAL!* 😘

${senderName} le dio un beso tierno a ${targetName} 💋

💕 Los besos son el lenguaje universal del amor...
😘 ¡Comparte cariño con todos!`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });
    }
  }
};
