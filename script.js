const socket = new WebSocket("wss://r1-api.rabbit.tech/session");
const messages = [];
const audioQueue = [];

window.onload = () => {
  token = localStorage.getItem("rabbitToken");
  if (!token) {
    token = prompt("Please enter your Rabbit token:");
  }
  if (token) {
    localStorage.setItem("rabbitToken", token);
  } else {
    alert("No token provided. Reload the page and try again.");
  }
};

socket.onopen = () => {
  console.log("WebSocket connection opened");
  const token = localStorage.getItem("rabbitToken");
  const authPayload = {
    global: {
      initialize: {
        deviceId: "358240051111110",
        evaluate: false,
        greet: true,
        language: "en",
        listening: true,
        mimeType: "wav",
        timeZone: "America/Los_Angeles",
        token: "rabbit-account-key+9f22b4de044f8eeb819fe96b8f6299aa",
      },
    },
  };
  socket.send(JSON.stringify(authPayload));
};

const updateMessages = () => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(message.user);
    messageDiv.innerText = message.text;
    messagesDiv.appendChild(messageDiv);
  });
};

socket.onmessage = (event) => {
  //   console.log("Message received:", event.data);
  const response = JSON.parse(event.data);
  if (response && response.kernel && response.kernel.assistantResponse) {
    messages.push({
      text: response.kernel.assistantResponse,
      user: "rabbit",
    });
  }
  if (response && response.kernel && response.kernel.assistantResponseDevice) {
    const responseText = JSON.parse(
      response.kernel.assistantResponseDevice.text
    );

    if (response.kernel.assistantResponseDevice.audio) {
      const audioData = response.kernel.assistantResponseDevice.audio;
      audioQueue.push("data:audio/wav;base64," + audioData);
      if (document.getElementById("audioPlayer").paused) {
        playNextAudio();
      }
    } else {
      document.getElementById("audioPlayer").style.display = "none";
    }
  }
  updateMessages();
  console.log(messages);
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};

function sendMessage() {
  const messageInput = document.getElementById("message").value.trim();
  if (messageInput === "") {
    alert("Please enter a message.");
    return;
  }
  messages.push({
    text: messageInput,
    user: "me",
  });
  const userTextPayload = {
    kernel: {
      userText: {
        text: messageInput,
      },
    },
  };
  socket.send(JSON.stringify(userTextPayload));
  messageInput.value = "";
}

function playAudio() {
  document.getElementById("audioPlayer").play();
}

function playNextAudio() {
  if (audioQueue.length > 0) {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = audioQueue.shift();
    audioPlayer.load();
    audioPlayer.play();
    audioPlayer.style.display = "inline-block";
    audioPlayer.onended = playNextAudio;
  }
}
document
  .getElementById("message")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
      document.getElementById("message").value = "";
    }
  });
