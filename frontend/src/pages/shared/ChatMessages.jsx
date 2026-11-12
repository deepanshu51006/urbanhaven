import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  HiOutlineChatAlt2,
  HiPaperAirplane,
  HiOutlineTrash,
  HiChevronLeft,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import { chatMessagesStyles as s } from "../../assets/dummyStyles.js";

const ChatMessages = () => {
  const { user, token, API_URL } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/chat`);
      if (res.data?.success) {
        setChats(res.data.chats || []);
        if (res.data.chats?.length > 0 && !activeChat) {
          setActiveChat(res.data.chats[0]);
          setMessages(res.data.chats[0].messages || []);
        }
      }
    } catch (err) {
      console.error("Fetch chats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [token]);

  useEffect(() => {
    if (activeChat) {
      setMessages(activeChat.messages || []);
      scrollToBottom();
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getChatPartner = (chat) => {
    if (!chat || !user) return null;
    const buyerId = chat.buyer?._id || chat.buyer;
    if (buyerId === user._id) {
      return chat.seller;
    }
    return chat.buyer;
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/${activeChat._id}/message`,
        { text: messageText }
      );

      if (res.data?.success && res.data?.chat) {
        setActiveChat(res.data.chat);
        setMessages(res.data.chat.messages || []);
        setChats((prev) =>
          prev.map((c) => (c._id === res.data.chat._id ? res.data.chat : c))
        );
        scrollToBottom();
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleDeleteMessage = async (chatId, messageId) => {
    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}/message/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setActiveChat((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m._id !== messageId),
      }));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div
      className={`${s.chatContainer} ${
        user?.role === "seller" ? s.chatContainerSeller : s.chatContainerNonSeller
      }`}
    >
      <div className={s.chatWrapper}>
        {/* Conversations Sidebar */}
        <aside
          className={`${s.sidebar} ${
            activeChat ? s.sidebarHidden : "translate-x-0"
          }`}
        >
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Conversations</h2>
          </div>

          <div className={s.sidebarContent}>
            {chats.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} size={48} />
                <p>No conversations yet. Inquire on a listing to start chatting.</p>
              </div>
            ) : (
              chats.map((chat) => {
                const partner = getChatPartner(chat);
                const isActive = activeChat?._id === chat._id;
                const lastMsg =
                  chat.messages && chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null;

                return (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`${s.conversationItem} ${
                      isActive ? s.conversationItemActive : ""
                    }`}
                  >
                    <div className={s.avatar}>
                      {partner?.profilePic ? (
                        <img
                          src={partner.profilePic}
                          alt=""
                          className={s.avatarImg}
                        />
                      ) : (
                        partner?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className={s.conversationInfo}>
                      <h4 className={s.conversationName}>{partner?.name || "User"}</h4>
                      <p className={s.conversationPreview}>
                        {chat.property?.title ? (
                          <span className="text-primary font-medium mr-1">
                            [{chat.property.title}]
                          </span>
                        ) : null}
                        {lastMsg?.text || "Started conversation"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Thread Area */}
        <div
          className={`${s.chatArea} ${
            !activeChat ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeChat ? (
            <>
              {/* Header */}
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button
                    className={s.backButton}
                    onClick={() => setActiveChat(null)}
                    aria-label="Back to conversations"
                  >
                    <HiChevronLeft size={24} />
                  </button>
                  <div className={s.avatar}>
                    {getChatPartner(activeChat)?.profilePic ? (
                      <img
                        className={s.avatarImg}
                        src={getChatPartner(activeChat).profilePic}
                        alt=""
                      />
                    ) : (
                      getChatPartner(activeChat)?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <h3 className={s.chatPartnerName}>
                      {getChatPartner(activeChat)?.name || "Chat Partner"}
                    </h3>
                    {activeChat.property && (
                      <p className="text-xs text-text-muted">
                        Regarding: {activeChat.property.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className={s.messagesArea}>
                {messages.length === 0 ? (
                  <div className="text-center text-text-muted py-10">
                    Send a message to begin your conversation.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn =
                      (msg.sender?._id || msg.sender) === user?._id;
                    return (
                      <div
                        key={idx}
                        className={`${s.messageBubble} ${
                          isOwn ? s.messageOwn : s.messageOther
                        }`}
                      >
                        <div className={s.messageContent}>
                          {msg.image && (
                            <div className={s.messageImageWrapper}>
                              <img
                                src={msg.image}
                                alt="Attachment"
                                className={s.messageImage}
                              />
                            </div>
                          )}
                          <div className={s.messageText}>{msg.text}</div>
                          {isOwn && (
                            <button
                              className={s.deleteMessageButton}
                              onClick={() =>
                                handleDeleteMessage(activeChat._id, msg._id)
                              }
                              title="Delete Message"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          )}
                        </div>
                        <span className={s.messageTime}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form className={s.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={s.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className={s.sendButton}
                  disabled={!newMessage.trim()}
                >
                  <HiPaperAirplane className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 className={s.noChatIcon} size={54} />
              <h3 className={s.noChatTitle}>Your Messages</h3>
              <p>Select a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;