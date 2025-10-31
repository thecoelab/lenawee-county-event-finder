<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nJHJvfFL288jgMNKDBKheTZ-tTFwpf9Z

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Docker (optional)

Build and run the production container (multi-stage build using the included `Dockerfile`):

```bash
# build the image
docker build -t lenawee-event-finder .

# run the container (maps container port 80 → localhost:8080)
docker run --rm -d -p 8080:80 --name lenawee-test lenawee-event-finder

# verify
curl -I http://localhost:8080
```

Stop the running container:

```bash
docker stop lenawee-test
```

Publishing to GitHub Container Registry (GHCR)
-------------------------------------------

Automate publishing via GitHub Actions:

- I added a workflow at `.github/workflows/publish-image.yml` that builds and pushes the image to GHCR when you push to `main`.
- The workflow tags images as `ghcr.io/<OWNER>/lenawee-event-finder:latest` and `ghcr.io/<OWNER>/lenawee-event-finder:<commit-sha>`.

Manual push (one-off)

1. Tag the local image (replace OWNER with your GitHub username or org):

```bash
docker tag lenawee-event-finder:latest ghcr.io/OWNER/lenawee-event-finder:1.0.0
```

2. Authenticate to GHCR (use a Personal Access Token with `write:packages` or use GITHUB CLI):

```bash
# using docker login and a PAT
echo "YOUR_GHCR_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# or using GitHub CLI (recommended)
gh auth login
gh auth refresh -h ghcr.io -s write:packages
```

3. Push the image:

```bash
docker push ghcr.io/OWNER/lenawee-event-finder:1.0.0
```

Once pushed, you'll find the image under your GitHub Packages / Container registry for the OWNER you used.
