const imageScaleFactor = 0.2;
const outputStride = 16;
const flipHorizontal = true;
const stats = new Stats();
const contentWidth = 640;
const contentHeight = 480;
const minPartConfidence = 0.4;
const minPoseConfidence = 0.1;
const guiState = {
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};
bindPage();

async function bindPage() {
    /*const net = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: contentWidth, height: contentHeight },
        quantBytes: 2
      });*/
      const net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: contentWidth, height: contentHeight },
        multiplier: 0.75
      });
      const loadingDivId = 'loading', mainDivId = 'main'
      document.getElementById(loadingDivId).style.display = 'none';
      document.getElementById(mainDivId).style.display = 'block';
    let video;
    try {
        video = document.getElementById('video');// video属性をロード
    } catch(e) {
        console.error(e);
        return;
    }
    video.addEventListener('loadeddata', (event) => {
        detectPoseInRealTime(video,net);
      });
    

}



// 取得したストリームをestimateSinglePose()に渡して姿勢予測を実行
// requestAnimationFrameによってフレームを再描画し続ける
function detectPoseInRealTime(video, net) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    async function poseDetectionFrame() {
        stats.begin();
        const poses = await net.estimatePoses(video, {
          flipHorizontal: flipHorizontal,
          imageScaleFactor: 0.3,
          decodingMethod: 'single-person'
        });

        ctx.clearRect(0, 0, contentWidth,contentHeight);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-contentWidth, 0);
        ctx.drawImage(video, 0, 0, contentWidth, contentHeight);
        ctx.restore();
        
        poses.forEach(({ score, keypoints }) => {
            
            if (window.DataSend != undefined) {
                /* keypoints
                0:nose, 1:leftEye, 2:rightEye
                3:leftEar, 4:rightEar
                5:leftShoulder, 6:rightShoulder +
                7:leftElbow, 8:rightElbow +
                9:leftWrist, 10:rightWrist +
                11:leftHip, 12:rightHip
                13:leftKnee, 14:rightKnee
                15:leftAnkle, 16:rightAnkle
                */
                window.DataSend(JSON.stringify(keypoints));
            }
        });

        poses.forEach(({score, keypoints}) => {
          if (score >= minPoseConfidence) {
            if (guiState.output.showPoints) {
              window.drawKeypoints(keypoints, minPartConfidence, ctx);
            }
            if (guiState.output.showSkeleton) {
              window.drawSkeleton(keypoints, minPartConfidence, ctx);
            }
            if (guiState.output.showBoundingBox) {
              window.drawBoundingBox(keypoints, ctx);
            }
          }
        });
        stats.end();

        requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
}

// 与えられたKeypointをcanvasに描画する
function drawWristPoint(wrist,ctx){
    ctx.beginPath();
    ctx.arc(wrist.position.x , wrist.position.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "pink";
    ctx.fill();
}