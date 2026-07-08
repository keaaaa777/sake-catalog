'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    SakeWater?: {
      triggerRipple: (x: number, y: number, strength?: number) => void
    }
    SakeAudio?: {
      init: () => void
      playDrip: (xPos?: number) => void
    }
  }
}

export default function WaterBackground() {
  const waterCanvasRef = useRef<HTMLCanvasElement>(null)
  const dripCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = waterCanvasRef.current
    const dripCanvas = dripCanvasRef.current
    if (!canvas || !dripCanvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    const gDrip = dripCanvas.getContext('2d')

    let dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5)
    let width = 0
    let height = 0
    let running = true

    const MAX_RIPPLES = 24
    const ripples = new Float32Array(MAX_RIPPLES * 4)
    let rippleIdx = 0
    interface FallingDrip {
      x: number
      y: number
      targetY: number
      vy: number
      g: number
      r: number
      length: number
    }
    const fallingDrips: FallingDrip[] = []
    let lastAutoDrip = 0
    const start = performance.now()
    const ampCur = 0.5 // 初期波の強さ（ゆったりとした凪）

    // WebGLフォールバック
    if (!gl) {
      document.body.classList.add('no-webgl')
      window.SakeWater = {
        triggerRipple: () => {}
      }
      return
    }

    // 頂点シェーダー
    const VERT = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }'

    // フラグメントシェーダー
    const FRAG = `
      precision highp float;
      uniform vec2  uRes;
      uniform float uTime;
      uniform vec4  uRipples[${MAX_RIPPLES}];
      uniform float uAmp;

      const vec3 uZenith   = vec3(0.016, 0.043, 0.090);
      const vec3 uHorizon  = vec3(0.039, 0.090, 0.173);
      const vec3 uLightDir = vec3(-0.25, 0.45, -0.85);
      const vec3 uLightCol = vec3(0.788, 0.690, 0.416);
      const vec3 uDeepA    = vec3(0.012, 0.035, 0.078);
      const vec3 uDeepB    = vec3(0.043, 0.098, 0.188);
      const float uStars   = 0.08;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      vec3 camRay(vec2 uv){
        vec2 ndc = uv * 2.0 - 1.0;
        ndc.x *= uRes.x / uRes.y;
        vec3 fw = normalize(vec3(0.0, -0.32, -1.0));
        vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(rt, fw);
        return normalize(fw + ndc.x * rt * 0.62 + ndc.y * up * 0.62);
      }

      float heightField(vec2 p){
        float t = uTime;
        float h = 0.0;
        h += sin(p.x * 0.32 + t * 0.55) * 0.085 * uAmp;
        h += sin(dot(p, vec2(0.24, 0.31)) + t * 0.42) * 0.065 * uAmp;
        h += sin(dot(p, vec2(-0.12, 0.45)) - t * 0.68) * 0.04 * uAmp;
        h += (noise(p * 0.9 + vec2(t * 0.22, t * 0.13)) - 0.5) * 0.10 * uAmp;
        float fine = 0.5 + 0.5 * uAmp;
        h += (noise(p * 2.6 + vec2(-t * 0.35, t * 0.28)) - 0.5) * 0.038 * fine;
        h += (noise(p * 6.0 + vec2(t * 0.6, -t * 0.4)) - 0.5) * 0.014 * fine;
        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
          float age = uTime - uRipples[i].z;
          if (age < 0.0 || age > 7.0 || uRipples[i].w <= 0.0) continue;
          float d = length(p - uRipples[i].xy);
          float r = age * 1.35;
          float band = exp(-pow((d - r) * 2.2, 2.0));
          float decay = exp(-age * 0.75) * exp(-d * 0.06);
          h += sin((d - r) * 9.0) * band * decay * 0.16 * uRipples[i].w;
        }
        return h;
      }

      vec3 skyColor(vec3 rd){
        float horizon = pow(clamp(1.0 - rd.y * 2.2, 0.0, 1.0), 2.1);
        vec3 col = mix(uZenith, uHorizon, horizon);
        float md = dot(rd, normalize(uLightDir));
        col += uLightCol * smoothstep(0.9994, 0.99975, md) * 1.1;
        col += uLightCol * pow(max(md, 0.0), 220.0) * 0.40;
        col += uLightCol * pow(max(md, 0.0), 24.0) * 0.16;
        vec2 sp = rd.xy / max(rd.z * -1.0 + 1.4, 0.35) * 46.0;
        float star = step(0.9975, hash(floor(sp)));
        col += vec3(star) * hash(floor(sp) + 7.0) * smoothstep(0.02, 0.2, rd.y) * 0.55 * uStars;
        return col;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        vec3 ro = vec3(0.0, 2.6, 5.5);
        vec3 rd = camRay(uv);
        vec3 col;

        if (rd.y < 0.012) {
          float t = -ro.y / min(rd.y, -0.015);
          vec2 p = (ro + rd * t).xz;
          float dist = t;

          float eps = 0.045 + dist * 0.012;
          float h  = heightField(p);
          float hx = heightField(p + vec2(eps, 0.0));
          float hz = heightField(p + vec2(0.0, eps));
          vec3 n = normalize(vec3(h - hx, eps * 1.35, h - hz));

          vec3 R = reflect(rd, n);
          R.y = abs(R.y);
          vec3 refl = skyColor(R);

          vec3 L = normalize(uLightDir);
          float spec = pow(max(dot(R, L), 0.0), 340.0);
          float glit = pow(max(dot(R, L), 0.0), 60.0);
          float sparkle = 0.6 + 0.4 * noise(p * 14.0 + uTime * 1.5);
          vec3 light = uLightCol * (spec * 3.2 + glit * 0.30) * sparkle;

          float fresnel = 0.028 + 0.972 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
          vec3 deep = mix(uDeepA, uDeepB, clamp(h * 6.0 + 0.5, 0.0, 1.0));

          col = mix(deep, refl, clamp(fresnel * 1.7, 0.0, 1.0)) + light;
          float fog = 1.0 - exp(-dist * 0.028);
          col = mix(col, skyColor(vec3(rd.x, 0.02, rd.z)), fog * 0.9);
        } else {
          col = skyColor(rd);
        }

        vec2 q = uv - 0.5;
        col *= 1.0 - dot(q, q) * 0.85;
        col = pow(col, vec3(0.90));
        gl_FragColor = vec4(col, 1.0);
      }
    `

    // シェーダーコンパイル
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)
      if (!s) return null
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('[sake water] shader error:', gl!.getShaderInfoLog(s))
        return null
      }
      return s
    }

    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      document.body.classList.add('no-webgl')
      window.SakeWater = { triggerRipple: () => {} }
      return
    }

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U: Record<string, WebGLUniformLocation | null> = {}
    ;['uRes', 'uTime', 'uRipples', 'uAmp'].forEach((n) => {
      U[n] = gl.getUniformLocation(prog, n)
    })

    // 波紋配列の初期化
    for (let i = 0; i < MAX_RIPPLES; i++) ripples[i * 4 + 2] = -100

    // リサイズ処理
    function resize() {
      const box = canvas!.parentElement
      if (!box) return
      width = box.clientWidth
      height = box.clientHeight

      const scale = dpr * 0.75
      canvas!.width = Math.round(width * scale)
      canvas!.height = Math.round(height * scale)
      gl!.viewport(0, 0, canvas!.width, canvas!.height)

      if (dripCanvas && gDrip) {
        dripCanvas.width = Math.round(width * dpr)
        dripCanvas.height = Math.round(height * dpr)
        gDrip.setTransform(1, 0, 0, 1, 0, 0)
        gDrip.scale(dpr, dpr)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    function getNow() {
      return (performance.now() - start) / 1000
    }

    function planeHit(uvx: number, uvy: number) {
      let ax = uvx * 2 - 1
      const ay = uvy * 2 - 1
      ax *= width / height

      const fl = Math.sqrt(0.32 * 0.32 + 1.0)
      const fwy = -0.32 / fl
      const fwz = -1.0 / fl
      let rtx = -fwz
      const rl = Math.abs(rtx)
      rtx = rtx / rl

      const upy = -fwz
      const upz = fwy
      const rdx = ax * 0.62
      let rdy = fwy + ay * upy * 0.62
      let rdz = fwz + ay * upz * 0.62
      const len = Math.sqrt(rdx * rdx + rdy * rdy + rdz * rdz)
      rdy /= len
      rdz /= len

      const t = -2.6 / Math.min(rdy, -0.015)
      return { x: (rdx / len) * t, z: 5.5 + rdz * t }
    }

    function addRipple(uvx: number, uvy: number, strength?: number) {
      const p = planeHit(uvx, uvy)
      const k = rippleIdx * 4
      ripples[k] = p.x
      ripples[k + 1] = p.z
      ripples[k + 2] = getNow()
      ripples[k + 3] = Math.min(strength || 1, 2.6)
      rippleIdx = (rippleIdx + 1) % MAX_RIPPLES
    }

    function triggerFallingDrip(x: number, y: number, targetY: number) {
      fallingDrips.push({
        x: x,
        y: y,
        targetY: targetY,
        vy: 1.5,
        g: 0.15,
        r: 2.2,
        length: 12
      })
    }

    // 自動雫落下
    function updateAutoDrips(timestamp: number) {
      if (timestamp - lastAutoDrip > 3800 + Math.random() * 2400) {
        const x = width * (0.15 + Math.random() * 0.7)
        const startY = -20
        const targetY = height * (0.35 + Math.random() * 0.5)
        triggerFallingDrip(x, startY, targetY)
        lastAutoDrip = timestamp
      }
    }

    // アニメーションループ
    function draw(timestamp: number) {
      if (!running) return

      const t = getNow()

      gl!.uniform2f(U.uRes, canvas!.width, canvas!.height)
      gl!.uniform1f(U.uTime, t)
      gl!.uniform4fv(U.uRipples, ripples)
      gl!.uniform1f(U.uAmp, ampCur)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)

      if (gDrip) {
        gDrip.clearRect(0, 0, width, height)

        for (let i = fallingDrips.length - 1; i >= 0; i--) {
          const d = fallingDrips[i]
          d.vy += d.g
          d.y += d.vy

          if (d.y >= d.targetY) {
            const uvx = d.x / width
            const uvy = 1 - d.targetY / height
            addRipple(uvx, uvy, 0.95)

            if (window.SakeAudio) {
              window.SakeAudio.playDrip(uvx)
            }
            fallingDrips.splice(i, 1)
            continue
          }

          gDrip.strokeStyle = 'rgba(247, 249, 246, 0.7)'
          gDrip.lineWidth = 1.2
          gDrip.lineCap = 'round'
          gDrip.beginPath()
          gDrip.moveTo(d.x, d.y - d.length)
          gDrip.lineTo(d.x, d.y)
          gDrip.stroke()

          gDrip.fillStyle = 'rgba(247, 249, 246, 0.8)'
          gDrip.beginPath()
          gDrip.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          gDrip.fill()
        }
      }

      updateAutoDrips(timestamp)
      requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)

    // 全体クリック/タップ時の波紋
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('label') || target.closest('.prefecture')) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const uvx = x / width
      const uvy = 1 - y / height

      addRipple(uvx, uvy, 1.2)

      if (window.SakeAudio) {
        window.SakeAudio.playDrip(uvx)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)

    const handleVisibilityChange = () => {
      running = !document.hidden
      if (running) requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // グローバルに波紋関数を登録
    window.SakeWater = {
      triggerRipple: (x: number, y: number, strength?: number) => {
        const uvx = x / width
        const uvy = 1 - y / height
        addRipple(uvx, uvy, strength)
      }
    }

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      delete window.SakeWater
    }
  }, [])

  // Web Audio API による音響生成の移植
  useEffect(() => {
    let audioCtx: AudioContext | null = null
    let delayNode: DelayNode | null = null
    let feedbackGain: GainNode | null = null

    function initAudio() {
      if (audioCtx) return
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtxClass) return

      audioCtx = new AudioCtxClass()
      delayNode = audioCtx.createDelay(1.0)
      feedbackGain = audioCtx.createGain()

      delayNode.delayTime.setValueAtTime(0.38, audioCtx.currentTime)
      feedbackGain.gain.setValueAtTime(0.32, audioCtx.currentTime)

      delayNode.connect(feedbackGain)
      feedbackGain.connect(delayNode)
      delayNode.connect(audioCtx.destination)
    }

    function playDrip(xPos?: number) {
      if (!audioCtx) initAudio()
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume()
      }
      if (!audioCtx) return

      const now = audioCtx.currentTime
      const osc1 = audioCtx.createOscillator()
      const osc2 = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      const x = xPos === undefined ? 0.5 : xPos
      const baseFreq = 800 + x * 350 + (Math.random() - 0.5) * 80

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(baseFreq, now)
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.012)
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.08)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now)
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3.2, now + 0.01)
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.1, now + 0.06)

      gain.gain.setValueAtTime(0.0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(audioCtx.destination)

      if (delayNode) {
        gain.connect(delayNode)
      }

      osc1.start(now)
      osc1.stop(now + 0.12)
      osc2.start(now)
      osc2.stop(now + 0.1)
    }

    // 初回の操作でオーディオを初期化
    let hasInteracted = false
    const triggerInitAudio = () => {
      if (hasInteracted) return
      hasInteracted = true
      initAudio()
      window.removeEventListener('pointerdown', triggerInitAudio)
      window.removeEventListener('keydown', triggerInitAudio)
    }

    window.addEventListener('pointerdown', triggerInitAudio)
    window.addEventListener('keydown', triggerInitAudio)

    window.SakeAudio = {
      init: initAudio,
      playDrip: playDrip
    }

    return () => {
      window.removeEventListener('pointerdown', triggerInitAudio)
      window.removeEventListener('keydown', triggerInitAudio)
      if (audioCtx) {
        audioCtx.close()
      }
      delete window.SakeAudio
    }
  }, [])

  return (
    <>
      <div className="background-canvas-container" aria-hidden="true">
        <canvas ref={waterCanvasRef} id="water-canvas"></canvas>
        <canvas ref={dripCanvasRef} id="drip-canvas" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></canvas>
      </div>
      <div className="grain-overlay" aria-hidden="true"></div>
    </>
  )
}
