const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig'); // Adjust based on your actual firebaseConfig path
const router = express.Router();

// VAPID keys for push notifications
const vapidKeys = {
  publicKey: 'BE5ilGf0inEseYpOWIFo4sLo593HXBq0Wa8evNkHE9Kf5XnF0Kagb4xzbY1jCrG-SF4DqvF1XDspjzRfZG5ioKY',
  privateKey: '8tl48rW3k3kI9OQLuSjEf9_nFv7qf6xSxrIPzc_uXDA',
};

// Set VAPID details for web-push
webPush.setVapidDetails(
  'mailto:richardsonreuben78@gmail.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Route to subscribe users to notifications
router.post('/subscribe', async (req, res) => {
  const subscription = req.body;

  try {
    // Save the subscription to Firestore
    const subscriptionRef = firestore.collection('subscriptions');
    await subscriptionRef.add(subscription);
    console.log('New subscription saved to Firestore:', subscription);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Error saving subscription' });
  }
});

// Route to trigger a sale notification
router.post('/sale', async (req, res) => {
  const notificationPayload = {
    title: 'New Sale!',
    body: 'A new sale has been recorded.',
  };

  try {
    // Get all subscriptions from Firestore
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();

    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());

    // Send notifications to all subscribers
    await Promise.all(
      subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
      )
    );

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (err) {
    console.error('Error sending notification', err);
    res.status(500).json({ error: 'Error sending notification' });
  }
});

module.exports = router;
