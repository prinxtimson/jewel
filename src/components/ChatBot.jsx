import { useEffect, useState, useRef } from "react";
import { RefreshCcw } from "lucide-react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import ChatBotify, { useFlow, ChatBotProvider } from "react-chatbotify";
import { socket } from "../lib/socket";

import { searchLeaveBalance, submitLeaveApplication } from "../lib/appwrite";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ChatBot = () => {
  const [sessionId] = useState(uuid());
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const formRef = useRef({});
  let prevMsg = {};

  const { user } = useSelector((state) => state.auth);

  // simple helper to update form
  const updateForm = (patch) => {
    Object.assign(formRef.current, patch);
  };

  useEffect(() => {
    if (isHumanAgent) {
      socket.emit("escalate", sessionId);
    } else {
      socket.off("new_message");
      socket.off("agent_connected");
    }
  }, [isHumanAgent]);

  function lowercaseFirstLetter(str) {
    if (!str || typeof str !== "string") {
      return ""; // Handle empty or non-string inputs gracefully
    }
    str = str.replaceAll(" ", "");
    str = str.replace("/Paternity", "");
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  const slots = {
    chatBotHeader: ChatHeader,
  };

  const flow = {
    start: {
      message:
        "Hi! I'm Emily, HR Connect AI virtual assistant. How can I assist you?",
      options: [],
      path: "loop",
    },
    loop: {
      message: "",
      options: async (params) => {
        const userMessage = params.userInput;
        let botResponse = "";
        const urlRegex = /https?:\/\/[^\s]+/;

        try {
          const response = await fetch(`${API_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage, sessionId }),
          });

          const data = await response.json();
          if (data.error) return data.error;
          let optionsArr =
            data
              .find((val) => val.message == "payload")
              ?.payload?.fields.options.listValue.values.map(
                (val) => val.stringValue,
              ) || [];

          data
            .filter((val) => val.message == "text")
            .map((msg) => {
              botResponse = botResponse + `${msg.text.text[0]}\n`;
            });

          if (urlRegex.test(botResponse)) {
            let txt = botResponse.match(urlRegex);
            let txt2 = botResponse.replace(txt, "");
            await params.injectMessage(
              <div
                className="rcb-bot-message rcb-bot-message-entry"
                style={{
                  backgroundColor: "rgb(73, 29, 141)",
                  color: "rgb(255, 255, 255)",
                  maxWidth: "65%",
                }}
              >
                <span>{txt2}</span>{" "}
                <a href={`${txt}`} target="_blank">
                  {txt}
                </a>
              </div>,
            );
          } else {
            await params.injectMessage(botResponse);
          }

          return optionsArr;
        } catch (error) {
          console.error("Chat Error:", error);
          await params.injectMessage(
            "Sorry, I'm having trouble connecting to the chat service.",
          );
          return [];
        }
      },
      function: (params) => {
        if (params.userInput == "Submit Leave Request") {
          updateForm({ user: user.$id, status: "pending" });
        }

        if (params.userInput.match("Escalate")) {
          setIsHumanAgent(true);
        }
      },
      path: async (params) => {
        if (
          params.userInput.toLowerCase().match("annual leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (
          params.userInput.toLowerCase().match("sick leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (
          params.userInput.toLowerCase().match("maternity/paternity leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (params.userInput == "Submit Leave Request") return "book_leave";
        if (params.userInput.match("Escalate")) {
          await params.injectMessage("Connecting to an agent... ");
          return "human_handover";
        }
        return "loop";
      },
    },
    leave_balance: {
      message: async (params) => {
        const userMessage = lowercaseFirstLetter(params.userInput);
        let botResponse = "";

        try {
          const { rows } = await searchLeaveBalance({
            userId: user.$id,
            leaveType: userMessage,
          });
          rows.map((row) => {
            botResponse =
              botResponse +
              `You have ${row.balanceDays} days ${params.userInput} left for the year.\n`;
          });

          return botResponse;
        } catch (error) {
          console.error("Chat Error:", error);
          return "Sorry, I'm having trouble connecting to the chat service.";
        }
      },
      options: (params) => [`Submit Leave Request`, "Return to Main Menu"],
      function: (params) => {
        if (params.userInput == `Submit Leave Request`) {
          updateForm({ user: user.$id, status: "pending" });
        }
      },
      path: (params) => {
        if (params.userInput == `Submit Leave Request`) return "book_leave";
        return "loop";
      },
    },
    book_leave: {
      message: "Please select from the categories below",
      options: ["Annual Leave", "Sick Leave", "Maternity/Paternity Leave"],
      function: (params) =>
        updateForm({ leaveType: lowercaseFirstLetter(params.userInput) }),
      path: (params) => {
        if (params.userInput.toLowerCase().match("annual leave"))
          return "ask_start";
        if (params.userInput.toLowerCase().match("sick leave"))
          return "ask_start";
        if (params.userInput.toLowerCase().match("maternity/paternity leave"))
          return "ask_start";
        return "loop";
      },
    },
    ask_start: {
      message: "Please enter your start date (Format: YYYY-MM-DD)",
      function: (params) => updateForm({ startDate: params.userInput }),
      path: async (params) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.userInput)) {
          await params.injectMessage(
            "Invalid date, please re-enter your start date",
          );
          return;
        }
        const date = new Date(params.userInput);
        if (isNaN(date.getTime())) {
          await params.injectMessage(
            "Invalid date, please re-enter your start date",
          );
          return;
        }
        return "ask_end";
      },
    },
    ask_end: {
      message: "Please enter your end date (Format: YYYY-MM-DD)",
      function: (params) => updateForm({ endDate: params.userInput }),
      path: async (params) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.userInput)) {
          await params.injectMessage(
            "Invalid date, please re-enter your end date",
          );
          return;
        }
        const date = new Date(params.userInput);
        if (isNaN(date.getTime())) {
          await params.injectMessage(
            "Invalid date, please re-enter your end date",
          );
          return;
        }
        return "submit_leave";
      },
    },
    submit_leave: {
      message: async () => {
        const form = formRef.current;
        try {
          await submitLeaveApplication(form);
          return "Leave application submitted successfully";
        } catch (error) {
          console.error("Chat Error:", error);
          return "Sorry, I'm having trouble connecting to the chat service.";
        }
      },
      options: ["Leave Management", "Return to Main Menu"],
      path: "loop",
    },
    human_handover: {
      message: async (params) => {
        socket.on("agent_joined", async () => {
          console.log("agent_joined");
          await params.injectMessage("Connected to an agent... ");
        });

        socket.on("new_message", async (data) => {
          if (parseInt(data.message.id) === parseInt(prevMsg.id)) {
            prevMsg = data.message;
          } else {
            prevMsg = data.message;
            await params.injectMessage(data.message.text);
          }
        });
      },
      function: (params) => {
        socket.emit("send_message", {
          id: Date.now().toString(),
          sessionId,
          text: params.userInput,
          sender: "user",
          timestamp: new Date(),
        });
      },
      path: "human_handover",
    },
    unknown_input: {
      message: "I didn't get that. Can you say it again?",
      options: ["Escalate", "Return to Main Menu"],
      function: (params) => {
        if (params.userInput.match("Escalate")) {
          setIsHumanAgent(true);
        }
      },
      path: async (params) => {
        if (params.userInput.match("Escalate")) {
          await params.injectMessage("Connecting to an agent... ");
          return "human_handover";
        }
        return "loop";
      },
    },
  };

  const settings = {
    general: {
      showIcon: false,
    },
    header: {
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">HR Connect</span>
        </div>
      ),
      showAvatar: true,
    },
    botBubble: {
      simStream: true,
      showAvatar: true,
    },
    userBubble: {
      showAvatar: true,
      avatar: "/images/no_img.png",
    },
    chatButton: {
      icon: "/images/bot_img.avif",
    },
    chatWindow: {
      showScrollbar: true,
    },
    theme: {
      primaryColor: "#6a008e",
      //secondaryColor: "#059669",
    },
    emoji: {
      disabled: true,
    },
    fileAttachment: {
      disabled: true,
    },
  };

  return (
    <ChatBotProvider>
      <ChatBotify flow={flow} settings={settings} slots={slots} />
    </ChatBotProvider>
  );
};

export default ChatBot;

const ChatHeader = (props) => {
  const { restartFlow } = useFlow();

  return (
    <div className="rcb-chat-header-container bg-[#4f257d]">
      <div className="rcb-chat-header">
        <div className="rcb-bot-avatar chat-bg-img"></div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">HR Connect</span>
        </div>
      </div>
      <div className="rcb-chat-header">
        <button className="rcb-notification-icon" onClick={restartFlow}>
          <RefreshCcw className="mx-auto" />
        </button>
        {props.buttons}
      </div>
    </div>
  );
};
