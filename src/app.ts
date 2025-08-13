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

  socket.on('pre-offer', (data) => {
    const { callType, personalCode } = data;

    const connectedPeer = storage.getConnectedPeer(personalCode);

    if (connectedPeer) {
      const data = {
        personalCode: socket.id,
        callType
      };

      io.to(personalCode).emit('pre-offer', data);
    } else {
      const answer = {
        preOfferAnswer: 'CALLEE_NOT_FOUND'
      }

      io.to(socket.id).emit('pre-offer-answer', answer);
    }
  });

  socket.on('pre-offer-answer', (data) => {
    const {
      callerSocketId,
    } = data;

    const connectedPeer = storage.getConnectedPeer(callerSocketId);

    if (connectedPeer) {
      io.to(callerSocketId).emit('pre-offer-answer', data);
    }
  });

  socket.on('webRTC-signaling', (data) => {
    const { connectedUserSocketId } = data;
    const connectedPeer = storage.getConnectedPeer(connectedUserSocketId);

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit('webRTC-signaling', data);
    }
  });

  socket.on('disconnect', () => {
    storage.removePeer(socket.id);
  });
});

export default server;
