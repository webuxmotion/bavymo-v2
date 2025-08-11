type SocketId = string;
type ConnectedPeers = SocketId[];
type ServerStore = {
    addNewPeer: (socketId: SocketId) => void;
    getConnectedPeers: () => ConnectedPeers;
    removePeer: (socketId: SocketId) => void;
}

let connectedPeers: ConnectedPeers = [];

const addNewPeer = (socketId: SocketId): void => {
    connectedPeers.push(socketId);
}

const getConnectedPeers = (): ConnectedPeers => {
    return connectedPeers;
}

const removePeer = (socketId: SocketId): void => {
    connectedPeers = connectedPeers.filter(id => id !== socketId);
}

const storage: ServerStore = {
    addNewPeer,
    getConnectedPeers,
    removePeer,
}

export default storage;