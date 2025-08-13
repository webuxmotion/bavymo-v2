import * as wss from "./wss.js";
import * as store from './store.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from './ui.js';

// initialization of socketIO connection
const socket = io();
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

const personalCodeCopyButton = document.getElementById('personal_code_copy_button');
personalCodeCopyButton.addEventListener('click', () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

const personalCodeChatButton = document.getElementById('personal_code_chat_button');
personalCodeChatButton.addEventListener('click', () => {
    const calleePersonalCode = document.getElementById('personal_code_input').value;
    const callType = constants.callType.CHAT_PERSONAL_CODE;

    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

const personalCodeVideoButton = document.getElementById('personal_code_video_button');
personalCodeVideoButton.addEventListener('click', () => {
    const calleePersonalCode = document.getElementById('personal_code_input').value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE;

    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

// event listeners for video call buttons
const micButton = document.getElementById('mic_button');
micButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;

    ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById('camera_button');
cameraButton.addEventListener('click', () => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;

    ui.updateCameraButton(cameraEnabled);
});