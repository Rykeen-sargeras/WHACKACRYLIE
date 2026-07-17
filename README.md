# Whack Crylie

A GitHub- and Railway-ready cartoon office point-and-click parody inspired by the discovery-loop of classic Flash games. Players upload a PNG/JPG/WebP as the cartoon boss face, click office objects, discover eight non-graphic slapstick animations, and use the **Cleaner** button to reset the scene.

## Features

- Custom character-face upload
- Image is stored only in the player's browser using `localStorage`
- Eight clickable office-object gags
- Discovery counter and saved progress
- Responsive desktop/mobile layout
- Express static server
- Railway-compatible `PORT` handling and `0.0.0.0` binding
- `/health` endpoint

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy from GitHub to Railway

1. Create a new GitHub repository.
2. Upload all files from this project and push them to the main branch.
3. In Railway, create a new project and choose **Deploy from GitHub repo**.
4. Select the repository.
5. Railway should detect the Node app and run `npm start`.
6. In the service's Networking settings, generate a public domain.

No environment variables are required. Railway supplies `PORT`, which `server.js` reads automatically.

## Replace the title or dialogue

- Page title and interface copy: `public/index.html`
- Action names, impact words, and dialogue: `public/game.js`
- Art direction and layout: `public/styles.css`

## Add another clickable gag

1. Add a button with class `hotspot` and a unique `data-action` in `public/index.html`.
2. Style the object in `public/styles.css`.
3. Add a matching entry to the `actions` object in `public/game.js`.
4. Optionally add a `body.action-yourname` animation rule.

## Content note

This project intentionally uses non-graphic cartoon slapstick. Do not use it to threaten, harass, or encourage real-world harm toward an identifiable person.

## Railway build-error repair

This version intentionally uses Railway's default **Railpack** Node builder and does not include a Dockerfile. Railway detects `package.json`, installs dependencies, and runs `npm start`.

If an older deployment still reports `dockerfile parse error ... unknown instruction: const`, verify the GitHub repository root does not contain an incorrectly created file named `Dockerfile`, then push this version and redeploy. In Railway, the service Root Directory should be `/` unless these files are inside a subfolder.
