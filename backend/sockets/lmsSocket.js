const lmsSocket = (io, app) => {

    io.on("connection", (socket) => {

        // console.log("Socket connected:", socket.id);

        const userId = socket.user?.user_id;

        if (!userId) {
            console.log("Socket connected without user ID");
            return;
        }

        // Join user's personal room
        socket.join(`user:${userId}`);

        // console.log(
        //     `User ${userId} joined notification room`
        // );


        socket.on("disconnect", () => {

            // console.log(
            //     "Socket disconnected:",
            //     socket.id
            // );

        });

    });

};

module.exports = lmsSocket;