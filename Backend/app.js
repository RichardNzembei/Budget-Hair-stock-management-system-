const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://budget-hair-stock-management-system.vercel.app'
];

app.use(bodyParser.json());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy error: Origin not allowed'));
    }
  }
}));

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
