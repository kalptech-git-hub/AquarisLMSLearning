const {
    createNotification
} = require("../models/notification.model");


// exports.sendNotification = async (
//     connection,
//     io,
//     notification
// ) => {

//     // Save notification permanently
//     const notificationId =
//         await createNotification(
//             connection,
//             notification
//         );

//     const finalNotification = {
//         notification_id: notificationId,
//         user_id: notification.user_id,
//         notification_type: notification.notification_type,
//         notification_title: notification.notification_title,
//         notification_message: notification.notification_message,
//         live_session_id: notification.live_session_id || null,
//         enroll_id: notification.enroll_id || null,
//         training_id: notification.training_id || null,
//         is_read: 0,
//         created_at: new Date()
//     };


//     // Send real-time notification
//     io.to(`user:${notification.user_id}`)
//         .emit(
//             "notification:new",
//             finalNotification
//         );


//     return finalNotification;
// };

exports.createNotificationRecord = async (
    connection,
    notification
) => {

    const notificationId =
        await createNotification(
            connection,
            notification
        );

    return {
        notification_id: notificationId,

        user_id: notification.user_id,

        notification_type:
            notification.notification_type,

        title:
            notification.title,

        message:
            notification.message,

        live_session_id:
            notification.live_session_id || null,

        enroll_id:
            notification.enroll_id || null,

        training_id:
            notification.training_id || null,

        is_read: 0,

        created_at: new Date()
    };
};


exports.emitNotification = (
    io,
    notification
) => {

    console.log("📢 EMITTING NOTIFICATION");
    console.log({
        room: `user:${notification.user_id}`,
        event: "notification:new",
        notification
    });

    io.to(`user:${notification.user_id}`)
        .emit(
            "notification:new",
            notification
        );

};