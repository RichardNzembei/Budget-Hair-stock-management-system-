const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();

// VAPID keys for Web Push notifications (secured using environment variables)
const vapidKeys = {
  publicKey: 'BE5ilGf0inEseYpOWIFo4sLo593HXBq0Wa8evNkHE9Kf5XnF0Kagb4xzbY1jCrG-SF4DqvF1XDspjzRfZG5ioKY',
  privateKey: '8tl48rW3k3kI9OQLuSjEf9_nFv7qf6xSxrIPzc_uXDA',
};

webPush.setVapidDetails('mailto:richardsonreuben78@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

// Send notification function
const sendNotification = async (notificationPayload) => {
  try {
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());

    await Promise.all(
      subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
      )
    );
    console.log('Notifications sent successfully');
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

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
    if (productData[productSubtype] < 0) {
      productData[productSubtype] = 0;
    }

    await stockRef.set(productData);

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

    // Send notification on sale update
    const notificationPayload = {
      title: 'Sale Updated',
      body: `A sale of ${quantitySold} ${productSubtype} of ${productType} was made.`,
      icon: '/path/to/icon.png', // Optional: path to notification icon
      actions: [
        { action: 'view', title: 'View Details' },
      ],
    };
    await sendNotification(notificationPayload);

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

    // Send notification for deleted sale
    const notificationPayload = {
      title: 'Sale Deleted',
      body: `A sale of ${saleData.quantitySold} ${saleData.productSubtype} of ${saleData.productType} was restored to stock.`,
      icon: '/path/to/icon.png', // Optional: path to notification icon
      actions: [
        { action: 'view', title: 'View Details' },
      ],
    };
    await sendNotification(notificationPayload);

    res.status(200).json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Error deleting sale and restoring stock' });
  }
});

module.exports = router;
