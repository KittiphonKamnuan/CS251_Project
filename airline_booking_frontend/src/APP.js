const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// โหลดตัวแปรจากไฟล์ .env
dotenv.config();

// สร้าง Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // สำหรับบันทึกการเรียกใช้งาน API

// ตั้งค่าโฟลเดอร์สำหรับไฟล์ static
// ให้บริการไฟล์ HTML จากโฟลเดอร์ templates
app.use(express.static(path.join(__dirname, '..', 'src', 'templates')));

// ให้บริการไฟล์ CSS
app.use('/assets/css', express.static(path.join(__dirname, '..', 'src', 'assets', 'css')));

// ให้บริการไฟล์ JS
app.use('/assets/js', express.static(path.join(__dirname, '..', 'src', 'assets', 'js')));

// ให้บริการไฟล์รูปภาพ
app.use('/assets/images', express.static(path.join(__dirname, '..', 'src', 'assets', 'images')));
app.use('/public/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// API Routes (สำหรับเพิ่มในอนาคต)
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/flights', require('./routes/flightRoutes'));
// app.use('/api/bookings', require('./routes/bookingRoutes'));

// ให้บริการไฟล์ index.html สำหรับเส้นทางหลัก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'index.html'));
});

// ให้บริการหน้า HTML เฉพาะ
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'register.html'));
});

app.get('/promotions', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'promotions.html'));
});

app.get('/booking-status', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'booking-status.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'contact.html'));
});

app.get('/flight-details', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'flight-details.html'));
});

app.get('/seat-selection', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'seat-selection.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'payment.html'));
});

app.get('/confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'templates', 'confirmation.html'));
});

// สร้างฟังก์ชั่นเพื่อแสดงโครงสร้างโฟลเดอร์ (สำหรับการดีบัก)
app.get('/debug-paths', (req, res) => {
  const paths = {
    templatePath: path.join(__dirname, '..', 'src', 'templates'),
    cssPath: path.join(__dirname, '..', 'src', 'assets', 'css'),
    jsPath: path.join(__dirname, '..', 'src', 'assets', 'js'),
    imagesPath: path.join(__dirname, '..', 'src', 'assets', 'images'),
    publicImagesPath: path.join(__dirname, '..', 'public', 'images'),
    currentDir: __dirname,
    parentDir: path.join(__dirname, '..')
  };
  
  res.json(paths);
});

// จัดการกรณี 404
app.use((req, res) => {
  res.status(404).send('Page Not Found - ไม่พบหน้าที่คุณค้นหา');
});

// ตั้งค่าพอร์ต
const PORT = process.env.PORT || 3000;

// เริ่มต้น server
app.listen(PORT, () => {
  console.log(`Server กำลังทำงานที่พอร์ต ${PORT}`);
  console.log(`Frontend ถูกเรียกใช้จาก: ${path.join(__dirname, '..', 'src', 'templates')}`);
});

module.exports = app;