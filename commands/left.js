function left(event, api) {
  const leftParticipantId = event.logMessageData["leftParticipantFbId"];
  api.getUserInfo(leftParticipantId, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const left = data[leftParticipantId]["name"];
    api.sendMessage(`>Bye ${left}!`, event.threadID);
  });
}

module.exports = left;
