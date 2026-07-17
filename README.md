# Whack Crylie — Railway Static Deployment

This version intentionally contains no Dockerfile, package.json, package-lock.json, server.js, or railway.json.
Railway Railpack detects the root index.html/Staticfile and serves the game as a static site with Caddy.

## Deploy
1. Delete every existing file from the GitHub repository.
2. Extract this ZIP locally.
3. Upload these five files directly to the repository root:
   - index.html
   - styles.css
   - game.js
   - Staticfile
   - README.md
4. Commit the files.
5. In Railway, redeploy the latest commit.
6. Remove any custom Build Command or Start Command from Railway service settings.

The uploaded face image stays in the player's browser and is not uploaded to a server.
