const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://afproject:123@citypulse.xa9v9oa.mongodb.net/playwright?appName=citypulse';


mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => res.send('OK'));

app.get('/users', async (req, res) => {
  const users = await User.find().lean();
  const mapped = users.map(u => ({ ...u, id: u._id }));
  res.json(mapped);
});

app.post('/users', async (req, res) => {
  const created = await User.create(req.body || {});
  const obj = created.toObject();
  obj.id = obj._id;
  console.log('Created user', obj.id);
  res.status(201).json(obj);
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'Not found' });
    user.id = user._id;
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body || {}, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    updated.id = updated._id;
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

module.exports = app;
