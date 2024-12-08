const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig');

// Route to update stock
router.post('/stock', async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();
    const productData = stockDoc.exists ? stockDoc.data() : {};

    productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

    await stockRef.set(productData, { merge: true });

    // Emit stock update event
    req.io.emit('stock-updated', { productType, productSubtype, newStock: productData[productSubtype] });

    res.status(201).json({ message: 'Stock updated successfully', productType, productSubtype, quantity });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch current stock
router.get('/stock', async (req, res) => {
  try {
    const snapshot = await firestore.collection('stock').get();
    const stock = {};
    snapshot.forEach((doc) => {
      stock[doc.id] = doc.data();
    });
    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
