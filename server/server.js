import express from "express";
import dialogflow from "@google-cloud/dialogflow";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = 8080;

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const credentials = {
  client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  private_key: process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// const auth = new google.auth.JWT({
//   email: credentials.client_email,
//   key: credentials.private_key,
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
// });

const activeSessions = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    const { sessionId, id, text, sender, timestamp } = data;

    // Broadcast to everyone in the room except the sender
    if (activeSessions[sessionId]) {
      const msg = { id, text, sender, timestamp };
      activeSessions[sessionId].messages.push(msg);
      socket.broadcast
        .to(sessionId)
        .emit("new_message", { sessionId, message: msg });
    }
  });

  socket.on("agent_join", ({ sessionId, userId }) => {
    socket.join(sessionId);
    activeSessions[sessionId].agentConnected = userId;
    socket.broadcast.to(sessionId).emit("agent_joined");
  });

  socket.on("agent_rejoin", (sessionId) => {
    socket.join(sessionId);
  });

  socket.on("agent_connected", () => {
    socket.emit(
      "active_sessions",
      Object.keys(activeSessions).map((sid) => ({
        sessionId: sid,
        messages: activeSessions[sid].messages,
        agentConnected: activeSessions[sid].agentConnected,
      })),
    );
  });

  socket.on("escalate", (sessionId) => {
    socket.join(sessionId);
    const msg = {
      text: "A user will like to transfer to an agent!",
      sender: "system",
      timestamp: new Date(),
    };
    // If it's a user joining, notify agents
    if (!activeSessions[sessionId]) {
      activeSessions[sessionId] = { messages: [msg], agentConnected: null };
    }
    console.log("agent_transfer_requested");
    socket.broadcast.emit("agent_transfer_requested", {
      sessionId,
      messages: [msg],
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// const sheets = google.sheets({ version: "v4", auth });
const sessionClient = new dialogflow.SessionsClient({
  credentials,
});

app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

// Define a route for GET requests to the root URL
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  // Sends data from the agent as a response
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId,
    );

    // The dialogflow request object
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: message,
          languageCode: "en-US",
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    res.status(200).send(responses[0].queryResult.fulfillmentMessages);
  } catch (e) {
    console.log(e);
    res.status(422).send({ e });
  }
});

// app.get("/api/leave/get", async (req, res) => {
//   const { query } = req.query;
//   const spreadsheetId = process.env.GOOGLE_SHEET_ID;

//   if (!spreadsheetId) {
//     return res.status(500).json({ error: "GOOGLE_SHEET_ID not configured." });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Sheet1!A:C",
//     });
//     const rows = response.data.values || [];
//     const rowIndex = rows.findIndex(
//       (row) =>
//         row[0]?.toString().toLowerCase() === query?.toString().toLowerCase(),
//     );

//     if (rowIndex === -1) {
//       return res.json({ success: false, message: "No entry found." });
//     }

//     res.json({ success: true, rowIndex: rowIndex + 1, data: rows[rowIndex] });
//   } catch (error) {
//     console.error("Sheets Error:", error);
//     res.status(500).json({
//       error: "Failed to search Google Sheets",
//       details: error.message,
//     });
//   }
// });

// Start the server
httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export default app;
