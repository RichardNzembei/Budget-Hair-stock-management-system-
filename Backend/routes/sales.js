// routes/sales.js
const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig');

// Route to add a new sale
router.post('/sales', async (req, res) => {
  const { productType, productSubtype, quantitySold, saleTime } = req.body;

  if (!productType || !productSubtype || !quantitySold) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const productData = stockDoc.data();

    // Check stock availability
    if (!productData[productSubtype] || productData[productSubtype] < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update stock
    productData[productSubtype] -= quantitySold;
    if (productData[productSubtype] <= 0) {
      delete productData[productSubtype];
    }

    if (Object.keys(productData).length === 0) {
      await stockRef.delete();
    } else {
      await stockRef.set(productData);
    }

    // Record the sale
    const salesRef = firestore.collection('sales');
    const saleData = {
      productType,
      productSubtype,
      quantitySold,
      saleTime: saleTime || new Date().toISOString(),
    };
    const docRef = await salesRef.add(saleData);

    req.io.emit('sale-updated');
    req.io.emit('stock-updated');

    res.status(201).json({ id: docRef.id, ...saleData });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch all sales
router.get('/sales', async (req, res) => {
  try {
    const snapshot = await firestore.collection('sales').get();
    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Server error during sales fetching' });
  }
});

// Route to delete a sale and restore stock
router.delete('/sales/:id', async (req, res) => {
  const saleId = req.params.id;

  try {
    const saleDoc = await firestore.collection('sales').doc(saleId).get();
    if (!saleDoc.exists) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const saleData = saleDoc.data();

    const stockRef = firestore.collection('stock').doc(saleData.productType);
    const stockDoc = await stockRef.get();

    let productData = stockDoc.exists ? stockDoc.data() : {};

    if (productData[saleData.productSubtype]) {
      productData[saleData.productSubtype] += saleData.quantitySold;
    } else {
      productData[saleData.productSubtype] = saleData.quantitySold;
    }

    await stockRef.set(productData);

    await firestore.collection('sales').doc(saleId).delete();

    req.io.emit('sale-updated');
    req.io.emit('stock-updated', {
      productType: saleData.productType,
      isNewProduct: !stockDoc.exists,
    });

    res.status(200).json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Error deleting sale and restoring stock' });
  }
});

module.exports = router;
