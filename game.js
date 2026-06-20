const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const biomeName = document.getElementById("biomeName");
const gemCount = document.getElementById("gemCount");
const energyText = document.getElementById("energyText");
const checkpointText = document.getElementById("checkpointText");
const toast = document.getElementById("toast");
const achievementModal = document.getElementById("achievementModal");
const achievementText = document.getElementById("achievementText");
const restartButton = document.getElementById("restartButton");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const TILE = 32;
const WORLD_W = 12200;
const WORLD_TOP = -980;
const WORLD_H = 2200;
const GRAVITY = 0.74;
const MAX_GEMS = 55;

const keys = new Set();
const touchKeys = new Set();
const solids = [];
const gems = [];
const checkpoints = [];
const springs = [];
const creatures = [];
const finish = { x: 11680, y: -830, w: 70, h: 210 };

let started = false;
let won = false;
let time = 0;
let camera = { x: 0, y: 0 };
let messageTimer = 0;
let messageText = "";

const player = {
  x: 120,
  y: 1150,
  w: 25,
  h: 38,
  vx: 0,
  vy: 0,
  face: 1,
  ground: false,
  jumps: 0,
  energy: 100,
  gems: 0,
  checkpoint: { x: 120, y: 1150, name: "草原营地" },
  invuln: 0
};

const biomes = [
  { name: "草原", start: 0, end: 2300, sky: "#87d9ff", far: "#b5ecff", ground: "#68bd69", dark: "#3e8a52", accent: "#ffe16a" },
  { name: "森林", start: 2300, end: 4600, sky: "#83c9d2", far: "#a7e0cf", ground: "#398d57", dark: "#225a45", accent: "#bdf071" },
  { name: "海洋", start: 4600, end: 7600, sky: "#7fc8ff", far: "#c1f2ff", ground: "#55c7cc", dark: "#237aa1", accent: "#ffd36b" },
  { name: "天空", start: 7600, end: WORLD_W, sky: "#9edcff", far: "#d9f6ff", ground: "#87d874", dark: "#5572c7", accent: "#ffb7e8" }
];

function rect(x, y, w, h, type = "grass") {
  solids.push({ x, y, w, h, type });
}

function addGem(x, y) {
  gems.push({ x, y, w: 22, h: 22, got: false, bob: Math.random() * 10 });
}

function addCheckpoint(x, y, name) {
  checkpoints.push({ x, y, w: 42, h: 70, name, active: false });
}

function addSpring(x, y) {
  springs.push({ x, y, w: 36, h: 18, pulse: 0 });
}

function addCreature(type, x, y, rangeX = 40, rangeY = 18) {
  const size = type === "shark" || type === "eagle" ? 54 : 42;
  creatures.push({
    type,
    baseX: x,
    baseY: y,
    x,
    y,
    w: size,
    h: type === "bird" ? 28 : 34,
    rangeX,
    rangeY,
    phase: Math.random() * Math.PI * 2,
    cooldown: 0
  });
}

function buildWorld() {
  rect(0, 1320, 2220, 280, "grass");
  rect(260, 1180, 300, 28, "grass");
  rect(760, 1060, 330, 28, "grass");
  rect(1250, 940, 360, 28, "grass");
  rect(1710, 1070, 300, 28, "grass");

  rect(2240, 1320, 2200, 280, "forest");
  rect(2370, 1130, 300, 28, "forest");
  rect(2790, 990, 320, 28, "forest");
  rect(3240, 850, 280, 28, "forest");
  rect(3650, 1030, 360, 28, "forest");
  rect(4140, 900, 250, 28, "forest");

  rect(4560, 1390, 1020, 210, "ocean");
  rect(5900, 1390, 760, 210, "ocean");
  rect(7000, 1390, 560, 210, "ocean");
  rect(4660, 1170, 290, 28, "sand");
  rect(5120, 1040, 300, 28, "sand");
  rect(5580, 910, 280, 28, "sand");
  rect(6030, 1020, 350, 28, "sand");
  rect(6500, 860, 260, 28, "sand");
  rect(4860, 1280, 190, 24, "ocean");
  rect(5350, 1235, 170, 24, "ocean");
  rect(5850, 1135, 180, 24, "ocean");
  rect(6260, 1195, 190, 24, "ocean");
  rect(6760, 1080, 180, 24, "ocean");
  rect(7190, 980, 220, 24, "sand");
  rect(7420, 820, 180, 24, "sand");
  rect(4920, 1630, 210, 24, "ocean");
  rect(5350, 1770, 230, 24, "ocean");
  rect(5820, 1940, 260, 28, "sand");
  rect(6280, 1810, 230, 24, "ocean");
  rect(6750, 1980, 250, 28, "sand");
  rect(7180, 1730, 240, 24, "ocean");
  rect(7470, 1540, 240, 24, "sand");

  rect(7680, 1390, 380, 210, "cloud");
  rect(8060, 1210, 310, 28, "cloud");
  rect(8460, 1030, 310, 28, "cloud");
  rect(8870, 880, 280, 28, "cloud");
  rect(9250, 720, 280, 28, "cloud");
  rect(9650, 930, 250, 28, "cloud");
  rect(10040, 780, 260, 28, "cloud");
  rect(10460, 610, 260, 28, "cloud");
  rect(10860, 760, 240, 28, "cloud");
  rect(11240, 560, 260, 28, "cloud");
  rect(11620, 500, 180, 90, "cloud");
  rect(7930, 1080, 150, 24, "cloud");
  rect(8340, 900, 150, 24, "cloud");
  rect(8730, 710, 150, 24, "cloud");
  rect(9430, 1060, 150, 24, "cloud");
  rect(9840, 590, 150, 24, "cloud");
  rect(10230, 990, 150, 24, "cloud");
  rect(10620, 430, 150, 24, "cloud");
  rect(11020, 1040, 150, 24, "cloud");
  rect(8790, 500, 180, 24, "cloud");
  rect(9180, 300, 180, 24, "cloud");
  rect(9560, 90, 190, 24, "cloud");
  rect(9960, -130, 190, 24, "cloud");
  rect(10380, -330, 200, 24, "cloud");
  rect(10820, -530, 210, 24, "cloud");
  rect(11270, -710, 220, 24, "cloud");
  rect(11620, -620, 210, 90, "cloud");

  [
    [420, 1128], [930, 1010], [1410, 890], [1860, 1020],
    [2500, 1080], [2920, 940], [3370, 800], [3820, 980], [4260, 850],
    [4780, 1120], [4970, 1230], [5250, 990], [5450, 1185],
    [5710, 860], [5940, 1085], [6180, 970], [6360, 1145],
    [6600, 810], [6860, 1030], [7290, 930], [7480, 770],
    [7840, 1330], [8190, 1160], [8420, 860], [8610, 980],
    [8960, 830], [9360, 670], [9720, 880], [9910, 540],
    [10130, 730], [10300, 940], [10550, 560], [10710, 390],
    [10950, 710], [11100, 990], [11340, 510], [11690, 450],
    [5030, 1580], [5460, 1720], [5940, 1890], [6400, 1760],
    [6880, 1930], [7300, 1680], [7560, 1490],
    [8880, 450], [9270, 250], [9660, 40], [10060, -180],
    [10480, -380], [10930, -580], [11390, -760], [11710, -690],
    [2100, 1230], [4420, 1230], [7560, 1280]
  ].forEach(([x, y]) => addGem(x, y));

  addCheckpoint(110, 1250, "草原营地");
  addCheckpoint(2520, 1060, "森林营地");
  addCheckpoint(5100, 970, "海风营地");
  addCheckpoint(5850, 1870, "海底营地");
  addCheckpoint(6900, 1010, "珊瑚营地");
  addCheckpoint(8100, 1140, "云端营地");
  addCheckpoint(10470, 540, "高空营地");
  addCheckpoint(10880, -600, "云顶营地");
  addSpring(1980, 1300);
  addSpring(4380, 1300);
  addSpring(5570, 1370);
  addSpring(6660, 1370);
  addSpring(7560, 1370);
  addSpring(9160, 700);
  addSpring(10180, 760);
  addSpring(11170, 1020);
  addSpring(9850, 70);
  addSpring(10620, -360);
  addSpring(11470, -740);

  addCreature("dolphin", 5200, 1540, 80, 26);
  addCreature("dolphin", 7050, 1650, 70, 24);
  addCreature("shark", 5660, 1880, 110, 18);
  addCreature("shark", 6630, 2010, 95, 18);
  addCreature("bird", 9000, 390, 70, 32);
  addCreature("bird", 10080, -240, 75, 30);
  addCreature("eagle", 9650, 250, 110, 34);
  addCreature("eagle", 11120, -470, 120, 30);
}

function biomeAt(x) {
  return biomes.find((b) => x >= b.start && x < b.end) || biomes[biomes.length - 1];
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function showMessage(text) {
  messageText = text;
  messageTimer = 180;
  toast.textContent = text;
  toast.hidden = false;
}

function showAchievement() {
  const title = player.gems >= 36 ? "你点亮了天空灯塔，完成了云海探险！" : "你抵达了天空灯塔，完成了轻松通关！";
  achievementText.textContent = `${title} 星晶 ${player.gems} / ${MAX_GEMS}`;
  achievementModal.hidden = false;
}

function restartGame() {
  won = false;
  started = true;
  player.x = 120;
  player.y = 1150;
  player.vx = 0;
  player.vy = 0;
  player.face = 1;
  player.ground = false;
  player.jumps = 0;
  player.energy = 100;
  player.gems = 0;
  player.checkpoint = { x: 120, y: 1150, name: "草原营地" };
  player.invuln = 60;
  gems.forEach((gem) => gem.got = false);
  checkpoints.forEach((checkpoint) => checkpoint.active = false);
  checkpoints[0].active = true;
  checkpointText.textContent = "草原营地";
  achievementModal.hidden = true;
  startButton.classList.add("hidden");
  showMessage("新的冒险开始了！");
}

function respawn() {
  player.x = player.checkpoint.x;
  player.y = player.checkpoint.y;
  player.vx = 0;
  player.vy = 0;
  player.energy = 100;
  player.invuln = 90;
  showMessage("回到最近的营地，继续向前！");
}

function updateCreatures() {
  for (const creature of creatures) {
    creature.x = creature.baseX + Math.sin(time * 0.025 + creature.phase) * creature.rangeX;
    creature.y = creature.baseY + Math.sin(time * 0.035 + creature.phase) * creature.rangeY;
    creature.cooldown = Math.max(0, creature.cooldown - 1);
    if (!overlap(player, creature) || creature.cooldown > 0) continue;

    if (creature.type === "dolphin") {
      player.vx = Math.max(player.vx, 10);
      player.vy = -13;
      player.energy = 100;
      creature.cooldown = 120;
      showMessage("海豚托起了你，冲向前方！");
    }

    if (creature.type === "bird") {
      player.vx += 6;
      player.vy = -15;
      player.energy = Math.min(100, player.energy + 35);
      creature.cooldown = 120;
      showMessage("小鸟带来一阵上升气流！");
    }

    if ((creature.type === "shark" || creature.type === "eagle") && player.invuln === 0) {
      player.vx = creature.type === "shark" ? -8 : -5;
      player.vy = creature.type === "shark" ? -11 : 8;
      player.energy = Math.max(0, player.energy - 30);
      player.invuln = 95;
      creature.cooldown = 90;
      showMessage(creature.type === "shark" ? "小心鲨鱼！它把你撞开了。" : "老鹰俯冲！稳住方向。");
    }
  }
}

function moveAndCollide() {
  player.x += player.vx;
  for (const s of solids) {
    if (!overlap(player, s)) continue;
    if (player.vx > 0) player.x = s.x - player.w;
    if (player.vx < 0) player.x = s.x + s.w;
    player.vx = 0;
  }

  player.y += player.vy;
  player.ground = false;
  for (const s of solids) {
    if (!overlap(player, s)) continue;
    if (player.vy > 0) {
      player.y = s.y - player.h;
      player.vy = 0;
      player.ground = true;
      player.jumps = 0;
    } else if (player.vy < 0) {
      player.y = s.y + s.h;
      player.vy = 0;
    }
  }
}

function updatePlayer() {
  const left = keys.has("ArrowLeft") || keys.has("a") || touchKeys.has("ArrowLeft");
  const right = keys.has("ArrowRight") || keys.has("d") || touchKeys.has("ArrowRight");
  const jumpHeld = keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || touchKeys.has(" ");
  const sprint = keys.has("Shift") || touchKeys.has("Shift");

  const accel = sprint && player.energy > 4 ? 0.98 : 0.62;
  const maxSpeed = sprint && player.energy > 4 ? 9.2 : 6.1;
  if (left) {
    player.vx -= accel;
    player.face = -1;
  }
  if (right) {
    player.vx += accel;
    player.face = 1;
  }
  if (!left && !right) player.vx *= 0.82;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (sprint && (left || right) && player.energy > 0) {
    player.energy -= 0.42;
  }

  if (jumpHeld && !player._jumpWasHeld && (player.ground || player.jumps < 2)) {
    player.vy = player.ground ? -15.2 : -12.2;
    player.ground = false;
    player.jumps += 1;
  }

  const flying = jumpHeld && !player.ground && player.energy > 0 && player.vy > -7;
  if (flying) {
    player.vy -= 0.36;
    player.vy *= 0.91;
    player.energy -= 0.36;
  }

  player.vy += flying ? GRAVITY * 0.22 : GRAVITY;
  player.vy = Math.min(player.vy, flying ? 4.3 : 15.5);

  if (player.ground) player.energy = Math.min(100, player.energy + 1.15);
  else player.energy = Math.min(100, player.energy + 0.08);

  player._jumpWasHeld = jumpHeld;
  moveAndCollide();

  for (const spring of springs) {
    if (overlap(player, spring) && player.vy >= 0) {
      player.vy = -20;
      player.energy = Math.min(100, player.energy + 25);
      spring.pulse = 18;
      showMessage("弹跳花给了你一阵风！");
    }
    spring.pulse = Math.max(0, spring.pulse - 1);
  }

  updateCreatures();

  for (const gem of gems) {
    if (!gem.got && overlap(player, gem)) {
      gem.got = true;
      player.gems += 1;
      showMessage(`收集到星晶 ${player.gems} / ${MAX_GEMS}`);
    }
  }

  for (const cp of checkpoints) {
    if (overlap(player, cp)) {
      player.checkpoint = { x: cp.x, y: cp.y - 40, name: cp.name };
      checkpoints.forEach((c) => c.active = false);
      cp.active = true;
      checkpointText.textContent = cp.name;
    }
  }

  if (overlap(player, finish) && !won) {
    won = true;
    showMessage("成就达成：云海探险家！");
    showAchievement();
  }

  if (player.y > WORLD_H + 160) respawn();
  if (keys.has("r")) respawn();
  player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));
  player.invuln = Math.max(0, player.invuln - 1);
}

function updateCamera() {
  camera.x += (player.x + player.w / 2 - W / 2 - camera.x) * 0.12;
  camera.y += (player.y + player.h / 2 - H / 2 - camera.y) * 0.1;
  camera.x = Math.max(0, Math.min(WORLD_W - W, camera.x));
  camera.y = Math.max(WORLD_TOP, Math.min(WORLD_H - H + 80, camera.y));
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBackground(biome) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, biome.sky);
  grad.addColorStop(0.55, biome.far);
  grad.addColorStop(1, "#fff4c4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const par = camera.x * 0.18;
  for (let i = -2; i < 14; i++) {
    const x = i * 190 - (par % 190);
    const y = 120 + Math.sin(i * 1.7 + time * 0.01) * 12;
    drawPixelRect(x, y, 76, 18, "rgba(255,255,255,0.72)");
    drawPixelRect(x + 24, y - 18, 82, 24, "rgba(255,255,255,0.72)");
    drawPixelRect(x + 84, y + 3, 48, 15, "rgba(255,255,255,0.72)");
  }

  if (biome.name === "森林") {
    for (let i = -1; i < 12; i++) {
      const x = i * 130 - ((camera.x * 0.34) % 130);
      drawPixelRect(x + 22, 410 - camera.y * 0.08, 28, 210, "#6a4a36");
      drawPixelRect(x - 8, 350 - camera.y * 0.08, 90, 82, "#245d43");
      drawPixelRect(x + 12, 310 - camera.y * 0.08, 76, 70, "#2f7a4f");
    }
  }

  if (biome.name === "海洋") {
    const waterY = 530 - camera.y * 0.1;
    drawPixelRect(0, waterY, W, H - waterY, "rgba(38,154,203,0.42)");
    for (let i = 0; i < 18; i++) {
      drawPixelRect(i * 94 - ((camera.x * 0.45) % 94), waterY + 38 + Math.sin(time * 0.04 + i) * 8, 46, 5, "#d8fbff");
    }
  }

  if (biome.name === "天空") {
    for (let i = -1; i < 9; i++) {
      const x = i * 220 - ((camera.x * 0.24) % 220);
      drawPixelRect(x, 450 - camera.y * 0.15, 140, 28, "rgba(255,255,255,0.52)");
      drawPixelRect(x + 36, 425 - camera.y * 0.15, 92, 28, "rgba(255,255,255,0.52)");
    }
  }
}

function drawTile(s) {
  const x = s.x - camera.x;
  const y = s.y - camera.y;
  let top = "#74c86b";
  let side = "#3f914e";
  let dirt = "#7a583e";
  if (s.type === "forest") {
    top = "#3fa45e"; side = "#28684b"; dirt = "#594130";
  }
  if (s.type === "sand") {
    top = "#ffe29a"; side = "#d49d59"; dirt = "#9a7957";
  }
  if (s.type === "ocean") {
    top = "#55d2d8"; side = "#2388ad"; dirt = "#21627f";
  }
  if (s.type === "cloud") {
    top = "#ffffff"; side = "#cce8ff"; dirt = "#8db4e8";
  }
  drawPixelRect(x, y, s.w, 10, top);
  drawPixelRect(x, y + 10, s.w, s.h - 10, s.h > 40 ? dirt : side);
  for (let tx = 0; tx < s.w; tx += TILE) {
    drawPixelRect(x + tx + 3, y + 3, 12, 4, "rgba(255,255,255,0.28)");
  }
}

function drawGems() {
  for (const gem of gems) {
    if (gem.got) continue;
    const x = gem.x - camera.x;
    const y = gem.y - camera.y + Math.sin(time * 0.06 + gem.bob) * 7;
    drawPixelRect(x + 8, y, 7, 4, "#fff7a8");
    drawPixelRect(x + 4, y + 4, 15, 7, "#ffe16a");
    drawPixelRect(x, y + 11, 23, 7, "#ff9f48");
    drawPixelRect(x + 5, y + 18, 13, 5, "#c75c5c");
  }
}

function drawCheckpoints() {
  for (const cp of checkpoints) {
    const x = cp.x - camera.x;
    const y = cp.y - camera.y;
    drawPixelRect(x + 16, y + 8, 8, 62, "#594130");
    drawPixelRect(x + 24, y + 8, 38, 26, cp.active ? "#ffe16a" : "#ff7b7b");
    drawPixelRect(x + 28, y + 14, 20, 6, "#fff7a8");
    drawPixelRect(x + 4, y + 66, 44, 8, "#24315c");
  }
}

function drawSprings() {
  for (const s of springs) {
    const x = s.x - camera.x;
    const y = s.y - camera.y;
    const lift = s.pulse > 0 ? -8 : 0;
    drawPixelRect(x, y + 10, 36, 8, "#315c48");
    drawPixelRect(x + 4, y + lift, 28, 14, "#ff7ab8");
    drawPixelRect(x + 10, y + lift - 6, 16, 8, "#ffe16a");
  }
}

function drawCreatures() {
  for (const c of creatures) {
    const x = c.x - camera.x;
    const y = c.y - camera.y;

    if (c.type === "dolphin") {
      drawPixelRect(x + 4, y + 12, 34, 16, "#65d4ff");
      drawPixelRect(x + 28, y + 6, 18, 12, "#65d4ff");
      drawPixelRect(x, y + 18, 12, 8, "#2a83bd");
      drawPixelRect(x + 16, y + 2, 10, 12, "#2a83bd");
      drawPixelRect(x + 37, y + 10, 4, 4, "#24315c");
      drawPixelRect(x + 8, y + 30, 10, 4, "#d8fbff");
    }

    if (c.type === "shark") {
      drawPixelRect(x + 2, y + 12, 42, 18, "#55708e");
      drawPixelRect(x + 38, y + 17, 16, 10, "#55708e");
      drawPixelRect(x + 17, y + 2, 12, 14, "#31435f");
      drawPixelRect(x + 42, y + 16, 4, 4, "#ffffff");
      drawPixelRect(x + 46, y + 20, 4, 4, "#ffffff");
      drawPixelRect(x + 8, y + 30, 22, 5, "#d8fbff");
    }

    if (c.type === "bird") {
      drawPixelRect(x + 16, y + 10, 18, 12, "#ffe16a");
      drawPixelRect(x + 4, y + 8, 16, 6, "#f7fbff");
      drawPixelRect(x + 30, y + 8, 16, 6, "#f7fbff");
      drawPixelRect(x + 34, y + 13, 8, 5, "#ff9f48");
      drawPixelRect(x + 28, y + 12, 3, 3, "#24315c");
    }

    if (c.type === "eagle") {
      drawPixelRect(x + 18, y + 12, 24, 14, "#7a583e");
      drawPixelRect(x, y + 8, 24, 8, "#594130");
      drawPixelRect(x + 36, y + 8, 24, 8, "#594130");
      drawPixelRect(x + 40, y + 13, 10, 6, "#ffe16a");
      drawPixelRect(x + 34, y + 14, 4, 4, "#24315c");
      drawPixelRect(x + 20, y + 26, 12, 5, "#f7fbff");
    }
  }
}

function drawFinish() {
  const x = finish.x - camera.x;
  const y = finish.y - camera.y;
  drawPixelRect(x + 20, y + 40, 34, 170, "#f7fbff");
  drawPixelRect(x + 14, y + 34, 46, 18, "#24315c");
  drawPixelRect(x + 22, y + 18, 30, 22, won ? "#ffe16a" : "#78d7ff");
  drawPixelRect(x + 8, y, 58, 20, won ? "#fff7a8" : "#385b92");
  drawPixelRect(x + 28, y + 78, 18, 30, "#70b8ff");
  if (won || Math.sin(time * 0.08) > 0) {
    drawPixelRect(x - 26, y + 12, 122, 8, "rgba(255,225,106,0.52)");
  }
}

function drawPlayer() {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  const blink = player.invuln > 0 && Math.floor(time / 5) % 2 === 0;
  if (blink) return;

  if (!player.ground && (keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || touchKeys.has(" ")) && player.energy > 0) {
    drawPixelRect(x - 10, y + 12, 14, 18, "rgba(255,255,255,0.72)");
    drawPixelRect(x + player.w - 4, y + 12, 14, 18, "rgba(255,255,255,0.72)");
  }

  drawPixelRect(x + 5, y + 4, 16, 15, "#ffd3a3");
  drawPixelRect(x + 3, y + 17, 21, 17, "#2874d8");
  drawPixelRect(x + 7, y + 31, 6, 9, "#24315c");
  drawPixelRect(x + 17, y + 31, 6, 9, "#24315c");
  drawPixelRect(x + (player.face > 0 ? 17 : 5), y + 9, 4, 4, "#24315c");
  drawPixelRect(x + 2, y, 23, 7, "#d45252");
  drawPixelRect(x + (player.face > 0 ? -8 : 22), y + 20, 10, 6, "#ffd3a3");

  if (Math.abs(player.vx) > 7) {
    drawPixelRect(x - player.face * 18, y + 28, 12, 4, "#ffe16a");
    drawPixelRect(x - player.face * 30, y + 22, 16, 4, "#f7fbff");
  }
}

function drawMiniMap() {
  const mapW = 270;
  const mapH = 10;
  const x = W - mapW - 24;
  const y = H - 44;
  drawPixelRect(x - 4, y - 4, mapW + 8, mapH + 8, "rgba(35,48,82,0.8)");
  for (const b of biomes) {
    const bx = x + (b.start / WORLD_W) * mapW;
    const bw = ((b.end - b.start) / WORLD_W) * mapW;
    drawPixelRect(bx, y, bw, mapH, b.ground);
  }
  const px = x + (player.x / WORLD_W) * mapW;
  drawPixelRect(px - 3, y - 5, 6, 20, "#ffe16a");
}

function draw() {
  const biome = biomeAt(player.x);
  biomeName.textContent = biome.name;
  drawBackground(biome);

  ctx.save();
  solids.forEach(drawTile);
  drawFinish();
  drawCheckpoints();
  drawSprings();
  drawCreatures();
  drawGems();
  drawPlayer();
  ctx.restore();

  drawMiniMap();
  gemCount.textContent = `宝石 ${player.gems} / ${MAX_GEMS}`;
  energyText.textContent = `飞翔 ${Math.round(player.energy)}%`;

  if (messageTimer > 0) {
    messageTimer -= 1;
    toast.hidden = false;
    toast.textContent = messageText;
  } else {
    toast.hidden = true;
  }
}

function loop() {
  time += 1;
  if (started) {
    updatePlayer();
    updateCamera();
  }
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Shift"].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  if (!started && (event.key === "Enter" || event.key === " ")) {
    startButton.click();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

document.querySelectorAll("[data-key]").forEach((button) => {
  const key = button.dataset.key;
  const press = (event) => {
    event.preventDefault();
    touchKeys.add(key);
    button.classList.add("is-pressed");
    if (!started) startButton.click();
  };
  const release = (event) => {
    event.preventDefault();
    touchKeys.delete(key);
    button.classList.remove("is-pressed");
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

window.addEventListener("blur", () => {
  touchKeys.clear();
  document.querySelectorAll(".touch-btn").forEach((button) => button.classList.remove("is-pressed"));
});

startButton.addEventListener("click", () => {
  started = true;
  startButton.classList.add("hidden");
  showMessage("向右出发，Shift 疾跑，长按跳跃可以飞翔。");
});

restartButton.addEventListener("click", restartGame);

buildWorld();
checkpoints[0].active = true;
loop();
