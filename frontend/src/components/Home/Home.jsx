import React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  HelpCircle,
  Settings,
  Paperclip,
  Globe,
  GraduationCap,
  ArrowUp,
  X,
  FileText,
  Image,
} from "lucide-react";
import "./Home.css";

function Chip({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="chip" aria-label={label}>
      <Icon size={16} className="chip-icon" />
      <span>{label}</span>
    </button>
  );
}

export default function Page() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const placeholders = [
    "AI that makes legal documents simple and clear.",
    "Turning legal jargon into plain language.",
    "Understand contracts. Protect your rights.",
    "Your first step to clear, accessible legal guidance."
  ];

  const canSubmit = message.trim().length > 0 || attachedFiles.length > 0;

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesSelected = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);

      if (attachedFiles.length + files.length > 4) {
        alert("You can only upload a maximum of 4 files");
        return;
      }

      setIsUploading(true);

      // Simulate file upload process
      setTimeout(() => {
        const newFiles = files.map((file) => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        }));

        setAttachedFiles((prev) => [...prev, ...newFiles]);
        setIsUploading(false);
      }, 1000);
    },
    [attachedFiles.length]
  );

  const removeFile = useCallback((fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const focusTextarea = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'; // 128px = 8rem
    }
  }, []);

  // Adjust textarea height when component mounts or message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Cycle through placeholders every 3 seconds when textarea is empty
  useEffect(() => {
    if (message === '') {
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [message, placeholders.length]);

  const submitMessage = useCallback(() => {
    const text = message.trim();
    if (!text && attachedFiles.length === 0) return;

    // Create user message with text and attached files
    const userMessage = {
      role: "user",
      content: text,
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : null
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setAttachedFiles([]); // Clear attached files after sending

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Service unavailable - this is a UI preview for testing the layout and interactions.",
        },
      ]);
    }, 400);
  }, [message, attachedFiles]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      submitMessage();
    },
    [submitMessage]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const hasMessages = messages.length > 0;



  

  return (
    <div className="home-container">
      {/* Main content */}
      <main className={`main-content ${hasMessages ? "has-messages" : ""}`}>
        {!hasMessages && <h1 className="title">ChatBOT</h1>}

        {/* Conversation preview (appears after first submit) */}
        {hasMessages && (
          <section className="messages-section">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="user-message-container">
                  <div className="user-message">
                    {/* Show uploaded documents as small cards */}
                    {m.attachedFiles && m.attachedFiles.length > 0 && (
                      <div className="message-attached-files">
                        {m.attachedFiles.map((file) => (
                          <div key={file.id} className="message-file-card">
                            <div className="message-file-icon">
                              {file.type.startsWith("image/") ? (
                                <Image size={12} />
                              ) : (
                                <FileText size={12} />
                              )}
                            </div>
                            <span className="message-file-name">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Show text content if exists */}
                    {m.content && <div className="user-message-text">{m.content}</div>}
                  </div>
                </div>
              ) : (
                <div key={i} className="assistant-message-container">
                  <div className="assistant-message">{m.content}</div>
                </div>
              )
            )}
          </section>
        )}

        {/* Prompt card */}
        <section
          className={`prompt-section ${hasMessages ? "has-messages" : ""}`}
        >
          <form onSubmit={onSubmit} className="form">
            {/* File upload cards */}
            {attachedFiles.length > 0 && (
              <div className="file-cards-container">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="file-card">
                    <div className="file-icon">
                      {file.type.startsWith("image/") ? (
                        <Image size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="file-remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {isUploading && (
                  <div className="file-card uploading">
                    <div className="file-icon">
                      <div className="upload-spinner"></div>
                    </div>
                    <div className="file-info">
                      <span className="file-name">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input row */}
            <div
              className="input-row"
              onClick={focusTextarea}
              role="group"
              aria-label="Ask anything input"
            >
              <div className="textarea-container">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={onKeyDown}
                  rows={1}
                  className="textarea"
                />
                {message === '' && (
                  <div 
                    className="animated-placeholder"
                    key={currentPlaceholder} // Force re-render for animation
                  >
                    {placeholders[currentPlaceholder]}
                  </div>
                )}
              </div>
            </div>

            {/* Chips + Submit row */}
            <div className="chips-submit-row">
              <div className="chips-container">
                <Chip
                  icon={Paperclip}
                  label="Attach"
                  onClick={openFilePicker}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden-input"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit}
                aria-label="Submit"
                className="submit-button"
                title={canSubmit ? "Send" : "Type a message to enable"}
              >
                <span className="submit-icon">
                  <ArrowUp
                    size={16}
                    className={
                      canSubmit ? "submit-icon-enabled" : "submit-icon-disabled"
                    }
                  />
                </span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
