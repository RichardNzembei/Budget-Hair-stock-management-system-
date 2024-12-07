const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://budget-hair-stock-management-system.vercel.app',
];

app.use(bodyParser.json());


app.use(cors({
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
