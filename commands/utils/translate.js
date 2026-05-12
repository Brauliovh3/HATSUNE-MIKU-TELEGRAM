export default {
  command: ['translate', 'trad', 'traducir'],
  category: 'utils',
  description: 'Traducir texto a diferentes idiomas',
  async run(ctx, args) {
    if (!args || args.length === 0) {
      return ctx.reply(`🌐 *TRADUCTOR* 🌐

💡 *Uso:* /traducir [idioma] [texto]
📝 *Ejemplo:* /traducir en Hello world
🌍 *Idiomas disponibles:* en, es, fr, de, it, pt, ru, ja, ko, zh, ar

📌 *Si no especificas idioma, detectará automáticamente*`);
    }

   
    if (ctx.message.reply_to_message) {
      const textToTranslate = ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption;
      if (!textToTranslate) {
        return ctx.reply('❌ El mensaje respondido no tiene texto para traducir.');
      }
      
      args.unshift(textToTranslate);
    }

    let targetLang = 'es'; 
    let textToTranslate = '';

    
    const langCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'];
    if (args.length > 1 && langCodes.includes(args[0].toLowerCase())) {
      targetLang = args[0].toLowerCase();
      textToTranslate = args.slice(1).join(' ');
    } else {
      textToTranslate = args.join(' ');
    }

    if (!textToTranslate) {
      return ctx.reply('❌ Debes proporcionar texto para traducir.');
    }

    try {
     
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
      
      const response = await axios.get(url);
      const translatedText = response.data[0].map(item => item[0]).join('');

      const langNames = {
        'en': 'Inglés',
        'es': 'Español',
        'fr': 'Francés',
        'de': 'Alemán',
        'it': 'Italiano',
        'pt': 'Portugués',
        'ru': 'Ruso',
        'ja': 'Japonés',
        'ko': 'Coreano',
        'zh': 'Chino',
        'ar': 'Árabe'
      };

      const message = `🌐 *TRADUCCIÓN COMPLETADA* 🌐

📝 *Texto Original:*
${textToTranslate}

🔄 *Traducción (${langNames[targetLang] || targetLang.toUpperCase()}):*
${translatedText}

💡 *Traducido por:* Hatsune Miku Bot`;

      await ctx.reply(message, {
        parse_mode: 'Markdown'
      });

    } catch (error) {
      console.error('Error en traducción:', error);
      await ctx.reply('❌ Error al traducir el texto. Por favor intenta nuevamente.');
    }
  }
};
