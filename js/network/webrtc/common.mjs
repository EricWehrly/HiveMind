

export default function createPeerConnection(lasticecandidate) {
  let peerConnection;
  const configuration = {
    iceServers: [{
      urls: "stun:stun.stunprotocol.org"
    }]
  };
  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch (err) {
    console.error(err);
  }
  peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
  // peerConnection.onconnectionstatechange = handleconnectionstatechange;
  // peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
  return peerConnection;
}

function handleicecandidate(lasticecandidate) {
  return function (event) {
    if (event.candidate != null) {
      console.log('new ice candidate');
    } else {
      console.log('all ice candidates');
      if (lasticecandidate) lasticecandidate();
    }
  }
}