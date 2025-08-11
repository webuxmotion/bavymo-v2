"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const storage_1 = __importDefault(require("./utilities/storage"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const secrets_1 = require("./utilities/secrets");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, express_session_1.default)({
    secret: secrets_1.SESSION_SECRET,
    cookie: {
        maxAge: 60000
    },
    resave: false,
    saveUninitialized: false
}));
io.on('connection', (socket) => {
    storage_1.default.addNewPeer(socket.id);
    socket.on('message', (data) => {
        console.log(`Message from ${socket.id}: ${data}`);
        io.emit('message', data);
    });
    socket.on('disconnect', () => {
        storage_1.default.removePeer(socket.id);
    });
});
exports.default = server;
//# sourceMappingURL=app.js.map