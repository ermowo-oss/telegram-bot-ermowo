require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '2004468668'; 
const MASTER_SALT = "ERMOWO_UGC_ADS_SECURE_KEY_2026_MASTER";
const bot = new Telegraf(BOT_TOKEN);

const qrisImagePath = path.join(__dirname, '..', 'qris.png');

const paymentMessage = `Selamat datang di Sistem Berlangganan Official UGC Ads Generator!

Untuk menyelesaikan aktivasi lisensi aplikasi Anda:

1. Silakan lakukan scan & pembayaran via Kode QRIS Resmi UGC Ads generator di atas.

2. Kirimkan BUKTI TRANSFER & DEVICE ID Anda (Device ID dapat dilihat di menu Settings aplikasi) di obrolan chat ini.

Kunci Lisensi (License Key) Anda akan langsung dikirimkan oleh Admin dalam 1-5 menit setelah verifikasi!`;

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
        return ctx.reply('Cara Pakai Perintah Keygen:\n/keygen [DeviceID] [Tier]\n\nContoh:\n/keygen UGC-41A1-856D PRO');
    }
    
    const deviceId = args[1].trim().toUpperCase();
    const tier = args[2].trim().toUpperCase();
    const key = generateLicense(deviceId, tier);
    
    const replyText = `<b>KUNCI LISENSI RESMI UGC ADS GENERATOR</b>\n\n` +
                      `Device ID: <code>${deviceId}</code>\n` +
                      `Paket: <b>${tier}</b>\n` +
                      `License Key (Ketuk untuk salin):\n<code>${key}</code>\n\n` +
                      `<i>Ketuk kode di atas untuk menyalin otomatis!</i>`;
                      
    return ctx.replyWithHTML(replyText);
});

// Command Admin /sendkey (Buat Lisensi + Kirim Langsung ke Chat Konsumen dengan MonoSpace Copy)
bot.command('sendkey', async (ctx) => {
    const fromUser = ctx.from;
    if (String(fromUser.id) !== ADMIN_CHAT_ID) {
        return ctx.reply('Perintah ini khusus Admin!');
    }
    
    const args = ctx.message.text.split(' ').filter(Boolean);
    if (args.length < 4) {
        return ctx.reply('⚠️ Format Salah!\n\nFormat Benar:\n/sendkey [UserIDKonsumen] [DeviceID] [Tier]\n\nContoh:\n/sendkey 123456789 UGC-41A1-856D PRO');
    }
    
    const targetUserId = args[1].trim();
    const deviceId = args[2].trim().toUpperCase();
    const tier = args[3].trim().toUpperCase();
    
    if (!/^\d+$/.test(targetUserId)) {
        return ctx.reply(`⚠️ Target User ID harus berupa ANGKA.\nAnda memasukkan: "${targetUserId}"\n\nContoh Benar:\n/sendkey 123456789 UGC-41A1-856D PRO`);
    }
    
    const key = generateLicense(deviceId, tier);
    
    const userMsg = `🎉 <b>SELAMAT! LISENSI APLIKASI ANDA TELAH AKTIF!</b>\n\n` +
                    `Detail Lisensi Resmi Anda:\n` +
                    `• Device ID: <code>${deviceId}</code>\n` +
                    `• Paket: <b>${tier}</b>\n\n` +
                    `🔑 <b>KUNCI LISENSI (Ketuk kode di bawah untuk menyalin):</b>\n` +
                    `<code>${key}</code>\n\n` +
                    `Silakan ketuk kode lisensi <code>${key}</code> di atas, buka aplikasi UGC Ads Generator di HP Anda, lalu tempel di menu Settings / Layar Aktivasi. Terima kasih!`;
                    
    try {
        await bot.telegram.sendMessage(targetUserId, userMsg, { parse_mode: 'HTML' });
        return ctx.replyWithHTML(`✅ BERHASIL! Kunci Lisensi (<code>${key}</code>) telah dikirimkan langsung ke chat konsumen (ID: ${targetUserId})!`);
    } catch (err) {
        return ctx.reply(`❌ GAGAL Mengirim ke konsumen ID ${targetUserId}: ${err.message}`);
    }
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
    const fromUser = ctx.from;
    const isFromAdmin = String(fromUser.id) === ADMIN_CHAT_ID;
    
    if (!isFromAdmin) {
        await ctx.reply('Bukti transfer & foto Anda telah diterima!\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci lisensi akan dikirimkan di sini dalam 1-5 menit.');
        
        try {
            const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                             (fromUser.username ? ` (@${fromUser.username})` : '') + 
                             ` [ID: ${fromUser.id}]`;
            
            const photos = ctx.message.photo;
            const highestPhoto = photos[photos.length - 1].file_id;
            const captionText = ctx.message.caption || '';
            
            // Deteksi Device ID bermotif UGC-XXXX-XXXX dari caption
            const match = captionText.match(/UGC-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
            const detectedDeviceId = match ? match[0].toUpperCase() : 'DEVICE_ID';
            
            let deviceIdDisplay = `Detected: <code>${detectedDeviceId}</code>`;
            if (detectedDeviceId === 'DEVICE_ID') {
                deviceIdDisplay = `<i>(Tidak terdeteksi otomatis, silakan cek manual)</i>`;
            }

            const adminMsg = `🚨 <b>NOTIFIKASI BUKTI TRANSFER MASUK!</b>\n\n` +
                             `Dari Konsumen: <b>${userInfo}</b>\n` +
                             `User ID Konsumen: <code>${fromUser.id}</code>\n` +
                             `Pesan/Caption: ${captionText || '(Tanpa caption)'}\n\n` +
                             `Device ID: ${deviceIdDisplay}\n\n` +
                             `Salin & edit perintah di bawah ini untuk kirim lisensi:\n` +
                             `<code>/sendkey ${fromUser.id} ${detectedDeviceId} PRO</code>`;
                             
            await bot.telegram.sendPhoto(ADMIN_CHAT_ID, highestPhoto, { caption: adminMsg, parse_mode: 'HTML' });
        } catch (err) {
            console.error("Gagal meneruskan foto ke admin:", err);
        }
    }
});

// Penanganan Pesan Teks dari Konsumen
bot.on('message', async (ctx) => {
    const isCommand = ctx.message.text && ctx.message.text.startsWith('/');
    if (!isCommand) {
        const fromUser = ctx.from;
        const isFromAdmin = String(fromUser.id) === ADMIN_CHAT_ID;
        
        if (!isFromAdmin) {
            if (fs.existsSync(qrisImagePath)) {
                await ctx.replyWithPhoto(
                    { source: qrisImagePath },
                    { caption: paymentMessage }
                );
            } else {
                await ctx.reply(paymentMessage);
            }
            
            try {
                const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                                 (fromUser.username ? ` (@${fromUser.username})` : '') + 
                                 ` [ID: ${fromUser.id}]`;
                const text = ctx.message.text || '';
                
                // Deteksi Device ID bermotif UGC-XXXX-XXXX dari teks
                const match = text.match(/UGC-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
                const detectedDeviceId = match ? match[0].toUpperCase() : 'DEVICE_ID';
                
                let deviceIdDisplay = `Detected: <code>${detectedDeviceId}</code>`;
                if (detectedDeviceId === 'DEVICE_ID') {
                    deviceIdDisplay = `<i>(Tidak terdeteksi otomatis, silakan cek manual)</i>`;
                }

                const adminMsg = `💬 <b>PESAN KONSUMEN MASUK!</b>\n\n` +
                                 `Dari: <b>${userInfo}</b>\n` +
                                 `User ID Konsumen: <code>${fromUser.id}</code>\n` +
                                 `Pesan: ${text}\n\n` +
                                 `Device ID: ${deviceIdDisplay}\n\n` +
                                 `Salin & edit perintah di bawah ini untuk kirim lisensi:\n` +
                                 `<code>/sendkey ${fromUser.id} ${detectedDeviceId} PRO</code>`;
                                 
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'HTML' });
            } catch (err) {
                console.error("Gagal meneruskan pesan ke admin:", err);
            }
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
