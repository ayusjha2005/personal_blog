const ContactMessage = require('../models/ContactMessage');

class ContactService {
  async createMessage(data) {
    return ContactMessage.create(data);
  }

  async getMessages({ page = 1, limit = 15, status = null }) {
    const query = {};
    if (status && ['unread', 'read'].includes(status)) {
      query.status = status;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;
    const totalMessages = await ContactMessage.countDocuments(query);
    const unreadCount = await ContactMessage.countDocuments({ status: 'unread' });
    const totalPages = Math.ceil(totalMessages / limit) || 1;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      messages,
      totalMessages,
      unreadCount,
      totalPages,
      currentPage: Math.max(1, parseInt(page, 10)),
    };
  }

  async markAsRead(id) {
    return ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });
  }

  async markAsUnread(id) {
    return ContactMessage.findByIdAndUpdate(id, { status: 'unread' }, { new: true });
  }

  async deleteMessage(id) {
    return ContactMessage.findByIdAndDelete(id);
  }

  async getUnreadCount() {
    return ContactMessage.countDocuments({ status: 'unread' });
  }
}

module.exports = new ContactService();
