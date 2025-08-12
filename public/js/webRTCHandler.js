import * as wss from "./wss.js";
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;

let pendingCandidates = [];

const defaultConstraints = {
    audio: true,
    video: true
}

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:13902'
        }
    ]
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
        if (peerConnection.connectionState === 'connected') {
            console.log('connected with other peer');
        }
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
    console.log('rejectOutcomingCallHandler');
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