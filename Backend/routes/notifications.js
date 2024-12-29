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

// Route to handle subscription
router.post('/subscribe', async (req, res) => {
  const subscription = req.body;

  // Validate the subscription data here if needed
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription data' });
  }

  try {
    const subscriptionRef = firestore.collection('subscriptions');
    await subscriptionRef.add(subscription);
    console.log('New subscription saved:', subscription);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Error saving subscription' });
  }
});

// Route to send notifications
router.post('/send', async (req, res) => {
  const notificationPayload = {
    title: req.body.title || 'Notification',
    body: req.body.body || 'This is a test notification.',
  };

  try {
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());

    // Send notifications concurrently with individual error handling
    await Promise.all(
      subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
          .catch((error) => {
            console.error('Error sending notification to subscription', subscription, error);
            // Optionally, log or retry failed notifications
          })
      )
    );

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

module.exports = router;
