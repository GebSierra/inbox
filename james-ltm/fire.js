// fire.js: a drop-in campfire/altar fire for three.js (r150+), ported from "My Place".
// Usage:
//   import {makeFire} from './fire.js';
//   const fire = makeFire(THREE, {scale: 1});   // scale 1 = campfire about 1.8 m tall
//   fire.position.set(x, y, z); scene.add(fire);
//   // in your animation loop:
//   fire.update(elapsedSeconds, camera);
// Everything is in one Group: layered flame cards, a glowing ember bed, rising sparks,
// drifting smoke and a flickering warm point light. No textures or files needed.

const NOISE = `float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;

export function makeFire(THREE, {scale = 1, light = true} = {}) {
  const root = new THREE.Group();
  const t = {value: 0};

  // flame: several camera-facing cards of animated noise shaped into tongues, added together
  const flame = new THREE.Group();
  flame.scale.set(1.45 * scale, 1.8 * scale, 1.45 * scale);
  flame.position.y = .12 * scale;
  root.add(flame);
  [[1.15,.9,0,1,0],[.9,.7,3.7,1.15,0],[.55,.42,7.1,1.5,0],[.8,.55,11.3,.9,-.24],[.75,.5,15.9,.9,.26],[.5,.4,21,1.1,.1]]
  .forEach(([h, w, seed, hot, ox]) => {
    const m = new THREE.ShaderMaterial({
      uniforms: {t, seed: {value: seed}, hot: {value: hot}},
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `${NOISE}uniform float t,seed,hot;varying vec2 vU;
      void main(){vec2 p=vU;p.x=p.x*2.-1.;
       float n1=fb(vec2(p.x*2.2+seed,p.y*2.6-t*2.6));float n2=fb(vec2(p.x*5.+seed*2.,p.y*5.5-t*4.4));
       p.x+=(n1-.5)*.55*p.y+(n2-.5)*.12;
       float body=1.-smoothstep(.15,1.,abs(p.x)/(.7*pow(1.-p.y,1.15)+.02));
       float rise=smoothstep(.0,.12,p.y)*(1.-smoothstep(.35,1.,p.y+n1*.35-.1));
       float sep=.55+.45*sin(p.x*9.+seed+fb(vec2(p.y*3.-t*3.,seed))*4.);
       float tongues=smoothstep(.06,.5,(n2*.6+n1*.75-p.y*.5)*mix(.6,1.15,sep));
       float i=body*rise*tongues;
       vec3 col=mix(vec3(.6,.06,.0),vec3(1.,.35,.04),smoothstep(.05,.35,i));
       col=mix(col,vec3(1.,.72,.25),smoothstep(.35,.7,i));
       col=mix(col,vec3(1.,.85,.55),smoothstep(.75,1.,i)*(1.-p.y)*.6);
       col=mix(col,vec3(1.,.42,.08),.35);
       gl_FragColor=vec4(col*min(1.,i*1.6)*hot*3.,min(1.,i*1.7));}`
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    q.position.set(ox, h / 2, ox * .3);
    flame.add(q);
  });

  // ember bed: glowing cracks in grey ash
  const bed = new THREE.Mesh(new THREE.CircleGeometry(.72 * scale, 48), new THREE.ShaderMaterial({
    uniforms: {t, R: {value: .72 * scale}}, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `${NOISE}uniform float t,R;varying vec2 vP;void main(){vec2 q=vP/R*.72;float r=length(q)/.72;
      float ash=fb(q*7.)*.55+fb(q*26.)*.45;vec3 c=mix(vec3(.28,.27,.26),vec3(.58,.57,.55),smoothstep(.25,.75,ash));
      float cr=smoothstep(.62,.75,fb(q*14.+vec2(0.,t*.05)))*(1.-smoothstep(.15,.7,r));float pulse=.75+.25*sin(t*2.3+fb(q*6.)*9.);
      c=mix(c,vec3(.04,.035,.03),cr*.8);c+=vec3(1.6,.4,.05)*cr*pulse*2.2*(1.-smoothstep(.0,.55,r));
      gl_FragColor=vec4(c,1.-smoothstep(.6,1.,r+fb(q*6.)*.25));}`
  }));
  bed.rotation.x = -Math.PI / 2; bed.position.y = .02 * scale; root.add(bed);

  // particles helper: points that loop upward over time
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
  const particles = (n, mat) => { const g = new THREE.BufferGeometry(), ph = new Float32Array(n), sd = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { ph[i] = Math.random(); sd[i*3] = Math.random() - .5; sd[i*3+1] = Math.random(); sd[i*3+2] = Math.random() - .5; }
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); g.setAttribute('sd', new THREE.BufferAttribute(sd, 3));
    const p = new THREE.Points(g, mat); p.frustumCulled = false; p.scale.setScalar(scale); root.add(p); return p; };
  // sparks
  particles(18, new THREE.ShaderMaterial({uniforms: {t}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float t;attribute float ph;attribute vec3 sd;varying float vA;void main(){float k=fract(ph+t*.35);
      vec3 p=vec3(sd.x*.3,.3+k*2.4,sd.z*.3)+vec3(sin(t*3.+ph*20.)*.15*k,0.,cos(t*2.6+ph*17.)*.15*k);
      vA=(1.-k)*step(.3,sd.y);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=4.*vA*(30./-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.45,.12)*1.6*vA*(1.-smoothstep(.15,.5,d)),1.);}`}));
  // smoke
  particles(90, new THREE.ShaderMaterial({uniforms: {t, map: {value: soft}}, transparent: true, depthWrite: false,
    vertexShader: `uniform float t;attribute float ph;attribute vec3 sd;varying float vA;void main(){float k=fract(ph+t*.07);
      vec3 p=vec3(sd.x*.1,.75,sd.z*.1)+vec3(k*k*1.6+sin(t*.8+ph*9.)*.5*k+sd.x*k,k*4.,k*.5+cos(t*.6+ph*7.)*.3*k+sd.z*k*.6);
      vA=pow(1.-k,1.6)*smoothstep(.0,.08,k)*(.6+.4*sin(t*.9+ph*12.));vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=(.35+k*2.6)*170./-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform sampler2D map;varying float vA;void main(){gl_FragColor=vec4(vec3(.62,.64,.68),texture2D(map,gl_PointCoord).a*.42*vA);}`}));

  // warm flickering light
  const L1 = new THREE.PointLight(0xff7a2e, 0, 16 * scale, 1.6), L2 = new THREE.PointLight(0xffa860, 0, 7 * scale, 1.8);
  L1.position.y = .9 * scale; L2.position.y = .35 * scale;
  if (light) root.add(L1, L2);

  root.update = (time, camera) => {
    t.value = time;
    const fl = 1 + Math.sin(time*11.3)*.12 + Math.sin(time*17.9+1)*.08 + Math.sin(time*5.1)*.1;
    L1.intensity = 16 * fl * scale; L2.intensity = 7 * fl * scale;
    if (camera) { const w = new THREE.Vector3(); root.getWorldPosition(w);
      flame.rotation.y = Math.atan2(camera.position.x - w.x, camera.position.z - w.z) - root.rotation.y; }
  };
  return root;
}
