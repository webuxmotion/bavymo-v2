import * as wss from "./wss.js";
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;
let dataChannel;
let isDataChannelOpen = false;
let connectionTimeout;
let retryCount = 0;
const MAX_RETRIES = 3;
const CONNECTION_TIMEOUT = 30000; // 30 seconds

const defaultConstraints = {
    audio: true,
    video: true
}

const configuration = {
    iceServers: [
        // {
        //     urls: 'stun:stun.l.google.com:19302'
        // },
        // {
        //     urls: 'stun:stun1.l.google.com:19302'
        // },
        // {
        //     urls: 'stun:stun2.l.google.com:19302'
        // },
        // {
        //     urls: 'stun:stun3.l.google.com:19302'
        // },
        // {
        //     urls: 'stun:stun4.l.google.com:19302'
        // },
        // {
        //     urls: [
        //         'stun:185.233.47.117:3478',
        //         'turn:185.233.47.117:3478?transport=udp',
        //         'turn:185.233.47.117:3478?transport=tcp'
        //     ],
        //     username: 'webrtcuser',
        //     credential: 'strongpassword'
        // }
    ],
    iceCandidatePoolSize: 10
}

export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        })
        .catch((err) => {
            console.log('error occured when trying to get access to camera', err);
        });
}

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);
    isDataChannelOpen = false;
    retryCount = 0;

    // Start connection timeout
    startConnectionTimeout();

    dataChannel = peerConnection.createDataChannel('chat');

    dataChannel.onopen = () => {
        console.log('Data channel opened successfully');
        isDataChannelOpen = true;
    }

    dataChannel.onclose = () => {
        console.log('Data channel closed');
        isDataChannelOpen = false;
    }

    dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
        isDataChannelOpen = false;
    }

    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        isDataChannelOpen = false;

        dataChannel.onopen = () => {
            console.log('Data channel opened successfully');
            isDataChannelOpen = true;
        }

        dataChannel.onclose = () => {
            console.log('Data channel closed');
            isDataChannelOpen = false;
        }

        dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            isDataChannelOpen = false;
        }

        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            ui.appendMessage(message);
        }
    }

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            });
        }
    }

    peerConnection.onconnectionstatechange = (event) => {
        console.log('Connection state changed:', peerConnection.connectionState);

        if (peerConnection.connectionState === 'connected') {
            console.log('WebRTC connection established successfully');
            clearConnectionTimeout();
            retryCount = 0;
            //ui.showInfoDialog('Connection established successfully!');
        } else if (peerConnection.connectionState === 'failed') {
            console.error('WebRTC connection failed');
            isDataChannelOpen = false;
            clearConnectionTimeout();
            ui.showInfoDialog('Connection failed. Please try again.');
        } else if (peerConnection.connectionState === 'disconnected') {
            console.log('WebRTC connection disconnected');
            isDataChannelOpen = false;
            clearConnectionTimeout();
            ui.showInfoDialog('Connection lost. Please reconnect.');
        } else if (peerConnection.connectionState === 'closed') {
            console.log('WebRTC connection closed');
            isDataChannelOpen = false;
            clearConnectionTimeout();
        }
    }

    peerConnection.oniceconnectionstatechange = (event) => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);

        if (peerConnection.iceConnectionState === 'connected' ||
            peerConnection.iceConnectionState === 'completed') {
            console.log('ICE connection established successfully');
        } else if (peerConnection.iceConnectionState === 'failed') {
            console.error('ICE connection failed');
            ui.showInfoDialog('Connection failed. This might be due to network restrictions. Please try again.');
        } else if (peerConnection.iceConnectionState === 'disconnected') {
            console.log('ICE connection disconnected');
            ui.showInfoDialog('Connection lost. Please wait for reconnection or try again.');
        }
    }

    peerConnection.onicegatheringstatechange = (event) => {
        console.log('ICE gathering state:', peerConnection.iceGatheringState);
    }

    // receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    }

    // add our stream to peer connection
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
}

export const sendMessageUsingDataChannel = (message) => {
    if (!dataChannel || !isDataChannelOpen) {
        console.warn('Data channel is not ready. Current state:', {
            dataChannelExists: !!dataChannel,
            isDataChannelOpen: isDataChannelOpen,
            connectionState: peerConnection?.connectionState
        });

        // Show user-friendly error message
        ui.showInfoDialog('Connection not ready. Please wait for the connection to establish or try reconnecting.');
        return false;
    }

    try {
        const stringifiedMessage = JSON.stringify(message);
        dataChannel.send(stringifiedMessage);
        return true;
    } catch (error) {
        console.error('Error sending message via data channel:', error);
        ui.showInfoDialog('Failed to send message. Please try again.');
        return false;
    }
}

export const sendPreOffer = (callType, personalCode) => {
    connectedUserDetails = {
        socketId: personalCode,
        callType,
    };

    if (
        callType === constants.callType.CHAT_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        const data = {
            callType,
            personalCode,
        };
        ui.showOutcomingCallDialog(rejectOutcomingCallHandler);
        wss.sendPreOffer(data);
    }
}


export const handlePreOffer = (data) => {
    const {
        callType,
        personalCode,
    } = data;

    connectedUserDetails = {
        socketId: personalCode,
        callType,
    };

    if (
        callType === constants.callType.CHAT_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
    }
}

export const handlePreOfferAnswer = (data) => {
    const {
        preOfferAnswer
    } = data;

    ui.removeAllDialogs();

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        createPeerConnection();
        sendWebRTCOffer();
        ui.showCallElements(connectedUserDetails.callType);
    }
}

// Update handleWebRTCOffer to flush the queue after setting remote description
export const handleWebRTCOffer = async (data) => {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer,
    });
};

export const handleWebRTCAnswer = async (data) => {
    await peerConnection.setRemoteDescription(data.answer);
}

export const handleWebRTCCandidate = async (data) => {
    try {
        await peerConnection.addIceCandidate(data.candidate);
    } catch (err) {
        console.error('Error adding ICE candidate:', err);
    }
};

// helpers

function acceptCallHandler() {
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
}

function rejectCallHandler() {
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

function rejectOutcomingCallHandler() {

}

function sendPreOfferAnswer(preOfferAnswer) {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer,
    }
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
}

async function sendWebRTCOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer,
    });
}

let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if (screenSharingActive) {
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders();

        const sender = senders.find((sender) => {
            return (sender.track.kind === localStream.getVideoTracks()[0].kind);
        });

        if (sender) {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        // stop screen sharing screen
        store.getState().screenSharingStream.getTracks().forEach((track) => track.stop());

        store.setScreenSharingActive(!screenSharingActive);

        ui.updateLocalVideo(localStream);
    } else {
        try {
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });

            store.setScreenSharingStream(screenSharingStream);

            // replace track which sender is sending
            const senders = peerConnection.getSenders();

            const sender = senders.find((sender) => {
                return (sender.track.kind === screenSharingStream.getVideoTracks()[0].kind);
            });

            if (sender) {
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        } catch (error) {
            console.error('error screen sharing', error);
        }
    }
}

export const getConnectionStatus = () => {
    if (!peerConnection) {
        return {
            status: 'No connection',
            details: 'Peer connection not created'
        };
    }

    return {
        status: peerConnection.connectionState,
        iceConnectionState: peerConnection.iceConnectionState,
        iceGatheringState: peerConnection.iceGatheringState,
        dataChannelReady: isDataChannelOpen,
        hasDataChannel: !!dataChannel
    };
}

export const isConnectionReady = () => {
    return peerConnection &&
        peerConnection.connectionState === 'connected' &&
        isDataChannelOpen;
}

export const getConnectionStats = async () => {
    if (!peerConnection) {
        return null;
    }

    try {
        const stats = await peerConnection.getStats();
        const connectionStats = {};

        stats.forEach((report) => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                connectionStats.localCandidate = report.localCandidateId;
                connectionStats.remoteCandidate = report.remoteCandidateId;
                connectionStats.priority = report.priority;
            }

            if (report.type === 'local-candidate' && report.id === connectionStats.localCandidate) {
                connectionStats.localAddress = report.address;
                connectionStats.localProtocol = report.protocol;
                connectionStats.localType = report.candidateType;
            }

            if (report.type === 'remote-candidate' && report.id === connectionStats.remoteCandidate) {
                connectionStats.remoteAddress = report.address;
                connectionStats.remoteProtocol = report.protocol;
                connectionStats.remoteType = report.candidateType;
            }
        });

        return connectionStats;
    } catch (error) {
        console.error('Error getting connection stats:', error);
        return null;
    }
};

// Debug function for troubleshooting (can be called from browser console)
export const debugConnection = async () => {
    console.log('=== WebRTC Connection Debug Info ===');

    const status = getConnectionStatus();
    console.log('Connection Status:', status);

    const stats = await getConnectionStats();
    console.log('Connection Stats:', stats);

    if (peerConnection) {
        console.log('ICE Connection State:', peerConnection.iceConnectionState);
        console.log('Connection State:', peerConnection.connectionState);
        console.log('Signaling State:', peerConnection.signalingState);
        console.log('Data Channel State:', isDataChannelOpen);

        // Log ICE candidates
        console.log('Local Description:', peerConnection.localDescription);
        console.log('Remote Description:', peerConnection.remoteDescription);
    }

    console.log('Connected User Details:', connectedUserDetails);
    console.log('Retry Count:', retryCount);
    console.log('=====================================');
};

// Make debug function available globally
if (typeof window !== 'undefined') {
    window.debugWebRTC = debugConnection;
}

const startConnectionTimeout = () => {
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
    }

    connectionTimeout = setTimeout(() => {
        if (peerConnection && peerConnection.connectionState !== 'connected') {
            console.warn('Connection timeout - attempting retry');
            handleConnectionTimeout();
        }
    }, CONNECTION_TIMEOUT);
};

const clearConnectionTimeout = () => {
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
    }
};

const handleConnectionTimeout = () => {
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying connection... Attempt ${retryCount}/${MAX_RETRIES}`);

        ui.showInfoDialog(`Connection attempt ${retryCount}/${MAX_RETRIES} failed. Retrying...`);

        // Clean up existing connection
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }

        // Wait a bit before retrying
        setTimeout(() => {
            if (connectedUserDetails) {
                createPeerConnection();
                sendWebRTCOffer();
            }
        }, 2000);
    } else {
        console.error('Max retry attempts reached');
        ui.showInfoDialog('Connection failed after multiple attempts. Please check your network and try again.');
        retryCount = 0;
    }
};