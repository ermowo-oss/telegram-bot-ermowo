const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOT_TOKEN = '8048626993:AAFh13Aqhg5P0vZz0Ich-U2sohqAgb53ZaU';
const ADMIN_CHAT_ID = '2004468668'; // ID Telegram Mas Ermowo
const MASTER_SALT = "ERMOWO_UGC_ADS_SECURE_KEY_2026_MASTER";
const bot = new Telegraf(BOT_TOKEN);

const qrisImagePath = path.join(__dirname, '..', 'qris.png');

const paymentMessage = `Selamat datang di Sistem Berlangganan Official UGC Ads Generator!

Untuk menyelesaikan aktivasi lisensi aplikasi Anda:

1. Silakan lakukan scan & pembayaran via Kode QRIS Resmi UGC Ads generator di atas.

2. Kirimkan BUKTI TRANSFER & DEVICE ID Anda (Device ID dapat dilihat di menu Settings aplikasi) di obrolan chat ini.

Kunci Lisensi (License Key) Anda akan langsung dikirimkan oleh Admin dalam 1-5 menit setelah verifikasi!`;

// Helper Generator Lisensi 100% MATCH Identik Dengan UserTier.kt & LicenseManager.kt Android
function generateLicense(deviceIdInput, tierStrInput) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const period = `${year}${month}`;
    
    const cleanId = deviceIdInput.trim().toUpperCase();
    
    let prefix = "PRO";
    const t = tierStrInput.toUpperCase();
    if (t.includes("STARTER") || t.includes("STANDARD") || t.includes("STD") || t.includes("ST")) {
        prefix = "STD";
    } else if (t.includes("ULTRA") || t.includes("ULT")) {
        prefix = "ULTRA";
    } else {
        prefix = "PRO";
    }
    
    const inputStr = `${cleanId}-${MASTER_SALT}-${period}-${prefix}`;
    const hash = crypto.createHash('sha256').update(inputStr).digest('hex').toUpperCase();
    
    const p1 = hash.substring(0, 4);
    const p2 = hash.substring(4, 8);
    const p3 = hash.substring(8, 12);
    
    return `${prefix}-${p1}-${p2}-${p3}`;
}

// Command Admin /keygen
bot.command('keygen', (ctx) => {
    const args = ctx.message.text.split(' ').filter(Boolean);
    if (args.length < 3) {
        return ctx.reply('Cara Pakai Perintah Keygen:\n/keygen [DeviceID] [Tier]\n\nContoh:\n/keygen UGC-41A1-856D PRO\n/keygen UGC-41A1-856D ULTRA\n/keygen UGC-41A1-856D STARTER');
    }
    
    const deviceId = args[1].trim().toUpperCase();
    const tier = args[2].trim().toUpperCase();
    const key = generateLicense(deviceId, tier);
    
    const replyText = `KUNCI LISENSI RESMI UGC ADS GENERATOR\n\n` +
                      `Device ID: ${deviceId}\n` +
                      `Paket: ${tier}\n` +
                      `License Key: ${key}\n\n` +
                      `Salin kode di atas dan berikan ke konsumen untuk di-paste di aplikasi!`;
                      
    return ctx.reply(replyText);
});

bot.start((ctx) => {
    if (fs.existsSync(qrisImagePath)) {
        return ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: paymentMessage }
        );
    } else {
        return ctx.reply(paymentMessage);
    }
});

bot.command('langganan', (ctx) => {
    if (fs.existsSync(qrisImagePath)) {
        return ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: paymentMessage }
        );
    } else {
        return ctx.reply(paymentMessage);
    }
});

// Penanganan Pesan Foto (Bukti Transfer dari Konsumen)
bot.on('photo', async (ctx) => {
    // Balas ke konsumen
    await ctx.reply('Bukti transfer & foto Anda telah diterima!\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci lisensi akan dikirimkan di sini dalam 1-5 menit.');
    
    // NOTIFIKASI OTOMATIS KE ADMIN TELEGRAM (Ermowo)
    try {
        const fromUser = ctx.from;
        const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                         (fromUser.username ? ` (@${fromUser.username})` : '') + 
                         ` [ID: ${fromUser.id}]`;
        
        const photos = ctx.message.photo;
        const highestPhoto = photos[photos.length - 1].file_id;
        const captionText = ctx.message.caption || '';
        
        const adminMsg = `🚨 NOTIFIKASI BUKTI TRANSFER MASUK!\n\n` +
                         `Dari Konsumen: ${userInfo}\n` +
                         `Pesan/Caption: ${captionText || '(Tanpa caption)'}\n\n` +
                         `Gunakan /keygen di bot untuk membuat lisensi.`;
                         
        await bot.telegram.sendPhoto(ADMIN_CHAT_ID, highestPhoto, { caption: adminMsg });
    } catch (err) {
        console.error("Gagal meneruskan foto ke admin:", err);
    }
});

// Penanganan Pesan Teks dari Konsumen
bot.on('message', async (ctx) => {
    const isCommand = ctx.message.text && ctx.message.text.startsWith('/');
    if (!isCommand) {
        // Balas ke konsumen
        if (fs.existsSync(qrisImagePath)) {
            await ctx.replyWithPhoto(
                { source: qrisImagePath },
                { caption: paymentMessage }
            );
        } else {
            await ctx.reply(paymentMessage);
        }
        
        // NOTIFIKASI OTOMATIS KE ADMIN TELEGRAM (Ermowo)
        try {
            const fromUser = ctx.from;
            if (String(fromUser.id) !== ADMIN_CHAT_ID) {
                const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                                 (fromUser.username ? ` (@${fromUser.username})` : '') + 
                                 ` [ID: ${fromUser.id}]`;
                const text = ctx.message.text || '';
                
                const adminMsg = `💬 PESAN KONSUMEN MASUK!\n\n` +
                                 `Dari: ${userInfo}\n` +
                                 `Pesan: ${text}\n\n` +
                                 `Gunakan /keygen [DeviceID] [Tier] untuk buat lisensi.`;
                                 
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg);
            }
        } catch (err) {
            console.error("Gagal meneruskan pesan ke admin:", err);
        }
    }
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot Serverless Running!');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send(e.message);
    }
};
