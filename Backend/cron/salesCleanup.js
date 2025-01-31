const cron = require("node-cron");
const admin = require("firebase-admin");

const db = admin.firestore();
const DELETE_AFTER_DAYS = 7; 

const deleteOldSalesFields = async () => {
  console.log("Running sales deletion job...");

  const salesRef = db.collection("sales");
  const snapshot = await salesRef.get();

  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - DELETE_AFTER_DAYS);

  const batch = db.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.saleTime && new Date(data.saleTime) < cutoffDate) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  console.log("Old sales deleted successfully.");
};


cron.schedule("0 0 * * *", deleteOldSalesFields);

module.exports = deleteOldSalesFields;
