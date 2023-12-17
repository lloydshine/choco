const axios = require("axios"); // Add this line to use axios for downloading images
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.gemini);

// Function to download and convert an image to base64
async function downloadAndConvertToBase64(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64Data = Buffer.from(response.data, "binary").toString("base64");
  return base64Data;
}

// Converts base64 image data to a GoogleGenerativeAI.Part object.
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

async function describe(event, prompt, api) {
  api.sendTypingIndicator(event.threadID, async () => {
    if (event.type !== "message_reply") {
      api.sendMessage(
        `⚠️ You must reply this command to a photo`,
        event.threadID,
        event.messageID
      );
      return;
    }

    const attachments = event.messageReply.attachments;
    // Create an array to store image parts
    const imageParts = [];
    try {
      // Loop through attachments and add them to imageParts
      for (const attachment of attachments) {
        // Check if the attachment is a photo
        if (attachment.type === "photo") {
          const base64Image = await downloadAndConvertToBase64(attachment.url);

          // Add the image part to the array
          imageParts.push(base64ToGenerativePart(base64Image, "image/png"));
        }
      }

      // For text-and-image input (multimodal), use the gemini-pro-vision model
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      api.sendMessage(
        response.text(),
        event.threadID,
        event.messageReply.messageID
      );
    } catch (error) {
      api.sendMessage(
        "Something happened, try again.",
        event.threadID,
        event.messageReply.messageID
      );
      console.log(error);
    }
  });
}

module.exports = describe;
