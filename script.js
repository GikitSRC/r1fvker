const socket = new WebSocket("wss://r1-api.rabbit.tech/session");

socket.onopen = () => {
  console.log("WebSocket connection opened");
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

socket.onmessage = (event) => {
  console.log("Message received:", event.data);
  const response = JSON.parse(event.data);
  if (response && response.kernel && response.kernel.assistantResponseDevice) {
    const responseText = JSON.parse(
      response.kernel.assistantResponseDevice.text
    );
    document.getElementById("responseText").innerText =
      responseText.chars.join("");
    if (response.kernel.assistantResponseDevice.audio) {
      const audioData =
        response.kernel.assistantResponseDevice.audio.split(",")[1];
      const audioPlayer = document.getElementById("audioPlayer");
      audioPlayer.src = "data:audio/wav;base64," + audioData;
      audioPlayer.load();
      audioPlayer.style.display = "inline-block";
    } else {
      document.getElementById("audioPlayer").style.display = "none";
    }
  }
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
  const userTextPayload = {
    kernel: {
      userText: {
        text: messageInput,
      },
    },
  };
  socket.send(JSON.stringify(userTextPayload));
}

function playAudio() {
  document.getElementById("audioPlayer").play();
}
