"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let connectedPeers = [];
const addNewPeer = (socketId) => {
    connectedPeers.push(socketId);
};
const getConnectedPeers = () => {
    return connectedPeers;
};
const removePeer = (socketId) => {
    connectedPeers = connectedPeers.filter(id => id !== socketId);
};
const storage = {
    addNewPeer,
    getConnectedPeers,
    removePeer,
};
exports.default = storage;
//# sourceMappingURL=storage.js.map