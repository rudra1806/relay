import { create } from 'zustand';
import toast from 'react-hot-toast';
import useSocketStore from './useSocketStore';

// ──────────────────────────────────────────────
// ICE Server Configuration
// ──────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

// Call timeout (30 seconds)
const CALL_TIMEOUT = 30000;

const useCallStore = create((set, get) => ({
  // ──────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────
  callStatus: 'idle', // 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected'
  callType: null, // 'audio' | 'video'
  remoteUser: null, // { _id, name, profilePic }
  isMuted: false,
  isVideoOff: false,
  isRemoteMuted: false,
  isRemoteVideoOff: false,
  callDuration: 0,
  localStream: null,
  remoteStream: null,

  // Internal refs
  _peerConnection: null,
  _callTimer: null,
  _callTimeout: null,
  _iceCandidateQueue: [],

  // ──────────────────────────────────────────────
  // Initiate a call (Caller side)
  // Called from a user click — getUserMedia works here
  // ──────────────────────────────────────────────
  initiateCall: async (contact, callType) => {
    const { callStatus } = get();
    if (callStatus !== 'idle') {
      toast.error('You are already in a call');
      return;
    }

    const socket = useSocketStore.getState().socket;
    if (!socket?.connected) {
      toast.error('Connection lost. Please try again.');
      return;
    }

    // Acquire media FIRST (user gesture context — this is the click handler)
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
    } catch (error) {
      console.error('❌ getUserMedia failed:', error.name, error.message);
      if (error.name === 'NotAllowedError') {
        toast.error('Please allow microphone/camera access to make calls.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone or camera found.');
      } else {
        toast.error('Could not access microphone/camera.');
      }
      return; // Don't start the call at all
    }

    set({
      callStatus: 'calling',
      callType,
      localStream: stream,
      remoteUser: {
        _id: contact._id,
        name: contact.name,
        profilePic: contact.profilePic,
      },
      isMuted: false,
      isVideoOff: false,
      isRemoteMuted: false,
      isRemoteVideoOff: false,
      callDuration: 0,
      remoteStream: null,
      _peerConnection: null,
      _iceCandidateQueue: [],
    });

    // Emit call initiation to server
    socket.emit('call:initiate', {
      receiverId: contact._id,
      callType,
    });

    // Set a timeout — auto-end if not answered
    const timeout = setTimeout(() => {
      const { callStatus: currentStatus } = get();
      if (currentStatus === 'calling') {
        toast('No answer', { icon: '📞' });
        get().endCall();
      }
    }, CALL_TIMEOUT);

    set({ _callTimeout: timeout });
  },

  // ──────────────────────────────────────────────
  // Handle incoming call (Receiver side)
  // ──────────────────────────────────────────────
  handleIncomingCall: ({ callerId, callerName, callerPic, callType }) => {
    const { callStatus } = get();

    // If already in a call, auto-reject
    if (callStatus !== 'idle') {
      const socket = useSocketStore.getState().socket;
      socket?.emit('call:rejected', { callerId });
      return;
    }

    set({
      callStatus: 'ringing',
      callType,
      remoteUser: {
        _id: callerId,
        name: callerName,
        profilePic: callerPic,
      },
      isMuted: false,
      isVideoOff: false,
      isRemoteMuted: false,
      isRemoteVideoOff: false,
      callDuration: 0,
      localStream: null,
      remoteStream: null,
      _peerConnection: null,
      _iceCandidateQueue: [],
    });

    // Auto-reject after timeout
    const timeout = setTimeout(() => {
      const { callStatus: currentStatus } = get();
      if (currentStatus === 'ringing') {
        get().rejectCall();
      }
    }, CALL_TIMEOUT);

    set({ _callTimeout: timeout });
  },

  // ──────────────────────────────────────────────
  // Accept call (Receiver side)
  // Called from a user click — getUserMedia works here
  // ──────────────────────────────────────────────
  acceptCall: async () => {
    const { remoteUser, callType, _callTimeout } = get();
    if (!remoteUser) return;

    // Clear the auto-reject timeout
    if (_callTimeout) clearTimeout(_callTimeout);
    set({ _callTimeout: null });

    // Acquire media FIRST (user gesture context — this is the accept button click)
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
    } catch (error) {
      console.error('❌ Receiver getUserMedia failed:', error.name, error.message);
      if (error.name === 'NotAllowedError') {
        toast.error('Please allow microphone/camera access to receive calls.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone or camera found.');
      } else {
        toast.error('Could not access microphone/camera.');
      }
      // Reject the call since we can't get media
      get().rejectCall();
      return;
    }

    set({ localStream: stream, callStatus: 'connecting' });

    const socket = useSocketStore.getState().socket;
    socket?.emit('call:accepted', {
      callerId: remoteUser._id,
      callType,
    });


  },

  // ──────────────────────────────────────────────
  // Reject call (Receiver side)
  // ──────────────────────────────────────────────
  rejectCall: () => {
    const { remoteUser, _callTimeout } = get();
    if (!remoteUser) return;

    if (_callTimeout) clearTimeout(_callTimeout);

    const socket = useSocketStore.getState().socket;
    socket?.emit('call:rejected', { callerId: remoteUser._id });

    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Call accepted — Caller creates offer
  // localStream already acquired in initiateCall()
  // ──────────────────────────────────────────────
  handleCallAccepted: async () => {
    const { remoteUser, localStream, _callTimeout } = get();
    if (!remoteUser) return;

    if (_callTimeout) clearTimeout(_callTimeout);
    set({ callStatus: 'connecting', _callTimeout: null });

    if (!localStream) {
      console.error('❌ No local stream available when call accepted');
      toast.error('Media stream lost. Please try again.');
      get().endCall();
      return;
    }

    try {
      // Create peer connection and offer
      const pc = get()._createPeerConnection();

      // Add local tracks to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = useSocketStore.getState().socket;
      socket?.emit('call:offer', {
        offer: pc.localDescription,
        receiverId: remoteUser._id,
      });
    } catch (error) {
      console.error('❌ Failed to create offer:', error);
      toast.error('Failed to establish call connection');
      get().endCall();
    }
  },

  // ──────────────────────────────────────────────
  // Handle WebRTC Offer (Receiver side)
  // localStream already acquired in acceptCall()
  // ──────────────────────────────────────────────
  handleOffer: async ({ offer, callerId }) => {
    const { localStream, callStatus } = get();

    if (callStatus !== 'connecting') {
      console.warn('📹 Received offer in unexpected state:', callStatus);
      return;
    }

    if (!localStream) {
      console.error('❌ No local stream available when offer received');
      toast.error('Media stream lost. Please try again.');
      get().endCall();
      return;
    }

    try {
      // Create peer connection
      const pc = get()._createPeerConnection();

      // Add local tracks
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Set remote description (the offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Process any queued ICE candidates
      const { _iceCandidateQueue } = get();
      if (_iceCandidateQueue.length > 0) {
        for (const candidate of _iceCandidateQueue) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('⚠️ Failed to add queued ICE candidate:', e);
          }
        }
        set({ _iceCandidateQueue: [] });
      }

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = useSocketStore.getState().socket;
      socket?.emit('call:answer', {
        answer: pc.localDescription,
        callerId,
      });
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
      toast.error('Failed to establish call connection');
      get().endCall();
    }
  },

  // ──────────────────────────────────────────────
  // Handle WebRTC Answer (Caller side)
  // ──────────────────────────────────────────────
  handleAnswer: async ({ answer }) => {
    const { _peerConnection } = get();
    if (!_peerConnection) {
      console.warn('📹 Received answer but no peer connection');
      return;
    }

    try {
      await _peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

      // Process any queued ICE candidates
      const { _iceCandidateQueue } = get();
      if (_iceCandidateQueue.length > 0) {
        for (const candidate of _iceCandidateQueue) {
          try {
            await _peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('⚠️ Failed to add queued ICE candidate:', e);
          }
        }
        set({ _iceCandidateQueue: [] });
      }
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
    }
  },

  // ──────────────────────────────────────────────
  // Handle ICE Candidate
  // ──────────────────────────────────────────────
  handleICECandidate: async ({ candidate }) => {
    if (!candidate) return;

    const { _peerConnection } = get();

    if (!_peerConnection || !_peerConnection.remoteDescription) {
      // Queue if PC or remote desc not ready yet
      set((state) => ({
        _iceCandidateQueue: [...state._iceCandidateQueue, candidate],
      }));
      return;
    }

    try {
      await _peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn('⚠️ Failed to add ICE candidate:', error);
    }
  },

  // ──────────────────────────────────────────────
  // End call (either party)
  // ──────────────────────────────────────────────
  endCall: () => {
    const { remoteUser } = get();

    if (remoteUser) {
      const socket = useSocketStore.getState().socket;
      socket?.emit('call:ended', { peerId: remoteUser._id });
    }

    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Handle remote call ended
  // ──────────────────────────────────────────────
  handleCallEnded: ({ reason }) => {
    const { callStatus } = get();
    if (callStatus === 'idle') return;

    if (callStatus === 'connected' || callStatus === 'connecting') {
      if (reason === 'disconnected') {
        toast('Call ended — user disconnected', { icon: '📴' });
      } else {
        toast('Call ended', { icon: '📴' });
      }
    }

    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Handle remote rejection
  // ──────────────────────────────────────────────
  handleCallRejected: () => {
    toast('Call declined', { icon: '📞' });
    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Handle busy signal
  // ──────────────────────────────────────────────
  handleCallBusy: ({ message }) => {
    toast(message || 'User is busy', { icon: '📞' });
    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Handle unavailable (offline)
  // ──────────────────────────────────────────────
  handleCallUnavailable: () => {
    toast('User is offline', { icon: '📵' });
    get()._cleanup();
  },

  // ──────────────────────────────────────────────
  // Toggle mute
  // ──────────────────────────────────────────────
  toggleMute: () => {
    const { localStream, isMuted, remoteUser } = get();
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMuted;
      set({ isMuted: !isMuted });

      const socket = useSocketStore.getState().socket;
      socket?.emit('call:toggle-media', {
        peerId: remoteUser?._id,
        mediaType: 'audio',
        enabled: isMuted,
      });
    }
  },

  // ──────────────────────────────────────────────
  // Toggle video
  // ──────────────────────────────────────────────
  toggleVideo: () => {
    const { localStream, isVideoOff, remoteUser } = get();
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = isVideoOff;
      set({ isVideoOff: !isVideoOff });

      const socket = useSocketStore.getState().socket;
      socket?.emit('call:toggle-media', {
        peerId: remoteUser?._id,
        mediaType: 'video',
        enabled: isVideoOff,
      });
    }
  },

  // ──────────────────────────────────────────────
  // Flip camera (front ↔ back) — mobile support
  // Stops old camera first, then opens new one
  // ──────────────────────────────────────────────
  _facingMode: 'user',

  flipCamera: async () => {
    const { localStream, _peerConnection, _facingMode, isVideoOff } = get();
    if (!localStream || isVideoOff) return;

    const oldTrack = localStream.getVideoTracks()[0];
    if (!oldTrack) return;

    const newFacingMode = _facingMode === 'user' ? 'environment' : 'user';

    // IMPORTANT: Stop old track FIRST — mobile browsers often can't
    // have two cameras open simultaneously
    oldTrack.stop();
    localStream.removeTrack(oldTrack);

    let newTrack = null;

    try {
      // Attempt 1: Use facingMode (soft preference, no 'exact')
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });
      newTrack = newStream.getVideoTracks()[0];
    } catch (err1) {
      console.warn('📹 facingMode failed, trying device enumeration:', err1);

      try {
        // Attempt 2: Enumerate devices and pick a different one
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');

        if (videoDevices.length < 2) {
          toast.error('No other camera available');
          // Re-open the original camera since we stopped it
          const fallback = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: _facingMode },
            audio: false,
          });
          const fallbackTrack = fallback.getVideoTracks()[0];
          if (fallbackTrack) {
            localStream.addTrack(fallbackTrack);
            if (_peerConnection) {
              const sender = _peerConnection.getSenders().find(
                (s) => s.track === null || s.track?.kind === 'video'
              );
              if (sender) await sender.replaceTrack(fallbackTrack);
            }
          }
          set({ isVideoOff: true });
          setTimeout(() => set({ isVideoOff: false }), 50);
          return;
        }

        // Try each device until one works
        for (const device of videoDevices) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: device.deviceId } },
              audio: false,
            });
            newTrack = stream.getVideoTracks()[0];
            if (newTrack) break;
          } catch {
            continue;
          }
        }
      } catch (err2) {
        console.error('❌ Device enumeration failed:', err2);
      }
    }

    if (!newTrack) {
      toast.error('Failed to switch camera');
      // Try to re-open original camera
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        const fb = fallback.getVideoTracks()[0];
        if (fb) {
          localStream.addTrack(fb);
          if (_peerConnection) {
            const sender = _peerConnection.getSenders().find(
              (s) => s.track === null || s.track?.kind === 'video'
            );
            if (sender) await sender.replaceTrack(fb);
          }
        }
      } catch {}
      set({ isVideoOff: true });
      setTimeout(() => set({ isVideoOff: false }), 50);
      return;
    }

    // Add new track to local stream
    localStream.addTrack(newTrack);

    // Replace track in peer connection so remote sees new camera
    if (_peerConnection) {
      const sender = _peerConnection.getSenders().find(
        (s) => s.track === null || s.track?.kind === 'video'
      );
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    }

    set({ _facingMode: newFacingMode });
    // Trigger re-attachment of local video
    set({ isVideoOff: true });
    setTimeout(() => set({ isVideoOff: false }), 50);
  },

  // ──────────────────────────────────────────────
  // Handle remote media toggle
  // ──────────────────────────────────────────────
  handleRemoteMediaToggle: ({ mediaType, enabled }) => {
    if (mediaType === 'audio') {
      set({ isRemoteMuted: !enabled });
    } else if (mediaType === 'video') {
      set({ isRemoteVideoOff: !enabled });
    }
  },


  // ──────────────────────────────────────────────
  // Create WebRTC Peer Connection (internal)
  // ──────────────────────────────────────────────
  _createPeerConnection: () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Handle ICE candidates — send each one to the peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const { remoteUser } = get();
        const socket = useSocketStore.getState().socket;
        socket?.emit('call:ice-candidate', {
          candidate: event.candidate,
          peerId: remoteUser?._id,
        });
      }
    };

    // Handle remote media tracks arriving
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        set({ remoteStream, callStatus: 'connected' });
      }
    };

    // Handle WebRTC connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      if (state === 'connected') {
        // Start the call duration timer
        const { _callTimer } = get();
        if (!_callTimer) {
          const timer = setInterval(() => {
            set((s) => ({ callDuration: s.callDuration + 1 }));
          }, 1000);
          set({ _callTimer: timer });
        }
      }

      if (state === 'disconnected') {
        // May recover — wait a few seconds before ending
        console.warn('⚠️ PeerConnection disconnected, waiting for recovery...');
        setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            console.error('❌ PeerConnection did not recover');
            toast.error('Call connection lost.');
            get().endCall();
          }
        }, 5000);
      }

      if (state === 'failed') {
        console.error('❌ PeerConnection state: failed');
        toast.error('Call connection failed. Please try again.');
        setTimeout(() => get().endCall(), 0);
      }
    };

    // Log ICE state changes for debugging
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed');
      }
    };

    set({ _peerConnection: pc });
    return pc;
  },

  // ──────────────────────────────────────────────
  // Cleanup everything (internal)
  // ──────────────────────────────────────────────
  _cleanup: () => {
    const { localStream, _peerConnection, _callTimer, _callTimeout } = get();

    // Stop all local media tracks (releases camera/mic)
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // Close peer connection (remove handlers first to prevent callbacks during close)
    if (_peerConnection) {
      _peerConnection.onicecandidate = null;
      _peerConnection.ontrack = null;
      _peerConnection.onconnectionstatechange = null;
      _peerConnection.oniceconnectionstatechange = null;
      _peerConnection.close();
    }

    // Clear timers
    if (_callTimer) clearInterval(_callTimer);
    if (_callTimeout) clearTimeout(_callTimeout);

    set({
      callStatus: 'idle',
      callType: null,
      remoteUser: null,
      isMuted: false,
      isVideoOff: false,
      isRemoteMuted: false,
      isRemoteVideoOff: false,
      callDuration: 0,
      localStream: null,
      remoteStream: null,
      _peerConnection: null,
      _callTimer: null,
      _callTimeout: null,
      _iceCandidateQueue: [],
      _facingMode: 'user',
    });
  },
}));

export default useCallStore;
