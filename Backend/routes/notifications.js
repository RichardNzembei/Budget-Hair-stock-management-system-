const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();

const vapidKeys = {
  publicKey: 'BLXNZaVwiz5mh3WI_Zqf-e77TvVs80zxJX0KL8MZEB2KRcAvPANCekrwj8vbGrNT6nMGmwu1zxbBOdMd8S6kaGM',
  privateKey: 'IQtpY0qIYG999VvQXcPAcmK7PnIYbwBJYY5I3If-MJA',
};

// Set VAPID details
webPush.setVapidDetails('mailto:richardsonreuben78@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

router.post('/subscribe', async (req, res) => {
  const subscription = req.body;

  try {
    console.log('Received subscription:', subscription);
    const subscriptionRef = firestore.collection('subscriptions');
    await subscriptionRef.add(subscription);
    console.log('New subscription saved:', subscription);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Error saving subscription' });
  }
});

router.post('/send', async (req, res) => {
  const notificationPayload = {
    title: req.body.title || 'Notification',
    body: req.body.body || 'This is a test notification.',
  };

  try {
    console.log('Sending notification with payload:', notificationPayload);
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    console.log('Fetched subscriptions:', subscriptionsSnapshot.size);

    if (subscriptionsSnapshot.empty) {
      console.log('No subscriptions found.');
      return res.status(404).json({ message: 'No subscriptions found' });
    }

    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());
    console.log('Sending notifications to subscriptions:', subscriptions);

    await Promise.all(
      subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
      )
    );

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

module.exports = router;
