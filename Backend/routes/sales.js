const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();
const deleteOldSalesFields = require('../cron/salesCleanup');
const admin = require('firebase-admin');

const vapidKeys = {
  publicKey: 'BLXNZaVwiz5mh3WI_Zqf-e77TvVs80zxJX0KL8MZEB2KRcAvPANCekrwj8vbGrNT6nMGmwu1zxbBOdMd8S6kaGM',
  privateKey: 'IQtpY0qIYG999VvQXcPAcmK7PnIYbwBJYY5I3If-MJA',
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
  if (!productType || !productSubtype || !quantitySold || typeof quantitySold !== 'number' || quantitySold <= 0) {
    return res.status(400).json({ error: 'Invalid sale data: productType, productSubtype, and valid quantitySold are required' });
  }

  try {
    const stockRef = firestore.collection('stock').doc(productType);
    const stockDoc = await stockRef.get();
    if (!stockDoc.exists) {
      return res.status(404).json({ error: `Product type ${productType} not found` });
    }

    const productData = stockDoc.data();
    if (!productData[productSubtype] || productData[productSubtype] < quantitySold) {
      return res.status(400).json({ error: `Insufficient stock for ${productSubtype}` });
    }

    const newStock = productData[productSubtype] - quantitySold;
    productData[productSubtype] = newStock >= 0 ? newStock : 0;
    await stockRef.set(productData);

    const salesRef = firestore.collection('sales');
    const saleData = {
      productType,
      productSubtype,
      quantitySold,
      saleTime: saleTime || admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await salesRef.add(saleData);

    const saleResponse = { id: docRef.id, ...saleData };
    if (saleData.saleTime instanceof admin.firestore.Timestamp) {
      saleResponse.saleTime = saleData.saleTime.toDate().toISOString();
    }

    const stockPayload = {
      productType,
      productSubtype,
      newStock: productData[productSubtype] === 0 ? null : productData[productSubtype],
    };
    console.log('Emitting stock-updated:', stockPayload);
    req.io.emit('stock-updated', stockPayload);

    console.log('Emitting sale-updated:', saleResponse);
    req.io.emit('sale-updated', saleResponse);

    const notificationPayload = {
      title: 'Sale Recorded',
      body: `Sold ${quantitySold} units of ${productSubtype} (${productType}).`,
      icon: '/path/to/icon.png',
      actions: [{ action: 'view', title: 'View Details' }],
    };
    await sendNotification(notificationPayload);

    res.status(201).json(saleResponse);
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Server error processing sale' });
  }
});

router.get('/sales', async (req, res) => {
  try {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - 4);
    const snapshot = await firestore
      .collection('sales')
      .where('saleTime', '>=', cutoffDate.toISOString())
      .orderBy('saleTime', 'desc')
      .get();

    const sales = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.saleTime instanceof admin.firestore.Timestamp) {
        data.saleTime = data.saleTime.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
    console.log('Fetched 5-day sales:', sales);
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching 5-day sales:', error);
    res.status(500).json({ error: 'Server error during sales fetching' });
  }
});

router.get('/sales/all-time', async (req, res) => {
  try {
    const snapshot = await firestore
      .collection('sales')
      .orderBy('saleTime', 'desc')
      .get();

    const sales = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.saleTime instanceof admin.firestore.Timestamp) {
        data.saleTime = data.saleTime.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
    console.log('Fetched all-time sales:', sales);
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching all-time sales:', error);
    res.status(500).json({ error: 'Server error during all-time sales fetching' });
  }
});

router.get('/sales/date-range', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const snapshot = await firestore
      .collection('sales')
      .where('saleTime', '>=', start.toISOString())
      .where('saleTime', '<=', end.toISOString())
      .orderBy('saleTime', 'desc')
      .get();

    const sales = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.saleTime instanceof admin.firestore.Timestamp) {
        data.saleTime = data.saleTime.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
    console.log('Fetched sales by date range:', sales);
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    res.status(500).json({ error: 'Server error during date range sales fetching' });
  }
});

router.patch('/sales/:id', async (req, res) => {
  const saleId = req.params.id;
  const { quantityToRestore } = req.query;

  if (!quantityToRestore || isNaN(quantityToRestore) || quantityToRestore <= 0) {
    return res.status(400).json({ error: 'Invalid quantity to restore' });
  }

  try {
    const saleDoc = await firestore.collection('sales').doc(saleId).get();
    if (!saleDoc.exists) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const saleData = saleDoc.data();
    if (parseInt(quantityToRestore) > saleData.quantitySold) {
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

    const updatedQuantitySold = saleData.quantitySold - parseInt(quantityToRestore);
    let responseMessage;
    if (updatedQuantitySold <= 0) {
      await firestore.collection('sales').doc(saleId).delete();
      req.io.emit('sale-deleted', { id: saleId });
      responseMessage = 'Sale fully restored and deleted, stock updated';
    } else {
      await firestore.collection('sales').doc(saleId).update({
        quantitySold: updatedQuantitySold,
      });
      const updatedSaleData = {
        id: saleId,
        productType: saleData.productType,
        productSubtype: saleData.productSubtype,
        quantitySold: updatedQuantitySold,
        saleTime: saleData.saleTime instanceof admin.firestore.Timestamp
          ? saleData.saleTime.toDate().toISOString()
          : saleData.saleTime,
      };
      req.io.emit('sale-updated', updatedSaleData);
      responseMessage = 'Sale updated and stock restored';
    }

    const stockPayload = {
      productType: saleData.productType,
      productSubtype: saleData.productSubtype,
      newStock: productData[saleData.productSubtype],
    };
    console.log('Emitting stock-updated:', stockPayload);
    req.io.emit('stock-updated', stockPayload);

    const notificationPayload = {
      title: 'Sale Updated',
      body: updatedQuantitySold <= 0
        ? `Sale of ${saleData.quantitySold} ${saleData.productSubtype} (${saleData.productType}) fully restored and deleted.`
        : `Sale of ${saleData.quantitySold} ${saleData.productSubtype} (${saleData.productType}) updated. ${quantityToRestore} units restored to stock.`,
      icon: '/path/to/icon.png',
      actions: [{ action: 'view', title: 'View Details' }],
    };
    await sendNotification(notificationPayload);

    res.status(200).json({ message: responseMessage });
  } catch (error) {
    console.error('Error updating sale and restoring stock:', error);
    res.status(500).json({ error: 'Error updating sale and restoring stock' });
  }
});

router.post('/delete-sales-now', async (req, res) => {
  console.log('🔄 Manual deletion job triggered...');
  try {
    await deleteOldSalesFields();
    console.log('✅ Manual deletion completed successfully.');
    res.status(200).json({ message: 'Manual deletion job ran successfully.' });
  } catch (error) {
    console.error('❌ Error running deletion job:', error);
    res.status(500).json({ error: 'Error running deletion job' });
  }
});

module.exports = router;