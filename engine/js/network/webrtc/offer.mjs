import createPeerConnection from './common.mjs';

// static?
// let peerConnection;

export default async function makeOffer() {
  const peerConnection = createPeerConnection();
  const dataChannel = peerConnection.createDataChannel('chat');
  // TODO:
  // dataChannel.onopen = datachannelopen;
  // dataChannel.onmessage = datachannelmessage;
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

function lasticecandidate() {
  console.log('lasticecandidate');
  const offer = peerConnection.localDescription;
  // textelement.value = JSON.stringify(offer);
  console.log(offer);
}
