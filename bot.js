const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const moment = require('moment-timezone')
const axios = require('axios')
const gtts = require('gtts')
const fs = require('fs')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ["Bangcats", "Chrome", "1.0.0"]
    })
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect } = up
        if (connection === 'close') {
            const reconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            if (reconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ BANGCATS ON 24 JAM MAS!')
        }
    })

    // DATA 38 PROVINSI MAS
    const provinsi = {
        aceh: 'Banda Aceh', sumut: 'Medan', sumbar: 'Padang', riau: 'Pekanbaru', jambi: 'Jambi',
        sumsel: 'Palembang', bengkulu: 'Bengkulu', lampung: 'Bandar Lampung', babel: 'Pangkal Pinang',
        kepri: 'Tanjung Pinang', jakarta: 'Jakarta', jabar: 'Bandung', jateng: 'Semarang',
        diy: 'Yogyakarta', jatim: 'Surabaya', banten: 'Serang', bali: 'Denpasar', ntb: 'Mataram',
        ntt: 'Kupang', kalbar: 'Pontianak', kalteng: 'Palangka Raya', kalsel: 'Banjarmasin',
        kaltim: 'Samarinda', kaltara: 'Tanjung Selor', sulut: 'Manado', sulteng: 'Palu',
        sultra: 'Kendari', sulsel: 'Makassar', sulbar: 'Mamuju', maluku: 'Ambon',
        malut: 'Ternate', papua: 'Jayapura', papbar: 'Manokwari', papsel: 'Merauke',
        papteng: 'Nabire', papgun: 'Wamena', nganjuk: 'Nganjuk', kediri: 'Kediri'
    }

    function voice(id, txt) {
        return new Promise(r => {
            try {
                const g = new gtts(txt, 'id')
                g.save('./voice.mp3', () => {
                    sock.sendMessage(id, { audio: fs.readFileSync('./voice.mp3'), mimetype: 'audio/mp4', ptt: true })
                    r()
                })
            } catch { r() }
        })
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return
        const id = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const args = body.trim().split(/ +/)
        const cmd = args[0].toLowerCase()
        const text = args.slice(1).join(' ')
        const jam = moment().tz('Asia/Jakarta').format('HH:mm:ss')
        const tgl = moment().tz('Asia/Jakarta').format('DD MMMM YYYY')

        if (cmd === '!menu') {
            await sock.sendMessage(id, { text: `*🤖 BANGCATS BOT 24 JAM MAS 🤖*\n📍 Nganjuk Kota Angin Mas\n${tgl} | ${jam} WIB\n\n*MENU MAS:*\n!menu - menu ini mas\n!waktu - cek waktu mas\n!cuaca [kota] - cek cuaca 38 provinsi mas\nContoh:!cuaca nganjuk mas\n!tt [link] - download TikTok mas\n!say [teks] - bot ngomong mas\n!nganjuk - info Nganjuk mas\n\n*Bot aktif tanpa Termux mas!*` })
        }
        else if (cmd === '!waktu') {
            await sock.sendMessage(id, { text: `⏰ Sekarang mas ${jam} WIB - ${tgl} mas\nNganjuk Kota Angin mas!` })
        }
        else if (cmd === '!nganjuk') {
            await sock.sendMessage(id, { text: `📍 *NGANJUK KOTA ANGIN MAS*\n${tgl} ${jam} WIB\nCuaca cerah mas, cocok ngopi mas!\nBot Bangcats ON 24 JAM mas!` })
            await voice(id, `Nganjuk kota angin mas, jam ${jam} mas`)
        }
        else if (cmd === '!cuaca') {
            if (!text) return sock.sendMessage(id, { text: 'Ketik:!cuaca nganjuk mas\n!cuaca jakarta mas\n!cuaca surabaya mas' })
            const kota = provinsi[text.toLowerCase()] || text
            try {
                const r = await axios.get(`https://wttr.in/${kota}?format=%C+%t`)
                const res = `🌤️ *CUACA ${kota.toUpperCase()} MAS*\n${r.data} mas\nJam ${jam} WIB - ${tgl} mas`
                await sock.sendMessage(id, { text: res })
                await voice(id, `Cuaca ${kota} mas ${r.data} mas`)
            } catch {
                await sock.sendMessage(id, { text: 'Gagal cek cuaca mas, coba lagi mas' })
            }
        }
        else if (cmd === '!say') {
            if (!text) return sock.sendMessage(id, { text: '!say halo mas ganteng' })
            await voice(id, text + ' mas')
        }
        else if (cmd === '!tt') {
            if (!text) return sock.sendMessage(id, { text: '!tt [link TikTok] mas' })
            try {
                const r = await axios.get(`https://www.tikwm.com/api/?url=${text}`)
                if (r.data.data) {
                    await sock.sendMessage(id, { video: { url: r.data.data.play }, caption: `✅ Done mas - ${r.data.data.title} mas` })
                }
            } catch {
                await sock.sendMessage(id, { text: 'Gagal download TikTok mas, link salah mas?' })
            }
        }
    })
}
startBot()
