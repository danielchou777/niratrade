import 'express-async-errors';

// express
import express from 'express';
const app = express();

// routes
import matchRouter from './router/matchRoutes.js';
import marketdataRouter from './router/marketdataRoutes.js';
import userdataRouter from './router/userdataRoutes.js';
import userAuthRouter from './router/userAuthRoutes.js';

// middleware
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import cors from 'cors';
import jwtVerification from './middleware/jwtVerification.js';

// Socket Initialization
import { createServer } from 'http';
import { createSocketServer } from './utils/socket.js';
const server = createServer(app);
// Socket 設定
createSocketServer(server);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/1.0/match', jwtVerification, matchRouter);
app.use('/api/1.0/marketdata', marketdataRouter);
app.use('/api/1.0/userdata', jwtVerification, userdataRouter);
app.use('/api/1.0/user', userAuthRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
