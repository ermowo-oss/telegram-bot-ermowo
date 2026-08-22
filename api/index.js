const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOT_TOKEN = '8048626993:AAFh13Aqhg5P0vZz0Ich-U2sohqAgb53ZaU';
const ADMIN_CHAT_ID = '2004468668'; 
const bot = new Telegraf(BOT_TOKEN);

const qrisImagePath = path.join(__dirname, '..', 'qris.png');

// Private Key RSA-2048 Resmi Proyek ERMOWO
const RSA_PRIVATE_KEY_BASE64 = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZ92UaKPvMYuRCYeJ9FqDamI0Q89gnTEeeCxnLJhtc/mljna/6xtLN1uwNYCurvFYU8RbZyXDzPyjUnzgMhT4AC9Ge6qJwki+xv1umPBqOVVLmJK81Qlhfb52Xifv34lTU2sSb0MqK0v+8UKN+eUPWVJY7ah4/MHWfKszr5DoaeE15wrLypui5NqAlvWr1xNvkYeOZ/6pnFVEWOB3MjYHwRWUFZScHKHxisP9hVMBRa+2uf1HmAz/MsugNi8+vvSOzpPKX/tJGDnpjWttXSDEKS/wTDPJC/m5fj3NpTa2tRYSLgqix5nQdTGSmDpX7+KvtCRxk3O9Q/TSrxcHmmnTvAgMBAAECggEACGgaT+KRH+rZh1ITViFJYdYkX2PNoKcbOawcx4AKg3D+JI9/zUPCBiNV0cO3brZwV/OqRPSpI13PsEYL2nlxaGg8y8Ljzq+QIPah5vA4eYygGn2LSF0ZplBZxdHu2LZIAn1DJ6Ovnt63Lc2UgOAgTeKrLiBQQp5IY4sWE7nGoq0h7Sb4gVM3XNBbk6DYNWeIPQwvIYmI+U/GdFm5+0CDPiWTGeSUMO4r6VR0N7yvX7DJ++4lD3t9ZLXRtfpRyIDGW1PA85gUfeLvviF57OsYJ13b/+aIYotfE5J6hPC2p8aMvSQ48NrNkBZi22S/D974N9RnMFU8Nub49FWkGZGKGQKBgQC+9ACJBvD4tA+o1KWVogI2ULuQwh2Ipg+0KvqamQGkvTZQ9Y/SfZrBkjii2q1/VmkOzJCVVVQ1/rt7CFLZ+qGy+osFgyy7aEGs0r0lK4nRGnlbdDEbmN3jgnUxuPfbQU5/t4T8yYsaJVH+ki8QkxUnrEUwWVPxwr6fqy9/OlVwOQKBgQDOafonZ+aOjaRmpraPJI0swiWVKAiLJ8c1wfk+WX6IP4kUS0v3EB39E6RDjf5GmaxAnNMjPkZfRuGpnCGjncvCMOOd2aDWV/9eRxoeJKOjg/ALqIO1wqMfPoMf1c5h6zondfaFj6dinNAOMI8SNGP7oPWKJ5mcNCpyxf40THC+ZwKBgHFB2ftsMYrhiZQypA+vKq66jbVbXRcKn6/V+hOuAsqKK2gzbd2EAEElkBAPse4f+2n6rRrVpH/uGZbspe+B91xnvANF/UcenC18RRGB1FlA4Y/7x5C9x4XEf+xA8EmMX5ni6K7if22/ivV6EQ48nsSMKfF2WhK/1j5v01kb6UcJAoGALbATaKl8xMzhOL9p5SEoBmIqw2sLCRIS6/k1W/GfKjU1+EH6XIM6wAua7kD9qU7Wa67KpSBhnzEnPc2LPJXuxdrgZs4G5aqwoYOHamidt9G6TjpMfOzKAl5p06AVgGL6ikV3/XQgjpk7DAj/gf4Kq2WjM6M0Qvjg9GqSq6zHv70CgYEAqkOoL2Nr4J9BGUH58VcpA9zTG1lxFWqE9VHVzkuyv4hKua21GHl8oOsfbyPs60MDr1oVjKWRWX5crY9ylno9gPs9p/Ygh5BFsDz3jH2v+qujCse13qMBHagLfCGrwwEh61FFZq78EbbTiLQ+URzWtFkwSPEqtqxeCGPJPXk7h8w=";

// Generator Pesan QRIS Khusus Per Paket
function getPaymentMessage(planStr) {
    const p = (planStr || '').toLowerCase();
    let planName = "Pro Plan";
    let planPrice = "Rp 50.000,-";
    
    if (p.includes("starter") || p.includes("standard")) {
        planName = "Standard Plan";
        planPrice = "Rp 25.000,-";
    } else if (p.includes("ultra")) {
        planName = "Ultra Plan";
        planPrice = "Rp 100.000,-";
    } else {
        planName = "Pro Plan";
        planPrice = "Rp 50.000,-";
    }

    return `Selamat datang di Sistem Berlangganan Official UGC Ads Generator!\n\n` +
           `Anda akan berlangganan <b>${planName}</b> sebesar <b>${planPrice}/bulan</b>. Untuk menyelesaikan aktivasi lisensi aplikasi Anda:\n\n` +
           `1. Silakan lakukan scan & pembayaran <b>${planPrice}</b> via Kode QRIS Resmi UGC Ads generator di atas.\n\n` +
           `2. Kirimkan BUKTI TRANSFER & DEVICE ID Anda (Device ID dapat dilihat di menu Settings aplikasi) di obrolan chat ini.\n\n` +
           `Kunci Lisensi (License Key) Anda akan langsung dikirimkan oleh Admin dalam 1-5 menit setelah verifikasi!`;
}

// Fungsi Generator RSA-2048 Resmi
function generateRsaLicense(deviceIdInput, tierInput, durationDays = 30) {
    const cleanId = deviceIdInput.trim().toUpperCase();
    const cleanTier = tierInput.trim().toUpperCase();

    const now = new Date();
    now.setDate(now.getDate() + parseInt(durationDays));
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const expiryYyyyMmDd = `${year}${month}${day}`;

    const payload = `${cleanId}|${cleanTier}|${expiryYyyyMmDd}`;

    const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
    const pemFooter = "\n-----END PRIVATE KEY-----";
    const pemKey = pemHeader + RSA_PRIVATE_KEY_BASE64.match(/.{1,64}/g).join('\n') + pemFooter;

    const signer = crypto.createSign('SHA256');
    signer.update(payload, 'utf8');
    const sigBytes = signer.sign(pemKey);

    const sigBase64 = sigBytes.toString('base64url');
    const payloadBase64 = Buffer.from(payload, 'utf8').toString('base64url');

    return `${cleanTier}.${payloadBase64}.${sigBase64}`;
}

// Command Admin /sendkey
bot.command('sendkey', async (ctx) => {
    const fromUser = ctx.from;
    if (String(fromUser.id) !== ADMIN_CHAT_ID) {
        return ctx.reply('Perintah ini khusus Admin!');
    }
    
    const args = ctx.message.text.split(' ').filter(Boolean);
    if (args.length < 4) {
        return ctx.reply('⚠️ Format Salah!\n\nFormat Benar:\n/sendkey [UserIDKonsumen] [DeviceID] [Tier]\n\nContoh:\n/sendkey 123456789 UGC-88A1-90F2 PRO');
    }
    
    const targetUserId = args[1].trim();
    const deviceId = args[2].trim().toUpperCase();
    const tier = args[3].trim().toUpperCase();
    
    if (!/^\d+$/.test(targetUserId)) {
        return ctx.reply(`⚠️ Target User ID harus berupa ANGKA.\nAnda memasukkan: "${targetUserId}"\n\nContoh Benar:\n/sendkey 123456789 UGC-88A1-90F2 PRO`);
    }
    
    const rsaKey = generateRsaLicense(deviceId, tier, 30);
    
    const userMsg = `🎉 <b>LISENSI APLIKASI ANDA TELAH AKTIF!</b>\n\n` +
                    `Detail Lisensi Resmi Anda:\n` +
                    `• Device ID: <code>${deviceId}</code>\n` +
                    `• Paket: <b>${tier}</b> (30 Hari)\n\n` +
                    `🔑 <b>KUNCI LISENSI (Ketuk kode di bawah untuk menyalin):</b>\n\n` +
                    `<code>${rsaKey}</code>\n\n` +
                    `Silakan ketuk kode lisensi di atas untuk menyalin otomatis, lalu buka aplikasi UGC Ads Generator di HP Anda, masuk ke menu Settings dan tempelkan kodenya. Terima kasih!`;
                    
    try {
        await bot.telegram.sendMessage(targetUserId, userMsg, { parse_mode: 'HTML' });
        return ctx.replyWithHTML(`✅ BERHASIL! Kunci Lisensi RSA-2048 Sah telah dikirimkan langsung ke chat konsumen (ID: ${targetUserId})!`);
    } catch (err) {
        return ctx.reply(`❌ GAGAL Mengirim ke konsumen ID ${targetUserId}: ${err.message}`);
    }
});

// Penanganan /start dengan Deep Link Parameter (?start=starter, ?start=pro, ?start=ultra)
bot.start((ctx) => {
    const payload = ctx.message.text.split(' ')[1] || 'pro';
    const msg = getPaymentMessage(payload);

    if (fs.existsSync(qrisImagePath)) {
        return ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: msg, parse_mode: 'HTML' }
        );
    } else {
        return ctx.replyWithHTML(msg);
    }
});

bot.command('langganan', (ctx) => {
    const msg = getPaymentMessage('pro');
    if (fs.existsSync(qrisImagePath)) {
        return ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: msg, parse_mode: 'HTML' }
        );
    } else {
        return ctx.replyWithHTML(msg);
    }
});

// Penanganan Pesan Foto (Bukti Transfer dari Konsumen)
bot.on('photo', async (ctx) => {
    const fromUser = ctx.from;
    const isFromAdmin = String(fromUser.id) === ADMIN_CHAT_ID;
    
    if (!isFromAdmin) {
        await ctx.reply('✅ Bukti transfer & foto Anda telah diterima!\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci lisensi akan dikirimkan di sini dalam 1-5 menit.');
        
        try {
            const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                             (fromUser.username ? ` (@${fromUser.username})` : '') + 
                             ` [ID: ${fromUser.id}]`;
            
            const photos = ctx.message.photo;
            const highestPhoto = photos[photos.length - 1].file_id;
            const captionText = ctx.message.caption || '';
            
            const match = captionText.match(/(?:TG|HW|WEB|UGC)-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
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
bot.on('text', async (ctx) => {
    const isCommand = ctx.message.text && ctx.message.text.startsWith('/');
    if (!isCommand) {
        const fromUser = ctx.from;
        const isFromAdmin = String(fromUser.id) === ADMIN_CHAT_ID;
        
        if (!isFromAdmin) {
            const text = ctx.message.text || '';
            const match = text.match(/(?:TG|HW|WEB|UGC)-[A-Z0-9]{4}-[A-Z0-9]{4}/i);
            const detectedDeviceId = match ? match[0].toUpperCase() : null;

            if (detectedDeviceId) {
                await ctx.reply(`✅ Terima kasih! Device ID Anda (<code>${detectedDeviceId}</code>) telah kami terima.\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci Lisensi resmi akan dikirimkan di sini dalam 1-5 menit.`, { parse_mode: 'HTML' });
            } else {
                await ctx.reply(`✅ Pesan Anda telah diterima!\n\nJika Anda sudah melakukan pembayaran, pastikan mencantumkan Device ID (contoh: <code>UGC-88A1-90F2</code>) agar lisensi dapat segera diproses oleh Admin.`, { parse_mode: 'HTML' });
            }
            
            try {
                const userInfo = `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() + 
                                 (fromUser.username ? ` (@${fromUser.username})` : '') + 
                                 ` [ID: ${fromUser.id}]`;
                
                let deviceIdDisplay = detectedDeviceId ? `Detected: <code>${detectedDeviceId}</code>` : `<i>(Tidak terdeteksi otomatis, silakan cek manual)</i>`;
                const finalDevId = detectedDeviceId || 'DEVICE_ID';

                const adminMsg = `💬 <b>PESAN KONSUMEN MASUK!</b>\n\n` +
                                 `Dari: <b>${userInfo}</b>\n` +
                                 `User ID Konsumen: <code>${fromUser.id}</code>\n` +
                                 `Pesan: ${text}\n\n` +
                                 `Device ID: ${deviceIdDisplay}\n\n` +
                                 `Salin & edit perintah di bawah ini untuk kirim lisensi:\n` +
                                 `<code>/sendkey ${fromUser.id} ${finalDevId} PRO</code>`;
                                 
                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'HTML' });
            } catch (err) {
                console.error("Gagal meneruskan pesan ke admin:", err);
            }
        }
    }
});

module.exports = async (req, res) => {
    try {
        if (req.url === '/app' || req.url === '/app/') {
            const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
            if (fs.existsSync(htmlPath)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.status(200).send(fs.readFileSync(htmlPath, 'utf8'));
            }
        }

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
