const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();
const deleteOldSalesFields = require("../cron/salesCleanup");

const vapidKeys = {
  publicKey: 'BLXNZaVwiz5mh3WI_Zqf-e77TvVs80zxJX0KL8MZEB2KRcAvPANCekrwj8vbGrNT6nMGmwu1zxbBOdMd8S6kaGM',
  privateKey:'IQtpY0qIYG999VvQXcPAcmK7PnIYbwBJYY5I3If-MJA',
};

webPush.setVapidDetails('mailto:richardsonreuben78@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);


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

    if (!productData[productSubtype] || productData[productSubtype] < quantitySold) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

   
    productData[productSubtype] -= quantitySold;
    if (productData[productSubtype] < 0) {
      productData[productSubtype] = 0;
    }

    await stockRef.set(productData);

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

 
    const notificationPayload = {
      title: 'Sale Updated',
      body: `A sale of ${quantitySold} ${productSubtype} of ${productType} was made.`,
      icon: '/path/to/icon.png',
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

router.patch('/sales/:id', async (req, res) => {
  const saleId = req.params.id;
  const { quantityToRestore } = req.query; 

  if (!quantityToRestore || quantityToRestore <= 0) {
    return res.status(400).json({ error: 'Invalid quantity to restore' });
  }

  try {
    const saleDoc = await firestore.collection('sales').doc(saleId).get();
    if (!saleDoc.exists) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const saleData = saleDoc.data();

    if (quantityToRestore > saleData.quantitySold) {
      return res.status(400).json({ error: 'Quantity to restore cannot exceed quantity sold' });
    }

    const stockRef = firestore.collection('stock').doc(saleData.productType);
    const stockDoc = await stockRef.get();

    let productData = stockDoc.exists ? stockDoc.data() : {};

    if (productData[saleData.productSubtype]) {
      productData[saleData.productSubtype] += parseInt(quantityToRestore);
    } else {
      productData[saleData.productSubtype] = parseInt(quantityToRestore);
    }

    await stockRef.set(productData);

    const updatedQuantitySold = saleData.quantitySold - quantityToRestore;

    if (updatedQuantitySold <= 0) {
      await firestore.collection('sales').doc(saleId).delete();
      req.io.emit('sale-deleted');
      res.status(200).json({ message: 'Sale fully restored and deleted, stock updated' });
    } else {
      await firestore.collection('sales').doc(saleId).update({
        quantitySold: updatedQuantitySold,
      });
      req.io.emit('sale-updated');
      res.status(200).json({ message: 'Sale updated and stock restored' });
    }
    req.io.emit('stock-updated', {
      productType: saleData.productType,
      isNewProduct: !stockDoc.exists,
    });
    const notificationPayload = {
      title: 'Sale Updated',
      body: updatedQuantitySold <= 0
        ? `The sale of ${saleData.quantitySold} ${saleData.productSubtype} of ${saleData.productType} has been fully restored and deleted.`
        : `The sale of ${saleData.quantitySold} ${saleData.productSubtype} of ${saleData.productType} has been updated. ${quantityToRestore} items have been restored to stock.`,
      icon: '/path/to/icon.png', 
      actions: [
        { action: 'view', title: 'View Details' },
      ],
    };
    await sendNotification(notificationPayload);

  } catch (error) {
    console.error('Error updating sale and restoring stock:', error);
    res.status(500).json({ error: 'Error updating sale and restoring stock' });
  }
});

router.post("/delete-sales-now", async (req, res) => {
  // curl -X POST http://localhost:5000/api/delete-sales-now
  console.log("🔄 Manual deletion job triggered...");

  try {
    await deleteOldSalesFields();
    console.log("✅ Manual deletion completed successfully.");
    
    res.status(200).json({ message: "Manual deletion job ran successfully." });
  } catch (error) {
    console.error("❌ Error running deletion job:", error);

    res.status(500).json({ error: "Error running deletion job" });
  }
});

module.exports = router;
