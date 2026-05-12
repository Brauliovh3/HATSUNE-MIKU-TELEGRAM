export default {
  command: ['verify18', 'verify', 'verificar'],
  category: 'nsfw',
  description: 'Verificar edad para contenido +18',
  async run(ctx, args) {
    const userId = ctx.from.id.toString();
    const user = global.db.data.users[userId];
    
    if (!user) {
      return ctx.reply('❌ Error: Usuario no encontrado en la base de datos.');
    }

   
    if (user.verified18) {
      return ctx.reply('✅ *YA ESTÁS VERIFICADO* ✅\n\nTienes acceso a todo el contenido +18 del bot.\n\n💡 Usa /nsfw para ver los comandos disponibles');
    }

    const message = `🔞 *VERIFICACIÓN DE EDAD +18* 🔞

⚠️ *ADVERTENCIA IMPORTANTE* ⚠️

Este contenido es exclusivo para mayores de 18 años. Al verificar tu edad, confirmas que:

✅ Tienes 18 años o más
✅ Es legal en tu país ver contenido adulto
✅ Aceptas toda responsabilidad
✅ No compartiras este contenido con menores

📝 *Para verificar, responde a este mensaje con:*
"Soy mayor de 18 años y acepto los términos"

⏳ *Tienes 60 segundos para responder...*

🚫 *Si mientes sobre tu edad, serás baneado permanentemente*`;

    const verificationMsg = await ctx.reply(message, {
      parse_mode: 'Markdown'
    });

    
    const timeout = setTimeout(async () => {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          verificationMsg.message_id,
          null,
          '⏰ *TIEMPO DE VERIFICACIÓN AGOTADO* ⏰\n\nNo respondiste a tiempo. Si quieres verificar tu edad, usa /verify18 nuevamente.',
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        
      }
    }, 60000); 

    
    const verificationHandler = async (ctx) => {
      if (ctx.message?.text?.toLowerCase().includes('soy mayor de 18 años') && 
          ctx.from.id === parseInt(userId)) {
        
        clearTimeout(timeout);
        
        
        user.verified18 = true;
        user.verifiedDate = new Date().toISOString();
        user.usedcommands = (user.usedcommands || 0) + 1;

        try {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            verificationMsg.message_id,
            null,
            '✅ *VERIFICACIÓN COMPLETADA* ✅\n\n🎉 ¡Felicidades! Ahora tienes acceso a todo el contenido +18 del bot.\n\n💡 Usa /nsfw para ver los comandos disponibles\n🔞 Disfruta del contenido responsablemente',
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
       
          await ctx.reply('✅ *VERIFICACIÓN COMPLETADA* ✅\n\n🎉 ¡Felicidades! Ahora tienes acceso a todo el contenido +18 del bot.\n\n💡 Usa /nsfw para ver los comandos disponibles');
        }

        ctx.telegram.off('message', verificationHandler);
      }
    };

    ctx.telegram.on('message', verificationHandler);
  }
};
