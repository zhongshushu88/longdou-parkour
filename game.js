(() => {
  "use strict";

  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");
  const frame = document.querySelector("#gameFrame");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ui = {
    levelName: document.querySelector("#levelName"),
    energy: document.querySelector("#energyValue"),
    coins: document.querySelector("#coinValue"),
    fruit: document.querySelector("#fruitValue"),
    chaseFill: document.querySelector("#chaseFill"),
    chaseState: document.querySelector("#chaseState"),
    progressText: document.querySelector("#progressText"),
    progressFill: document.querySelector("#progressFill"),
    boostFill: document.querySelector("#boostFill"),
    boostState: document.querySelector("#boostState"),
    toast: document.querySelector("#toast"),
    tutorial: document.querySelector("#tutorialCard"),
    tutorialIcon: document.querySelector("#tutorialIcon"),
    tutorialTitle: document.querySelector("#tutorialTitle"),
    tutorialText: document.querySelector("#tutorialText"),
    throwButton: document.querySelector("#throwButton"),
    boostButton: document.querySelector("#boostButton"),
    soundButton: document.querySelector("#soundButton"),
    mobileSoundButton: document.querySelector("#mobileSoundButton"),
    pauseButton: document.querySelector("#pauseButton"),
    score: document.querySelector("#scoreValue"),
    target: document.querySelector("#targetValue"),
    best: document.querySelector("#bestValue"),
    combo: document.querySelector("#comboValue"),
    practiceBadge: document.querySelector("#practiceBadge"),
    familyFill: document.querySelector("#familyFill"),
    familyState: document.querySelector("#familyState"),
    familyButton: document.querySelector("#familyButton"),
    familyButtonLabel: document.querySelector("#familyButtonLabel"),
    mission: document.querySelector("#missionHud"),
  };

  const screens = {
    menu: document.querySelector("#menuScreen"),
    characters: document.querySelector("#characterScreen"),
    story: document.querySelector("#storyScreen"),
    levels: document.querySelector("#levelScreen"),
    result: document.querySelector("#resultScreen"),
    pause: document.querySelector("#pauseScreen"),
  };

  const levelData = [
    {
      name: "骑楼追风",
      place: "骑楼老街",
      caption: "从骑楼拱廊间夺回第一枚徽章",
      speed: 365,
      duration: 52,
      targetScore: 4200,
      spawn: [1.45, 2.1],
      background: "assets/scene-1-qilou.webp",
      obstacles: ["crate", "cone", "cat"],
      mechanic: "tutorial",
      goals: ["成功到达终点", "找回骑楼徽章", "全程最多碰撞一次"],
    },
    {
      name: "绿园穿梭",
      place: "万绿园",
      caption: "穿过草坪与椰林，别让铃铛声靠近",
      speed: 395,
      duration: 78,
      targetScore: 5000,
      spawn: [1.35, 1.95],
      background: "assets/scene-2-wanlv-park.webp",
      obstacles: ["bench", "puddle", "rescueCat", "cone"],
      mechanic: "rescue",
      goals: ["成功到达终点", "救到三只小猫", "三只小猫全部不掉队"],
    },
    {
      name: "西秀飞跃",
      place: "西秀海滩",
      caption: "海风变强，沙滩球和椰子滚来了",
      speed: 425,
      duration: 82,
      targetScore: 5900,
      spawn: [1.25, 1.85],
      background: "assets/scene-3-xixiu-beach.webp",
      obstacles: ["ball", "coconut", "wave", "seagull"],
      mechanic: "waves",
      goals: ["成功到达终点", "跳过五道海浪", "全程不被海浪击中"],
    },
    {
      name: "火山石道",
      place: "火山口公园",
      caption: "黑色火山石让道路变得更崎岖",
      speed: 455,
      duration: 84,
      targetScore: 6800,
      spawn: [1.15, 1.75],
      background: "assets/scene-4-volcano.webp",
      obstacles: ["fallingRock", "barrier", "crack", "coconut"],
      mechanic: "volcano",
      goals: ["成功到达终点", "躲过五次预警落石", "全程没有被落石击中"],
    },
    {
      name: "海湾夜跑",
      place: "海口湾",
      caption: "华灯初上，轮滑小丑开始全速追赶",
      speed: 485,
      duration: 86,
      targetScore: 7800,
      spawn: [1.05, 1.65],
      background: "assets/scene-5-haikou-bay-night.webp",
      obstacles: ["cone", "barrier", "puddle", "seagull", "crate"],
      mechanic: "night",
      goals: ["倒计时内到达终点", "完成十次连续收集", "抵达时剩余十秒"],
    },
    {
      name: "世纪桥冲刺",
      place: "世纪大桥",
      caption: "最后一枚徽章就在桥下，坚持到终点！",
      speed: 520,
      duration: 118,
      targetScore: 9000,
      spawn: [.92, 1.5],
      background: "assets/scene-6-century-bridge.webp",
      obstacles: ["barrier", "rock", "seagull", "crate", "crack", "cone"],
      mechanic: "boss",
      goals: ["夺回最后一枚徽章", "水果命中小丑三次", "无伤完成最终决战"],
    },
  ];

  const CHARACTER_CONFIG = {
    longlong: { name: "龙龙", type: "均衡型", callout: "冲呀！", cheers: ["太棒啦！", "再来一次！"], victory: "assets/longdou.webp", jump: "assets/longdou-jump.webp", supportSkill: "龙凤呈祥" },
    doudou: { name: "豆豆", type: "力量型", callout: "看我的！", cheers: ["我赢啦！", "继续挑战！"], victory: "assets/doudou-victory-full.png", jump: "assets/doudou-jump.png", supportSkill: "龙凤呈祥" },
    xiaoze: { name: "小泽", type: "敏捷型", callout: "我来啦！", cheers: ["我做到了！", "还要再跑！"], victory: "assets/xiaoze-victory.png", jump: "assets/xiaoze-jump.png", supportSkill: "兄弟同心" },
    xiaojia: { name: "小嘉", type: "收集型", callout: "一起加油！", cheers: ["我们成功啦！", "三星真漂亮！"], victory: "assets/xiaojia-victory.png", jump: "assets/xiaojia-jump.png", supportSkill: "兄弟同心" },
  };
  const CHARACTER_KEYS = Object.keys(CHARACTER_CONFIG);

  const COURSE_PATTERNS = [
    ["crate", "cone", "cat", "crate", "cone", "crate", "cat", "cone", "crate", "cat", "cone", "crate", "cat", "crate", "cone"],
    ["bench", "rescueCat", "cone", "rescueCat", "puddle", "bench", "rescueCat", "cone", "puddle", "bench", "cone", "puddle", "cone", "bench", "puddle", "cone"],
    ["ball", "wave", "coconut", "wave", "seagull", "wave", "ball", "wave", "coconut", "wave", "seagull", "wave", "ball", "coconut", "seagull", "wave"],
    ["fallingRock", "crack", "coconut", "barrier", "fallingRock", "coconut", "crack", "fallingRock", "coconut", "fallingRock", "barrier", "crack", "fallingRock", "coconut", "barrier", "crack"],
    ["cone", "puddle", "seagull", "barrier", "crate", "cone", "seagull", "puddle", "barrier", "crate", "seagull", "cone", "barrier", "puddle", "crate", "seagull", "barrier"],
    ["bossBanana", "fruitCache", "bossBall", "fruitCache", "bossBanana", "bossBall", "fruitCache", "bossBanana", "bossBall", "fruitCache", "bossBanana", "bossBall", "fruitCache", "bossBanana", "bossBall", "fruitCache", "bossBanana", "bossBall"],
  ];

  function buildCourse(levelIndex, attempt) {
    const level = levelData[levelIndex];
    const pattern = COURSE_PATTERNS[levelIndex];
    const interval = (level.duration - 8) / pattern.length;
    const variation = [0, .14, -.12][attempt % 3];
    return pattern.map((kind, index) => ({
      time: 2.2 + index * interval + (index % 2 === 0 ? variation : -variation),
      kind,
      coinCount: index % 5 === 4 ? 3 : 4,
      fruit: [2, 7, 12].includes(index),
    }));
  }

  const longlongRunImages = [1, 2, 3, 4, 5, 6].map((frame) => {
    const image = new Image();
    image.fetchPriority = frame === 1 ? "high" : "low";
    image.src = `assets/longlong-run-v2-${frame}.png`;
    return image;
  });
  const longlongJumpImage = new Image();
  longlongJumpImage.src = "assets/longdou-jump.webp";
  const doudouRunImages = [1, 2, 3, 4, 5, 6].map((frame) => {
    const image = new Image();
    image.fetchPriority = frame === 1 ? "high" : "low";
    image.src = `assets/doudou-skate-v2-${frame}.png`;
    return image;
  });
  const doudouJumpImage = new Image();
  doudouJumpImage.src = "assets/doudou-jump.png";
  const doudouVictoryImage = new Image();
  doudouVictoryImage.fetchPriority = "high";
  doudouVictoryImage.src = "assets/doudou-victory-full.png";
  const xiaozeRunImages = [1, 2, 3, 4, 5, 6].map((frame) => {
    const image = new Image();
    image.fetchPriority = frame === 1 ? "high" : "low";
    image.src = `assets/xiaoze-skate-${frame}.png`;
    return image;
  });
  const xiaojiaRunImages = [1, 2, 3, 4, 5, 6].map((frame) => {
    const image = new Image();
    image.fetchPriority = frame === 1 ? "high" : "low";
    image.src = `assets/xiaojia-skate-${frame}.png`;
    return image;
  });
  const xiaozeJumpImage = new Image(); xiaozeJumpImage.src = "assets/xiaoze-jump.png";
  const xiaojiaJumpImage = new Image(); xiaojiaJumpImage.src = "assets/xiaojia-jump.png";
  const xiaozeHurtImage = new Image(); xiaozeHurtImage.src = "assets/xiaoze-hurt.png";
  const xiaojiaHurtImage = new Image(); xiaojiaHurtImage.src = "assets/xiaojia-hurt.png";
  const xiaozeVictoryImage = new Image(); xiaozeVictoryImage.src = "assets/xiaoze-victory.png";
  const xiaojiaVictoryImage = new Image(); xiaojiaVictoryImage.src = "assets/xiaojia-victory.png";
  const characterImages = {
    longlong: { run: longlongRunImages, jump: longlongJumpImage, hurt: longlongRunImages[0], victory: null },
    doudou: { run: doudouRunImages, jump: doudouJumpImage, hurt: doudouRunImages[0], victory: doudouVictoryImage },
    xiaoze: { run: xiaozeRunImages, jump: xiaozeJumpImage, hurt: xiaozeHurtImage, victory: xiaozeVictoryImage },
    xiaojia: { run: xiaojiaRunImages, jump: xiaojiaJumpImage, hurt: xiaojiaHurtImage, victory: xiaojiaVictoryImage },
  };
  const familyImages = {};
  const familyImageFiles = {
    "xiaojia-enter": "xiaojia-enter.png",
    "xiaojia-throw": "xiaojia-throw.png",
    "xiaoze-enter": "xiaoze-enter-v2.png",
    "xiaoze-throw": "xiaoze-throw-v2.png",
    "longlong-enter": "longlong-run-v2-1.png",
    "longlong-throw": "longlong-run-v2-4.png",
    "doudou-enter": "doudou-skate-v2-1.png",
    "doudou-throw": "doudou-skate-v2-4.png",
  };
  for (const [name, file] of Object.entries(familyImageFiles)) {
    familyImages[name] = new Image();
    familyImages[name].src = `assets/${file}`;
  }
  const clownSkateImages = [1, 2, 3, 4].map((frame) => {
    const image = new Image();
    image.fetchPriority = frame === 1 ? "high" : "low";
    image.src = `assets/clown-skate-${frame}.webp`;
    return image;
  });
  const clownSlipImage = new Image();
  clownSlipImage.src = "assets/clown-slip.webp";
  const catImage = new Image();
  catImage.src = "assets/cat.webp";
  const coinImage = new Image();
  coinImage.src = "assets/coin.webp";
  const backgroundImages = levelData.map((level, index) => {
    const image = new Image();
    image.fetchPriority = index === 0 ? "high" : "low";
    if (index === 0) image.src = level.background;
    return image;
  });

  function loadBackground(index) {
    const image = backgroundImages[index];
    if (!image.src) image.src = levelData[index].background;
    return image;
  }

  function preloadRemainingBackgrounds() {
    backgroundImages.forEach((image, index) => {
      if (index > 0 && !image.src) image.src = levelData[index].background;
    });
  }

  if (backgroundImages[0].complete && backgroundImages[0].naturalWidth) {
    preloadRemainingBackgrounds();
  } else {
    backgroundImages[0].addEventListener("load", preloadRemainingBackgrounds, { once: true });
    backgroundImages[0].addEventListener("error", preloadRemainingBackgrounds, { once: true });
  }

  const FULL_FRAME_CROP = { x: 0, y: 0, w: 512, h: 512 };
  const HERO_JUMP_CROP = { x: 368, y: 48, w: 744, h: 772 };
  const DOUDOU_CROP = FULL_FRAME_CROP;
  const CLOWN_SKATE_CROPS = [
    { x: 104, y: 254, w: 323, h: 487, anchorX: 136 },
    { x: 12, y: 256, w: 449, h: 485, anchorX: 248 },
    { x: 140, y: 248, w: 245, h: 489, anchorX: 120 },
    { x: 32, y: 259, w: 438, h: 482, anchorX: 228 },
  ];
  const CLOWN_SLIP_CROP = { x: 193, y: 57, w: 1089, h: 909 };
  const CAT_CROP = { x: 374, y: 183, w: 807, h: 644 };
  const COIN_CROP = { x: 192, y: 157, w: 884, h: 917 };
  const STORAGE_KEY = "longdou-run-v1";
  const groundY = 590;
  const hero = {
    x: 110, y: groundY - 132, w: 101, h: 132,
    vy: 0, jumps: 0, invulnerable: 0, airTime: 0, landingTime: 0,
  };

  const defaultSave = () => ({
    scoreVersion: 4,
    unlocked: 1,
    stars: [0, 0, 0, 0, 0, 0],
    scores: [0, 0, 0, 0, 0, 0],
    scoresByCharacter: {
      longlong: [0, 0, 0, 0, 0, 0],
      doudou: [0, 0, 0, 0, 0, 0],
      xiaoze: [0, 0, 0, 0, 0, 0],
      xiaojia: [0, 0, 0, 0, 0, 0],
    },
    starsByCharacter: {
      longlong: [0, 0, 0, 0, 0, 0],
      doudou: [0, 0, 0, 0, 0, 0],
      xiaoze: [0, 0, 0, 0, 0, 0],
      xiaojia: [0, 0, 0, 0, 0, 0],
    },
    characterBadges: {
      longlong: [false, false, false, false, false, false],
      doudou: [false, false, false, false, false, false],
      xiaoze: [false, false, false, false, false, false],
      xiaojia: [false, false, false, false, false, false],
    },
    recordRoutes: {
      longlong: [0, 0, 0, 0, 0, 0],
      doudou: [0, 0, 0, 0, 0, 0],
      xiaoze: [0, 0, 0, 0, 0, 0],
      xiaojia: [0, 0, 0, 0, 0, 0],
    },
    lastCharacter: "longlong",
    badges: [false, false, false, false, false, false],
    failures: [0, 0, 0, 0, 0, 0],
    attempts: [0, 0, 0, 0, 0, 0],
    championUnlocked: false,
    goldenTrailUnlocked: false,
    endlessUnlocked: false,
    familyPortraitUnlocked: false,
    endlessBest: 0,
    introSeen: false,
    tutorialDone: false,
    familyTutorialDone: false,
  });

  let save = loadSave();
  let selectedCharacter = save.lastCharacter || "longlong";
  persist();
  let characterSelectAction = null;
  let mode = "menu";
  let currentLevel = 0;
  let elapsed = 0;
  let locomotionDistance = 0;
  let lastTime = performance.now();
  let animationId = 0;
  let courseEvents = [];
  let courseEventIndex = 0;
  let backgroundOffset = 0;
  let entities = [];
  let projectiles = [];
  let particles = [];
  let energy = 3;
  let coins = 0;
  let fruit = 0;
  let boost = 0;
  let boostTime = 0;
  let familyPower = 0;
  let familyAssistTime = 0;
  let familyCalls = 0;
  let chaseDistance = 82;
  let clownStun = 0;
  let score = 0;
  let comboStreak = 0;
  let comboMultiplier = 1;
  let maxComboMultiplier = 1;
  let collisions = 0;
  let practiceMode = false;
  let recordAnnounced = false;
  let championJustUnlocked = false;
  let badgeCollected = false;
  let badgeSpawned = false;
  let screenShake = 0;
  let tutorialPhase = 0;
  let tutorialFruitShown = false;
  let tutorialBoostShown = false;
  let resultSnapshot = null;
  let strengthGuard = 0;
  let catsRescued = 0;
  let catsMissed = 0;
  let wavesCleared = 0;
  let waveHits = 0;
  let rocksDodged = 0;
  let rockHits = 0;
  let nightTimeLeft = 0;
  let nightCollectStreak = 0;
  let maxNightCollectStreak = 0;
  let bossHits = 0;
  let bossFinaleReady = false;
  let bossFinaleTriggered = false;
  let endlessMode = false;
  let checkpointMode = false;
  let checkpointSaved = false;
  let storyAction = null;
  let toastTimer = 0;
  let bellTimer = 0;
  let musicTimer = 0;
  let musicStep = 0;

  class TinyAudio {
    constructor() {
      this.enabled = true;
      this.context = null;
      this.output = null;
      this.unlocked = false;
      this.skillVoices = {
        "龙凤呈祥": new Audio("assets/skill-longfeng-child.mp3"),
        "兄弟同心": new Audio("assets/skill-xiongdi-child.mp3"),
      };
      Object.values(this.skillVoices).forEach((voice) => { voice.preload = "auto"; });
    }

    ensure() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!this.context) {
        this.context = new AudioContextClass();
        this.output = this.context.createGain();
        this.output.gain.value = .92;
        this.output.connect(this.context.destination);
        const syncState = () => { document.documentElement.dataset.audioState = this.context.state; };
        this.context.addEventListener("statechange", syncState);
        syncState();
      }
      if (this.context.state === "suspended") this.context.resume().catch(() => {});
      return this.context;
    }

    async unlock() {
      const context = this.ensure();
      if (!context) return false;
      try {
        if (context.state !== "running") await context.resume();
      } catch { /* the sound button can retry */ }
      document.documentElement.dataset.audioState = context.state;
      const running = context.state === "running";
      if (running && !this.unlocked) {
        this.unlocked = true;
        this.play("ready");
      }
      return running;
    }

    tone(frequency, duration = .09, type = "sine", volume = .04, delay = 0) {
      if (!this.enabled) return;
      this.ensure();
      const start = this.context.currentTime + delay;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(.001, start + duration);
      oscillator.connect(gain).connect(this.output);
      oscillator.start(start);
      oscillator.stop(start + duration);
    }

    kick(volume = .055) {
      if (!this.enabled) return;
      this.ensure();
      const start = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(145, start);
      oscillator.frequency.exponentialRampToValueAtTime(48, start + .12);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(.001, start + .14);
      oscillator.connect(gain).connect(this.output);
      oscillator.start(start);
      oscillator.stop(start + .15);
    }

    noise(duration = .055, volume = .012, highpass = 4200) {
      if (!this.enabled) return;
      this.ensure();
      const length = Math.ceil(this.context.sampleRate * duration);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) channel[i] = Math.random() * 2 - 1;
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      source.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = highpass;
      gain.gain.setValueAtTime(volume, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration);
      source.connect(filter).connect(gain).connect(this.output);
      source.start();
    }

    speak(text) {
      if (!this.enabled) return;
      document.documentElement.dataset.lastVoice = text;
      const fallback = () => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.rate = 1.04;
        utterance.pitch = 1.45;
        utterance.volume = 1;
        const chineseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("zh"));
        if (chineseVoice) utterance.voice = chineseVoice;
        window.speechSynthesis.speak(utterance);
      };
      const key = Object.keys(this.skillVoices).find((name) => text.includes(name));
      const voice = key ? this.skillVoices[key] : null;
      if (!voice) return fallback();
      Object.values(this.skillVoices).forEach((item) => { item.pause(); item.currentTime = 0; });
      const playing = voice.play();
      if (playing?.catch) playing.catch(fallback);
    }

    stopVoice() {
      Object.values(this.skillVoices).forEach((voice) => { voice.pause(); voice.currentTime = 0; });
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }

    music(step, level, boosted) {
      if (!this.enabled) return;
      const roots = [110, 123.47, 130.81, 146.83, 164.81, 174.61];
      const root = roots[level] || roots[0];
      const bassPattern = [0, 0, 7, 0, 3, 5, 7, 10, 0, 7, 12, 7, 5, 3, 0, -2];
      const leadPattern = [12, 15, 19, 17, 12, 19, 22, 19];
      const bassNote = root * 2 ** (bassPattern[step % bassPattern.length] / 12);

      if (step % 4 === 0) this.kick(boosted ? .11 : .086);
      if (step % 4 === 2) this.noise(.095, boosted ? .042 : .032, 1100);
      else this.noise(.035, boosted ? .022 : .016, 5200);

      this.tone(bassNote, .16, "sawtooth", boosted ? .032 : .025);
      if (step % 2 === 0) {
        const lead = root * 2 ** (leadPattern[(step / 2) % leadPattern.length] / 12);
        this.tone(lead, .12, "square", boosted ? .029 : .021);
        this.tone(lead * 1.5, .1, "triangle", boosted ? .018 : .012, .025);
      }
    }

    play(kind) {
      const sounds = {
        ready: () => { this.tone(523, .09, "triangle", .05); this.tone(784, .12, "triangle", .045, .07); },
        jump: () => { this.tone(420, .08, "square", .025); this.tone(620, .08, "square", .02, .06); },
        coin: () => { this.tone(880, .09, "sine", .035); this.tone(1180, .08, "sine", .025, .04); },
        pickup: () => { this.tone(540, .1, "triangle", .04); this.tone(760, .12, "triangle", .03, .08); },
        throw: () => this.tone(220, .13, "triangle", .045),
        hitClown: () => { this.tone(170, .16, "sawtooth", .035); this.tone(110, .24, "sawtooth", .025, .1); },
        hurt: () => { this.tone(150, .22, "square", .04); },
        boost: () => { [260, 390, 520, 780].forEach((f, i) => this.tone(f, .18, "sawtooth", .025, i * .045)); },
        family: () => { [392, 523, 659, 784, 988, 1175].forEach((f, i) => this.tone(f, .24, i % 2 ? "triangle" : "square", .036, i * .065)); },
        badge: () => { [520, 660, 780, 1040].forEach((f, i) => this.tone(f, .2, "triangle", .035, i * .08)); },
        record: () => { [659, 784, 988].forEach((f, i) => this.tone(f, .2, "triangle", .04, i * .07)); },
        champion: () => { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, .3, "triangle", .045, i * .1)); },
        win: () => { [392, 523, 659, 784].forEach((f, i) => this.tone(f, .28, "triangle", .035, i * .12)); },
        bell: () => { this.tone(1380, .18, "sine", .026); this.tone(1820, .12, "sine", .015, .05); },
      };
      if (sounds[kind]) sounds[kind]();
    }
  }

  const audio = new TinyAudio();

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = JSON.parse(raw);
      if (!stored) return defaultSave();
      if ((stored.scoreVersion || 1) < 4 && raw && !localStorage.getItem(`${STORAGE_KEY}-backup-v3`)) {
        localStorage.setItem(`${STORAGE_KEY}-backup-v3`, raw);
      }
      const defaults = defaultSave();
      const normalized = { ...defaults, ...stored };
      for (const key of ["stars", "scores", "badges", "failures", "attempts"]) {
        normalized[key] = defaults[key].map((fallback, index) => stored[key]?.[index] ?? fallback);
      }
      const legacyScores = stored.scoreVersion === 2 ? normalized.scores : defaults.scores;
      normalized.scoresByCharacter = {
        longlong: defaults.scores.map((fallback, index) => stored.scoresByCharacter?.longlong?.[index] ?? legacyScores[index] ?? fallback),
        doudou: defaults.scores.map((fallback, index) => stored.scoresByCharacter?.doudou?.[index] ?? fallback),
        xiaoze: defaults.scores.map((fallback, index) => stored.scoresByCharacter?.xiaoze?.[index] ?? fallback),
        xiaojia: defaults.scores.map((fallback, index) => stored.scoresByCharacter?.xiaojia?.[index] ?? fallback),
      };
      normalized.starsByCharacter = Object.fromEntries(CHARACTER_KEYS.map((key) => [
        key,
        defaults.stars.map((fallback, index) => stored.starsByCharacter?.[key]?.[index]
          ?? (key === "longlong" && (stored.scoreVersion || 1) < 4 ? normalized.stars[index] : fallback)),
      ]));
      normalized.characterBadges = Object.fromEntries(CHARACTER_KEYS.map((key) => [
        key,
        defaults.badges.map((fallback, index) => stored.characterBadges?.[key]?.[index] ?? (Boolean(stored.scoresByCharacter?.[key]?.[index]) || fallback)),
      ]));
      normalized.recordRoutes = Object.fromEntries(CHARACTER_KEYS.map((key) => [
        key,
        defaults.scores.map((fallback, index) => stored.recordRoutes?.[key]?.[index] ?? fallback),
      ]));
      normalized.lastCharacter = CHARACTER_KEYS.includes(stored.lastCharacter) ? stored.lastCharacter : "longlong";
      normalized.scoreVersion = 4;
      normalized.championUnlocked ||= normalized.stars.reduce((total, value) => total + value, 0) >= 18;
      normalized.goldenTrailUnlocked ||= normalized.stars.reduce((total, value) => total + value, 0) >= 12;
      normalized.endlessUnlocked ||= normalized.championUnlocked;
      normalized.familyPortraitUnlocked ||= Object.values(normalized.characterBadges).every((levels) => levels.every(Boolean));
      return normalized;
    } catch {
      return defaultSave();
    }
  }

  function activeScores() {
    return save.scoresByCharacter[selectedCharacter] || save.scoresByCharacter.longlong;
  }

  function characterName() {
    return CHARACTER_CONFIG[selectedCharacter]?.name || "龙龙";
  }

  function characterTotal(key) {
    return (save.scoresByCharacter[key] || []).reduce((total, value) => total + value, 0);
  }

  function usesSiblingSupport() {
    return ["longlong", "doudou"].includes(selectedCharacter);
  }

  function supportSkillName() {
    return usesSiblingSupport() ? "龙凤呈祥" : "兄弟同心";
  }

  function renderSupportPreview() {
    const siblingSupport = usesSiblingSupport();
    document.querySelector("#supportSkillName").textContent = supportSkillName();
    document.querySelector("#supportSkillText").textContent = siblingSupport
      ? "小嘉＋小泽前来清场支援"
      : "龙龙＋豆豆击退小丑并保护主角";
    document.querySelector("#supportLeftImage").src = siblingSupport ? "assets/xiaojia-enter.png" : "assets/longdou.webp";
    document.querySelector("#supportRightImage").src = siblingSupport ? "assets/xiaoze-enter-v2.png" : "assets/doudou-victory-full.png";
    ui.familyButtonLabel.textContent = supportSkillName();
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); } catch { /* private mode */ }
  }

  function readCheckpoint() {
    try {
      const checkpoint = JSON.parse(sessionStorage.getItem("longdou-checkpoint-v1"));
      if (!checkpoint || Date.now() - checkpoint.createdAt > 24 * 60 * 60 * 1000) return null;
      return checkpoint;
    } catch { return null; }
  }

  function renderCheckpointButton() {
    const checkpoint = readCheckpoint();
    const button = document.querySelector("#checkpointButton");
    button.hidden = !checkpoint;
    if (checkpoint) button.textContent = `继续第 ${checkpoint.level + 1} 关中途检查点`;
  }

  function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("is-visible"));
    if (name && screens[name]) screens[name].classList.add("is-visible");
  }

  function showToast(message, duration = 1300) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), duration);
  }

  function showTutorial(icon, title, text) {
    ui.tutorialIcon.textContent = icon;
    ui.tutorialTitle.textContent = title;
    ui.tutorialText.textContent = text;
    ui.tutorial.classList.add("is-visible");
  }

  function hideTutorial() {
    ui.tutorial.classList.remove("is-visible");
  }

  function renderLevelGrid() {
    const grid = document.querySelector("#levelGrid");
    const totalStars = save.stars.reduce((total, value) => total + value, 0);
    const rewards = [
      save.goldenTrailUnlocked ? "✨金色尾迹" : "",
      save.endlessUnlocked ? "♾️无尽挑战" : "",
      save.familyPortraitUnlocked ? "🌈全家冠军" : "",
    ].filter(Boolean).join(" · ");
    document.querySelector("#starTotal").textContent = `总星数 ${totalStars} / 18${rewards ? ` · ${rewards}` : ""}`;
    document.querySelector("#familyPortraitReward").hidden = !save.familyPortraitUnlocked;
    document.body.classList.toggle("champion-mode", save.championUnlocked);
    grid.replaceChildren();
    levelData.forEach((level, index) => {
      const button = document.createElement("button");
      button.className = "level-card";
      button.disabled = index >= save.unlocked;
      const stars = "★".repeat(save.stars[index]) + "☆".repeat(3 - save.stars[index]);
      const personalStars = "★".repeat(save.starsByCharacter[selectedCharacter][index]) + "☆".repeat(3 - save.starsByCharacter[selectedCharacter][index]);
      const familyScores = CHARACTER_KEYS.map((key) => ({ key, score: save.scoresByCharacter[key][index] || 0 }));
      const familyBest = familyScores.sort((a, b) => b.score - a.score)[0];
      const badgeCount = CHARACTER_KEYS.filter((key) => save.characterBadges[key][index]).length;
      const detail = button.disabled
        ? "🔒 尚未解锁"
        : `全家${stars} · ${characterName()}${personalStars} · ${badgeCount}/4徽章 · 纪录 ${familyBest.score || "—"}${familyBest.score ? `（${CHARACTER_CONFIG[familyBest.key].name}）` : ""}`;
      button.innerHTML = `<span class="level-number">第 ${index + 1} 关</span><b>${level.name}</b><small>${detail}</small>`;
      button.addEventListener("click", () => startLevel(index));
      grid.append(button);
    });
    document.querySelector("#endlessButton").hidden = !save.endlessUnlocked;
    document.querySelector("#restoreProgressButton").hidden = !localStorage.getItem(`${STORAGE_KEY}-backup-v3`);
  }

  function renderCharacterSelect() {
    for (const key of CHARACTER_KEYS) {
      const badges = save.characterBadges[key].filter(Boolean).length;
      const personalStars = save.starsByCharacter[key].reduce((total, value) => total + value, 0);
      document.querySelector(`#${key}Record`).textContent = `纪录 ${characterTotal(key)} 分 · 星 ${personalStars}/18 · 徽章 ${badges}/6`;
      const buttonId = `choose${key[0].toUpperCase()}${key.slice(1)}Button`;
      document.querySelector(`#${buttonId}`).classList.toggle("is-selected", selectedCharacter === key);
    }
    renderSupportPreview();
  }

  function openCharacterSelect(nextAction) {
    characterSelectAction = nextAction;
    renderCharacterSelect();
    mode = "characters";
    frame.classList.remove("is-playing");
    showScreen("characters");
  }

  function chooseCharacter(key) {
    selectedCharacter = key;
    save.lastCharacter = key;
    persist();
    renderLevelGrid();
    const action = characterSelectAction;
    characterSelectAction = null;
    renderSupportPreview();
    showToast(`${characterName()}：${CHARACTER_CONFIG[key].callout}`, 1200);
    if (action) action();
    else goMenu();
  }

  function syncStoryHero() {
    const image = document.querySelector("#storyHero");
    image.src = CHARACTER_CONFIG[selectedCharacter].victory;
    image.alt = characterName();
  }

  function playStory(kind, nextAction) {
    storyAction = nextAction;
    const kicker = document.querySelector("#storyKicker");
    const title = document.querySelector("#storyTitle");
    const text = document.querySelector("#storyText");
    const button = document.querySelector("#storyContinueButton");
    syncStoryHero();

    if (kind === "intro") {
      kicker.textContent = "故事开始";
      title.textContent = "徽章被偷走了！";
      text.textContent = `轮滑小丑偷走了海口的六枚城市徽章。${characterName()}抢回线索，全家支援队也准备出发！`;
      button.textContent = "出发！";
    } else if (kind === "outro") {
      kicker.textContent = "海口大冒险完成";
      title.textContent = "六枚徽章回来了！";
      text.textContent = `${characterName()}把徽章送回世纪大桥庆典。家人发动${supportSkillName()}，小丑一头滑进了水果堆！`;
      button.textContent = "看看成绩";
    } else {
      const next = levelData[kind];
      kicker.textContent = `下一站 · 第 ${kind + 1} 关`;
      title.textContent = next.name;
      text.textContent = next.caption;
      button.textContent = "继续追！";
    }
    mode = "story";
    frame.classList.remove("is-playing");
    showScreen("story");
  }

  function startAdventure() {
    audio.ensure();
    openCharacterSelect(beginAdventure);
  }

  function beginAdventure() {
    if (!save.introSeen) {
      playStory("intro", () => {
        save.introSeen = true;
        persist();
        startLevel(0);
      });
    } else {
      startLevel(Math.max(0, Math.min(save.unlocked - 1, levelData.length - 1)));
    }
  }

  function resetRun() {
    elapsed = 0;
    locomotionDistance = 0;
    courseEventIndex = 0;
    courseEvents = buildCourse(currentLevel, save.attempts[currentLevel]);
    entities = [];
    projectiles = [];
    particles = [];
    energy = 3;
    coins = 0;
    fruit = 1;
    boost = 0;
    boostTime = 0;
    familyPower = 0;
    familyAssistTime = 0;
    familyCalls = 0;
    chaseDistance = 82;
    clownStun = 0;
    score = 0;
    comboStreak = 0;
    comboMultiplier = 1;
    maxComboMultiplier = 1;
    collisions = 0;
    recordAnnounced = false;
    championJustUnlocked = false;
    badgeCollected = false;
    badgeSpawned = false;
    screenShake = 0;
    tutorialPhase = currentLevel === 0 && !save.tutorialDone ? 1 : 0;
    tutorialFruitShown = false;
    tutorialBoostShown = false;
    strengthGuard = selectedCharacter === "doudou" ? 1 : 0;
    catsRescued = 0;
    catsMissed = 0;
    wavesCleared = 0;
    waveHits = 0;
    rocksDodged = 0;
    rockHits = 0;
    nightTimeLeft = currentLevel === 4 ? (practiceMode ? 42 : 34) : 0;
    nightCollectStreak = 0;
    maxNightCollectStreak = 0;
    bossHits = 0;
    bossFinaleReady = false;
    bossFinaleTriggered = false;
    checkpointSaved = false;
    hero.x = 110;
    hero.y = groundY - hero.h;
    hero.vy = 0;
    hero.jumps = 0;
    hero.invulnerable = 0;
    hero.airTime = 0;
    hero.landingTime = 0;
    backgroundOffset = currentLevel * 285;
    bellTimer = 0;
    musicTimer = 0;
    musicStep = 0;
    updateHud();
  }

  function startLevel(index, options = {}) {
    currentLevel = index;
    practiceMode = Boolean(options.practice);
    endlessMode = Boolean(options.endless);
    checkpointMode = Boolean(options.checkpoint);
    if (checkpointMode) practiceMode = true;
    if (!options.retry) save.attempts[index] += 1;
    persist();
    loadBackground(index);
    resetRun();
    if (endlessMode) nightTimeLeft = 999;
    if (checkpointMode) {
      elapsed = levelData[index].duration * .5;
      const nextEvent = courseEvents.findIndex((event) => event.time >= elapsed);
      courseEventIndex = nextEvent < 0 ? courseEvents.length : nextEvent;
      showToast("从中途检查点继续 · 本局不计最高分", 2200);
    }
    mode = "playing";
    showScreen(null);
    frame.classList.add("is-playing");
    ui.practiceBadge.hidden = !practiceMode;
    ui.levelName.textContent = endlessMode ? `${characterName()} · 海口无尽挑战` : `${characterName()} · ${levelData[index].place} · 第 ${index + 1} 关`;
    ui.pauseButton.textContent = "Ⅱ";
    hideTutorial();
    audio.ensure();
    renderSupportPreview();
    showToast(practiceMode ? `${characterName()}练习模式 · 第 ${index + 1} 关` : `${characterName()}：${CHARACTER_CONFIG[selectedCharacter].callout}`, 1800);
    if (!practiceMode) audio.speak(CHARACTER_CONFIG[selectedCharacter].callout);
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }

  function goMenu() {
    mode = "menu";
    practiceMode = false;
    endlessMode = false;
    checkpointMode = false;
    frame.classList.remove("is-playing");
    showScreen("menu");
    hideTutorial();
    updateHud();
  }

  function togglePause(force) {
    if (!["playing", "paused"].includes(mode)) return;
    const shouldPause = force ?? mode === "playing";
    if (shouldPause) {
      mode = "paused";
      showScreen("pause");
      ui.pauseButton.textContent = "▶";
    } else {
      mode = "playing";
      showScreen(null);
      ui.pauseButton.textContent = "Ⅱ";
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    }
  }

  function jump() {
    if (mode !== "playing" || hero.jumps >= 2) return;
    const agileBonus = selectedCharacter === "xiaoze" ? 1.13 : 1;
    hero.vy = (hero.jumps === 0 ? -930 : -815) * agileBonus;
    hero.airTime = 0;
    hero.landingTime = 0;
    hero.jumps += 1;
    audio.play("jump");
    addBurst(hero.x + 45, hero.y + hero.h, "#fff2c4", 6);
    if (tutorialPhase === 1) {
      tutorialPhase = 2;
      hideTutorial();
    }
  }

  function throwFruit() {
    if (mode !== "playing" || fruit <= 0) {
      if (mode === "playing") showToast("先捡一个水果！");
      return;
    }
    fruit -= 1;
    projectiles.push({ x: hero.x + 16, y: hero.y + 55, vx: -860, vy: -110, angle: 0 });
    audio.play("throw");
    updateHud();
    if (tutorialPhase === 3) {
      tutorialPhase = 4;
      hideTutorial();
    }
  }

  function triggerBoost() {
    if (mode !== "playing" || boost < 100 || boostTime > 0) {
      if (mode === "playing" && boost < 100) showToast(`加速能量 ${Math.floor(boost)}%`);
      return;
    }
    boost = 0;
    boostTime = 3;
    chaseDistance = Math.min(95, chaseDistance + 12);
    audio.play("boost");
    showToast("椰风冲刺！", 1100);
    if (tutorialPhase === 5) {
      tutorialPhase = 6;
      save.tutorialDone = true;
      persist();
      hideTutorial();
    }
  }

  function chargeFamily(amount) {
    if (familyAssistTime > 0) return;
    const multiplier = practiceMode ? 1.35 : 1;
    const wasReady = familyPower >= 100;
    familyPower = Math.min(100, familyPower + amount * multiplier);
    if (!wasReady && familyPower >= 100) {
      audio.play("ready");
      showToast("家人能量已满！", 1200);
      if (currentLevel === 0 && !save.familyTutorialDone) {
        const helpers = usesSiblingSupport() ? "小泽和小嘉" : "龙龙和豆豆";
        showTutorial("👫", `${supportSkillName()}已就绪`, `按 G 或点击呼唤，${helpers}来支援`);
      }
    }
  }

  function triggerFamilyAssist() {
    if (mode !== "playing" || familyPower < 100 || familyAssistTime > 0) {
      if (mode === "playing" && familyPower < 100) showToast(`家人能量 ${Math.floor(familyPower)}%`);
      return;
    }
    familyPower = 0;
    familyAssistTime = 3;
    familyCalls += 1;
    const siblingSupport = usesSiblingSupport();
    clownStun = Math.max(clownStun, siblingSupport ? 3.4 : 4);
    chaseDistance = Math.min(95, chaseDistance + (siblingSupport ? 30 : 50));
    if (siblingSupport) {
      for (const entity of entities) {
        const inFront = entity.x > hero.x - 30 && entity.x < hero.x + 720;
        if (!inFront || entity.dead) continue;
        if (entity.type === "obstacle") {
          entity.dead = true;
          if (entity.kind === "wave" && !entity.hit) wavesCleared += 1;
          if (entity.kind === "fallingRock" && !entity.hit) rocksDodged += 1;
          rewardAction(150);
          addBurst(entity.x + entity.w / 2, entity.y + entity.h / 2, "#ffd45d", 10);
        } else if (entity.type === "rescue") {
          entity.dead = true;
          catsRescued += 1;
          rewardAction(350);
        } else if (entity.type === "coin") {
          collect(entity);
        }
      }
    } else {
      hero.invulnerable = Math.max(hero.invulnerable, 5);
      boostTime = Math.max(boostTime, 5);
    }
    save.familyTutorialDone = true;
    persist();
    hideTutorial();
    audio.play("family");
    audio.speak(`${supportSkillName()}！`);
    showToast(`${siblingSupport ? "小泽＋小嘉" : "龙龙＋豆豆"} · ${supportSkillName()}！`, 1700);
    if (currentLevel === 5 && bossFinaleReady) bossFinaleTriggered = true;
    updateHud();
  }

  function spawnEntity(event) {
    const kind = event.kind;
    if (kind === "fruitCache") {
      entities.push({ type: "fruit", x: 1330, y: groundY - 120, w: 40, h: 40, spin: 0 });
      return;
    }
    const specs = {
      crate: [76, 72, true], cone: [50, 66, true], cat: [90, 66, false],
      bench: [110, 72, false], puddle: [112, 24, false], ball: [58, 58, true],
      coconut: [52, 52, true], seagull: [82, 42, false], rock: [92, 62, false],
      barrier: [110, 82, false], crack: [125, 18, false],
      rescueCat: [92, 68, false], wave: [138, 58, false], fallingRock: [82, 82, false],
      bossBanana: [82, 28, false], bossBall: [64, 64, true],
    };
    const [w, h, small] = specs[kind];
    const flying = kind === "seagull";
    const isRescue = kind === "rescueCat";
    const isFallingRock = kind === "fallingRock";
    const obstacle = {
      type: isRescue ? "rescue" : "obstacle", kind, x: 1330,
      y: isFallingRock ? groundY - 245 : flying ? groundY - 160 : groundY - h,
      targetY: groundY - h, w, h, small, hit: false,
      warning: isFallingRock ? 1.05 : 0, clearedCounted: false,
    };
    entities.push(obstacle);

    const arcCoins = isRescue ? 2 : event.coinCount;
    for (let i = 0; i < arcCoins; i += 1) {
      entities.push({
        type: "coin", x: obstacle.x + 145 + i * 49,
        y: groundY - 104 - Math.sin((i / Math.max(1, arcCoins - 1)) * Math.PI) * 72,
        w: 32, h: 32, spin: Math.random() * 5,
      });
    }

    if (event.fruit && fruit < 3) {
      entities.push({ type: "fruit", x: obstacle.x + 275, y: groundY - 178, w: 40, h: 40, spin: 0 });
    }
  }

  function spawnBadge() {
    badgeSpawned = true;
    entities.push({ type: "badge", x: 1340, y: groundY - 190, w: 52, h: 60, spin: 0 });
  }

  function intersects(a, b, inset = 0) {
    return a.x + inset < b.x + b.w - inset && a.x + a.w - inset > b.x + inset &&
      a.y + inset < b.y + b.h - inset && a.y + a.h - inset > b.y + inset;
  }

  function updateCombo() {
    const previous = comboMultiplier;
    comboMultiplier = comboStreak >= 10 ? 3 : comboStreak >= 5 ? 2 : 1;
    maxComboMultiplier = Math.max(maxComboMultiplier, comboMultiplier);
    if (comboMultiplier > previous) {
      audio.play("record");
      showToast(`漂亮！连击 ×${comboMultiplier}`, 900);
    }
  }

  function rewardAction(basePoints) {
    comboStreak += 1;
    updateCombo();
    const gained = basePoints * comboMultiplier;
    score += gained;
    chargeFamily(basePoints >= 300 ? 15 : basePoints >= 150 ? 10 : 4);
    return gained;
  }

  function resetCombo() {
    comboStreak = 0;
    comboMultiplier = 1;
  }

  function damagePlayer() {
    if (hero.invulnerable > 0) return;
    if (selectedCharacter === "doudou" && strengthGuard > 0) {
      strengthGuard -= 1;
      hero.invulnerable = 1.2;
      screenShake = .18;
      resetCombo();
      audio.play("hurt");
      showToast("豆豆力量护盾挡住了障碍！", 1200);
      updateHud();
      return;
    }
    energy -= 1;
    hero.invulnerable = practiceMode ? 3.2 : 2;
    chaseDistance = Math.max(0, chaseDistance - 25);
    score = Math.max(0, score - 300);
    collisions += 1;
    if (currentLevel === 4) nightCollectStreak = 0;
    resetCombo();
    screenShake = .38;
    audio.play("hurt");
    showToast(energy > 0 ? "小丑靠近了！" : "小丑追上来了！", 1100);
    updateHud();
    if (energy <= 0 || chaseDistance <= 0) {
      if (endlessMode) finishEndless();
      else finishLevel(false);
    }
  }

  function collect(entity) {
    entity.dead = true;
    if (entity.type === "coin") {
      coins += 1;
      if (currentLevel === 4) {
        nightTimeLeft = Math.min(45, nightTimeLeft + 1.25);
        nightCollectStreak += 1;
        maxNightCollectStreak = Math.max(maxNightCollectStreak, nightCollectStreak);
      }
      rewardAction(100);
      boost = Math.min(100, boost + 5);
      audio.play("coin");
      addBurst(entity.x, entity.y, "#ffd447", 5);
    } else if (entity.type === "fruit") {
      fruit = Math.min(3, fruit + 1);
      comboStreak += 1;
      updateCombo();
      chargeFamily(15);
      audio.play("pickup");
      showToast("捡到海南水果！");
      if (currentLevel === 0 && !tutorialFruitShown) {
        tutorialFruitShown = true;
        tutorialPhase = 3;
        showTutorial("🥭", "投水果", "按 F 或点击水果键，让小丑打滑");
      }
    } else if (entity.type === "badge") {
      badgeCollected = true;
      score += 1000;
      boost = Math.min(100, boost + 30);
      audio.play("badge");
      showToast(`找回「${levelData[currentLevel].place}徽章」！`, 1900);
      addBurst(entity.x, entity.y, "#fff2a3", 18);
    }
    updateHud();
  }

  function addBurst(x, y, color, count = 8) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x, y, color, life: .45 + Math.random() * .35,
        vx: (Math.random() - .5) * 250,
        vy: -60 - Math.random() * 220,
        size: 3 + Math.random() * 6,
      });
    }
  }

  function update(dt) {
    const level = levelData[currentLevel];
    elapsed += dt;
    const progress = endlessMode ? (elapsed % 60) / 60 : Math.min(1, elapsed / level.duration);
    const endlessSpeed = endlessMode ? Math.min(1.42, 1 + elapsed / 420) : 1;
    const speed = level.speed * (practiceMode ? .82 : 1) * (boostTime > 0 ? 1.42 : 1) * endlessSpeed;
    backgroundOffset += speed * dt * .22;
    locomotionDistance += speed * dt;
    if (currentLevel === 4 && !endlessMode) {
      nightTimeLeft = Math.max(0, nightTimeLeft - dt);
      if (nightTimeLeft <= 0) {
        finishLevel(false);
        return;
      }
    }

    hero.invulnerable = Math.max(0, hero.invulnerable - dt);
    hero.landingTime = Math.max(0, hero.landingTime - dt);
    boostTime = Math.max(0, boostTime - dt);
    familyAssistTime = Math.max(0, familyAssistTime - dt);
    clownStun = Math.max(0, clownStun - dt);
    screenShake = Math.max(0, screenShake - dt);
    chaseDistance = Math.min(92, chaseDistance + dt * (boostTime > 0 ? 5.5 : .42));

    hero.vy += 2450 * dt;
    hero.y += hero.vy * dt;
    if (hero.y >= groundY - hero.h) {
      if (hero.vy > 260 && hero.jumps > 0) {
        addBurst(hero.x + 48, groundY, "#e5c990", 5);
        hero.landingTime = .18;
      }
      hero.y = groundY - hero.h;
      hero.vy = 0;
      hero.jumps = 0;
      hero.airTime = 0;
    } else {
      hero.airTime += dt;
    }

    const startX = 110;
    const finishX = canvas.width - hero.w - 20;
    const courseX = startX + (finishX - startX) * progress;
    hero.x = courseX;

    if (!endlessMode && !practiceMode && !checkpointSaved && progress >= .5) {
      checkpointSaved = true;
      try {
        sessionStorage.setItem("longdou-checkpoint-v1", JSON.stringify({
          level: currentLevel, character: selectedCharacter, createdAt: Date.now(),
        }));
        renderCheckpointButton();
        showToast("已保存中途检查点", 900);
      } catch { /* session storage may be unavailable */ }
    }

    while (courseEventIndex < courseEvents.length && elapsed >= courseEvents[courseEventIndex].time) {
      spawnEntity(courseEvents[courseEventIndex]);
      courseEventIndex += 1;
    }
    if (endlessMode && courseEventIndex >= courseEvents.length) {
      const segmentLevel = Math.floor(elapsed / 30) % 5;
      const nextSegment = buildCourse(segmentLevel, Math.floor(elapsed / 25));
      const offset = elapsed + 1.2;
      courseEvents.push(...nextSegment.map((event) => ({ ...event, time: offset + (event.time - 2.2) * .62 })));
    }
    if (!badgeSpawned && progress > .56) spawnBadge();

    for (const entity of entities) {
      entity.x -= speed * dt * (entity.type === "rescue" ? 1.18 : 1);
      entity.spin = (entity.spin || 0) + dt * 4;
      if (entity.kind === "fallingRock" && entity.warning > 0) {
        entity.warning -= dt;
      } else if (entity.kind === "fallingRock" && entity.y < entity.targetY) {
        entity.y = Math.min(entity.targetY, entity.y + 520 * dt);
      }
      if (entity.type === "obstacle" && !entity.hit && intersects(hero, entity, 14)) {
        if (entity.kind === "fallingRock" && entity.warning > 0) continue;
        entity.hit = true;
        if (boostTime > 0 && entity.small) {
          entity.dead = true;
          rewardAction(150);
          addBurst(entity.x + entity.w / 2, entity.y + entity.h / 2, "#fff3c0", 10);
          showToast("冲开障碍！", 650);
        } else {
          if (entity.kind === "wave") waveHits += 1;
          if (entity.kind === "fallingRock") rockHits += 1;
          damagePlayer();
        }
      } else if (entity.type === "rescue" && intersects(hero, entity, 2)) {
        entity.dead = true;
        catsRescued += 1;
        rewardAction(350);
        audio.play("pickup");
        showToast(`救到小猫 ${catsRescued}/3！`, 900);
      } else if (["coin", "fruit", "badge"].includes(entity.type) && intersects(hero, entity, selectedCharacter === "xiaojia" ? -30 : 8)) {
        collect(entity);
      }
      if (!entity.clearedCounted && entity.x + entity.w < hero.x - 15) {
        entity.clearedCounted = true;
        if (entity.kind === "wave" && !entity.hit) wavesCleared += 1;
        if (entity.kind === "fallingRock" && !entity.hit) rocksDodged += 1;
      }
      if (entity.x < -160) {
        if (entity.type === "rescue" && !entity.dead) catsMissed += 1;
        entity.dead = true;
      }
    }

    const clownX = clownDrawX();
    for (const projectile of projectiles) {
      projectile.vy += 470 * dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.angle -= dt * 9;
      if (!projectile.hit && projectile.x <= clownX + 108) {
        projectile.hit = true;
        projectile.dead = true;
        clownStun = 2.3;
        chaseDistance = Math.min(95, chaseDistance + 24);
        rewardAction(300);
        audio.play("hitClown");
        showToast("命中！小丑打滑了！", 1200);
        addBurst(clownX + 55, groundY - 70, "#ff785d", 15);
        if (currentLevel === 5) {
          bossHits = Math.min(3, bossHits + 1);
          if (bossHits >= 3) {
            bossFinaleReady = true;
            familyPower = 100;
            showToast(`第三次命中！按 G 发动${supportSkillName()}！`, 2400);
          } else {
            showToast(`命中小丑 ${bossHits}/3！`, 1200);
          }
        }
      }
      if (projectile.x < -80 || projectile.y > 760) projectile.dead = true;
    }

    for (const particle of particles) {
      particle.life -= dt;
      particle.vy += 500 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    }

    entities = entities.filter((item) => !item.dead);
    projectiles = projectiles.filter((item) => !item.dead);
    particles = particles.filter((item) => item.life > 0);

    if (tutorialPhase === 1 && elapsed > 1.2) showTutorial("↑", "点击跳跃", "再次点击可以二段跳");
    if (currentLevel === 0 && !tutorialBoostShown && boost >= 100) {
      tutorialBoostShown = true;
      tutorialPhase = 5;
      showTutorial("⚡", "椰风冲刺已就绪", "按 Shift 或点击加速键");
    }

    const bestScore = activeScores()[currentLevel];
    if (!practiceMode && bestScore > 0 && score > bestScore && !recordAnnounced) {
      recordAnnounced = true;
      audio.play("record");
      showToast("🎉 已超过个人纪录！", 1300);
    }

    updateAudio(dt);
    updateHud();
    if (endlessMode) {
      // Endless mode only ends when the player runs out of energy.
    } else if (currentLevel === 5) {
      if (bossFinaleTriggered && familyAssistTime <= .04) finishLevel(true);
      else if (progress >= 1 && !bossFinaleTriggered) finishLevel(false);
    } else if (progress >= 1) finishLevel(true);
  }

  function updateAudio(dt) {
    musicTimer -= dt;
    if (!audio.enabled) {
      musicTimer = 0;
    } else if (musicTimer <= 0) {
      const bpm = boostTime > 0 ? 160 : 136 + currentLevel * 3;
      const eighthNote = 60 / bpm / 2;
      audio.music(musicStep, currentLevel, boostTime > 0);
      musicStep = (musicStep + 1) % 64;
      musicTimer += eighthNote;
    }
    bellTimer -= dt;
    const interval = chaseDistance < 35 ? .65 : chaseDistance < 58 ? 1.25 : 2.4;
    if (bellTimer <= 0 && clownStun <= 0) {
      audio.play("bell");
      bellTimer = interval;
    }
  }

  function missionStatus() {
    if (currentLevel === 0) return [badgeCollected, collisions <= 1];
    if (currentLevel === 1) return [catsRescued >= 3, catsRescued >= 3 && catsMissed === 0];
    if (currentLevel === 2) return [wavesCleared >= 5, waveHits === 0];
    if (currentLevel === 3) return [rocksDodged >= 5, rockHits === 0];
    if (currentLevel === 4) return [maxNightCollectStreak >= 10, nightTimeLeft >= 10];
    return [bossHits >= 3, bossHits >= 3 && collisions === 0];
  }

  function calculateStars() {
    const [featureComplete, masteryComplete] = missionStatus();
    return 1 + Number(featureComplete) + Number(!practiceMode && masteryComplete);
  }

  function finishEndless() {
    if (mode !== "playing") return;
    mode = "result";
    frame.classList.remove("is-playing");
    hideTutorial();
    sessionStorage.removeItem("longdou-checkpoint-v1");
    renderCheckpointButton();
    const finalScore = Math.floor(score + elapsed * 25);
    const previousBest = save.endlessBest || 0;
    save.endlessBest = Math.max(previousBest, finalScore);
    persist();
    resultSnapshot = {
      endless: true, won: false, stars: 0, coins, score: finalScore, badgeCollected: false,
      energy, collisions, maxComboMultiplier, previousBest, newRecord: finalScore > previousBest,
      practice: false, character: characterName(), familyCalls, missionStatus: [false, false],
      elapsed,
    };
    showResult();
  }

  function finishLevel(won) {
    if (mode !== "playing") return;
    mode = "result";
    frame.classList.remove("is-playing");
    hideTutorial();
    if (won) {
      sessionStorage.removeItem("longdou-checkpoint-v1");
      renderCheckpointButton();
    }
    const previousBest = activeScores()[currentLevel];
    const finalScore = won ? Math.floor(score + 1000 + energy * 300) : Math.floor(score);
    const stars = won ? calculateStars() : 0;
    const newRecord = won && !practiceMode && finalScore > previousBest;
    resultSnapshot = {
      won, stars, coins, score: finalScore, badgeCollected, energy,
      collisions, maxComboMultiplier, previousBest, newRecord, practice: practiceMode,
      character: characterName(), familyCalls, missionStatus: missionStatus(),
      catsRescued, catsMissed, wavesCleared, waveHits, rocksDodged, rockHits,
      nightTimeLeft, maxNightCollectStreak, bossHits,
    };

    if (won) {
      save.stars[currentLevel] = Math.max(save.stars[currentLevel], stars);
      save.starsByCharacter[selectedCharacter][currentLevel] = Math.max(save.starsByCharacter[selectedCharacter][currentLevel], stars);
      if (!practiceMode) activeScores()[currentLevel] = Math.max(activeScores()[currentLevel], finalScore);
      if (newRecord) save.recordRoutes[selectedCharacter][currentLevel] = (save.attempts[currentLevel] % 3) + 1;
      save.badges[currentLevel] ||= badgeCollected;
      if (!practiceMode) save.characterBadges[selectedCharacter][currentLevel] = true;
      save.unlocked = Math.max(save.unlocked, Math.min(levelData.length, currentLevel + 2));
      if (!practiceMode) save.failures[currentLevel] = 0;
      const totalStars = save.stars.reduce((total, value) => total + value, 0);
      save.goldenTrailUnlocked ||= totalStars >= 12;
      if (totalStars >= 18 && !save.championUnlocked) {
        save.championUnlocked = true;
        save.endlessUnlocked = true;
        championJustUnlocked = true;
      }
      save.familyPortraitUnlocked ||= Object.values(save.characterBadges).every((levels) => levels.every(Boolean));
      audio.play("win");
      const cheers = CHARACTER_CONFIG[selectedCharacter].cheers;
      setTimeout(() => audio.speak(cheers[Math.floor(Math.random() * cheers.length)]), 260);
      if (newRecord) audio.play("record");
      if (championJustUnlocked) audio.play("champion");
      if (currentLevel === levelData.length - 1) {
        persist();
        playStory("outro", showResult);
        return;
      }
    } else if (!practiceMode) {
      save.failures[currentLevel] += 1;
    }
    persist();
    showResult();
  }

  function showResult() {
    const result = resultSnapshot;
    mode = "result";
    const title = document.querySelector("#resultTitle");
    const kicker = document.querySelector("#resultKicker");
    const stars = document.querySelector("#resultStars");
    const summary = document.querySelector("#resultSummary");
    const next = document.querySelector("#nextButton");
    const practice = document.querySelector("#practiceButton");
    const record = document.querySelector("#resultRecord");
    const advice = document.querySelector("#resultAdvice");
    const champion = document.querySelector("#championReward");
    const resultCharacter = document.querySelector("#resultCharacter");
    const level = levelData[currentLevel];

    if (result.endless) {
      resultCharacter.src = CHARACTER_CONFIG[selectedCharacter].victory;
      resultCharacter.alt = `${result.character}完成无尽挑战`;
      kicker.textContent = "无尽挑战结束";
      title.textContent = `${result.character}坚持了 ${Math.floor(result.elapsed)} 秒！`;
      stars.textContent = "🏁 ⚡ 🏁";
      summary.textContent = `金币 ${result.coins} · 家人技能 ${result.familyCalls} 次 · 碰撞 ${result.collisions} 次 · 得分 ${result.score}`;
      const milestones = [
        [document.querySelector("#finishGoal"), result.elapsed >= 60, "坚持60秒"],
        [document.querySelector("#badgeGoal"), result.score >= 10000, "达到10000分"],
        [document.querySelector("#scoreGoal"), result.maxComboMultiplier >= 3, "达成×3连击"],
      ];
      milestones.forEach(([element, complete, label]) => {
        element.classList.toggle("is-complete", complete);
        element.textContent = `${complete ? "★" : "☆"} ${label}`;
      });
      record.textContent = result.newRecord ? `🎉 无尽模式新纪录 ${result.score}` : `无尽模式纪录 ${save.endlessBest}`;
      advice.textContent = "无尽模式会越来越快，换一位角色还能挑战不同手感。";
      champion.hidden = true;
      practice.hidden = true;
      next.hidden = true;
      showScreen("result");
      return;
    }

    resultCharacter.src = result.won
      ? CHARACTER_CONFIG[selectedCharacter].victory
      : selectedCharacter === "xiaoze" ? "assets/xiaoze-hurt.png"
        : selectedCharacter === "xiaojia" ? "assets/xiaojia-hurt.png"
          : selectedCharacter === "doudou" ? "assets/doudou-run-1.png" : "assets/longdou.webp";
    resultCharacter.alt = `${result.character}庆祝`;

    kicker.textContent = result.practice ? "练习模式成绩" : result.won ? `第 ${currentLevel + 1} 关完成` : "小丑追上来了";
    title.textContent = result.won ? `${result.character}通过${levelData[currentLevel].name}！` : `水果网救下了${result.character}`;
    stars.textContent = result.won ? `${"★ ".repeat(result.stars)}${"☆ ".repeat(3 - result.stars)}`.trim() : "☆ ☆ ☆";
    summary.textContent = `金币 ${result.coins} · ${supportSkillName()} ${result.familyCalls} 次 · 碰撞 ${result.collisions} 次 · 最高连击 ×${result.maxComboMultiplier} · 得分 ${result.score}`;

    const goalStates = [
      [document.querySelector("#finishGoal"), result.won, level.goals[0]],
      [document.querySelector("#badgeGoal"), result.missionStatus[0], level.goals[1]],
      [document.querySelector("#scoreGoal"), !result.practice && result.missionStatus[1], level.goals[2]],
    ];
    goalStates.forEach(([element, complete, label]) => {
      element.classList.toggle("is-complete", complete);
      element.textContent = `${complete ? "★" : "☆"} ${label}`;
    });

    record.textContent = result.practice
      ? "练习模式不记录最高分"
      : result.newRecord
        ? `🎉 新纪录！原纪录 ${result.previousBest || 0} → ${result.score} · 路线${save.recordRoutes[selectedCharacter][currentLevel]}`
        : `个人纪录 ${Math.max(result.previousBest, result.score) || "—"}${save.recordRoutes[selectedCharacter][currentLevel] ? ` · 路线${save.recordRoutes[selectedCharacter][currentLevel]}` : ""}`;

    if (!result.won) {
      advice.textContent = save.failures[currentLevel] >= 3
        ? "已经连续失败三次，可以先进入练习模式熟悉障碍。"
        : "下一局先减少一次碰撞，保住能量就能跑得更远。";
    } else if (result.practice) {
      advice.textContent = "练习完成！回到正式模式才能获得第三星和刷新纪录。";
    } else if (!result.missionStatus[0]) {
      advice.textContent = `下一局完成“${level.goals[1]}”，就能获得第二星。`;
    } else if (!result.missionStatus[1]) {
      advice.textContent = `第三星挑战：${level.goals[2]}。`;
    } else if (result.newRecord) {
      advice.textContent = "三星＋新纪录！下一局挑战更长的 ×3 连击。";
    } else {
      advice.textContent = `已经三星！距离个人纪录还差 ${Math.max(0, result.previousBest - result.score)} 分。`;
    }

    champion.hidden = !championJustUnlocked;
    practice.hidden = result.won || save.failures[currentLevel] < 3;
    next.hidden = !result.won || currentLevel >= levelData.length - 1;
    showScreen("result");
    renderLevelGrid();
  }

  function nextLevel() {
    const nextIndex = currentLevel + 1;
    if (nextIndex >= levelData.length) return goMenu();
    playStory(nextIndex, () => startLevel(nextIndex));
  }

  function clownDrawX() {
    const bossSlide = currentLevel === 5 && bossHits > 0 ? Math.sin(elapsed * (bossHits >= 2 ? 4.2 : 2.8)) * (bossHits >= 2 ? 62 : 34) : 0;
    return Math.max(12, hero.x - 150 + (92 - chaseDistance) * 1.55 + bossSlide);
  }

  function drawBackground(level) {
    const backgroundImage = loadBackground(currentLevel);
    if (!backgroundImage.complete || !backgroundImage.naturalWidth) {
      ctx.fillStyle = "#73d3ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const imageW = backgroundImage.naturalWidth || backgroundImage.width || canvas.width;
    const imageH = backgroundImage.naturalHeight || backgroundImage.height || canvas.height;
    const imageRatio = imageW / imageH;
    const canvasRatio = canvas.width / canvas.height;
    let sx = 0;
    let sy = 0;
    let sw = imageW;
    let sh = imageH;

    if (imageRatio > canvasRatio) {
      sw = imageH * canvasRatio;
      sx = (imageW - sw) / 2;
    } else if (imageRatio < canvasRatio) {
      sh = imageW / canvasRatio;
      sy = (imageH - sh) / 2;
    }

    ctx.drawImage(backgroundImage, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const lineOffset = (backgroundOffset * 3.5) % 140;
    ctx.fillStyle = "rgba(255,255,255,.28)";
    for (let x = -lineOffset; x < canvas.width + 140; x += 140) ctx.fillRect(x, groundY + 45, 75, 5);
  }

  function drawHero() {
    const flash = hero.invulnerable > 0 && Math.floor(hero.invulnerable * 12) % 2 === 0;
    if (flash) return;
    const airborne = hero.y < groundY - hero.h - 1;
    const isDoudou = selectedCharacter === "doudou";
    const isLonglong = selectedCharacter === "longlong";
    const selectedImages = characterImages[selectedCharacter];
    const runImages = selectedImages.run;
    const jumpImage = selectedImages.jump;
    const strideDistance = isDoudou ? 315 : selectedCharacter === "xiaoze" ? 235 : selectedCharacter === "xiaojia" ? 250 : 260;
    const runCycle = locomotionDistance / strideDistance;
    const runPosition = runCycle * runImages.length;
    const runPhase = runCycle * Math.PI * 2;
    const runFrame = Math.floor(runPosition) % runImages.length;
    const jumpReady = jumpImage.complete && jumpImage.naturalWidth;
    const selectedRunFrame = runImages[runFrame].complete && runImages[runFrame].naturalWidth ? runFrame : 0;
    const hurtReady = hero.invulnerable > 1.35 && selectedImages.hurt?.complete && selectedImages.hurt.naturalWidth;
    const image = hurtReady ? selectedImages.hurt : airborne && jumpReady ? jumpImage : runImages[selectedRunFrame];
    const crop = airborne && jumpReady
      ? isLonglong ? HERO_JUMP_CROP : FULL_FRAME_CROP
      : FULL_FRAME_CROP;
    const drawH = isDoudou ? 168 : selectedCharacter === "xiaoze" ? 146 : selectedCharacter === "xiaojia" ? 158 : airborne ? hero.h : 150;
    const drawW = airborne && jumpReady && isLonglong ? 127 : drawH;
    const centerX = hero.x + hero.w / 2;
    const runBounce = airborne || prefersReducedMotion ? 0 : -Math.abs(Math.sin(runPhase * 2)) * (isDoudou ? 1.8 : 2.8);
    const groundInset = airborne ? 0 : isDoudou ? 11 : 12;
    const drawY = hero.y + hero.h - drawH + runBounce + groundInset;
    const landingAmount = hero.landingTime > 0 ? Math.sin(hero.landingTime / .18 * Math.PI) : 0;
    const airStretch = airborne && !prefersReducedMotion ? Math.max(-.025, Math.min(.035, -hero.vy / 22000)) : 0;
    const scaleX = prefersReducedMotion ? 1 : 1 + landingAmount * .055 - airStretch * .45;
    const scaleY = prefersReducedMotion ? 1 : 1 - landingAmount * .065 + airStretch;
    const tilt = airborne
      ? prefersReducedMotion ? 0 : Math.max(-.12, Math.min(.09, hero.vy / 5600))
      : prefersReducedMotion ? 0 : (isDoudou ? -.035 : -.018) - (boostTime > 0 ? .025 : 0) + Math.sin(runPhase) * .012;

    if (save.goldenTrailUnlocked) {
      ctx.save();
      ctx.font = "18px system-ui";
      for (let i = 1; i <= 6; i += 1) {
        ctx.globalAlpha = .34 / i;
        ctx.fillText(i % 2 ? "🥭" : "🍍", centerX - 24 - i * 22, drawY + drawH * .72 + Math.sin(elapsed * 12 + i) * 7);
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = airborne ? Math.max(.16, .38 - hero.y / groundY * .22) : .2;
    ctx.fillStyle = "#17333c";
    ctx.beginPath();
    const shadowScale = airborne ? Math.max(.38, 1 - (groundY - hero.y - hero.h) / 260) : 1;
    ctx.ellipse(centerX, groundY + 3, 38 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, drawY + drawH);
    ctx.rotate(tilt);
    ctx.scale(scaleX, scaleY);
    if (save.championUnlocked) {
      ctx.shadowColor = "#ffd43b";
      ctx.shadowBlur = 16;
    }
    if (boostTime > 0) {
      ctx.globalAlpha = .2;
      for (let i = 3; i > 0; i -= 1) {
        ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h,
          -drawW / 2 - i * 26, -drawH, drawW, drawH);
      }
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h,
      -drawW / 2, -drawH, drawW, drawH);
    if (save.championUnlocked && !airborne) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = save.familyPortraitUnlocked ? `hsl(${(elapsed * 160) % 360} 90% 58%)` : "#ffd43b";
      ctx.strokeStyle = "#8d5d00";
      ctx.lineWidth = 2;
      for (const wheelX of [-drawW * .28, drawW * .28]) {
        ctx.beginPath();
        ctx.arc(wheelX, -3, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawFamilyAssist() {
    if (familyAssistTime <= 0) return;
    const phase = 3 - familyAssistTime;
    const enter = Math.min(1, phase / .48);
    const finale = Math.max(0, Math.min(1, (phase - 2.35) / .45));
    const ease = (value) => 1 - (1 - value) ** 3;
    const leftBase = -190 + ease(enter) * 355;
    const rightBase = canvas.width + 10 - ease(enter) * 420;
    const leftX = leftBase + finale * 255;
    const rightX = rightBase - finale * 230;
    const y = groundY - 214;
    const size = 220;
    const throwing = phase > .52 && phase < 2.4;
    const siblingSupport = usesSiblingSupport();
    const leftKey = siblingSupport ? "xiaojia" : "longlong";
    const rightKey = siblingSupport ? "xiaoze" : "doudou";
    const leftImage = familyImages[`${leftKey}-${throwing ? "throw" : "enter"}`];
    const rightImage = familyImages[`${rightKey}-${throwing ? "throw" : "enter"}`];

    ctx.save();
    if (save.championUnlocked) {
      ctx.shadowColor = "#ffd43b";
      ctx.shadowBlur = 18;
    }
    ctx.drawImage(leftImage, leftX, y, size, size);
    ctx.drawImage(rightImage, rightX, y, size, size);
    ctx.shadowBlur = 0;

    if (throwing) {
      const targetX = clownDrawX() + 60;
      for (let i = 0; i < 7; i += 1) {
        const travel = (phase * 1.35 + i * .17) % 1;
        const fromLeft = i % 2 === 0;
        const startX = fromLeft ? leftX + 145 : rightX + 62;
        const startY = y + 90 + (i % 3) * 13;
        const x = startX + (targetX - startX) * travel;
        const arc = Math.sin(travel * Math.PI) * (70 + i * 4);
        const fruitColors = ["#ffb126", "#8f5a2b", "#f05278", "#ffd74b"];
        ctx.fillStyle = fruitColors[i % fruitColors.length];
        ctx.strokeStyle = "#693f20";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, startY - arc, 12 + i % 3, 10 + (i + 1) % 3, travel * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    if (finale > .15) {
      ctx.globalAlpha = Math.sin(finale * Math.PI);
      ctx.font = "bold 50px system-ui";
      ctx.fillStyle = "#fff06a";
      ctx.fillText("✦", canvas.width / 2 - 16, groundY - 155);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawClown() {
    const x = clownDrawX();
    const h = 132;
    const skateRate = boostTime > 0 ? 10.4 : 7.6;
    const skatePosition = elapsed * skateRate;
    const skateFrame = Math.floor(skatePosition) % clownSkateImages.length;
    const skatePhase = skatePosition / clownSkateImages.length * Math.PI * 2;
    const push = Math.sin(skatePhase);
    const bossLift = currentLevel === 5 && bossHits >= 2 ? Math.abs(Math.sin(elapsed * 3.1)) * 54 : 0;
    const clownGround = groundY - bossLift;
    const y = clownGround - h;
    ctx.save();
    if (clownStun > 0) {
      const slipW = 158;
      ctx.translate(x + slipW / 2, y + h / 2 - 4);
      ctx.rotate(Math.sin(elapsed * 15) * .12 + (familyAssistTime > 0 ? Math.sin(elapsed * 10) * .08 : 0));
      ctx.drawImage(clownSlipImage, CLOWN_SLIP_CROP.x, CLOWN_SLIP_CROP.y, CLOWN_SLIP_CROP.w, CLOWN_SLIP_CROP.h, -slipW / 2, -h / 2, slipW, h);
      ctx.font = "bold 28px system-ui";
      ctx.fillText("✦", -68, -48);
      ctx.fillText("✦", 54, -55);
      if (familyAssistTime > 0) {
        ctx.save();
        ctx.rotate(elapsed * 4);
        ctx.font = "26px system-ui";
        ctx.fillText("🎩", -8, -88);
        ctx.restore();
        ctx.font = "22px system-ui";
        ctx.fillText("🥭🍍🥥", -55, 68);
        ctx.fillStyle = Math.floor(elapsed * 10) % 2 ? "#ff2c38" : "#ff8990";
        ctx.beginPath();
        ctx.arc(14, -24, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const selectedSkateFrame = clownSkateImages[skateFrame].complete && clownSkateImages[skateFrame].naturalWidth ? skateFrame : 0;
      const image = clownSkateImages[selectedSkateFrame];
      const crop = CLOWN_SKATE_CROPS[selectedSkateFrame];
      const scale = h / crop.h;
      const drawW = crop.w * scale;
      const drawX = -crop.anchorX * scale;
      const centerX = x + 63;
      const glideBob = -Math.abs(Math.sin(skatePhase * 2)) * 1.8;
      ctx.translate(centerX + push * 1.2, clownGround + glideBob);
      ctx.rotate(push * .014);
      ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, drawX, -h, drawW, h);
      ctx.strokeStyle = "rgba(255,255,255,.72)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      const trail = .45 + Math.abs(push) * .55;
      ctx.beginPath();
      ctx.moveTo(drawX - 4, -24);
      ctx.lineTo(drawX - 22 - trail * 22, -24);
      ctx.moveTo(drawX, -43);
      ctx.lineTo(drawX - 15 - trail * 18, -43);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundedRect(x, y, w, h, radius, fill, stroke = "#112e35") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.stroke();
  }

  function drawEntity(item) {
    const { x, y, w, h } = item;
    ctx.save();
    if (item.type === "coin") {
      ctx.translate(x + w / 2, y + h / 2);
      if (currentLevel === 4) {
        ctx.shadowColor = Math.floor(item.spin * 2) % 2 ? "#ff59d6" : "#55f4ff";
        ctx.shadowBlur = 18;
      }
      const turn = .18 + Math.abs(Math.sin(item.spin)) * .82;
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * .82);
      glow.addColorStop(0, "rgba(255,242,141,.42)");
      glow.addColorStop(1, "rgba(255,215,53,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(0, 0, w * .82, 0, Math.PI * 2); ctx.fill();
      ctx.scale(turn, 1);
      ctx.drawImage(coinImage, COIN_CROP.x, COIN_CROP.y, COIN_CROP.w, COIN_CROP.h, -w / 2, -h / 2, w, h);
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.beginPath(); ctx.arc(-w * .18, -h * .2, 2.2, 0, Math.PI * 2); ctx.fill();
    } else if (item.type === "fruit") {
      ctx.translate(x + w / 2, y + h / 2); ctx.rotate(Math.sin(item.spin) * .12);
      ctx.fillStyle = "#ffb52e"; ctx.strokeStyle = "#9b4e13"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 3, 17, 20, -.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#3d9b4b"; ctx.beginPath(); ctx.ellipse(8, -17, 11, 5, -.5, 0, Math.PI * 2); ctx.fill();
    } else if (item.type === "badge") {
      ctx.translate(x + w / 2, y + h / 2); ctx.rotate(Math.sin(item.spin) * .1);
      ctx.fillStyle = "#ffcf35"; ctx.strokeStyle = "#743f17"; ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 12; i += 1) {
        const angle = i * Math.PI / 6 - Math.PI / 2;
        const r = i % 2 ? 19 : 28;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1caeb1"; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    } else {
      drawObstacle(item);
    }
    ctx.restore();
  }

  function drawObstacle(item) {
    const { x, y, w, h, kind } = item;
    ctx.lineWidth = 4; ctx.strokeStyle = "#112e35";
    if (kind === "crate") {
      roundedRect(x, y, w, h, 7, "#bd7035");
      ctx.beginPath(); ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + w - 8, y + h - 8);
      ctx.moveTo(x + w - 8, y + 8); ctx.lineTo(x + 8, y + h - 8); ctx.stroke();
    } else if (kind === "cone") {
      ctx.fillStyle = "#ff7045"; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff4d0"; ctx.fillRect(x + 11, y + 34, w - 22, 9);
    } else if (kind === "puddle" || kind === "crack") {
      ctx.fillStyle = kind === "puddle" ? "#2f87bd" : "#3c3a38";
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (kind === "crack") { ctx.strokeStyle = "#d9b77a"; ctx.beginPath(); ctx.moveTo(x + 20, y + 8); ctx.lineTo(x + 53, y + 2); ctx.lineTo(x + 78, y + 15); ctx.lineTo(x + 104, y + 5); ctx.stroke(); }
    } else if (["ball", "coconut", "rock", "fallingRock", "bossBall"].includes(kind)) {
      ctx.fillStyle = ["ball", "bossBall"].includes(kind) ? "#ff6f59" : kind === "coconut" ? "#855129" : "#50565a";
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, -.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (["ball", "bossBall"].includes(kind)) { ctx.strokeStyle = "#fff2c4"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 3, -.7, 1.9); ctx.stroke(); }
      if (kind === "coconut") { ctx.fillStyle = "#d9a768"; [0,1,2].forEach(i => { ctx.beginPath(); ctx.arc(x + 19 + i * 7, y + 16, 2.5, 0, Math.PI * 2); ctx.fill(); }); }
      if (kind === "fallingRock" && item.warning > 0) {
        ctx.fillStyle = "#ffdc43"; ctx.strokeStyle = "#7c301f"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x + w / 2, groundY - 118); ctx.lineTo(x + w / 2 - 22, groundY - 78); ctx.lineTo(x + w / 2 + 22, groundY - 78); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#7c301f"; ctx.font = "bold 24px system-ui"; ctx.fillText("!", x + w / 2 - 5, groundY - 87);
      }
    } else if (kind === "barrier" || kind === "bench") {
      const color = kind === "barrier" ? "#ff7648" : "#8a5a35";
      roundedRect(x, y + 12, w, h - 30, 6, color);
      ctx.fillStyle = "#fff2d0";
      if (kind === "barrier") for (let i = 12; i < w; i += 34) ctx.fillRect(x + i, y + 18, 13, h - 43);
      ctx.fillStyle = "#263a3e"; ctx.fillRect(x + 10, y + h - 18, 9, 18); ctx.fillRect(x + w - 19, y + h - 18, 9, 18);
    } else if (kind === "cat" || kind === "rescueCat") {
      const stride = Math.sin(elapsed * 15 + x * .02);
      const catW = w + 12;
      const catH = h + 8;
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2 + stride * 3);
      ctx.scale(-(1 + Math.abs(stride) * .035), 1 - Math.abs(stride) * .025);
      ctx.drawImage(catImage, CAT_CROP.x, CAT_CROP.y, CAT_CROP.w, CAT_CROP.h, -catW / 2, -catH / 2, catW, catH);
      ctx.restore();
      if (kind === "rescueCat") {
        ctx.font = "bold 18px system-ui"; ctx.fillStyle = "#fff"; ctx.strokeStyle = "#112e35"; ctx.lineWidth = 4;
        ctx.strokeText("救我！", x + 10, y - 8); ctx.fillText("救我！", x + 10, y - 8);
      }
    } else if (kind === "wave") {
      const wave = Math.sin(elapsed * 8 + x * .02) * 7;
      ctx.fillStyle = "rgba(58,184,224,.9)"; ctx.strokeStyle = "#0b6f9a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + 24);
      ctx.quadraticCurveTo(x + w * .3, y - 8 + wave, x + w * .52, y + 22);
      ctx.quadraticCurveTo(x + w * .76, y + 2 - wave, x + w, y + 18);
      ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#eaffff"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + 8, y + 23); ctx.quadraticCurveTo(x + w * .3, y - 3 + wave, x + w * .52, y + 23); ctx.stroke();
    } else if (kind === "bossBanana") {
      ctx.font = "54px system-ui"; ctx.fillText("🍌", x, y + h + 12);
    } else if (kind === "seagull") {
      ctx.strokeStyle = "#f8fbf4"; ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(x + 22, y + 28, 25, 3.7, 5.8); ctx.arc(x + 65, y + 28, 25, 3.7, 5.8); ctx.stroke();
      ctx.strokeStyle = "#112e35"; ctx.lineWidth = 3; ctx.stroke();
    }
  }

  function drawProjectile(item) {
    ctx.save();
    ctx.translate(item.x, item.y); ctx.rotate(item.angle);
    ctx.fillStyle = "#ff9f27"; ctx.strokeStyle = "#783d16"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#4ea957"; ctx.beginPath(); ctx.ellipse(9, -11, 9, 4, -.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size); ctx.restore();
    }
  }

  function draw() {
    const level = levelData[currentLevel];
    const shakeX = screenShake > 0 ? (Math.random() - .5) * 18 : 0;
    const shakeY = screenShake > 0 ? (Math.random() - .5) * 10 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawBackground(level);
    drawClown();
    entities.forEach(drawEntity);
    projectiles.forEach(drawProjectile);
    drawHero();
    drawFamilyAssist();
    drawParticles();
    ctx.restore();
  }

  function updateHud() {
    const level = levelData[currentLevel];
    const progress = mode === "menu" ? 0 : endlessMode ? (elapsed % 60) / 60 * 100 : Math.min(100, elapsed / level.duration * 100);
    ui.energy.textContent = "🥥".repeat(Math.max(0, energy)) + "○".repeat(Math.max(0, 3 - energy));
    ui.coins.textContent = String(coins);
    ui.fruit.textContent = `${fruit} / 3`;
    ui.score.textContent = String(Math.floor(score));
    ui.target.textContent = "3星";
    ui.best.textContent = String(endlessMode ? save.endlessBest || "—" : activeScores()[currentLevel] || "—");
    ui.combo.textContent = `连击 ×${comboMultiplier}`;
    ui.combo.classList.toggle("is-hot", comboMultiplier > 1);
    ui.practiceBadge.hidden = !practiceMode;
    ui.chaseFill.style.width = `${chaseDistance}%`;
    ui.chaseState.textContent = chaseDistance < 32 ? "危险" : chaseDistance < 58 ? "靠近" : "安全";
    ui.progressText.textContent = endlessMode ? `无尽 · ${Math.floor(elapsed)}秒` : `第 ${currentLevel + 1} 关 · ${Math.floor(progress)}%`;
    ui.progressFill.style.width = `${progress}%`;
    ui.boostFill.style.width = `${boostTime > 0 ? 100 : boost}%`;
    ui.boostState.textContent = boostTime > 0 ? `${boostTime.toFixed(1)}秒` : boost >= 100 ? "就绪" : `${Math.floor(boost)}%`;
    ui.familyFill.style.width = `${familyPower}%`;
    ui.familyState.textContent = familyAssistTime > 0 ? (usesSiblingSupport() ? "呈祥中" : "同心中") : familyPower >= 100 ? "就绪" : `${Math.floor(familyPower)}%`;
    ui.familyButtonLabel.textContent = supportSkillName();
    ui.familyButton.hidden = familyPower < 100 || familyAssistTime > 0;
    ui.throwButton.disabled = fruit <= 0;
    ui.boostButton.disabled = boost < 100 && boostTime <= 0;
    const missionText = endlessMode
      ? `无尽挑战 ${Math.floor(elapsed)}秒 · 速度 ${Math.round(100 + Math.min(42, elapsed / 4.2))}%`
      : currentLevel === 0
      ? `任务：找回徽章${selectedCharacter === "doudou" && strengthGuard ? " · 🛡️力量护盾" : ""}`
      : currentLevel === 1 ? `救猫 ${catsRescued}/3 · 掉队 ${catsMissed}`
        : currentLevel === 2 ? `踏浪 ${wavesCleared}/5 · 被浪打中 ${waveHits}`
          : currentLevel === 3 ? `躲落石 ${rocksDodged}/5 · 命中 ${rockHits}`
            : currentLevel === 4 ? `夜赛剩余 ${nightTimeLeft.toFixed(1)}秒 · 连续收集 ${maxNightCollectStreak}/10`
              : bossFinaleReady ? `按 G 发动${supportSkillName()}完成决战` : `命中小丑 ${bossHits}/3`;
    ui.mission.textContent = missionText;
  }

  function loop(now) {
    if (mode !== "playing") return;
    const dt = Math.min(.033, Math.max(.001, (now - lastTime) / 1000));
    lastTime = now;
    update(dt);
    draw();
    if (mode === "playing") animationId = requestAnimationFrame(loop);
  }

  function handleKey(event) {
    if (["Space", "ArrowUp"].includes(event.code)) {
      event.preventDefault(); jump();
    } else if (event.code === "KeyF") {
      event.preventDefault(); throwFruit();
    } else if (["ShiftLeft", "ShiftRight"].includes(event.code)) {
      event.preventDefault(); triggerBoost();
    } else if (event.code === "KeyG") {
      event.preventDefault(); triggerFamilyAssist();
    } else if (event.code === "Escape") {
      event.preventDefault(); togglePause();
    }
  }

  const adventureButton = document.querySelector("#adventureButton");
  adventureButton.addEventListener("click", async () => {
    const audioReady = await audio.unlock();
    startAdventure();
    if (!audioReady) showToast("点一下右上角的声音按钮开启音乐", 2400);
  });
  document.querySelector("#levelSelectButton").addEventListener("click", () => { renderLevelGrid(); showScreen("levels"); });
  document.querySelector("#checkpointButton").addEventListener("click", () => {
    const checkpoint = readCheckpoint();
    if (!checkpoint) return renderCheckpointButton();
    selectedCharacter = CHARACTER_KEYS.includes(checkpoint.character) ? checkpoint.character : "longlong";
    save.lastCharacter = selectedCharacter;
    persist();
    startLevel(checkpoint.level, { checkpoint: true, retry: true });
  });
  document.querySelector("#chooseLonglongButton").addEventListener("click", () => chooseCharacter("longlong"));
  document.querySelector("#chooseDoudouButton").addEventListener("click", () => chooseCharacter("doudou"));
  document.querySelector("#chooseXiaozeButton").addEventListener("click", () => chooseCharacter("xiaoze"));
  document.querySelector("#chooseXiaojiaButton").addEventListener("click", () => chooseCharacter("xiaojia"));
  document.querySelector("#endlessButton").addEventListener("click", () => {
    openCharacterSelect(() => startLevel(4, { endless: true }));
  });
  document.querySelector("#characterBackButton").addEventListener("click", goMenu);
  document.querySelector("#backToMenuButton").addEventListener("click", goMenu);
  document.querySelector("#clearProgressButton").addEventListener("click", () => {
    if (!window.confirm("确定清除《龙豆跑酷》的全部关卡进度吗？")) return;
    save = defaultSave();
    selectedCharacter = "longlong";
    persist();
    renderLevelGrid();
    showToast("进度已清除");
  });
  document.querySelector("#restoreProgressButton").addEventListener("click", () => {
    const backup = localStorage.getItem(`${STORAGE_KEY}-backup-v3`);
    if (!backup || !window.confirm("恢复改版前的关卡进度吗？当前新版进度会被替换。")) return;
    localStorage.setItem(STORAGE_KEY, backup);
    save = loadSave();
    selectedCharacter = save.lastCharacter;
    persist();
    renderLevelGrid();
    renderCharacterSelect();
    showToast("已恢复并迁移旧进度", 1600);
  });
  document.querySelector("#storyContinueButton").addEventListener("click", () => { const action = storyAction; storyAction = null; if (action) action(); });
  document.querySelector("#skipStoryButton").addEventListener("click", () => { const action = storyAction; storyAction = null; if (action) action(); });
  document.querySelector("#retryButton").addEventListener("click", () => startLevel(currentLevel, { practice: practiceMode, retry: true }));
  document.querySelector("#practiceButton").addEventListener("click", () => startLevel(currentLevel, { practice: true }));
  document.querySelector("#nextButton").addEventListener("click", nextLevel);
  document.querySelector("#changeCharacterButton").addEventListener("click", () => {
    openCharacterSelect(() => startLevel(currentLevel, { practice: practiceMode, retry: true }));
  });
  document.querySelector("#resultMenuButton").addEventListener("click", goMenu);
  document.querySelector("#resumeButton").addEventListener("click", () => togglePause(false));
  document.querySelector("#pauseMenuButton").addEventListener("click", goMenu);
  ui.pauseButton.addEventListener("click", () => togglePause());
  ui.throwButton.addEventListener("click", (event) => { event.stopPropagation(); throwFruit(); });
  ui.boostButton.addEventListener("click", (event) => { event.stopPropagation(); triggerBoost(); });
  ui.familyButton.addEventListener("click", (event) => { event.stopPropagation(); triggerFamilyAssist(); });
  async function toggleSound() {
    audio.enabled = !audio.enabled;
    if (audio.enabled) await audio.unlock();
    else audio.stopVoice();
    [ui.soundButton, ui.mobileSoundButton].forEach((button) => {
      button.textContent = audio.enabled ? "🔊" : "🔇";
      button.setAttribute("aria-label", audio.enabled ? "关闭声音" : "打开声音");
    });
    showToast(audio.enabled ? "音乐已开启 🔊" : "音乐已关闭", 1200);
  }
  ui.soundButton.addEventListener("click", toggleSound);
  ui.mobileSoundButton.addEventListener("click", (event) => { event.stopPropagation(); toggleSound(); });
  document.addEventListener("pointerdown", () => { if (audio.enabled) audio.unlock(); }, { capture: true, once: true });
  canvas.addEventListener("pointerdown", jump);
  window.addEventListener("keydown", handleKey, { passive: false });
  window.addEventListener("blur", () => { if (mode === "playing") togglePause(true); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && mode === "playing") togglePause(true);
  });

  renderLevelGrid();
  renderCharacterSelect();
  renderCheckpointButton();
  updateHud();

  const waitForImage = (image) => new Promise((resolve) => {
    if (image.complete) resolve();
    else { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }
  });

  Promise.all([
    backgroundImages[0], longlongRunImages[0], doudouRunImages[0], xiaozeRunImages[0], xiaojiaRunImages[0], doudouVictoryImage, clownSkateImages[0],
  ].map(waitForImage)).then(() => {
    adventureButton.disabled = false;
    adventureButton.textContent = "开始冒险";
    draw();
  });
})();
