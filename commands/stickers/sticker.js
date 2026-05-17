import fs from 'fs';
import path from 'path';

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
        return ctx.reply('💙 Responde a una imagen o envía una imagen con el comando\n📝 Ejemplo: .s respondiendo a una imagen');
      }

     
      if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
      const tempPath = path.join('./temp', `sticker_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, imageBuffer);

      
      await ctx.client.sendFile(ctx.chatId, {
        file: tempPath,
        fileName: `sticker_${Date.now()}.webp`,
        mimeType: 'image/webp',
        forceDocument: false
      });

      
      setTimeout(() => {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          
        }
      }, 5000);

    } catch (error) {
      console.error('Error en comando sticker:', error);
      await ctx.reply('❌ Error al crear el sticker. Asegúrate de responder a una imagen válida.');
    }
  }
};
