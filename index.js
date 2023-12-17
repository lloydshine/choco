const login = require("fca-unofficial");
const joined = require("./commands/joined.js");
const left = require("./commands/left.js");
const ai = require("./commands/ai.js");
const nick = require("./commands/nick.js");
const thread = require("./commands/thread.js");
const aiCode = require("./commands/aiCode.js");
const describe = require("./commands/describe.js");
const fs = require("fs");

const vips = ["100008672340619"];

login(
  { appState: JSON.parse(fs.readFileSync("./config/appstate.json", "utf8")) },
  async (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true });
    console.log("ON");
    api.sendMessage("I am on!", "100008672340619");

    const event_types = [
      "event",
      "log:subscribe",
      "log:unsubscribe",
      "message_reply",
      "message",
      "message_unsend",
    ];

    const listenEmitter = api.listen(async (err, event) => {
      if (err) return console.error(err);
      if (!event_types.includes(event.type)) {
        return;
      }
      switch (event.type) {
        case "event":
          if (!thread.isWhitelisted(event.threadID)) {
            return;
            0;
          }
          if (!event_types.includes(event.logMessageType)) {
            return;
          }
          switch (event.logMessageType) {
            case "log:subscribe":
              const data = await api.getThreadInfo(event.threadID);
              joined(event, data, api);
              break;
            case "log:unsubscribe":
              left(event, api);
              break;
          }
          break;
        case "message_reply":
        case "message":
          if (!event.body.startsWith("!")) {
            return;
          }
          const command = event.body.split(/(?<=^\S+)\s/);
          if (!thread.isWhitelisted(event.threadID)) {
            if (command[0] == "!join") {
              const code = aiCode.getCode();
              if (command[1] != code) {
                api.sendMessage(
                  "Wrong Code. Please message the admin.",
                  event.threadID,
                  event.messageID
                );
                return;
              }
              aiCode.generateCode();
              thread.join(event, api);
            }
            return;
          }
          api.setMessageReaction(
            "🆙",
            event.messageID,
            (err) => {
              if (err) return console.error(err);
            },
            true
          );
          switch (command[0].toLowerCase()) {
            case "!code":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              api.sendMessage(
                aiCode.getCode(),
                event.threadID,
                event.messageID
              );
              break;
            case "!commands":
              api.sendMessage(
                "Commands:\n!ai <prompt> - ChatBot\n!nick <nickname> - Change your messenger nickname",
                event.threadID,
                event.messageID
              );
              break;
            case "!ai":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              ai(event, command[1], api);
              break;
            case "!describe":
              describe(event, !command[1] ? "Describe this" : command[1], api);
              break;
            case "!nick":
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              nick(event, command, api);
              break;
            case "!thread":
              if (!vips.includes(event.senderID)) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              if (!command[1]) {
                api.sendMessage("?", event.threadID, event.messageID);
                return;
              }
              thread.thread(command[1].split(/(?<=^\S+)\s/), event, api);
              break;
            default:
              api.sendMessage(
                "Taka raman kag yawit uy",
                event.threadID,
                event.messageID
              );
              break;
          }
          break;
        default:
          break;
      }
    });
  }
);
