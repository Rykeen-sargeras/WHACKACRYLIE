const disclaimerScreen = document.querySelector('#disclaimerScreen');
const agreeBox = document.querySelector('#agreeBox');
const enterGame = document.querySelector('#enterGame');
const appShell = document.querySelector('.app-shell');
agreeBox.addEventListener('change', () => { enterGame.disabled = !agreeBox.checked; });
enterGame.addEventListener('click', () => { disclaimerScreen.classList.add('dismissed'); appShell.removeAttribute('aria-hidden'); });

const avatarInput = document.querySelector('#avatarInput');
const avatarImage = document.querySelector('#avatarImage');
const avatarFrame = document.querySelector('#avatarFrame');
const clearAvatar = document.querySelector('#clearAvatar');
const cleanerButton = document.querySelector('#cleanerButton');
const hotspots = [...document.querySelectorAll('.hotspot')];
const statusText = document.querySelector('#statusText');
const foundCount = document.querySelector('#foundCount');
const totalCount = document.querySelector('#totalCount');
const speechBubble = document.querySelector('#speechBubble');
const impactText = document.querySelector('#impactText');
const curtain = document.querySelector('#curtain');
const fxLayer = document.querySelector('#fxLayer');

const STORAGE_AVATAR = 'whack-crylie-avatar';
const STORAGE_FOUND = 'whack-crylie-found';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
let busy = false;
let found = new Set(JSON.parse(localStorage.getItem(STORAGE_FOUND) || '[]'));

const actions = {
  stapler: { text: 'KA-CHUNK!', line: 'Please circle back... after lunch.', duration: 1800, fx: () => comboFx(stars) },
  mug: { text: 'SPLASH!', line: 'This meeting could have been an email!', duration: 1800, fx: () => comboFx(coffee) },
  keyboard: { text: 'TYPE FASTER!', line: 'Per my last email: AAAAAAA!', duration: 1900, fx: () => comboFx(keys) },
  phone: { text: 'RING-A-DING!', line: 'Tell them I am in a synergy emergency.', duration: 1900, fx: () => comboFx(phones) },
  pencils: { text: 'POINT TAKEN!', line: 'Let us sharpen our priorities.', duration: 1800, fx: () => comboFx(pencils) },
  monitor: { text: 'CTRL + ALT + YEET!', line: 'Your access has been... restructured.', duration: 2100, fx: () => comboFx(stars, 14) },
  paperwork: { text: 'PAPER STORM!', line: 'Here is that light reading you requested.', duration: 2100, fx: () => comboFx(papers) },
  lamp: { text: 'BRIGHT IDEA!', line: 'Let me shed some light on the issue.', duration: 1900, fx: () => comboFx(stars) },
  scissors: { text: 'SNIP HAPPENS!', line: 'Let us cut this meeting short.', duration: 1900, fx: () => comboFx(confetti, 12) },
  holepunch: { text: 'PUNCH LIST!', line: 'I found a hole in your management plan.', duration: 1900, fx: () => comboFx(confetti, 12) },
  trophy: { text: 'EMPLOYEE OF THE YEET!', line: 'Congratulations on your sudden promotion.', duration: 2100, fx: () => comboFx(stars, 14) },
  briefcase: { text: 'CASE CLOSED!', line: 'I packed your quarterly feedback.', duration: 2000, fx: () => comboFx(papers, 12) },
  extinguisher: { text: 'FOAM SWEET FOAM!', line: 'This workplace fire is now under control.', duration: 2200, fx: () => comboFx(foam, 8) },
  chair: { text: 'HOSTILE ROLLOVER!', line: 'Please take a seat somewhere else.', duration: 2200, fx: () => comboFx(stars, 14) },
  trashcan: { text: 'TRASH TALK!', line: 'Your proposal has entered the circular filing system.', duration: 2100, fx: () => comboFx(papers, 12) },
  watercooler: { text: 'WATER YOU DOING?!', line: 'Let us circle back after you dry off.', duration: 2200, fx: () => comboFx(water, 10) }
};

totalCount.textContent = Object.keys(actions).length;

function updateFoundUI() {
  foundCount.textContent = found.size;
  hotspots.forEach(button => button.classList.toggle('found', found.has(button.dataset.action)));
  localStorage.setItem(STORAGE_FOUND, JSON.stringify([...found]));
  if (found.size === Object.keys(actions).length) statusText.textContent = 'All office gags discovered!';
}

function loadSavedAvatar() {
  const saved = localStorage.getItem(STORAGE_AVATAR);
  if (!saved) return;
  avatarImage.src = saved;
  avatarFrame.classList.add('has-image');
}

avatarInput.addEventListener('change', () => {
  const file = avatarInput.files?.[0];
  if (!file) return;
  if (!['image/png', 'image/webp', 'image/jpeg'].includes(file.type)) {
    statusText.textContent = 'Please choose a PNG, JPG, or WebP image.';
    avatarInput.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    statusText.textContent = 'That image is too large. Keep it under 4 MB.';
    avatarInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result);
    avatarImage.src = result;
    avatarFrame.classList.add('has-image');
    try {
      localStorage.setItem(STORAGE_AVATAR, result);
      statusText.textContent = 'Custom face loaded. Click an office object.';
    } catch {
      statusText.textContent = 'Face loaded for this session, but the browser could not save it.';
    }
  };
  reader.readAsDataURL(file);
});

clearAvatar.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_AVATAR);
  avatarImage.removeAttribute('src');
  avatarFrame.classList.remove('has-image');
  avatarInput.value = '';
  statusText.textContent = 'Default cartoon face restored.';
});

cleanerButton.addEventListener('click', resetScene);

hotspots.forEach(button => {
  button.addEventListener('click', () => playAction(button.dataset.action));
});

function playAction(name) {
  if (busy || !actions[name]) return;
  busy = true;
  const action = actions[name];
  document.body.classList.add('playing', `action-${name}`);
  speechBubble.textContent = action.line;
  statusText.textContent = `Playing: ${name}`;
  showImpact(action.text);
  action.fx();
  found.add(name);
  updateFoundUI();

  window.setTimeout(() => curtain.classList.add('show'), action.duration - 450);
  window.setTimeout(() => { busy = false; }, action.duration);
}

function resetScene() {
  document.body.className = '';
  busy = false;
  curtain.classList.remove('show');
  fxLayer.replaceChildren();
  impactText.classList.remove('show');
  speechBubble.textContent = 'I need that report yesterday!';
  statusText.textContent = found.size === Object.keys(actions).length
    ? 'All office gags discovered! Click one again or reset your progress below.'
    : 'Click another suspicious office object.';
}

function showImpact(text) {
  impactText.textContent = text;
  impactText.classList.remove('show');
  void impactText.offsetWidth;
  impactText.classList.add('show');
}

function makeFx(className, count, content = '') {
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('span');
    el.className = className;
    el.textContent = content;
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.top = `${-10 + Math.random() * 45}%`;
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    fxLayer.appendChild(el);
  }
}
function papers() { makeFx('fx-paper', 18); }
function pencils() { makeFx('fx-pencil', 10); }
function keys() { makeFx('fx-key', 20); }
function coffee() { makeFx('fx-coffee', 3); }
function stars() { makeFx('fx-star', 8, '★'); }
function phones() { makeFx('fx-star', 7, '☎'); }
function foam() { makeFx('fx-foam', 10); }
function water() { makeFx('fx-water', 18); }
function confetti() { makeFx('fx-confetti', 16); }
function paintSplashes(count = 10) { makeFx('fx-paint', count); }
function comboFx(primary, paintCount = 10) { primary(); window.setTimeout(() => paintSplashes(paintCount), 260); }

loadSavedAvatar();
updateFoundUI();
