import 'express-async-errors';

// express
import express from 'express';
const app = express();

// routes
import matchRouter from './router/matchRoutes.js';

const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/1.0/match', matchRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
