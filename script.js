
const canvas = document.getElementById("batCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let time = 0;
let mouse = { x: -1000, y: -1000 };

// Low-resolution pixel art sprite.
// Each character represents one pixel.
const batFrames = [
  [
    "1000000000000001",
    "1100000000000011",
    "1110000000000111",
    "0111000000001110",
    "0011100000011100",
    "0001110011111000",
    "0000111111110000",
    "0000011221000000",
    "0000011221000000",
    "0000011111000000",
    "0000001001000000"
  ],
  [
    "0000000000000000",
    "0000000000000000",
    "1000000000000001",
    "1100000000000011",
    "0110000000000110",
    "0011000000001100",
    "0001110011111000",
    "0000111111110000",
    "0000011221000000",
    "0000011111000000",
    "0000001001000000"
  ]
];

const stars = [];
const particles = [];

const bat = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  size: 3
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  stars.length = 0;

  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.8 ? 2 : 3,
      phase: Math.random() * Math.PI * 2
    });
  }

  if (!bat.x) {
    bat.x = width * 0.5;
    bat.y = height * 0.55;
  }
}

window.addEventListener("resize", resize);
resize();

canvas.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

canvas.addEventListener("mouseleave", () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

canvas.addEventListener("click", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  for (let i = 0; i < 12; i++) {
    particles.push({
      x: bat.x,
      y: bat.y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 30 + Math.random() * 20
    });
  }
});

function drawMoon() {
  const mx = width * 0.78;
  const my = height * 0.27;

  ctx.fillStyle = "#dfe3ff";
  ctx.beginPath();
  ctx.arc(mx, my, 38, 0, Math.PI * 2);
  ctx.fill();

  // Dark circle creates a crescent moon.
  ctx.fillStyle = "#080b18";
  ctx.beginPath();
  ctx.arc(mx + 16, my - 12, 34, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars() {
  for (const star of stars) {
    const alpha =
      0.35 + 0.65 * Math.abs(Math.sin(time * 0.025 + star.phase));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#dbe2ff";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  ctx.globalAlpha = 1;
}

function drawBat() {
  const frame = Math.floor(time / 8) % 2;
  const sprite = batFrames[frame];

  // Turn the bat toward its direction of travel.
  const facingLeft = bat.vx < -0.2;

  const pixel = 3;
  const spriteWidth = sprite[0].length * pixel;
  const spriteHeight = sprite.length * pixel;

  ctx.save();
  ctx.translate(bat.x, bat.y);
  ctx.scale(facingLeft ? -1 : 1, 1);

  // Soft purple glow.
  ctx.shadowColor = "#9385ff";
  ctx.shadowBlur = 18;

  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const value = sprite[row][col];

      if (value === "0") continue;

      if (value === "1") {
        ctx.fillStyle = "#7774bc";
      } else {
        ctx.fillStyle = "#ff4f88";
      }

      ctx.fillRect(
        -spriteWidth / 2 + col * pixel,
        -spriteHeight / 2 + row * pixel,
        pixel,
        pixel
      );
    }
  }

  ctx.shadowBlur = 0;

  // Glowing eyes.
  ctx.fillStyle = "#ff456e";
  ctx.fillRect(-5, -1, 3, 3);
  ctx.fillRect(2, -1, 3, 3);

  ctx.restore();
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    ctx.globalAlpha = Math.max(0, p.life / 50);
    ctx.fillStyle = "#a7a0ff";
    ctx.fillRect(p.x, p.y, 3, 3);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  ctx.globalAlpha = 1;
}

function animate() {
  time++;

  ctx.fillStyle = "#080b18";
  ctx.fillRect(0, 0, width, height);

  drawStars();
  drawMoon();

  // Move toward the mouse when it is nearby.
  if (mouse.x > 0 && mouse.x < width &&
      mouse.y > 0 && mouse.y < height) {
    const dx = mouse.x - bat.x;
    const dy = mouse.y - bat.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 20) {
      bat.vx += (dx / distance) * 0.12;
      bat.vy += (dy / distance) * 0.12;
    }
  } else {
    // Otherwise, fly in a gentle looping path.
    const targetX = width * 0.5 +
      Math.sin(time * 0.012) * width * 0.25;

    const targetY = height * 0.55 +
      Math.sin(time * 0.025) * height * 0.12;

    bat.vx += (targetX - bat.x) * 0.0008;
    bat.vy += (targetY - bat.y) * 0.0008;
  }

  // Limit speed and add smooth movement.
  bat.vx *= 0.97;
  bat.vy *= 0.97;

  bat.vx = Math.max(-5, Math.min(5, bat.vx));
  bat.vy = Math.max(-4, Math.min(4, bat.vy));

  bat.x += bat.vx;
  bat.y += bat.vy;

  // Keep the bat on the screen.
  bat.x = Math.max(40, Math.min(width - 40, bat.x));
  bat.y = Math.max(40, Math.min(height - 40, bat.y));

  drawBat();
  updateParticles();

  requestAnimationFrame(animate);
}

animate();
