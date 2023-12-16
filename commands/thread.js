const fs = require("fs");

const openThreadList = () => {
  try {
    const fileContent = fs.readFileSync("config/thread-list.json", {
      encoding: "utf8",
    });
    return JSON.parse(fileContent);
  } catch (err) {
    // Handle file read error (e.g., file not found, invalid JSON)
    console.error("Error reading thread-list.json:", err.message);
    return [];
  }
};

const saveThreadList = (threadlist) => {
  try {
    fs.writeFileSync(
      "config/thread-list.json",
      JSON.stringify(threadlist, null, 4),
      {
        encoding: "utf8",
        flag: "w", // Use 'w' flag to open the file for writing
      }
    );
    console.log("Thread list saved successfully.");
  } catch (err) {
    // Handle file write error
    console.error("Error saving thread list:", err.message);
  }
};

function isWhitelisted(threadID) {
  const threadlist = openThreadList();
  if (threadlist.threads.includes(threadID)) {
    return true;
  } else {
    return false;
  }
}

async function join(event, api) {
  const threadlist = openThreadList();
  threadlist.threads.push(event.threadID);
  saveThreadList(threadlist);
  api.sendMessage(
    `Hello everyone! My name is ChatGPT and I'm an AI expert developed by Lloyd. I'm honored to be a part of this group chat and eager to learn and interact with each one of you. I have been specifically designed to assist and communicate with people, answer their questions, and engage in meaningful conversations. I hope to be a valuable addition to this group and assist in any way possible. Looking forward to interacting with you all!
  `,
    event.threadID
  );
  const botID = await api.getCurrentUserID();
  api.changeNickname("ChatGPT", event.threadID, botID, (err) => {
    if (err) return console.error(err);
  });
  const t = await api.getThreadInfo(event.threadID);
  const u = await api.getUserInfo(event.senderID);
  api.sendMessage(
    `Joined at ${t.threadName}\nBy: ${u[event.senderID]["name"]}`,
    "100008672340619"
  );
}

function leave(threadID) {
  const threadlist = openThreadList();
  if (!threadlist.threads.includes(threadID)) {
    return { message: "huh?", hasError: true };
  }
  threadlist.threads.splice(threadlist.threads.indexOf(threadID), 1);
  saveThreadList(threadlist);
  return { message: "Bye", hasError: false };
}

const listThread = async (api) => {
  const threadlist = openThreadList();
  var list = "";
  const length = threadlist.threads.length;
  for (const thread of threadlist.threads) {
    const data = await api.getThreadInfo(thread);
    list += `ID: ${thread}\n${data.threadName} (${data.participantIDs.length}} members)\n-------------\n`; // include the index in the list item
  }
  return { list, length, hasError: false };
};

const thread = async (matches, event, api) => {
  const action = matches[0]; // add | get | remove | list
  const name = matches[1]; // <name of thread> |
  switch (action) {
    case "list":
      let list = await listThread(api);
      api.sendMessage(
        `Threads (${list.length}):\n` + list.list,
        event.threadID
      );
      break;
    case "leave":
      const l = leave(name);
      if (l.hasError) {
        api.sendMessage(l.message, event.threadID);
        return;
      }
      api.sendMessage(l.message, name);
      api.sendMessage("Done", event.threadID);
      break;
  }
};

module.exports = {
  isWhitelisted,
  join,
  leave,
  thread,
};
