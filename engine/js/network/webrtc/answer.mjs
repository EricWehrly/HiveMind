import createPeerConnection from './common.mjs';

// TODO: FIX THIS
let peerConnection;

export default function makeAnswer(offer) {
    peerConnection = createPeerConnection();
    peerConnection.ondatachannel = handledatachannel;
    const setRemotePromise = peerConnection.setRemoteDescription(offer);
    setRemotePromise.then(setRemoteDone, setRemoteFailed);

    // return peerConnection.localDescription;
}

function handledatachannel(event) {
  console.debug('handledatachannel');
  dataChannel = event.channel;
  dataChannel.onopen = () => console.log("Data channel open.");
  dataChannel.onmessage = (message) => {
      console.log("New message:");
      console.log(message);
  }
}

function setRemoteDone() {
  console.debug('setRemoteDone');
  const createAnswerPromise = peerConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function createAnswerDone(answer) {
  console.debug('createAnswerDone');
  const setLocalPromise = peerConnection.setLocalDescription(answer);
  // setLocalPromise.then(setLocalDone, setLocalFailed);
}

function createAnswerFailed(reason) {
  console.log('createAnswerFailed');
  console.log(reason);
}
