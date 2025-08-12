import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');

    personalCodeParagraph.innerHTML = personalCode;
}

export const clearDialogAndAppend = (domElement) => {
    const dialogContainer = document.getElementById('dialog');
    dialogContainer.querySelectorAll('*').forEach(el => el.remove());
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