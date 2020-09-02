let last_time = 0;
ボタンの表示
function gestureDetection(data) {
  /* data score, part:string, position.x/y, timestamp, score(all)
  0:nose, 1:leftEye, 2:rightEye 3:leftEar, 4:rightEar
  5:leftShoulder, 6:rightShoulder 7:leftElbow, 8:rightElbow
  9:leftWrist, 10:rightWrist 11:leftHip, 12:rightHip
  13:leftKnee, 14:rightKnee 15:leftAnkle, 16:rightAnkle
  17:time
  */

  //fps表示
  let delta_time = data[17].timestamp - last_time;
  if (delta_time > 0) {
    let fps = 1000 / delta_time;
    $("#fps").text(parseInt(fps));
  }
  last_time = data[17].timestamp;
}
