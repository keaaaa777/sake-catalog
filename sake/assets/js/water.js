/* Sake Water — WebGLによる立体的な清らかな水面と、Canvas 2Dによる雫の自由落下シミュレーション */
(function () {
  'use strict';

  var MAX_RIPPLES = 24;

  // WebGL用の水面キャンバス
  var canvas = document.getElementById('water-canvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });

  // 雫描画用の前面透明キャンバス
  var dripCanvas = document.getElementById('drip-canvas');
  var gDrip = dripCanvas ? dripCanvas.getContext('2d') : null;

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5); // パフォーマンスのため上限を1.5に制限
  var width = 0, height = 0;

  // 雫のアニメーション用変数
  var ripples = new Float32Array(MAX_RIPPLES * 4);
  var rippleIdx = 0;
  var fallingDrips = [];
  var lastAutoDrip = 0;
  var start = performance.now();
  var running = true;

  var ampCur = 0.5; // 初期波の強さ（ゆったりとした凪）

  // WebGLが利用できない場合のフォールバック（簡易版2D描画）
  if (!gl) {
    document.body.classList.add('no-webgl');
    // WebGLがない場合は、元の2D描画等のスタブを設定
    window.SakeWater = {
      triggerRipple: function () {}
    };
    return;
  }

  // 頂点シェーダー
  var VERT = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';

  // フラグメントシェーダー (日本酒・清らかな水の世界観に特化した3Dシェーダー)
  var FRAG = [
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform vec4  uRipples[' + MAX_RIPPLES + '];', // xy: 平面座標, z: 発生時刻, w: 強さ
    'uniform float uAmp;',
    '',
    // 日本酒・静寂な湧き水の世界観を表現するカラーパレット（定数）
    'const vec3 uZenith   = vec3(0.016, 0.043, 0.090);', // 天頂（深い紺青）
    'const vec3 uHorizon  = vec3(0.039, 0.090, 0.173);', // 地平線（澄んだ水面色）
    'const vec3 uLightDir = vec3(-0.25, 0.45, -0.85);',  // 月光の差し込む方向
    'const vec3 uLightCol = vec3(0.788, 0.690, 0.416);', // 反射光（金箔色 #c9b06a）
    'const vec3 uDeepA    = vec3(0.012, 0.035, 0.078);', // 水深部A
    'const vec3 uDeepB    = vec3(0.043, 0.098, 0.188);', // 水深部B（少し明るめの藍）
    'const float uStars   = 0.08;',                      // 星のきらめき強度（静寂を保つため控えめ）
    '',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',
    'float noise(vec2 p){',
    '  vec2 i = floor(p); vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    '',
    // カメラレイの算出（遠近感の設定）
    'vec3 camRay(vec2 uv){',
    '  vec2 ndc = uv * 2.0 - 1.0;',
    '  ndc.x *= uRes.x / uRes.y;',
    '  vec3 fw = normalize(vec3(0.0, -0.32, -1.0));',
    '  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));',
    '  vec3 up = cross(rt, fw);',
    '  return normalize(fw + ndc.x * rt * 0.62 + ndc.y * up * 0.62);',
    '}',
    '',
    // 波の高さマップの計算（シミュレーション）
    'float heightField(vec2 p){',
    '  float t = uTime;',
    '  float h = 0.0;',
    '  h += sin(p.x * 0.32 + t * 0.55) * 0.085 * uAmp;',
    '  h += sin(dot(p, vec2(0.24, 0.31)) + t * 0.42) * 0.065 * uAmp;',
    '  h += sin(dot(p, vec2(-0.12, 0.45)) - t * 0.68) * 0.04 * uAmp;',
    '  h += (noise(p * 0.9 + vec2(t * 0.22, t * 0.13)) - 0.5) * 0.10 * uAmp;',
    '  float fine = 0.5 + 0.5 * uAmp;',
    '  h += (noise(p * 2.6 + vec2(-t * 0.35, t * 0.28)) - 0.5) * 0.038 * fine;',
    '  h += (noise(p * 6.0 + vec2(t * 0.6, -t * 0.4)) - 0.5) * 0.014 * fine;',
    '  for (int i = 0; i < ' + MAX_RIPPLES + '; i++) {',
    '    float age = uTime - uRipples[i].z;',
    '    if (age < 0.0 || age > 7.0 || uRipples[i].w <= 0.0) continue;',
    '    float d = length(p - uRipples[i].xy);',
    '    float r = age * 1.35;',
    '    float band = exp(-pow((d - r) * 2.2, 2.0));',
    '    float decay = exp(-age * 0.75) * exp(-d * 0.06);',
    '    h += sin((d - r) * 9.0) * band * decay * 0.16 * uRipples[i].w;',
    '  }',
    '  return h;',
    '}',
    '',
    // 背景の空と反射光の計算
    'vec3 skyColor(vec3 rd){',
    '  float horizon = pow(clamp(1.0 - rd.y * 2.2, 0.0, 1.0), 2.1);',
    '  vec3 col = mix(uZenith, uHorizon, horizon);',
    '  float md = dot(rd, normalize(uLightDir));',
    '  col += uLightCol * smoothstep(0.9994, 0.99975, md) * 1.1;',
    '  col += uLightCol * pow(max(md, 0.0), 220.0) * 0.40;',
    '  col += uLightCol * pow(max(md, 0.0), 24.0) * 0.16;',
    '  vec2 sp = rd.xy / max(rd.z * -1.0 + 1.4, 0.35) * 46.0;',
    '  float star = step(0.9975, hash(floor(sp)));',
    '  col += vec3(star) * hash(floor(sp) + 7.0) * smoothstep(0.02, 0.2, rd.y) * 0.55 * uStars;',
    '  return col;',
    '}',
    '',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec3 ro = vec3(0.0, 2.6, 5.5);',
    '  vec3 rd = camRay(uv);',
    '  vec3 col;',
    '',
    '  if (rd.y < 0.012) {',
    '    float t = -ro.y / min(rd.y, -0.015);',
    '    vec2 p = (ro + rd * t).xz;',
    '    float dist = t;',
    '',
    '    float eps = 0.045 + dist * 0.012;',
    '    float h  = heightField(p);',
    '    float hx = heightField(p + vec2(eps, 0.0));',
    '    float hz = heightField(p + vec2(0.0, eps));',
    '    vec3 n = normalize(vec3(h - hx, eps * 1.35, h - hz));',
    '',
    '    vec3 R = reflect(rd, n);',
    '    R.y = abs(R.y);',
    '    vec3 refl = skyColor(R);',
    '',
    '    vec3 L = normalize(uLightDir);',
    '    float spec = pow(max(dot(R, L), 0.0), 340.0);',
    '    float glit = pow(max(dot(R, L), 0.0), 60.0);',
    '    float sparkle = 0.6 + 0.4 * noise(p * 14.0 + uTime * 1.5);',
    '    vec3 light = uLightCol * (spec * 3.2 + glit * 0.30) * sparkle;',
    '',
    '    float fresnel = 0.028 + 0.972 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);',
    '    vec3 deep = mix(uDeepA, uDeepB, clamp(h * 6.0 + 0.5, 0.0, 1.0));',
    '',
    '    col = mix(deep, refl, clamp(fresnel * 1.7, 0.0, 1.0)) + light;',
    '    float fog = 1.0 - exp(-dist * 0.028);',
    '    col = mix(col, skyColor(vec3(rd.x, 0.02, rd.z)), fog * 0.9);',
    '  } else {',
    '    col = skyColor(rd);',
    '  }',
    '',
    '  vec2 q = uv - 0.5;',
    '  col *= 1.0 - dot(q, q) * 0.85;',
    '  col = pow(col, vec3(0.90));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // シェーダーコンパイル用関数
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[sake water] shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    document.body.classList.add('no-webgl');
    window.SakeWater = { triggerRipple: function () {} };
    return;
  }

  // プログラムリンク
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // 頂点バッファの設定（画面全体を覆う三角形）
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // Uniform Location の取得
  var U = {};
  ['uRes', 'uTime', 'uRipples', 'uAmp'].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  // 波紋配列の初期化
  for (var i = 0; i < MAX_RIPPLES; i++) ripples[i * 4 + 2] = -100;

  // リサイズ処理
  function resize() {
    var box = canvas.parentElement;
    width = box.clientWidth;
    height = box.clientHeight;

    // WebGL キャンバスサイズ設定
    var scale = dpr * 0.75;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 雫描画用キャンバスサイズ設定
    if (dripCanvas && gDrip) {
      dripCanvas.width = Math.round(width * dpr);
      dripCanvas.height = Math.round(height * dpr);
      gDrip.scale(dpr, dpr);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function now() { return (performance.now() - start) / 1000; }

  // 画面のピクセル比率 (0〜1) から 3D 水面平面 (y = 0) の座標への逆投影
  function planeHit(uvx, uvy) {
    var ax = uvx * 2 - 1, ay = uvy * 2 - 1;
    // webgl canvas のアスペクト比
    ax *= (width / height);

    var fl = Math.sqrt(0.32 * 0.32 + 1.0);
    var fwy = -0.32 / fl, fwz = -1.0 / fl;
    var rtx = -fwz; // cross((0,fwy,fwz), (0,1,0)) = (-fwz,0,0)
    var rl = Math.abs(rtx); rtx = rtx / rl; // 1.0

    var upy = -fwz, upz = fwy; // cross(rt, fw)
    var rdx = ax * 0.62;
    var rdy = fwy + ay * upy * 0.62;
    var rdz = fwz + ay * upz * 0.62;
    var len = Math.sqrt(rdx * rdx + rdy * rdy + rdz * rdz);
    rdy /= len; rdx /= len; rdz /= len;

    var t = -2.6 / Math.min(rdy, -0.015);
    return { x: rdx * t, z: 5.5 + rdz * t };
  }

  // 3D波紋を追加する内部関数
  function addRipple(uvx, uvy, strength) {
    var p = planeHit(uvx, uvy);
    var k = rippleIdx * 4;
    ripples[k] = p.x;
    ripples[k + 1] = p.z;
    ripples[k + 2] = now();
    ripples[k + 3] = Math.min(strength || 1, 2.6);
    rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
  }

  // 自由落下する雫を生成
  function triggerFallingDrip(x, y, targetY) {
    fallingDrips.push({
      x: x,
      y: y,
      targetY: targetY,
      vy: 1.5,
      g: 0.15, // 重力加速度
      r: 2.2,
      length: 12
    });
  }

  // 画面全体へのクリックまたはタップ時に波紋を発生
  window.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || e.target.closest('a')) return;

    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var uvx = x / width;
    var uvy = 1 - (y / height); // GLSLは下が0のため反転

    addRipple(uvx, uvy, 1.2);

    if (window.SakeAudio) {
      window.SakeAudio.playDrip(uvx);
    }
  });

  // 自動的に雫を落下させる
  function updateAutoDrips(timestamp) {
    if (timestamp - lastAutoDrip > 3800 + Math.random() * 2400) {
      var x = width * (0.15 + Math.random() * 0.7);
      var startY = -20;
      var targetY = height * (0.35 + Math.random() * 0.5); // 画面中央〜下部
      triggerFallingDrip(x, startY, targetY);
      lastAutoDrip = timestamp;
    }
  }

  // アニメーションおよび描画ループ
  function draw(timestamp) {
    if (!running) return;

    var t = now();

    // 1. WebGLによる3D水面描画
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, t);
    gl.uniform4fv(U.uRipples, ripples);
    gl.uniform1f(U.uAmp, ampCur);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. Canvas 2Dによる雫の更新と描画
    if (gDrip) {
      gDrip.clearRect(0, 0, width, height);

      for (var i = fallingDrips.length - 1; i >= 0; i--) {
        var d = fallingDrips[i];
        d.vy += d.g; // 加速
        d.y += d.vy;

        if (d.y >= d.targetY) {
          // 水面に到達したら、WebGL水面に波紋を投じる
          var uvx = d.x / width;
          var uvy = 1 - (d.targetY / height);
          addRipple(uvx, uvy, 0.95);

          if (window.SakeAudio) {
            window.SakeAudio.playDrip(uvx);
          }
          fallingDrips.splice(i, 1);
          continue;
        }

        // 雫の描画（落ちていく光の流線：白練色）
        gDrip.strokeStyle = 'rgba(247, 249, 246, 0.7)';
        gDrip.lineWidth = 1.2;
        gDrip.lineCap = 'round';
        gDrip.beginPath();
        gDrip.moveTo(d.x, d.y - d.length);
        gDrip.lineTo(d.x, d.y);
        gDrip.stroke();

        // 先端の丸み
        gDrip.fillStyle = 'rgba(247, 249, 246, 0.8)';
        gDrip.beginPath();
        gDrip.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        gDrip.fill();
      }
    }

    updateAutoDrips(timestamp);
    requestAnimationFrame(draw);
  }

  // アニメーションループ開始
  requestAnimationFrame(draw);

  // 非表示時の描画一時停止
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  // 外部(main.js等)から波紋を追加できるようにグローバルへ登録
  window.SakeWater = {
    triggerRipple: function (x, y, strength) {
      // x, y は Canvas のピクセル座標。これを uv (0.0〜1.0) に変換して渡す
      var uvx = x / width;
      var uvy = 1 - (y / height);
      addRipple(uvx, uvy, strength);
    }
  };

})();
