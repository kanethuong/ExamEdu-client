import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
const StudentCall = () => {
    const roomID = "test";
    const user = useSelector((state) => state.user);

    const local_stream = useRef();
    const remoteStream = useRef();
    const [forceRender, setForceRender] = useState(1);
    const changeLocalVideoState = () => {
        local_stream.current.getVideoTracks()[0].enabled = !local_stream.current.getVideoTracks()[0].enabled;
    }
    const changeLocalAudioState = () => {
        local_stream.current.getAudioTracks()[0].enabled = !local_stream.current.getAudioTracks()[0].enabled;
    }



    useEffect(() => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            return ev.returnValue = 'Are you sure you want to close?';
        });
        var peer = new Peer();
        peer.on('open', (id) => {
            console.log("Connected with Id: " + id)
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                let video = document.getElementById("local-video");
                local_stream.current = stream;
                video.srcObject = stream;
                video.muted = true;
                video.play();
                let call = peer.call(roomID, stream, {
                    metadata: {
                        userEmail: user.email,
                        userFullname: user.fullname,
                        userRole: user.role
                    }
                });
                let count = 0;
                call.on('stream', (stream) => {
                    count++;
                    if (count === 2)
                        return;
                    remoteStream.current = stream;
                    setForceRender(Math.random()); //dung de force rerender
                })
            })

        })
    }, []);



    return (
        <div>
            <video id="local-video"></video>
            <video ref={(video) => {
                try {
                    video.srcObject = remoteStream.current;
                    console.log(remoteStream.current)
                } catch (error) {

                }
                
            }} autoPlay></video>
            <button onClick={() => changeLocalVideoState()}>local video state</button>
            <button onClick={() => changeLocalAudioState()}>Local audio state</button>
        </div>
    );
}

export default StudentCall;
