const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

// Icon Upload
const upload = multer({ dest: 'artikel/icons/' });

// Artikel erstellen
app.post('/api/artikel', upload.single('icon'), (req, res) => {
  const { title, description, category, tags, content } = req.body;
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 1. Icon umbenennen
  let iconPath = `artikel/icons/${id}.png`;
  if (req.file) {
    fs.renameSync(req.file.path, iconPath);
  } else {
    iconPath = 'https://mc-heads.net/avatar/MHF_Creeper/100';
  }

  // 2. .md Datei erstellen
  const mdContent = `# ${title}\n\n${content}`;
  fs.writeFileSync(`artikel/${id}.md`, mdContent);

  // 3. In articles.json eintragen
  const jsonPath = 'artikel/articles.json';
  let articles = [];
  if (fs.existsSync(jsonPath)) articles = JSON.parse(fs.readFileSync(jsonPath));
  
  articles.push({
    id, title, description, category,
    icon: iconPath,
    file: `artikel/${id}.md`,
    tags: tags.split(',').map(t => t.trim().toLowerCase())
  });
  fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2));

  res.json({ success: true, id });
});

app.listen(PORT, () => console.log(`Backend läuft auf ${PORT}`));
