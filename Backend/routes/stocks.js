const express = require("express");
const router = express.Router();
const firestore = require("../firebaseConfig");
const { FieldValue } = require("firebase-admin").firestore;
const admin = require("firebase-admin");
const cron = require("node-cron");

router.post("/stock", async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();
    const productData = stockDoc.exists ? stockDoc.data() : {};

    productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

    await stockRef.set(productData, { merge: true });

    const historyRef = firestore.collection("stock_history").doc();
    const historyData = {
      productType,
      productSubtype,
      quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await historyRef.set(historyData);

    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: productData[productSubtype],
    });

    res
      .status(201)
      .json({
        message: "Stock updated successfully",
        productType,
        productSubtype,
        quantity,
      });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/stock", async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    const productData = stockDoc.data();

    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: "Stock subtype not found" });
    }

    const oldQuantity = productData[productSubtype];
    productData[productSubtype] = quantity;

    await stockRef.set(productData, { merge: true });

    const historyRef = firestore.collection("stock_history").doc();
    const historyData = {
      productType,
      productSubtype,
      oldQuantity,
      newQuantity: quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "edited",
    };
    await historyRef.set(historyData);

    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: productData[productSubtype],
    });

    res
      .status(200)
      .json({
        message: "Stock updated successfully",
        productType,
        productSubtype,
        quantity,
      });
  } catch (error) {
    console.error("Error editing stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stock", async (req, res) => {
  const { productType, productSubtype } = req.body;

  if (!productType || !productSubtype) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    const productData = stockDoc.data();

    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: "Stock subtype not found" });
    }

    console.log(
      `Deleting subtype: ${productSubtype} from product type: ${productType}`
    );

    await stockRef.update({ [productSubtype]: FieldValue.delete() });

    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: null,
    });

    res
      .status(200)
      .json({
        message: "Stock subtype deleted successfully",
        productType,
        productSubtype,
      });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stock/:productType", async (req, res) => {
  const { productType } = req.params;

  if (!productType) {
    return res.status(400).json({ error: "Invalid product type" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    await stockRef.delete();

    req.io.emit("stock-deleted", { productType });

    res
      .status(200)
      .json({ message: "Product type deleted successfully", productType });
  } catch (error) {
    console.error("Error deleting product type:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/stock", async (req, res) => {
  try {
    const snapshot = await firestore.collection("stock").get();
    const stock = {};
    snapshot.forEach((doc) => {
      stock[doc.id] = doc.data();
    });
    res.status(200).json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get('/stock/history', async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Query range:', startOfDay.toISOString(), endOfDay.toISOString());

    const snapshot = await firestore
      .collection('stock_history')
      .where('timestamp', '>=', startOfDay)  // ✅ Use Date object, not string
      .where('timestamp', '<=', endOfDay)    // ✅ Use Date object, not string
      .orderBy('timestamp', 'desc')
      .get();

    const history = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert Firestore Timestamp to ISO string
      if (data.timestamp instanceof admin.firestore.Timestamp) {
        data.timestamp = data.timestamp.toDate().toISOString();
      }

      return { id: doc.id, ...data };
    });

    console.log('Fetched stock history for today:', history);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error.message, error.stack);
    res.status(500).json({ error: 'Server error during stock history fetching' });
  }
});

module.exports = router;
