const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();

const vapidKeys = {
  publicKey: 'BE5ilGf0inEseYpOWIFo4sLo593HXBq0Wa8evNkHE9Kf5XnF0Kagb4xzbY1jCrG-SF4DqvF1XDspjzRfZG5ioKY',
  privateKey: '8tl48rW3k3kI9OQLuSjEf9_nFv7qf6xSxrIPzc_uXDA',
};

// Set VAPID details
webPush.setVapidDetails('mailto:richardsonreuben78@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

router.post('/subscribe', async (req, res) => {
  const subscription = req.body;

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

router.post('/send', async (req, res) => {
  const notificationPayload = {
    title: req.body.title || 'Notification',
    body: req.body.body || 'This is a test notification.',
  };

  try {
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());

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
