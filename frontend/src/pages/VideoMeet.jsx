


import React, { useState, useRef, useEffect } from 'react';
import  styles from "../styles/VideoComponent.module.css";
import { Badge,Button, IconButton, TextField } from '@mui/material';
import { io } from "socket.io-client";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicIconOff from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router';



const server_url = "http://localhost:8000";
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [showModal, setModal] = useState(true);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
          localVideoRef.current.play();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      stream.getTracks().forEach(track => {
        connections[id].addTrack(track, stream);
      });
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          }).catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        window.localStream.getTracks().forEach(track => {
          connections[id].addTrack(track, window.localStream);
        });
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            }).catch(e => console.log(e));
        });
      }
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch(e => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
              });
            });
          }
        });
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  let addMessage = (data,sender,socketIdSender) => {
    
   
    if(socketIdSender!== socketIdRef.current){
        setNewMessages((prevCount)=>prevCount+1);
    }
    setMessages((prevMessages)=>[
        ...prevMessages,{sender:sender,data:data}
    ])
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, client) => {
        client.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].ontrack = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video => video.socketId === socketListId ? { ...video, stream: event.streams[0] } : video);
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.streams[0],
                autoPlay: true,
                playsinline: true
              };
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              window.localStream.getTracks().forEach(track => {
                connections[id2].addTrack(track, window.localStream);
              });
            } catch (e) {
              console.log(e);
            }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              });
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  };

  let handleVideo = ()=>{
        setVideo(!video);
  }
  let handleAudio =()=>{
    setAudio(!audio);
  }

  let handleScreen = ()=>{
    setScreen(!screen);
  }

  let sendMessage =()=>{
    socketRef.current.emit("chat-message",message,username);
setMessage("");


  }

  let handleEndCall = ()=>{
    try{
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track=>track.stop());
    }
    catch(e){
    }
    routeTo("/");

  }

  let getDisplayMediaSuccess =(stream)=>{

    try{
        window.localStream.getTracks().forEach(track=>track.stop());
    }
catch(e){
    console.log(e)
}


  
    window.localStream = stream;
    localVideoRef.current.srcObject =stream;
    for(let id in connections){
        if(id=== socketIdRef.current)continue;

        stream.getTracks().forEach(track=>{
            connections[id].addTrack(track,stream);
        })

        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description)
            .then(()=>{
                socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
            }).catch(e=>console.log(e));
        })

    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);
  
        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        } catch (e) {
          console.log(e);
        }
  
        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;
  
        getUserMedia();
      });
  } 


let getDisplayMedia = ()=>{
    if(screen){
        if(navigator.mediaDevices.getDisplayMedia){
            navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
            .then(getDisplayMediaSuccess)
            .then((stream)=>{})
            .catch(e=>console.log(e));
        }
    }

}
  useEffect(()=>{
    if(screen !== undefined){
        getDisplayMedia();
    }
  },[screen]);

  let routeTo = useNavigate();

  const connect = () => {
    setAskUsername(false);
    getMedia();
    connectToSocketServer();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            variant="outlined"
            onChange={e => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>Connect</Button>
          <div>
            <video ref={localVideoRef} autoPlay muted playsInline></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>

            {showModal?  
    <div className={styles.chatRoom}>

        <div className={styles.chatContainer}>
        <h1>Chat</h1>

        <div className={styles.chattingDisplay}>
            { messages.length>0? messages.map((item,index)=>{
                return(
                    <div key={index} style={{marginBottom:"20px"}}>
                            <p style={{fontWeight:"bold"}}>{item.sender}</p>
                            <p>{item.data}</p>
                        </div>
                )
            }):<p>No messgaes yet</p>}

        </div>

        <div className={styles.chattingArea}>
        <TextField value ={message} onChange={e=>setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" />
        <Button variant='contained' onClick={sendMessage} >Send</Button>
        </div>
       
        </div>
        

    </div>:<></>
}

            <div className={styles.buttonContainers}>

            <IconButton style={{color:"white"}} onClick={handleVideo}>
                {video===true? <VideocamIcon/> :<VideocamOffIcon/>}
            </IconButton>


            <IconButton style={{color:"red"}} onClick={handleEndCall}>
               <CallEndIcon/>
            </IconButton>

            <IconButton style={{color:"white"}} onClick={handleAudio}>
              {audio ===true ? <MicIcon/>:<MicIconOff/>}
            </IconButton>

            {screenAvailable ===true ?  <IconButton onClick={handleScreen} style={{color:"white"}}>
                {screen===true ? <ScreenShareIcon/>:<StopScreenShareIcon/>}
                </IconButton> : <></>}

            <Badge badgeContent = {newMessages} max={999} color='orange'>
                <IconButton style={{color:"white"}} onClick={()=>{
                    setModal(!showModal)
                }} >

                    <ChatIcon/>

                </IconButton>
            </Badge>
            

            </div>
            <div>


          <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline></video>
          {videos.map((video) => (
            <div  key={video.socketId}>
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el) el.srcObject = video.stream;
                }}
              />
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}