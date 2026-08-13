const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8048626993:AAFh13Aqhg5P0vZz0Ich-U2sohqAgb53ZaU';
const bot = new Telegraf(BOT_TOKEN);

const qrisImagePath = path.join(__dirname, 'qris.png');

// Pesan Otomatis QRIS 100% Sesuai Gambar Lampiran User
const paymentMessage = `Selamat datang di Sistem Berlangganan Official UGC Ads Generator!
Untuk menyelesaikan aktivasi lisensi aplikasi Anda:
Silakan lakukan scan & pembayaran via Kode QRIS Resmi UGC Ads generator di atas. Setelah pembayaran berhasil, kirimkan BUKTI TRANSFER / RESI pembayaran di obrolan chat ini.
Kunci Lisensi (License Key) Anda akan langsung dikirimkan oleh Admin secara otomatis dalam 1-5 menit!`;

bot.start((ctx) => {
    console.log(`[LOG] /start dipanggil oleh: ${ctx.from.first_name} (@${ctx.from.username || 'no_user'})`);
    if (fs.existsSync(qrisImagePath)) {
        ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: paymentMessage }
        );
    } else {
        ctx.reply(paymentMessage);
    }
});

bot.command('langganan', (ctx) => {
    if (fs.existsSync(qrisImagePath)) {
        ctx.replyWithPhoto(
            { source: qrisImagePath },
            { caption: paymentMessage }
        );
    } else {
        ctx.reply(paymentMessage);
    }
});

bot.on('photo', (ctx) => {
    ctx.reply('✅ Bukti transfer Anda telah diterima!\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci lisensi akan dikirimkan di sini dalam 1-5 menit.');
});

bot.on('message', (ctx) => {
    if (ctx.message.text && !ctx.message.text.startsWith('/')) {
        if (fs.existsSync(qrisImagePath)) {
            ctx.replyWithPhoto(
                { source: qrisImagePath },
                { caption: paymentMessage }
            );
        } else {
            ctx.reply(paymentMessage);
        }
    }
});

bot.launch().then(() => {
    console.log('====================================================');
    console.log('🚀 TELEGRAM BOT MANDIRI ERMOWO REMASTERED RUNNING!');
    console.log('====================================================');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
