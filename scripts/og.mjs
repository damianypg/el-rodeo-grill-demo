// Genera public/og.jpg (1200×630). Rehacer cuando llegue el logo original en alta resolución.
import sharp from 'sharp';

const logo = await sharp('src/assets/el-rodeo-grill-logo.png').resize(300, 300, { kernel: 'lanczos3' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#1b0e09' } })
  .composite([{ input: logo, left: 450, top: 165 }])
  .jpeg({ quality: 85 })
  .toFile('public/og.jpg');
console.log('public/og.jpg listo');
