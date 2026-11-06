const {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require("../models/notification.model");


// GET NOTIFICATIONS
exports.getNotifications = async (req, res) => {

    try {

        const notifications =
            await getUserNotifications(
                req.user.user_id
            );

        return res.status(200).json({
            success: true,
            notifications
        });

    } catch (error) {

        console.log(
            "Get Notifications Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {

    try {

        const unreadCount =
            await getUnreadNotificationCount(
                req.user.user_id
            );

        return res.status(200).json({
            success: true,
            unreadCount
        });

    } catch (error) {

        console.log(
            "Get Unread Count Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// MARK ONE AS READ
exports.markNotificationRead = async (req, res) => {

    try {
        const userId = req.user.user_id;

        const notificationId =
            Number(req.params.notificationId);

        if (!notificationId) {

            return res.status(400).json({
                success: false,
                message: "Notification ID is required."
            });
        }


        const updated =
            await markNotificationAsRead(
                userId,
                notificationId
            );


        if (!updated) {

            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }


        return res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {

        console.log(
            "Mark Notification Read Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {

    try {

        await markAllNotificationsAsRead(
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read."
        });

    } catch (error) {

        console.log(
            "Mark All Notifications Read Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};