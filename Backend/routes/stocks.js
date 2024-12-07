const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig'); // Firestore setup

// Add or update stock
router.post('/stock', async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  try {
    const stockRef = firestore.collection('stock').doc(productType);

    await firestore.runTransaction(async (transaction) => {
      const stockDoc = await transaction.get(stockRef);

      const productData = stockDoc.exists ? stockDoc.data() : {};
      productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

      transaction.set(stockRef, productData, { merge: true });
    });

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
    stockSnapshot.forEach((doc) => {
      stock[doc.id] = doc.data();
    });

    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock by product type
router.get('/stock/:productType', async (req, res) => {
  const { productType } = req.params;

  try {
    const stockDoc = await firestore.collection('stock').doc(productType).get();

    if (!stockDoc.exists) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    res.status(200).json(stockDoc.data());
  } catch (error) {
    console.error(`Error fetching stock for ${productType}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
