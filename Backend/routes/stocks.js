// routes/stock.js
const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig'); // your Firestore setup

// Add or update stock
router.post('/stock', async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  try {
    const stockRef = firestore.collection('stock');
    const stockDoc = stockRef.doc(productType);

    const productData = (await stockDoc.get()).data() || {};
    productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

    await stockDoc.set(productData, { merge: true });

    res.status(201).json({ message: 'Stock added successfully' });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all stock
router.get('/stock', async (req, res) => {
  try {
    const stockSnapshot = await firestore.collection('stock').get();

    if (stockSnapshot.empty) {
      return res.status(200).json({});
    }

    const stock = {};
    stockSnapshot.forEach(doc => {
      stock[doc.id] = doc.data();
    });

    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
