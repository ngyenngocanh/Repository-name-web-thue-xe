const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Đăng ký lịch làm việc cho tài xế
router.post('/schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Chỉ tài xế mới được đăng ký lịch làm việc' });
    }
    const { type, startDate, endDate, shifts } = req.body;
    if (!type || !startDate || !endDate || !shifts) {
      return res.status(400).json({ message: 'Thiếu thông tin lịch làm việc' });
    }
    const user = await User.findById(req.user._id || req.userId);
    user.driverSchedules.push({ type, startDate, endDate, shifts, isOnline: false });
    await user.save();
    res.json({ message: 'Đăng ký lịch làm việc thành công', schedules: user.driverSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy lịch làm việc của tài xế
router.get('/schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Chỉ tài xế mới được xem lịch làm việc' });
    }
    const user = await User.findById(req.user._id || req.userId);
    res.json({ schedules: user.driverSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cập nhật trạng thái online/offline theo lịch
router.post('/schedule/online', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Chỉ tài xế mới được cập nhật trạng thái' });
    }
    const { scheduleId, isOnline } = req.body;
    const user = await User.findById(req.user._id || req.userId);
    const schedule = user.driverSchedules.id(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    schedule.isOnline = isOnline;
    await user.save();
    res.json({ message: 'Cập nhật trạng thái thành công', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xóa lịch làm việc
router.delete('/schedule/:scheduleId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Chỉ tài xế mới được xóa lịch làm việc' });
    }
    const user = await User.findById(req.user._id || req.userId);
    const schedule = user.driverSchedules.id(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    schedule.deleteOne();
    await user.save();
    res.json({ message: 'Đã xóa lịch làm việc', schedules: user.driverSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
