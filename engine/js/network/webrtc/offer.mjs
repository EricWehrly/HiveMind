import createPeerConnection from './common.mjs';

export default async function makeOffer(lasticecandidate) {
  const peerConnection = createPeerConnection(lasticecandidate);
  peerConnection.ondatachannel = handledatachannel;
  const dataChannel = peerConnection.createDataChannel('chat');
  peerConnection.channels = {
    "chat": dataChannel
  };
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
  console.log(offer);

  return peerConnection;
}

function handledatachannel(event) {

  console.debug('handledatachannel');
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
