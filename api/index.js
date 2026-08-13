const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8048626993:AAFh13Aqhg5P0vZz0Ich-U2sohqAgb53ZaU';
const bot = new Telegraf(BOT_TOKEN);

const qrisImagePath = path.join(__dirname, '..', 'qris.png');

const paymentMessage = `Selamat datang di Sistem Berlangganan Official UGC Ads Generator!
Untuk menyelesaikan aktivasi lisensi aplikasi Anda:
Silakan lakukan scan & pembayaran via Kode QRIS Resmi UGC Ads generator di atas. Setelah pembayaran berhasil, kirimkan BUKTI TRANSFER / RESI pembayaran di obrolan chat ini.
Kunci Lisensi (License Key) Anda akan langsung dikirimkan oleh Admin secara otomatis dalam 1-5 menit!`;

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

bot.on('photo', (ctx) => {
    return ctx.reply('✅ Bukti transfer Anda telah diterima!\n\nAdmin sedang memverifikasi pembayaran Anda. Kunci lisensi akan dikirimkan di sini dalam 1-5 menit.');
});

bot.on('message', (ctx) => {
    if (ctx.message.text && !ctx.message.text.startsWith('/')) {
        if (fs.existsSync(qrisImagePath)) {
            return ctx.replyWithPhoto(
                { source: qrisImagePath },
                { caption: paymentMessage }
            );
        } else {
            return ctx.reply(paymentMessage);
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
