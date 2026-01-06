import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import './db'; // Init DB
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import synapseRoutes from './routes/synapse';
import messageRoutes from './routes/messages';

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})
const upload = multer({ storage: storage });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/synapse', synapseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', apiRoutes);

import { get } from './db';


// SEO Injection for Articles
app.get('/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = await get('SELECT title, excerpt, featured_image FROM articles WHERE id = ?', [id]);

        const indexPath = path.resolve(__dirname, '../../dist/index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

        if (article) {
            const title = `${article.title} | TeamNeuron`;
            const description = article.excerpt || 'Read this article on TeamNeuron.';
            const image = article.featured_image || 'https://www.teamneuron.blog/og-image.png'; // Make sure this exists
            const url = `https://www.teamneuron.blog/articles/${id}`;

            // Replace standard tags
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${description}"`);

            // Replace Open Graph tags (if they exist in index.html, otherwise inject)
            // It's safer to just REPLACE the head with our new head or append if missing
            // But let's assume index.html has placeholders or basic tags.
            // A regex replace is simplest for Title/Desc.
            // For OG, we might need to inject if not present, or replace.

            // Let's look for </head> and inject OG tags before it to be safe and override
            const ogTags = `
                <meta property="og:type" content="article" />
                <meta property="og:title" content="${title}" />
                <meta property="og:description" content="${description}" />
                <meta property="og:image" content="${image}" />
                <meta property="og:url" content="${url}" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="${title}" />
                <meta name="twitter:description" content="${description}" />
                <meta name="twitter:image" content="${image}" />
            `;

            html = html.replace('</head>', `${ogTags}</head>`);
        }

        res.send(html);
    } catch (error) {
        console.error('SEO Injection Error:', error);
        // Fallback to static file if error
        const indexPath = path.resolve(__dirname, '../../dist/index.html');
        res.sendFile(indexPath);
    }
});

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.get('/', (req, res) => {
    res.send('Team Neuron Science Hub API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
