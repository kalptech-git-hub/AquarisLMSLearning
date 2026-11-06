const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/auth.moddleware");

const {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markNotificationRead
} = require("../controllers/notification.controller");


// Get all notifications
router.get(
    "/",
    authMiddleware,
    getNotifications
);


// Get unread count
router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);


// Mark one notification read
router.put(
    "/:notificationId/read",
    authMiddleware,
    markNotificationRead
);


// Mark all notifications read
router.put(
    "/read-all",
    authMiddleware,
    markAllAsRead
);


module.exports = router;