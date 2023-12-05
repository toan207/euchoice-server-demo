
const multer = require('multer');

const fs = require('fs');
const path = require('path');

const folderPath = './uploads';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.ico'];

function countImagesInFolder(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        let imageCount = 0;

        files.forEach((file) => {
            const extension = path.extname(file).toLowerCase();
                imageCount++;
        });
        return imageCount;
    } catch (err) {
        console.error('Error reading folder:', err);
        return 0;
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Uploads will be saved in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, '' + (countImagesInFolder(folderPath) + 1) + '.' + file.originalname.split('.')[1]);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = upload;
