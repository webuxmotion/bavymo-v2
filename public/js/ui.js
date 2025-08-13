import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');

    personalCodeParagraph.innerHTML = personalCode;
}

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    });
}

export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;

    remoteVideo.addEventListener('loadedmetadata', () => {
        remoteVideo.play();
    });
}

export const clearDialogAndAppend = (domElement) => {
    const dialogContainer = removeAllDialogs();
    dialogContainer.appendChild(domElement);
}

export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 'Chat' : 'Video';

    const incomingCallDialog = elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);
    clearDialogAndAppend(incomingCallDialog);
}

export const showOutcomingCallDialog = (rejectOutcomingCallHandler) => {
    const outcomingCallDialog = elements.getOutcomingCallDialog(rejectOutcomingCallHandler);
    clearDialogAndAppend(outcomingCallDialog);
}

export const removeAllDialogs = () => {
    const dialogContainer = document.getElementById('dialog');
    dialogContainer.querySelectorAll('*').forEach(el => el.remove());

    return dialogContainer;
}

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    // Handle custom string messages
    if (typeof preOfferAnswer === 'string' && !Object.values(constants.preOfferAnswer).includes(preOfferAnswer)) {
        infoDialog = elements.getInfoDialog(
            'Info',
            preOfferAnswer,
            'dialogAvatar.png'
        );
    } else if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog(
            'Callee not found',
            'Please check personal code',
            'rejectedCall.png'
        );
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog(
            'Call is not possible',
            'Probably callee is busy. Please try again later'
        );
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog(
            'Call rejected',
            'Callee rejected your call',
            'rejectedCall.png'
        );
    } else if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {

    }

    if (infoDialog) {
        clearDialogAndAppend(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
}

export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CODE) {
        showChatCallElements();
    }

    if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
        showVideoCallElements();
    }
}

const showChatCallElements = () => {
    const finishChatButtonContainer = document.getElementById('finish_chat_button_container');
    showElement(finishChatButtonContainer);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);

    disableDashboard();
}

const showVideoCallElements = () => {
    const callButtons = document.getElementById('call_buttons');
    showElement(callButtons);

    const videoPlaceholder = document.getElementById('video_placeholder');
    hideElement(videoPlaceholder);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);

    disableDashboard();
}

const micOnImgSrc = '/images/mic.png';
const micOffImgSrc = '/images/micOff.png';

const cameraOnImgSrc = '/images/camera.png';
const cameraOffImgSrc = '/images/cameraOff.png';

// ui messages
export const appendMessage = (message, right = false) => {
    const messagesContainer = document.getElementById('messages_container');
    const messageElement = right ? 
        elements.getRightMessage(message) : 
        elements.getLeftMessage(message);

    messagesContainer.appendChild(messageElement);
}

export const clearMessenger = () => {
    const messagesContainer = document.getElementById('messages_container');
    messagesContainer.querySelectorAll('*').forEach(el => el.remove());
}

// ui call buttons
export const updateMicButton = (micActive) => {
    const micButtonImage = document.getElementById('mic_button_image');
    micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
}

export const updateCameraButton = (cameraActive) => {
    const cameraButtonImage = document.getElementById('camera_button_image');
    cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
}

export const showConnectionStatus = (status) => {
    const statusContainer = document.getElementById('connection_status');
    if (statusContainer) {
        statusContainer.innerHTML = `
            <div class="connection_status">
                <span class="status_label">Connection:</span>
                <span class="status_value ${status.status === 'connected' ? 'connected' : 'disconnected'}">
                    ${status.status}
                </span>
                ${status.dataChannelReady ? '<span class="data_channel_ready">✓ Data Ready</span>' : '<span class="data_channel_not_ready">✗ Data Not Ready</span>'}
            </div>
        `;
    }
}

export const hideConnectionStatus = () => {
    const statusContainer = document.getElementById('connection_status');
    if (statusContainer) {
        statusContainer.innerHTML = '';
    }
}

// ui helpers
const enableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (!dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.add('display_none');
    }
}

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.remove('display_none');
    }
}

const hideElement = (element) => {
    if (!element.classList.contains('display_none')) {
        element.classList.add('display_none');
    }
}

const showElement = (element) => {
    if (element.classList.contains('display_none')) {
        element.classList.remove('display_none');
    }
}