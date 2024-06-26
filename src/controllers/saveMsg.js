const User = require("../models/user");
const Conversation = require("../models/conversation");

const save_message_to_db = async (receiverName, message, userId) => {
  try {
    const user = await User.findById(userId).populate();
    const receiver = await User.findOne({ userName: receiverName }).populate();

    if (!user) {
      throw new Error("User not found");
    }

    if (!receiver) {
      throw new Error("receiver not found");
    }
    let conversation = await Conversation.findOne({
      users: { $all: [user.userName, receiverName] },
    });

    if (!conversation) {
      const newConversation = {
        users: [user.userName, receiverName],
        messages: [{ sender: user.userName, receiver: receiverName, message }],
      };
      conversation = await Conversation.create(newConversation);
      user.chatRooms.push({
        users: [user.userName, receiverName],
        chatRoomId: conversation._id,
      });
      receiver.chatRooms.push({
        users: [user.userName, receiverName],
        chatRoomId: conversation._id,
      });
    } else {
      conversation.messages.push({
        sender: user.userName,
        receiver: receiverName,
        message,
      });
    }

    await Promise.all([conversation.save(), user.save(), receiver.save()]);
  } catch (err) {
    console.error("Error saving message to db:", err.message);
    throw err; // Throw the error for consistent error handling
  }
};

module.exports = { save_message_to_db };
