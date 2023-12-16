require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.gemini);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const messages = {};

async function ai(event, matches, api) {
  api.setMessageReaction(
    "🆙",
    event.messageID,
    (err) => {
      if (err) return console.error(err);
    },
    true
  );

  const text = matches;
  const userID = event.senderID;
  const data = await api.getUserInfo(userID);
  const userChat = messages[userID]?.chat;
  let userMessages;
  if (userChat) {
    userMessages = userChat;
  } else {
    userMessages = model.startChat({
      history: [
        {
          role: "user",
          parts: `Hello I am ${data[userID]["name"]}`,
        },
        {
          role: "model",
          parts: `Hello ${data[userID]["name"]}, I am ChoCo, an expert AI that will help/answer any questions!`,
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    messages[userID] = {
      chat: userMessages,
    };
  }

  const stopTyping = api.sendTypingIndicator(event.threadID, async (err) => {
    if (err) console.error(err);

    try {
      const result = await userMessages.sendMessage(text);
      const response = await result.response;
      api.sendMessage(response.text(), event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "Something happened, please try again.",
        event.threadID,
        event.messageID
      );
    } finally {
      stopTyping();
    }
  });

  if (messages[userID]?.timer) {
    clearTimeout(messages[userID].timer);
  }
  messages[userID].timer = setTimeout(() => {
    console.log("Cleared!");
    delete messages[userID];
  }, 2 * 60 * 1000);
}

module.exports = ai;
