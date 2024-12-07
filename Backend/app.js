const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 5000;



app.use(bodyParser.json());


app.use(cors());

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
