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

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const productData = stockDoc.data();
    console.log("Fetched stock data:", productData);

    // Check if stock exists for the subtype and has enough quantity
    if (!productData[productSubtype] || productData[productSubtype] < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update the stock for the subtype
    productData[productSubtype] -= quantitySold;
    console.log(`Updated stock for ${productSubtype}:`, productData[productSubtype]);

    // If the stock for the subtype is zero, remove it
    if (productData[productSubtype] <= 0) {
      console.log(`Removing subtype ${productSubtype} from stock.`);
      delete productData[productSubtype];
    }

    // Check if no subtypes are left and delete the product type document
    if (Object.keys(productData).length === 0) {
      console.log(`No subtypes left, deleting document for ${productType}`);
      await stockRef.delete();  // Delete the entire document
      console.log(`Document for ${productType} deleted from Firestore.`);
    } else {
      console.log(`Updating Firestore document for ${productType}:`, productData);
      await stockRef.set(productData);  // Full update without merge
      console.log(`Firestore document for ${productType} updated.`);
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
    console.log("Sale recorded:", saleData);

    // Emit WebSocket events
    req.io.emit('sale-updated');
    req.io.emit('stock-updated');

    res.status(201).json({ id: docRef.id, ...saleData });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Route to fetch all sales records
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

module.exports = router;
