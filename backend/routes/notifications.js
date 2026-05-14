const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const notificationRepo = require('../repositories/notificationRepo');

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Lấy danh sách thông báo của user (hoặc admin)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (isMssql) {
      const { notifications, unreadCount } = await notificationRepo.getByRecipient(req.userId, { limit });
      return res.json({
        notifications,
        unreadCount,
        pagination: { page, limit, total: notifications.length, pages: 1 },
      });
    }

    const skip = (page - 1) * limit;

    // Filter by recipient (mặc định lấy theo userId)
    let filter = { recipient: req.userId };

    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Support filtering unread
    if (req.query.unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, read: false });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
  }
});

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', auth, async (req, res) => {
  try {
    if (isMssql) {
      const unreadCount = await notificationRepo.getUnreadCount(req.userId);
      return res.json({ unreadCount });
    }
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.userId, 
      read: false 
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error('Lỗi lấy số lượng thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đánh dấu 1 thông báo là đã đọc
router.put('/:id/read', auth, async (req, res) => {
  try {
    if (isMssql) {
      await notificationRepo.markAsRead(req.params.id);
      return res.json({ message: 'Đã đánh dấu là đã đọc' });
    }
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Đã đánh dấu là đã đọc', notification });
  } catch (error) {
    console.error('Lỗi update thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đánh dấu tất cả là đã đọc
router.put('/read-all', auth, async (req, res) => {
  try {
    if (isMssql) {
      await notificationRepo.markAllRead(req.userId);
      return res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
    }
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    console.error('Lỗi update thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
