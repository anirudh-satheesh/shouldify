const answers = {
  basic: ["YES", "NO", "MAYBE"],
  funny: ["HECK YES 💥", "NOPE 🙅", "ASK YOUR CAT 🐱", "MEH 😑"],
  "8ball": [
    "It is certain.",
    "Ask again later.",
    "Don’t count on it.",
    "Outlook good.",
    "Very doubtful.",
    "Yes, definitely.",
    "My sources say no.",
    "Signs point to yes."
  ]
};

const reasons = {
  YES: ["You already know it’s time.", "Go for it!", "Trust your instinct."],
  NO: ["Not now, maybe later.", "Think twice.", "Better wait a bit."],
  MAYBE: ["Flip a coin.", "Sleep on it.", "Ask again tomorrow."],
  FUNNY: ["The universe just giggled.", "Don’t say I didn’t warn you.", "Well... that’s random."],
  DEFAULT: ["The stars have spoken.", "Take it or leave it.", "Follow your heart."]
};

const resultEl = document.getElementById("result");
const againBtn = document.getElementById("againBtn");
const fortuneEl = document.getElementById("fortune");
const shareEl = document.getElementById("shareSection");

function decide() {
  const question = document.getElementById('question').value.trim();
  document.getElementById('questionDisplay').textContent = question ? `Should I... ${question}` : '';

  const mode = document.getElementById("answerMode").value;

  if (!question) {
    resultEl.innerHTML = "🤔 Ask something!";
    return;
  }

  document.getElementById('captureArea').classList.remove('hidden'); // <-- Move here

  const pool = answers[mode];
  const answer = pool[Math.floor(Math.random() * pool.length)];

  resultEl.innerHTML = "";
  let i = 0;

  const animate = setInterval(() => {
    resultEl.innerHTML = pool[Math.floor(Math.random() * pool.length)];
    i++;
    if (i > 10) {
      clearInterval(animate);
      resultEl.innerHTML = answer;

      let fortune;
      if (mode === "basic") {
        if (answer.includes("YES")) fortune = pick(reasons.YES);
        else if (answer.includes("NO")) fortune = pick(reasons.NO);
        else fortune = pick(reasons.MAYBE);
      } else if (mode === "funny") {
        fortune = pick(reasons.FUNNY);
      } else {
        fortune = pick(reasons.DEFAULT);
      }

      fortuneEl.innerHTML = `"${fortune}"`;
      againBtn.classList.remove("hidden");
      shareEl.classList.remove("hidden");
      window.lastDecision = { question, answer };
      document.getElementById('captureArea').classList.remove('hidden');
    }
  }, 100);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function reset() {
  document.getElementById("question").value = "";
  document.getElementById("questionDisplay").textContent = "";
  resultEl.innerHTML = "";
  fortuneEl.innerHTML = "";
  againBtn.classList.add("hidden");
  shareEl.classList.add("hidden");
  resultEl.classList.remove("ai-response");
  document.getElementById('captureArea').classList.add('hidden'); // <-- Hide captureArea on reset
}

function downloadImage() {
  const captureArea = document.getElementById('captureArea');
  const resultCard = document.getElementById('resultCard');
  const watermark = document.getElementById('watermark');

  // Save original styles
  const originalCaptureBg = captureArea.style.background;
  const originalColor = captureArea.style.color;
  const originalCardBg = resultCard.style.background;
  const originalDisplay = watermark.style.display;

  // Ensure watermark is visible before capture
  watermark.style.display = 'block';

  // Optional: Set background to solid for better contrast in the image
  captureArea.style.background = "#2d0260";
  captureArea.style.color = "#ffffff";
  resultCard.style.background = "#4f46e5";

  html2canvas(captureArea, {
    backgroundColor: null,
    scale: 2
  }).then(canvas => {
    // Restore original styles
    captureArea.style.background = originalCaptureBg;
    captureArea.style.color = originalColor;
    resultCard.style.background = originalCardBg;
    watermark.style.display = originalDisplay;

    const link = document.createElement('a');
    link.download = 'should-i-decide.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

const apiKey = "{{API_KEY}}"; // ← Replace this with your api key

async function askAI(question) {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: question })
  });

  const data = await response.json();
  console.log(data);
  if (data.error) {
    return `⚠️ Error: ${data.error.message}`;
  }
  const answer = data.choices?.[0]?.message?.content || "No response.";
  return answer;
}

async function decideWithAI() {
  const questionInput = document.getElementById('question');
  const question = questionInput.value.trim();
  if (!question) {
    resultEl.innerHTML = "🤖 Ask me a real question!";
    return;
  }

  document.getElementById('questionDisplay').textContent = `Should I... ${question}`;
  resultEl.innerHTML = "Thinking... 🤔";
  fortuneEl.innerHTML = "";
  againBtn.classList.add("hidden");
  shareEl.classList.add("hidden");
  document.getElementById('captureArea').classList.remove('hidden'); // <-- Move here

  try {
    const aiAnswer = await askAI(question);
    resultEl.classList.add("ai-response");
    resultEl.innerHTML = (aiAnswer && aiAnswer.split(' ').slice(0, 50).join(' ')) || "Hmm... couldn't think of anything clever.";
    fortuneEl.innerHTML = `"Follow your curiosity."`;
    againBtn.classList.remove("hidden");
    shareEl.classList.remove("hidden");
    window.lastDecision = { question, answer: aiAnswer };
  } catch (err) {
    resultEl.innerHTML = "⚠️ Oops! Something went wrong with the AI.";
    console.error(err);
  }
}
