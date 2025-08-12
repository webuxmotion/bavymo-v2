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
        ui.showInfoDialog(preOfferAnswer);
    }
}

function acceptCallHandler() {
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
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