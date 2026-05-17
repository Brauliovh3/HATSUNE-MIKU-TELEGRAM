import pkg from "telegram";
const { Api } = pkg;
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default {
  command: ['s', 'sticker'],
  category: 'stickers',
  description: 'Convertir imagen a sticker',
  middlewares: [],
  cooldown: 3,
  async run(ctx, args) {
    try {
      const msg = ctx.message;
      let targetMedia = null;

      
      const repliedMsg = await msg.getReplyMessage();
     
      const mediaMsg = repliedMsg || msg;

      if (mediaMsg.media && (mediaMsg.media.photo || (mediaMsg.media.document && mediaMsg.media.document.mimeType?.startsWith('image/')))) {
        targetMedia = mediaMsg.media;
      }

      if (!targetMedia) {
        return ctx.reply('💙 Responde a una imagen o envía una imagen con el comando\n📝 Ejemplo: .s respondiendo a una imagen');
      }

      
      const buffer = await ctx.client.downloadMedia(targetMedia, { workers: 1 });

      if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
      const tempPath = path.join('./temp', `sticker_${Date.now()}.webp`);

      
      await sharp(buffer)
        .resize(512, 512, {
          fit: 'inside',
          withoutEnlargement: false
        })
        .toFormat('webp')
        .toFile(tempPath);

     
      await ctx.client.sendFile(ctx.chatId, {
        file: tempPath,
        attributes: [
          new Api.DocumentAttributeSticker({
            alt: "💙",
            stickerset: new Api.InputStickerSetEmpty(),
          })
        ]
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
