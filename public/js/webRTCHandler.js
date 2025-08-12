import * as wss from "./wss.js";
import * as constants from './constants.js';
import * as ui from './ui.js';

let connectedUserDetails;

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

function acceptCallHandler() {
    console.log('accept');
}

function rejectCallHandler() {
    console.log('reject');
}

function rejectOutcomingCallHandler() {
    console.log('rejectOutcomingCallHandler');
}