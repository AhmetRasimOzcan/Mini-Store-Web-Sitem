const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/ministore', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB bağlantı hatası:'));
db.once('open', () => {
    console.log('MongoDB bağlantısı başarılı.');
});

const orderSchema = new mongoose.Schema({
    ad: String,
    soyad: String,
    telefon: String,
    adres: String,
    krediKartiBilgileri: {
        kartNumarasi: String,
        sonKullanimTarihi: String,
        guvenlikKodu: String
    },

});

const Order = mongoose.model('Order', orderSchema, 'orders');

let sepet = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/odeme', (req, res) => {
    res.sendFile(__dirname + '/odeme.html');
});

app.post('/odeme', async (req, res) => {
    const { ad, soyad, telefon, adres, krediKartiBilgileri, } = req.body;

    const yeniSiparis = new Order({
        ad,
        soyad,
        telefon,
        adres,
        krediKartiBilgileri,
    });

    try {
        const savedOrder = await yeniSiparis.save();
        console.log('Sipariş başarıyla kaydedildi:', savedOrder);
        sepet = [];
        res.send('Ödeme başarıyla alındı.');
    } catch (error) {
        console.error('Sipariş kaydedilemedi:', error);
        res.status(500).send('Ödeme işlemi sırasında bir hata oluştu.');
    }
});

app.post('/sepete-ekle', (req, res) => {
    const { orderNumber, products } = req.body;
    // MongoDB'ye sipariş bilgilerini kaydet
    const yeniSiparis = new Order({
        siparisNumarasi: orderNumber,
        urunler: products
    });

    yeniSiparis.save()
        .then(savedOrder => {
            console.log('Sipariş başarıyla kaydedildi:', savedOrder);
            res.json({ success: true });
        })
        .catch(error => {
            console.error('Sipariş kaydedilemedi:', error);
            res.status(500).json({ success: false, error: 'Ödeme işlemi sırasında bir hata oluştu.' });
        });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor.`);
});
