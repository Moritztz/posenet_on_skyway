const SAMPLING_DULATION = 400 //ms
let last_time = 0;

let initCount = 0;
const MAX_INIT_COUNT = 20;
let sum_delta_time = 0;
let sampl_count = 0;

let r_sho = 0;
let r_elb = 0;
let r_wri = 0;
let l_sho = 0;
let l_elb = 0;
let l_wri = 0;

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

  if (last_time != 0 && sampl_count == 0) {
    if (initCount < MAX_INIT_COUNT) {
      sum_delta_time += delta_time;
      initCount++;
    } else {
      let ave_delta_time = sum_delta_time / MAX_INIT_COUNT;
      sampl_count = parseInt(SAMPLING_DULATION / ave_delta_time);

      //初期化
      l_sho = new ArrKeepData();
      l_elb = new ArrKeepData();
      l_wri = new ArrKeepData();
      r_sho = new ArrKeepData();
      r_elb = new ArrKeepData();
      r_wri = new ArrKeepData();
    }
  } else if (sampl_count != 0) {
    //データ更新
    l_sho.add(data[5]);
    l_elb.add(data[7]);
    l_wri.add(data[9]);
    r_sho.add(data[6]);
    r_elb.add(data[8]);
    r_wri.add(data[10]);
  }

  last_time = data[17].timestamp;
}

//スコアが最も高いデータの位置x,y
var ArrKeepData = function() {
  this.keypoints = [0];
  this.x = 0;
  this.y = 0;

  this.add = function(part){
    this.keypoints.unshift(part);
    if (this.keypoints.length() > sampl_count) {
      part.pop();
    }
  }

  this.updatePart = function() {
    let index = 0;
    let maxCallback = (( max, cur, cIndex) => {
      if (max > cur) {
        return max;
      } else {
        index = cIndex;
        return cur;
      }
    });
    this.keypoints.map( el => el.score )
                  .reduce( maxCallback, -Infinity);
    this.x = this.keypoints[index].position.x;
    this.y = this.keypoints[index].position.y;
  }
}