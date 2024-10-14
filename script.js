const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");

const API_KEY = "AIzaSyAyNemnRnv8H3xhEMHuPE1_3WmTVG6kquQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: userData.message },
            ...(userData.file.data ? [{ inline_data: userData.file }] : []),
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponseText = data?.candidates[0]?.content?.parts[0]?.text.trim();
    console.log(data);
    messageElement.innerHTML = apiResponseText;
  } catch (error) {
    console.log(error);
    messageElement.innerHTML = error;
    messageElement.style.color = "#ff0000";
  } finally {
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

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (x) => {
    const base64String = x.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type,
    };

    fileInput.value = "";
  };

  reader.readAsDataURL(file);
});

sendMessageButton.addEventListener("click", (x) => handleOutgoingMessage(x));
document
  .querySelector("#file-upload")
  .addEventListener("click", () => fileInput.click());
