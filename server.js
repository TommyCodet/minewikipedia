require('dotenv').config();
const express=require('express');const fs=require('fs');const path=require('path');const multer=require('multer');
const app=express();const PORT=process.env.PORT||3000;
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASS=process.env.ADMIN_PASS||'change-me';
app.use(express.json());app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use('/artikel',express.static('artikel'));
const upload=multer({dest:'public/icons/'});
const DB='artikel/articles.json';
const readDB=()=>fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB)):[];
const writeDB=(d)=>fs.writeFileSync(DB,JSON.stringify(d,null,2));

// Public API - nur lesen
app.get('/api/artikel',(req,res)=>res.json(readDB()));

// Auth Check
const checkAuth=(req,res,next)=>{if(req.headers['x-admin-pass']!==ADMIN_PASS&&req.body.password!==ADMIN_PASS)return res.status(401).json({error:'Keine Berechtigung'});next();};
app.post('/api/admin/login',(req,res)=>{if(req.body.user===ADMIN_USER&&req.body.password===ADMIN_PASS)return res.json({ok:true});return res.status(401).json({error:'Falscher Login'})});

// Admin: Erstellen / Bearbeiten
app.post('/api/admin/artikel',checkAuth,upload.single('icon'),(req,res)=>{
 const{title,description,category,tags,content,icon}=req.body;
 const id=title.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/[^a-z0-9]+/g,'-');
 let iconPath=icon||'/icons/grass.png'; if(req.file){iconPath=`/icons/${id}.png`;fs.renameSync(req.file.path,path.join('public',iconPath));}
 fs.writeFileSync(`artikel/${id}.md`,`# ${title}\n\n${content}`);
 let a=readDB().filter(x=>x.id!==id);a.push({id,title,description,category,icon:iconPath,file:`artikel/${id}.md`,tags:(tags||'').split(',').map(t=>t.trim().toLowerCase())});
 writeDB(a);res.json({success:true,id});
});
app.post('/api/admin/delete',checkAuth,(req,res)=>{let a=readDB().filter(x=>x.id!==req.body.id);writeDB(a);try{fs.unlinkSync(`artikel/${req.body.id}.md`)}catch(e){}res.json({success:true})});
app.get('/api/admin/artikel/:id',checkAuth,(req,res)=>{const a=readDB().find(x=>x.id===req.params.id);if(!a)return res.status(404).json({error:'Nicht gefunden'});const content=fs.existsSync(a.file)?fs.readFileSync(a.file,'utf8'):'';res.json({...a,content:content.replace(`# ${a.title}\n\n`, '')})});

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public/admin.html')));
app.get('/:slug',(req,res)=>{if(req.params.slug.includes('.'))return res.status(404).send('Not found');return res.sendFile(path.join(__dirname,'public/index.html'))});
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public/index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log(`MineWiki läuft auf ${PORT} | Admin: ${ADMIN_USER}`));
