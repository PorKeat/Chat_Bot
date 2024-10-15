const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileInput = document.getElementById("file-input");
const fileUploadButton = document.getElementById("file-upload");
const fileCancelButton = document.getElementById("file-cancel");
const previewImage = document.getElementById("preview-image");
const chatbotToggler = document.getElementById("chatbot-toggler");
const chatbotPopup = document.querySelector(".chatbot-popup");
const closeChatbot = document.getElementById("close-chatbot");

const API_KEY = "AIzaSyBBftvnIi15VSCwoz39tUhCuZELpLNSVr0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: userData.file }] : []),
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponseText = data?.candidates[0]?.content?.parts[0]?.text.trim();
    console.log(data);
    messageElement.innerHTML = apiResponseText;
    chatHistory.push({
      role: "model",
      parts: [{text: userData.apiResponseText}],
    });
  } catch (error) {
    console.log(error);
    messageElement.innerHTML = error;
    messageElement.style.color = "#ff0000";
  } finally {
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth",
    });
  }
};

const handleOutgoingMessage = (x) => {
  x.preventDefault();

  userData.message = messageInput.value.trim();
  messageInput.value = "";

  const messageContent = `
        <div class="message user-message flex flex-col items-end">
          <div
            class="message-text py-[12px] px-[16px] max-w-[75%] text-[0.9rem] rounded-[13px_13px_3px_13px] bg-red-600 text-white"
          >
             ${userData.message}
          </div>
                  ${
                    userData.file.data
                      ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="w-[50%] mt-[5px] rounded-[13px_3px_13px_13px]" />`
                      : ""
                  }
        </div>`;
  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").textContent =
    userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth",
  });

  previewImage.src = "";
  previewImage.classList.add("hidden");

  setTimeout(() => {
    const messageContent = `
    <div class="message bot-message thinking flex gap-[11px] items-center">
          <i
            class="fa-brands fa-bots text-center text-[25px] w-[40px] h-[40px] self-end place-content-center rounded-[50%] bg-red-600 p-[6px] text-white shrink-0 mb-[4px]"
          ></i>
          <div
            class="message-text max-w-[75%] text-[0.9rem] bg-slate-100 rounded-[13px_13px_13px_3px] py-[2px] px-[16px]"
          >
            <div class="thinking-indicator flex gap-[4px] py-[15px]">
              <div
                class="dot h-[7px] w-[7px] bg-red-400 rounded-[50%] opacity-[0.7]"
                style="animation: dotPulse 1.8s ease-in-out infinite 0.2s"
              ></div>
              <div
                class="dot h-[7px] w-[7px] bg-red-400 rounded-[50%] opacity-[0.7]"
                style="animation: dotPulse 1.8s ease-in-out infinite 0.3s"
              ></div>
              <div
                class="dot h-[7px] w-[7px] bg-red-400 rounded-[50%] opacity-[0.7]"
                style="animation: dotPulse 1.8s ease-in-out infinite 0.4s"
              ></div>
            </div>
          </div>
        </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth",
    });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

messageInput.addEventListener("keydown", (x) => {
  const userMessage = x.target.value.trim();
  if (x.key === "Enter" && userMessage) {
    handleOutgoingMessage(x);
  }
});

messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const imgTag = fileUploadWrapper.querySelector("img");
    imgTag.src = event.target.result;
    imgTag.classList.remove("hidden");

    const base64String = event.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type,
    };

    fileInput.value = "";
  };

  reader.readAsDataURL(file);
});

fileCancelButton.addEventListener("click", () => {
  previewImage.src = "";
  previewImage.classList.add("hidden");
  fileUploadButton.classList.remove("hidden");
  fileCancelButton.classList.add("hidden");
  fileInput.value = "";
});

const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (x) => {
    const emojiButton = document.getElementById("emoji-picker");

    if (emojiButton.contains(x.target)) {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (x) => handleOutgoingMessage(x));
document
  .querySelector("#file-upload")
  .addEventListener("click", () => fileInput.click());

const toggleChatbot = () => {
  const messageIcon = document.getElementById("chatbot-icon");
  const closeIcon = document.getElementById("close-icon");
  const isMobile = window.innerWidth <= 640;

  if (chatbotPopup.classList.contains("opacity-0")) {
    chatbotPopup.classList.remove("opacity-0", "scale-[0.1]");
    chatbotPopup.classList.add("opacity-100", "scale-100", "z-30");
    messageIcon.classList.add("opacity-0");
    closeIcon.classList.remove("opacity-0");
    chatbotToggler.classList.add("rotate-[-90deg]");

    if (isMobile) {
      previewImage.addEventListener("click", () => {
        previewImage.src = "";
        previewImage.classList.add("hidden");
      });
    }
  } else {
    chatbotPopup.classList.remove("opacity-100", "scale-100", "z-30");
    chatbotPopup.classList.add("opacity-0", "scale-[0.1]");
    messageIcon.classList.remove("opacity-0");
    closeIcon.classList.add("opacity-0");
    chatbotToggler.classList.remove("rotate-[-90deg]");
  }
};

chatbotToggler.addEventListener("click", toggleChatbot);
closeChatbot.addEventListener("click", toggleChatbot);
