import createPeerConnection from './common.mjs';

// static?
let peerConnection;

export default async function makeOffer(promise) {
    peerConnection = createPeerConnection(lasticecandidate);
    const dataChannel = peerConnection.createDataChannel('chat');
    // TODO:
    // dataChannel.onopen = datachannelopen;
    // dataChannel.onmessage = datachannelmessage;

    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer)
    return offer;
}

function lasticecandidate() {
    console.log('lasticecandidate');
    const offer = peerConnection.localDescription;
    // textelement.value = JSON.stringify(offer);
    console.log(offer);
  }
