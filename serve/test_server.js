const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('GET / received');
  res.send('Test server working!');
});

app.listen(3002, '0.0.0.0', () => {
  console.log('Test server running on port 3002');
});
