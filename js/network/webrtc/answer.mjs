import createPeerConnection from './common.mjs';

export default async function makeAnswer(offer) {

  const peerConnection = createPeerConnection();
  peerConnection.ondatachannel = handledatachannel;
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  return answer;
}

function handledatachannel(event) {

  const dataChannel = event.channel;
  dataChannel.onopen = () => {
    console.log("Data channel open.");
    dataChannel.send("Greetings!");
  }
  dataChannel.onmessage = (message) => {
    console.log("New message:");
    console.log(message);
  }
}
