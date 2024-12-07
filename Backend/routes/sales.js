const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig');

router.post('/sales', async (req, res) => {
  const { productType, productSubtype, quantitySold, saleTime } = req.body;

  if (!productType || !productSubtype || !quantitySold) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();
    const productData = stockDoc.exists ? stockDoc.data() : {};

    if (!productData[productSubtype] || productData[productSubtype] < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    productData[productSubtype] -= quantitySold;
    if (productData[productSubtype] === 0) delete productData[productSubtype];
    if (Object.keys(productData).length === 0) await stockRef.delete();
    else await stockRef.set(productData, { merge: true });

    const salesRef = firestore.collection('sales');
    const saleData = {
      productType,
      productSubtype,
      quantitySold,
      saleTime: saleTime || new Date().toISOString(),
    };
    const docRef = await salesRef.add(saleData);

    res.status(201).json({ id: docRef.id, ...saleData });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/sales', async (req, res) => {
  try {
    const snapshot = await firestore.collection('sales').get();
    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
