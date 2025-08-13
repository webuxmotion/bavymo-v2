export const getIncomingCallDialog = (callTypeInfo, acceptCallHandler, rejectCallHandler) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="dialog_wrapper">
      <div class="dialog_content">
        <p class="dialog_title">Incoming ${callTypeInfo} Call</p>
        <div class="dialog_image_container">
          <img src="/images/dialogAvatar.png" alt="Caller avatar" />
        </div>
        <div class="dialog_button_container">
          <button id="accept_button" class="dialog_accept_call_button">
            <img src="/images/acceptCall.png" class="dialog_button_image" alt="" />
          </button>
          <button id="reject_button" class="dialog_reject_call_button">
            <img src="/images/rejectCall.png" class="dialog_button_image" alt="" />
          </button>
        </div>
      </div>
    </div>
  `;

  wrapper.querySelector('#accept_button').addEventListener('click', acceptCallHandler);
  wrapper.querySelector('#reject_button').addEventListener('click', rejectCallHandler);

  return wrapper.firstElementChild;
};

export const getOutcomingCallDialog = (rejectOutcomingCallHandler) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="dialog_wrapper">
      <div class="dialog_content">
        <p class="dialog_title">Calling...</p>
        <div class="dialog_image_container">
          <img src="/images/dialogAvatar.png" alt="Caller avatar" />
        </div>
        <div class="dialog_button_container">
          <button id="reject_button" class="dialog_reject_call_button">
            <img src="/images/rejectCall.png" class="dialog_button_image" alt="" />
          </button>
        </div>
      </div>
    </div>
  `;

  wrapper.querySelector('#reject_button').addEventListener('click', rejectOutcomingCallHandler);

  return wrapper.firstElementChild;
}

export const getInfoDialog = (title, description, iconFilename = 'dialogAvatar.png') => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="dialog_wrapper">
      <div class="dialog_content">
        <p class="dialog_title">${title}</p>
        <div class="dialog_image_container">
          <img src="/images/${iconFilename}" alt="info dialog icon" />
        </div>
        <p class="dialog_description">${description}</p>
      </div>
    </div>
  `;

  return wrapper.firstElementChild;
}

export const getLeftMessage = (message) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="message_left_container">
      <p class="message_left_paragraph">
        ${message}
      </p>
    </div>
  `;

  return wrapper.firstElementChild;
}

export const getRightMessage = (message) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="message_right_container">
      <p class="message_right_paragraph">
        ${message}
      </p>
    </div>
  `;

  return wrapper.firstElementChild;
}