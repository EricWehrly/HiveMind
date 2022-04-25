// static?
let peerConnection;

export default function makeOffer(promise) {
    peerConnection = createPeerConnection(lasticecandidate);
    const dataChannel = peerConnection.createDataChannel('chat');
    // TODO:
    // dataChannel.onopen = datachannelopen;
    // dataChannel.onmessage = datachannelmessage;
    const createOfferPromise = peerConnection.createOffer();
    createOfferPromise.then(createOfferDone, createOfferFailed)
        .then(promise);
}

function createOfferDone(offer) {
  console.log('createOfferDone');
  const setLocalPromise = peerConnection.setLocalDescription(offer);
  // setLocalPromise.then(setLocalDone, setLocalFailed);
}

function createOfferFailed(reason) {
  console.log('createOfferFailed');
  console.log(reason);
}

// ------------------------------------------------- \\

function lasticecandidate() {
  console.log('lasticecandidate');
  const offer = peerConnection.localDescription;
  // textelement.value = JSON.stringify(offer);
  console.log(offer);
}

function createPeerConnection(lasticecandidate) {
    const configuration = {
      iceServers: [{
        urls: "stun:stun.stunprotocol.org"}]};
    try {
      peerConnection = new RTCPeerConnection(configuration);
    } catch(err) {
      chatlog('error: ' + err);
    }
    peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
    // peerConnection.onconnectionstatechange = handleconnectionstatechange;
    // peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
    return peerConnection;
  }

  function handleicecandidate(lasticecandidate) {
    return function(event) {
      if (event.candidate != null) {
        console.log('new ice candidate');
      } else {
        console.log('all ice candidates');
        lasticecandidate();
      }
    }
  }