export const getIncomingCallDialog = (callTypeInfo, acceptCallHandler, rejectCallHandler) => {
  const dialogHTML = `
    <div class="dialog_wrapper">
      <div class="dialog_content">
        <p class="dialog_title">Incoming ${callTypeInfo} Call</p>
        <div class="dialog_image_container">
          <img src="/images/dialogAvatar.png" alt="Caller avatar" />
        </div>
        <div class="dialog_button_container">
          <button id="acceptBtn" class="dialog_accept_call_button">
            <img src="/images/acceptCall.png" class="dialog_button_image" alt="" />
          </button>
          <button id="rejectBtn" class="dialog_reject_call_button">
            <img src="/images/rejectCall.png" class="dialog_button_image" alt="" />
          </button>
        </div>
      </div>
    </div>
  `;

  const dialogContainer = document.getElementById('dialog');
  dialogContainer.innerHTML = dialogHTML;

  // Attach events after inserting into DOM
  document.getElementById('acceptBtn').addEventListener('click', acceptCallHandler);
  document.getElementById('rejectBtn').addEventListener('click', rejectCallHandler);
};