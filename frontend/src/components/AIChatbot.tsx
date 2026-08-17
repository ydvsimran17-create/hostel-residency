import { useState } from "react";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
  console.log("SEND BUTTON CLICKED");

  try {
    const res = await fetch("http://localhost:5000/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    console.log("STATUS:", res.status);

    const data = await res.json();

    console.log("DATA:", data);

    setReply(data.reply || JSON.stringify(data));
  } catch (err) {
    console.log("ERROR:", err);
    setReply("AI service unavailable");
  }
};

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px 16px",
          borderRadius: "50px",
        }}
      >
        🤖 AI
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "300px",
            background: "white",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <h3>AI Assistant</h3>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
          />

         <button
  onClick={() => {
        sendMessage();
  }}
>
  Send
</button>

          <p>{reply}</p>
        </div>
      )}
    </>
  );
}