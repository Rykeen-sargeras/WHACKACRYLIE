<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#17171c" />
  <meta name="description" content="A cartoon office point-and-click parody." />
  <title>Whack Crylie</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Inter:wght@500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <section id="disclaimerScreen" class="disclaimer-screen" role="dialog" aria-modal="true" aria-labelledby="disclaimerTitle">
    <div class="warning-banner">CARTOON VIOLENCE • SATIRE • STRONG LANGUAGE • 18+</div>
    <div class="disclaimer-card">
      <h2 id="disclaimerTitle">WHACK CRYLIE</h2>
      <p class="disclaimer-subtitle">A totally serious office simulator.</p>
      <div class="fake-loader"><span>Loading office supplies...</span><div><i></i></div></div>
      <h3>DISCLAIMER</h3>
      <p>This work is an independent parody created for entertainment purposes only and is not associated with, endorsed by, sponsored by, or affiliated with any individual, company, organization, or private entity.</p>
      <p>All trademarks, service marks, logos, names, and other intellectual property remain the property of their respective owners.</p>
      <p>This game contains exaggerated cartoon violence, detachable cartoon limbs, red paint effects, satire, crude humor, and fictional scenarios. It does not encourage real-world violence.</p>
      <p class="disclaimer-joke">No crybaby bitches were hurt in the making of this game.</p>
      <p class="age-warning">18+ ONLY</p>
      <label class="disclaimer-check"><input id="agreeBox" type="checkbox" /> I understand this is parody and confirm I am at least 18 years old.</label>
      <button id="enterGame" class="enter-button" type="button" disabled>ENTER THE OFFICE</button>
    </div>
  </section>

  <main class="app-shell" aria-hidden="true">
    <header class="topbar">
      <div>
        <p class="eyebrow">A POINT-AND-CLICK OFFICE PARODY</p>
        <h1>WHACK <span>CRYLIE</span></h1>
      </div>
      <div class="header-actions">
        <label class="upload-button" for="avatarInput">Upload PNG</label>
        <input id="avatarInput" type="file" accept="image/png,image/webp,image/jpeg" hidden />
        <button id="clearAvatar" class="secondary-button" type="button">Reset Face</button>
      </div>
    </header>

    <section class="status-panel" aria-live="polite">
      <div><strong id="foundCount">0</strong>/<span id="totalCount">8</span> gags found</div>
      <div id="statusText">Click suspicious office objects.</div>
      <button id="cleanerButton" class="cleaner-button" type="button">🧽 CLEANER</button>
    </section>

    <section id="gameStage" class="game-stage" aria-label="Cartoon office scene">
      <div class="wall-poster">TEAMWORK<br><small>because panic alone isn't enough</small></div>
      <div class="window"><div class="city"></div></div>
      <div class="clock"><span></span></div>
      <div class="floor-shadow"></div>

      <div id="boss" class="boss character">
        <div class="boss-head">
          <div id="avatarFrame" class="avatar-frame" aria-label="Uploaded character image">
            <div id="defaultFace" class="default-face">
              <span class="hair"></span><span class="eye left"></span><span class="eye right"></span>
              <span class="brow left"></span><span class="brow right"></span><span class="mouth"></span>
            </div>
            <img id="avatarImage" alt="Custom uploaded character" />
          </div>
        </div>
        <div class="boss-body"><span class="tie"></span></div>
        <span class="boss-limb boss-arm boss-arm-left" data-limb="left-arm"></span>
        <span class="boss-limb boss-arm boss-arm-right" data-limb="right-arm"></span>
        <span class="boss-limb boss-leg boss-leg-left" data-limb="left-leg"></span>
        <span class="boss-limb boss-leg boss-leg-right" data-limb="right-leg"></span>
        <div class="speech-bubble" id="speechBubble">I need that report yesterday!</div>
      </div>

      <div id="worker" class="worker character">
        <div class="worker-head"><span class="worker-hair"></span><span class="worker-face">•_•</span></div>
        <div class="worker-body"></div>
      </div>

      <div class="desk">
        <button class="hotspot stapler" data-action="stapler" aria-label="Stapler"><span></span></button>
        <button class="hotspot mug" data-action="mug" aria-label="Coffee mug">☕</button>
        <button class="hotspot keyboard" data-action="keyboard" aria-label="Keyboard"></button>
        <button class="hotspot phone" data-action="phone" aria-label="Office phone">☎</button>
        <button class="hotspot pencil-cup" data-action="pencils" aria-label="Pencil cup"><i></i><i></i><i></i></button>
        <button class="hotspot monitor" data-action="monitor" aria-label="Computer monitor"><span>404<br>BOSS<br>NOT FOUND</span></button>
        <button class="hotspot paperwork" data-action="paperwork" aria-label="Stack of paperwork"><i></i><i></i><i></i></button>
        <button class="hotspot lamp" data-action="lamp" aria-label="Desk lamp"><span></span></button>
        <button class="hotspot scissors" data-action="scissors" aria-label="Scissors">✂</button>
        <button class="hotspot hole-punch" data-action="holepunch" aria-label="Hole punch">●●</button>
        <button class="hotspot trophy" data-action="trophy" aria-label="Office trophy">★</button>
        <button class="hotspot briefcase" data-action="briefcase" aria-label="Briefcase"><span></span></button>
      </div>


      <button class="hotspot floor-item extinguisher" data-action="extinguisher" aria-label="Fire extinguisher"><span></span></button>
      <button class="hotspot floor-item rolling-chair" data-action="chair" aria-label="Rolling office chair"><span></span></button>
      <button class="hotspot floor-item trash-can" data-action="trashcan" aria-label="Trash can">🗑</button>
      <button class="hotspot floor-item water-cooler" data-action="watercooler" aria-label="Water cooler"><span></span></button>

      <div id="fxLayer" class="fx-layer" aria-hidden="true"></div>
      <div id="impactText" class="impact-text"></div>
      <div id="curtain" class="curtain"><span>Scene complete!</span><small>Press CLEANER to reset</small></div>
    </section>

    <footer>
      <p>Cartoon slapstick only. Uploaded images stay in your browser and are not sent to the server.</p>
    </footer>
  </main>

  <script src="game.js" defer></script>
</body>
</html>
