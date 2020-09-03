const SAMPLING_DULATION = 400 //ms
let last_time = 0;
const MIN_CONFIDENCE = 0.3;

let initCount = 0;
const MAX_INIT_COUNT = 20;
let sum_delta_time = 0;
let sampl_count = 0;

let l_sho = 0;
let l_elb = 0;
let l_wri = 0;
// let l_hip = 0;
let r_sho = 0;
let r_elb = 0;
let r_wri = 0;
// let r_hip = 0;

let l_up_arm_ang = 0;
let l_low_arm_ang = 0;
let r_up_arm_ang = 0;
let r_low_arm_ang = 0;

//ボタンの表示
function gestureDetection(data) {
  /* data score, part:string, position.x/y, timestamp, score(all)
  0:nose, 1:leftEye, 2:rightEye 3:leftEar, 4:rightEar, 5:leftShoulder, 6:rightShoulder 7:leftElbow, 8:rightElbow
  9:leftWrist, 10:rightWrist 11:leftHip, 12:rightHip, 13:leftKnee, 14:rightKnee 15:leftAnkle, 16:rightAnkle, 17:time
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
      // l_hip = new ArrKeepData();
      r_sho = new ArrKeepData();
      r_elb = new ArrKeepData();
      r_wri = new ArrKeepData();
      // r_hip = new ArrKeepData();

      initCount = 0;//再利用
    }
  } else if (sampl_count != 0) {
    //データ更新
    l_sho.add(data[5]);
    l_elb.add(data[7]);
    l_wri.add(data[9]);
    // l_hip.add(data[11]);
    r_sho.add(data[6]);
    r_elb.add(data[8]);
    r_wri.add(data[10]);
    // r_hip.add(data[12]);
    initCount++;
    if (initCount >= sampl_count - 1) {
      //データ選定
      l_sho.updatePart();
      l_elb.updatePart();
      l_wri.updatePart();
      // l_hip.updatePart();
      r_sho.updatePart();
      r_elb.updatePart();
      r_wri.updatePart();
      // r_hip.updatePart();

      //正当性判定
      justification(l_wri, r_wri); //手首
      justification(l_elb, r_elb); //肘

      initCount = 0;
    }

    //動作判定
    if (score_checker(data[17])) {
      detector();
    }
  }
  last_time = data[17].timestamp;
}

//動作判定
function detector() {
  if (score_checker(l_elb) * score_checker(l_sho)) {
    l_up_arm_ang = calc_angle(l_elb.x, l_elb.y, l_sho.x, Infinity, l_sho.x, l_sho.y, l_sho.x, l_sho.y);
  }
  if (score_checker(l_wri) * score_checker(l_elb) * score_checker(l_sho)) {
    l_low_arm_ang = calc_angle(l_wri.x, l_wri.y, l_elb.x, l_elb.y, l_elb.x, l_elb.y, l_sho.x, l_sho.y);
  }
  if (score_checker(r_elb) * score_checker(r_sho)) {
    r_up_arm_ang = calc_angle(r_elb.x, r_elb.y, r_sho.x, Infinity, r_sho.x, r_sho.y, r_sho.x, r_sho.y);
  }
  if (score_checker(r_wri) * score_checker(r_elb) * score_checker(r_sho)) {
    r_low_arm_ang = calc_angle(r_wri.x, r_wri.y, r_elb.x, r_elb.y, r_elb.x, r_elb.y, r_sho.x, r_sho.y);
  }




  //表示
  $("#l_up_arm_ang").text(l_up_arm_ang);
  $("#l_low_arm_ang").text(l_low_arm_ang);
  $("#r_up_arm_ang").text(r_up_arm_ang);
  $("#r_low_arm_ang").text(r_low_arm_ang);
}

//スコアが超えているか判定
function score_checker(part) {
  if (part.score > MIN_CONFIDENCE) {
    return 1;
  } else {
    return 0;
  }
}

//正当性判定
function justification(l, r) {
  if ((l.x - r_sho.x) > 0) { //左
    if ((r.x - l_sho.x) < 0) { //右
      //両方入れ替え
      let tmp_x = l.x;
      let tmp_y = l.y;
      let tmp_s = l.score;
      l.x = r.x;
      l.y = r.y;
      l.score = r.score;
      r.x = tmp_x;
      r.y = tmp_y;
      r.score = tmp_s;
    }
    else {
      l.score = 0; //左を捨てる
    }
  }
  else if ((r.x - l.x) < 0) { //右
    r.score = 0;
  }
}

//ベクトルの角度
function get_degree (x, y, xb, yb) {
  return Math.atan2 (y-yb, x-xb) * 180 / Math.PI;
}

//二ベクトルの角度差を計算する
function calc_angle (x, y, xf, yf, xb, yb, xfb, yfb) {
  var r = get_degree (x, y, xb, yb);
  var rf = get_degree (xf, yf, xfb, yfb);
  return r - rf;
}

//スコアが最も高いデータの位置x,y
var ArrKeepData = function() {
  this.keypoints = [];
  this.x = 0;
  this.y = 0;
  this.score = 0;

  //データの追加
  this.add = function(part){
    this.keypoints.unshift(part);
    if (this.keypoints.length > sampl_count) {
      this.keypoints.pop();
    }
  }

  //データの選択
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
    this.score = this.keypoints[index].score;
  }
}