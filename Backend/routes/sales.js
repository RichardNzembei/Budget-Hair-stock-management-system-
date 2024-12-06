const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig'); // Your Firestore setup

// POST a new sale and update stock
router.post('/sales', async (req, res) => {
  const { productType, productSubtype, quantitySold, saleTime } = req.body;

  if (!productType || !productSubtype || !quantitySold) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock');
    const stockDoc = stockRef.doc(productType);

    // Fetch the stock for the given product type
    const productData = (await stockDoc.get()).data() || {};

    // Check if the product subtype exists in stock
    const availableStock = productData[productSubtype];

    if (!availableStock || availableStock < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update the stock: Subtract the sold quantity
    productData[productSubtype] -= quantitySold;

    // If stock for this subtype is now 0, delete it
    if (productData[productSubtype] === 0) {
      delete productData[productSubtype];
    }

    // If all subtypes of this product type are deleted, remove the product type
    if (Object.keys(productData).length === 0) {
      await stockDoc.delete(); // Delete the entire product type if no subtypes remain
    } else {
      await stockDoc.set(productData, { merge: true });
    }

    // Add the sale to Firestore
    const salesRef = firestore.collection('sales');
    const newSale = {
      productType,
      productSubtype,
      quantitySold,
      saleTime: saleTime || new Date().toISOString(),
    };

    // Add the new sale to the Firestore 'sales' collection
    const docRef = await salesRef.add(newSale);
    
    // Return the newly created sale with stock updates
    const saleData = { id: docRef.id, ...newSale };
    res.status(201).json(saleData);
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all sales
router.get('/sales', async (req, res) => {
  try {
    const salesSnapshot = await firestore.collection('sales').get();

    if (salesSnapshot.empty) {
      return res.status(200).json([]);
    }

    const sales = [];
    salesSnapshot.forEach(doc => {
      sales.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
