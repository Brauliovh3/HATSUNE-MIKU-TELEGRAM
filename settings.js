import dotenv from 'dotenv';
dotenv.config();

export default {
  namebot: process.env.BOT_NAME || '💙HATSUNE MIKU💙',
  botname: process.env.BOT_NAME || '💙HATSUNE MIKU💙',
  link: process.env.BOT_CHANNEL || 'https://t.me/BVH3INDUSTRIES',
  owner: '(ㅎㅊDEPOOLㅊㅎ)',  
  ownerId: process.env.OWNER_ID || '51931619252', 
  currency: process.env.CURRENCY || '🌱 Cebollines',
  prefix: ['.'],
  audios: false,
  banner: 'https://i.pinimg.com/736x/0c/1e/f8/0c1ef8e804983e634fbf13df1044a41f.jpg',
  icon: 'https://i.pinimg.com/736x/0c/1e/f8/0c1ef8e804983e634fbf13df1044a41f.jpg'
};