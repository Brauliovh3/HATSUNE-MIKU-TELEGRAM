export default {
  command: ['s', 'sticker'],
  category: 'stickers',
  description: 'Convertir imagen a sticker',
  middlewares: [],
  cooldown: 3,
  async run(ctx, args) {
    try {
      const msg = ctx.message;
      let imageBuffer = null;
      let fileName = `sticker_${Date.now()}.webp`;

 
      if (msg.replyTo) {
        const repliedMsg = await msg.replyTo;
        
        if (repliedMsg.media) {
          if (repliedMsg.media.photo) {
         
            const buffer = await ctx.client.downloadMedia(repliedMsg.media, {
              workers: 1
            });
            imageBuffer = buffer;
          } else if (repliedMsg.media.document) {
           
            const document = repliedMsg.media.document;
            if (document.mimeType?.startsWith('image/')) {
              const buffer = await ctx.client.downloadMedia(repliedMsg.media, {
                workers: 1
              });
              imageBuffer = buffer;
            }
          }
        }
      } else if (msg.media) {
       
        if (msg.media.photo) {
          const buffer = await ctx.client.downloadMedia(msg.media, {
            workers: 1
          });
          imageBuffer = buffer;
        } else if (msg.media.document) {
          const document = msg.media.document;
          if (document.mimeType?.startsWith('image/')) {
            const buffer = await ctx.client.downloadMedia(msg.media, {
              workers: 1
            });
            imageBuffer = buffer;
          }
        }
      }

      if (!imageBuffer) {
        return ctx.reply('📸 *USO:* Responde a una imagen o envía una imagen con el comando\n📝 *Ejemplo:* .s (respondiendo a una imagen)');
      }

    
      await ctx.client.sendFile(ctx.chatId, {
        file: imageBuffer,
        fileName: fileName,
        forceDocument: false,
        attributes: [{
          _: 'documentAttributeImageSize',
          w: 512,
          h: 512
        }]
      });

    } catch (error) {
      console.error('Error en comando sticker:', error);
      await ctx.reply('❌ Error al crear el sticker. Asegúrate de responder a una imagen válida.');
    }
  }
};
