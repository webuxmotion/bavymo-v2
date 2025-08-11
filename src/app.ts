import express from 'express';
import { Application, Request, Response } from 'express';
import path from 'path';
import http, { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import storage from './utilities/storage';
import session from 'express-session';
import helmet from "helmet";
import compression from "compression";
import { SESSION_SECRET } from "./utilities/secrets";

const app: Application = express();
const server: HTTPServer = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.static('public'));
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(helmet());
app.use(compression());
app.use(session({
  secret: SESSION_SECRET,
  cookie: {
    maxAge: 60000
  },
  resave: false,
  saveUninitialized: false
}
));

io.on('connection', (socket: Socket) => {
  storage.addNewPeer(socket.id);

  socket.on('message', (data: string) => {
    console.log(`Message from ${socket.id}: ${data}`);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    storage.removePeer(socket.id);
  });
});

export default server;
