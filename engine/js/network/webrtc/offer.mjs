import createPeerConnection from './common.mjs';

export default async function makeOffer(lasticecandidate) {
  const peerConnection = createPeerConnection(lasticecandidate);
  const dataChannel = peerConnection.createDataChannel('chat');
  peerConnection.channels = {
    "chat": dataChannel
  };
  
  dataChannel.onopen = () => {
    console.log("Data channel open.");
    dataChannel.send("Greetings!");
  }
  dataChannel.onmessage = (message) => {
    console.log("New message:");
    console.log(message);
  }

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  return peerConnection;
}
