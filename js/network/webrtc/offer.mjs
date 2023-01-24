import createPeerConnection from './common.mjs';
import NetworkMessenger from '../network-messenger.mjs';

export default async function makeOffer(lasticecandidate) {
  const peerConnection = createPeerConnection(lasticecandidate);
  const dataChannel = peerConnection.createDataChannel('events');
  peerConnection.channels = {
    "events": dataChannel
  };
  
  dataChannel.onopen = (details) => {
    // console.log("Data channel [events] open.");
    // console.log(details);
    // dataChannel.send("Greetings!");
  }
  dataChannel.onmessage = (message) => {
    console.log(message);
    NetworkMessenger.ReceiveEvent(message);
  }

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  return peerConnection;
}
