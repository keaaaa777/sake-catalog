/* Sake Audio — Web Audio API による水滴音（滴下音）のリアルタイム合成 */
(function () {
  'use strict';

  var audioCtx = null;
  var delayNode = null;
  var feedbackGain = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 静寂を演出するための残響ディレイラインの構築
    delayNode = audioCtx.createDelay(1.0);
    feedbackGain = audioCtx.createGain();

    // 380ms遅延させ、かすかに減衰しながら繰り返す
    delayNode.delayTime.setValueAtTime(0.38, audioCtx.currentTime);
    feedbackGain.gain.setValueAtTime(0.32, audioCtx.currentTime);

    // ディレイのフィードバックループ接続
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(audioCtx.destination);
  }

  /**
   * 水滴の音を合成して鳴らす
   * @param {number} xPos - 画面の左右位置 (0.0〜1.0)。ピッチに変化を与える。
   */
  function playDrip(xPos) {
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    var now = audioCtx.currentTime;
    
    // 発振器とエンベロープ用のゲイン
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    
    // クリック位置に応じて少し音程を変える
    var x = xPos == null ? 0.5 : xPos;
    var baseFreq = 800 + x * 350 + (Math.random() - 0.5) * 80;
    
    // 1つ目の発振器（メインの鋭いピチャン音）
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.012);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.08);

    // 2つ目の発振器（金属的なきらめきの高周波成分）
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3.2, now + 0.01);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.1, now + 0.06);

    // 音量のエンベロープ（一瞬で立ち上がり、速やかに消える）
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.003); 
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    // 接続
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    
    // 残響エフェクト（ディレイ）へ流す
    if (delayNode) {
      gain.connect(delayNode);
    }

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now);
    osc2.stop(now + 0.1);
  }

  window.SakeAudio = {
    init: initAudio,
    playDrip: playDrip
  };
})();
