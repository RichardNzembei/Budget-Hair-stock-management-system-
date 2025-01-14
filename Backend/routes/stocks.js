const express = require('express');
const router = express.Router();
const firestore = require('../firebaseConfig'); // Firebase configuration
const { FieldValue } = require('firebase-admin').firestore; // Import FieldValue
const admin = require('firebase-admin');
const cron = require('node-cron'); 

// Route to add or update stock and log in a history collection
router.post('/stock', async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();
    const productData = stockDoc.exists ? stockDoc.data() : {};

    // Add or update the stock in the 'stock' collection
    productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

    await stockRef.set(productData, { merge: true });

    // Add an entry in the 'stock_history' collection to log the change
    const historyRef = firestore.collection('stock_history').doc();
    const historyData = {
      productType,
      productSubtype,
      quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Timestamp of the update
      action: 'added', // Action is 'added' for new stock
    };
    await historyRef.set(historyData);

    // Emit stock update event
    req.io.emit('stock-updated', { productType, productSubtype, newStock: productData[productSubtype] });

    res.status(201).json({ message: 'Stock updated successfully', productType, productSubtype, quantity });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to edit stock (update specific product subtype) and log to history
router.put('/stock', async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Stock type not found' });
    }

    const productData = stockDoc.data();

    // Ensure the product subtype exists before editing
    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: 'Stock subtype not found' });
    }

    // Update the stock quantity for the product subtype
    const oldQuantity = productData[productSubtype];
    productData[productSubtype] = quantity;

    await stockRef.set(productData, { merge: true });

    // Add an entry in the 'stock_history' collection to log the update
    const historyRef = firestore.collection('stock_history').doc();
    const historyData = {
      productType,
      productSubtype,
      oldQuantity,
      newQuantity: quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Timestamp of the update
      action: 'edited', // Action is 'edited' for updates
    };
    await historyRef.set(historyData);

    // Emit stock update event
    req.io.emit('stock-updated', { productType, productSubtype, newStock: productData[productSubtype] });

    res.status(200).json({ message: 'Stock updated successfully', productType, productSubtype, quantity });
  } catch (error) {
    console.error('Error editing stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete a stock subtype
router.delete('/stock', async (req, res) => {
  const { productType, productSubtype } = req.body;

  if (!productType || !productSubtype) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Stock type not found' });
    }

    const productData = stockDoc.data();

    // Ensure the product subtype exists before deleting
    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: 'Stock subtype not found' });
    }

    console.log(`Deleting subtype: ${productSubtype} from product type: ${productType}`);

    // Explicitly delete the product subtype using FieldValue.delete()
    await stockRef.update({ [productSubtype]: FieldValue.delete() });

    // Emit stock update event
    req.io.emit('stock-updated', { productType, productSubtype, newStock: null });

    res.status(200).json({ message: 'Stock subtype deleted successfully', productType, productSubtype });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Route to delete a product type (including all its subtypes)
router.delete('/stock/:productType', async (req, res) => {
  const { productType } = req.params;

  if (!productType) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Stock type not found' });
    }

    // Delete the entire product type document
    await stockRef.delete();

    // Emit stock update event
    req.io.emit('stock-deleted', { productType });

    res.status(200).json({ message: 'Product type deleted successfully', productType });
  } catch (error) {
    console.error('Error deleting product type:', error);
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
router.get('/stock/history', async (req, res) => {
  try {
    // Get today's date range (from 00:00:00 to 23:59:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // End of today

    // Query Firestore for entries within the date range
    const snapshot = await firestore.collection('stock_history')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(todayStart))
      .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(todayEnd))
      .get();

    const history = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to JavaScript Date
      if (data.timestamp) {
        data.timestamp = data.timestamp.toDate(); // Convert to Date
      }

      history.push(data);
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Scheduled task to delete all stock history at midnight every day
cron.schedule('0 0 0 * * *', async () => {
  try {
    // Get a snapshot of the stock history
    const snapshot = await firestore.collection('stock_history').get();

    // Delete all stock history entries
    const batch = firestore.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref); // Queue the deletion
    });

    // Commit the batch delete operation
    await batch.commit();

    console.log('All stock history records deleted successfully');
  } catch (error) {
    console.error('Error deleting stock history:', error);
  }
});



module.exports = router;
