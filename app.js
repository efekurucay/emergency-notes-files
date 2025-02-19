const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// URL'leri bağlantıya dönüştürme fonksiyonu
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" class="text-primary text-decoration-none">${url}</a>`;
    });
}

// View engine ayarları
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Orjinal dosya adını parçalara ayır
        const nameWithoutExt = path.parse(file.originalname).name;
        const extension = path.parse(file.originalname).ext;
        
        // Dosya adını düzenle (sadece tehlikeli karakterleri temizle)
        const safeFileName = nameWithoutExt
            .replace(/[<>:"/\\|?*]/g, '-') // Sadece dosya sistemi için tehlikeli karakterleri değiştir
            .replace(/-+/g, '-') // Ardışık tireleri tek tireye dönüştür
            .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
        
        // Benzersiz dosya adı oluştur ve URI encode et
        const uniqueFileName = `${Date.now()}-${encodeURIComponent(safeFileName)}${extension}`;
        
        cb(null, uniqueFileName);
    }
});

const upload = multer({ storage: storage });

// Uploads klasörünü oluştur
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Notları saklamak için dosya yolu
const notesFile = 'notes.txt';

// Not formatı: JSON string olarak saklanacak
// { content: string, priority: string, tags: string[], date: string }

// Notları okuma fonksiyonu
function readNotes() {
    if (!fs.existsSync(notesFile)) {
        return [];
    }
    return fs.readFileSync(notesFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => {
            try {
                return JSON.parse(line);
            } catch (e) {
                return { content: line, priority: 'normal', tags: [], date: new Date().toISOString() };
            }
        });
}

// Not yazma fonksiyonu
function writeNotes(notes) {
    const noteStrings = notes.map(note => JSON.stringify(note));
    fs.writeFileSync(notesFile, noteStrings.join('\n') + '\n');
}

// Dosya türüne göre ikon seçimi
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: 'bi-file-pdf',
        doc: 'bi-file-word',
        docx: 'bi-file-word',
        xls: 'bi-file-excel',
        xlsx: 'bi-file-excel',
        ppt: 'bi-file-ppt',
        pptx: 'bi-file-ppt',
        jpg: 'bi-file-image',
        jpeg: 'bi-file-image',
        png: 'bi-file-image',
        gif: 'bi-file-image',
        zip: 'bi-file-zip',
        rar: 'bi-file-zip',
        txt: 'bi-file-text',
    };
    return icons[ext] || 'bi-file-earmark';
}

// Ana sayfa
app.get('/', (req, res) => {
    const notes = readNotes().map((note, index) => ({
        id: index,
        content: note.content,
        htmlContent: linkify(note.content),
        priority: note.priority,
        tags: note.tags,
        date: new Date(note.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }));
    
    const files = fs.readdirSync('uploads').map(file => {
        const dashIndex = file.indexOf('-');
        const timestamp = file.substring(0, dashIndex);
        const encodedName = file.substring(dashIndex + 1);
        const stats = fs.statSync(path.join('uploads', file));
        return {
            name: file,
            originalName: decodeURIComponent(encodedName),
            path: `/uploads/${file}`,
            date: new Date(stats.mtime).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    }).sort((a, b) => b.name.localeCompare(a.name)); // En yeni dosyalar üstte
    
    res.render('index', { notes: notes.reverse(), files, getFileIcon });
});

// Not ekleme
app.post('/add-note', (req, res) => {
    const { note, priority, tags } = req.body;
    const newNote = {
        content: note,
        priority: priority || 'normal',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        date: new Date().toISOString()
    };
    
    const notes = readNotes();
    notes.push(newNote);
    writeNotes(notes);
    
    res.redirect('/');
});

// Not silme
app.post('/delete-note', (req, res) => {
    const noteId = parseInt(req.body.noteId);
    let notes = readNotes();
    notes.reverse(); // Görüntülenen sırayla eşleştirmek için ters çevir
    notes.splice(noteId, 1);
    notes.reverse(); // Tekrar normal sıraya çevir
    writeNotes(notes);
    res.redirect('/');
});

// Not düzenleme
app.post('/edit-note', (req, res) => {
    const noteId = parseInt(req.body.noteId);
    const newContent = req.body.content;
    let notes = readNotes();
    notes.reverse(); // Görüntülenen sırayla eşleştirmek için ters çevir
    notes[noteId] = {
        ...notes[noteId],
        content: newContent,
        date: new Date().toISOString() // Düzenleme tarihini güncelle
    };
    notes.reverse(); // Tekrar normal sıraya çevir
    writeNotes(notes);
    res.json({ 
        success: true, 
        htmlContent: linkify(newContent)
    });
});

// Dosya yükleme
app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

// Dosya silme
app.post('/delete-file', (req, res) => {
    const fileName = req.body.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    
    res.redirect('/');
});

// Uploads klasörüne erişim
app.use('/uploads', express.static('uploads'));

// Graph View sayfası
app.get('/graph', (req, res) => {
    try {
        res.render('graph', {
            getFileIcon: getFileIcon // Fonksiyonu template'e gönder
        });
    } catch (error) {
        console.error('Graph view render error:', error);
        res.status(500).send('Graph view yüklenirken bir hata oluştu');
    }
});

// Graph verilerini oluştur
app.get('/api/graph-data', (req, res) => {
    try {
        const notes = readNotes();
        const nodes = [];
        const edges = [];
        const addedTags = new Set();
        const addedUrls = new Set();

        // Notları düğüm olarak ekle
        notes.forEach((note, index) => {
            // Not içeriğini kısalt ve HTML'den temizle
            const plainContent = note.content.replace(/<[^>]*>/g, '');
            const shortContent = plainContent.substring(0, 30) + (plainContent.length > 30 ? '...' : '');

            nodes.push({
                id: `note-${index}`,
                label: shortContent,
                title: plainContent, // Tooltip olarak tam içeriği göster
                group: 'notes',
                color: {
                    background: '#3b82f6',
                    border: '#2563eb',
                    highlight: { background: '#60a5fa', border: '#3b82f6' }
                }
            });

            // Etiketleri düğüm olarak ekle
            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(tag => {
                    if (!addedTags.has(tag)) {
                        nodes.push({
                            id: `tag-${tag}`,
                            label: `#${tag}`,
                            group: 'tags',
                            color: {
                                background: '#10b981',
                                border: '#059669',
                                highlight: { background: '#34d399', border: '#10b981' }
                            }
                        });
                        addedTags.add(tag);
                    }
                    edges.push({
                        from: `note-${index}`,
                        to: `tag-${tag}`,
                        color: { color: '#10b981', opacity: 0.6 }
                    });
                });
            }

            // URL'leri düğüm olarak ekle
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = note.content.match(urlRegex) || [];
            urls.forEach(url => {
                try {
                    const shortUrl = new URL(url).hostname;
                    if (!addedUrls.has(url)) {
                        nodes.push({
                            id: `url-${url}`,
                            label: shortUrl,
                            title: url,
                            group: 'urls',
                            color: {
                                background: '#f59e0b',
                                border: '#d97706',
                                highlight: { background: '#fbbf24', border: '#f59e0b' }
                            }
                        });
                        addedUrls.add(url);
                    }
                    edges.push({
                        from: `note-${index}`,
                        to: `url-${url}`,
                        color: { color: '#f59e0b', opacity: 0.6 }
                    });
                } catch (error) {
                    console.error('Invalid URL:', url);
                }
            });
        });

        // Benzer etiketlere sahip notlar arasında bağlantı oluştur
        notes.forEach((note1, i) => {
            notes.forEach((note2, j) => {
                if (i < j && note1.tags && note2.tags) {
                    const commonTags = note1.tags.filter(tag => note2.tags.includes(tag));
                    if (commonTags.length > 0) {
                        edges.push({
                            from: `note-${i}`,
                            to: `note-${j}`,
                            value: commonTags.length,
                            title: `${commonTags.length} ortak etiket`,
                            dashes: true,
                            color: { opacity: 0.3 }
                        });
                    }
                }
            });
        });

        res.json({ nodes, edges });
    } catch (error) {
        console.error('Graph data error:', error);
        res.status(500).json({ error: 'Graph verileri oluşturulurken bir hata oluştu' });
    }
});

app.listen(port, () => {
    console.log(`Uygulama http://localhost:${port} adresinde çalışıyor`);
}); 