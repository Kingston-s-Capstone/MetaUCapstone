import { useState } from "react";
import { sendChatMessage } from "../utilities/data";
import "./ChatBot.css"

const ChatBot = ({ isOpen, onClose }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    
    const sendMessage = async (input) => {

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("")

        try {
            const res = await sendChatMessage(input);
            setMessages([...newMessages, { role: "bot", content: res }]);
        } catch (err) {
            console.error("Chatbot error:", err)
            setMessages([
                ...newMessages,
                { role: "bot", content: "Sorry, something went wrong." }
            ])
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chatbotModal">
            <div className="chatbotHeader">
                <span>UpliftED Chatbot</span>
                <button onClick={onClose}>x</button>
            </div>
            <div className="chatbotMessage">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="chatbotInput">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    placeholder="Ask me anything career or scholarship related..."
                />
                <button type="submit" onClick={() => sendMessage(input)}>Send</button>
            </div>
        </div>
    )
}

export default ChatBot;