const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Full path to your data.json file
const dataFile = path.join(__dirname, 'data.json');

// 🔹 Function to read JSON data from file
function readData() {
  try {
    const fileContent = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('❌ Error reading data.json:', err);
    return [];
  }
}

// 🔹 Function to write JSON data to file
function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Data successfully saved to data.json');
  } catch (err) {
    console.error('❌ Error writing to data.json:', err);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// ➕ POST: Add new user
app.post('/api/users', (req, res) => {
  const { Name, Age, City } = req.body;

  if (!Name || !Age || !City) {
    return res.status(400).send('Missing required fields');
  }

  const data = readData(); // read latest data from file
  data.push({ Name, Age: Number(Age), City });

  writeData(data); // ✅ actually write back to file

  res.redirect('/api/add?st=success');
});

// 🧾 GET: Add page with optional message
app.get('/api/add', (req, res) => {
  const status = req.query.st;
  if (status === 'success') {
    res.send(`
      <html>
        <body>
          <h1>User added successfully!</h1>
          <a href="/api/add">Go back</a>
        </body>
      </html>
    `);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'add.html'));
  }
});

// 🔍 GET: Get all users or filter
app.get('/api/users', (req, res) => {
  const { q = '', age = '' } = req.query;
  const data = readData();

  const filtered = data.filter(item => {
    const matchName = q ? item.Name.toLowerCase().includes(q.toLowerCase()) : true;
    const matchAge = age ? item.Age.toString().includes(age) : true;
    return matchName && matchAge;
  });

  res.json(filtered);
});

// 🚀 Start the server
app.listen(3000, () => {
  console.log('✅ Server is running on port 3000');
});
