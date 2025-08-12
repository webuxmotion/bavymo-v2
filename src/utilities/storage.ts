type SocketId = string;
type ConnectedPeers = SocketId[];

type AddNewPeer = (socketId: SocketId) => void;
type GetConnectedPeers = () => ConnectedPeers;
type GetConnectedPeer = (socketId: SocketId) => SocketId | undefined;
type RemovePeer = (socketId: SocketId) => void;

type ServerStore = {
    addNewPeer: AddNewPeer;
    getConnectedPeers: GetConnectedPeers;
    getConnectedPeer: GetConnectedPeer;
    removePeer: RemovePeer;
};

let connectedPeers: ConnectedPeers = [];

const addNewPeer: AddNewPeer = (socketId) => {
    connectedPeers.push(socketId);
};

const getConnectedPeers: GetConnectedPeers = () => {
    return connectedPeers;
};

const removePeer: RemovePeer = (socketId) => {
    connectedPeers = connectedPeers.filter((id) => id !== socketId);
};

const getConnectedPeer: GetConnectedPeer = (socketId) => {
    return connectedPeers.find((peerSocketId) => peerSocketId === socketId);
};

const storage: ServerStore = {
    addNewPeer,
    getConnectedPeers,
    getConnectedPeer,
    removePeer,
};

export default storage;