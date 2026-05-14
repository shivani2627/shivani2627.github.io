# Shivani Harode — UI/UX Designer Portfolio

**Live portfolio:** [your-username.github.io](https://your-username.github.io) *(update after deploying)*

---

## About

This is the source code for my personal UX/UI design portfolio. It features case studies for:

- **Missouri DESE School Finance Application** *(Current)*
- **PROTECT Case Management System** — State of Wisconsin
- **HP Managed Print Services**

---

## Project Structure

```
portfolio/
├── index.html                  ← Main portfolio page
├── resume.pdf                  ← Your resume (add this file)
├── images/
│   ├── dese-dashboard.jpg      ← DESE project preview
│   └── protect-preview.jpg     ← PROTECT project preview
├── case-studies/
│   ├── missouri-dese.html      ← Missouri DESE full case study
│   ├── protect.html            ← PROTECT overview (all 5 projects)
│   ├── protect-logo.html       ← PROTECT Logo & Identity
│   ├── protect-details.html    ← PROTECT Details Pane
│   ├── protect-efiling.html    ← PROTECT eFiling Site
│   ├── protect-xcq.html        ← PROTECT XCQ Inter-County Query
│   └── hp-mps.html             ← HP Managed Print Services
└── README.md
```

---

## Deploying to GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `your-username.github.io` (replace `your-username` with your actual GitHub username)
3. Set it to **Public**
4. Click **Create repository**

### Step 2 — Upload files

**Option A — GitHub web interface (easiest):**
1. Open your new repository on GitHub
2. Click **"Add file" → "Upload files"**
3. Drag all files from this folder into the upload area  
   ⚠️ Make sure to upload the **entire folder structure** (including `case-studies/` and `images/`)
4. Click **"Commit changes"**

**Option B — Git command line:**
```bash
cd path/to/portfolio
git init
git add .
git commit -m "Initial portfolio deploy"
git branch -M main
git remote add origin https://github.com/your-username/your-username.github.io.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **"Deploy from a branch"**
3. Select **`main`** branch, **`/ (root)`** folder
4. Click **Save**
5. Wait 1–2 minutes, then visit `https://your-username.github.io`

---

## Adding Your Resume

1. Save your resume as `resume.pdf`
2. Place it in the **root folder** (same level as `index.html`)
3. The "Download Resume" button will automatically work

---

## Customization

### Update your contact info
All contact details are in `index.html`. Search for:
- `Shivaniharode@gmail.com` — your email
- `6089823299` — your phone number  
- `shivani-harode-b00625147` — your LinkedIn slug

### Add your photo
Replace the `SH` initials placeholder in the About section with a real photo:
1. Add your photo to the `images/` folder as `profile.jpg`
2. In `index.html`, find the `.about-initials` div and replace with:
```html
<img src="images/profile.jpg" alt="Shivani Harode" style="width:100%;height:100%;object-fit:cover">
```

---

## Tech Stack

- **Pure HTML/CSS/JS** — no build tools, no dependencies, no npm
- **Google Fonts** — Fraunces, DM Sans, DM Mono
- **GitHub Pages compatible** — deploy directly, no server needed
- Images are **base64 embedded** in case study pages — fully self-contained

---

## Contact

**Shivani Harode** · Senior UI/UX Designer  
📧 Shivaniharode@gmail.com  
📞 (608) 982-3299  
💼 [linkedin.com/in/shivani-harode-b00625147](https://www.linkedin.com/in/shivani-harode-b00625147)  
📍 Frisco, TX
