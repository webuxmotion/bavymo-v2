let state = {
    socketId: null,
    localStream: null,
    remoteStream: null,
    screenSharingStream: null,
    allowConnectionsFromStrangers: false,
    screenSharingActive: false,
};

export const setSocketId = (socketId) => {
    state = {
        ...state,
        socketId,
    };
};

export const setLocalStream = (localStream) => {
    state = {
        ...state,
        localStream,
    };
};

export const setRemoteStream = (remoteStream) => {
    state = {
        ...state,
        remoteStream,
    };
};

export const setScreenSharingStream = (screenSharingStream) => {
    state = {
        ...state,
        screenSharingStream,
    };
};

export const setAllowConnectionsFromStrangers = (allow) => {
    state = {
        ...state,
        allowConnectionsFromStrangers: allow,
    };
};

export const setScreenSharingActive = (active) => {
    state = {
        ...state,
        screenSharingActive: active,
    };
};

// Optional getter if you want to read the state
export const getState = () => {
    return { ...state };
};