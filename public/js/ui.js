import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');

    personalCodeParagraph.innerHTML = personalCode;
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

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog(
            'Callee not found',
            'Please check personal code',
            'rejectedCall.png'
        );
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog(
            'Call is not possible',
            'Probably callee is busy. Please try again later'
        );
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog(
            'Call rejected',
            'Callee rejected your call',
            'rejectedCall.png'
        );
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {

    }

    if (infoDialog) {
        clearDialogAndAppend(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
}