import { useEffect, useRef, useState } from "react";
import Auth from "./pages/Auth";
import {
  getCurrentUser,
  logoutUser,
  uploadDocument,
  getDocuments,
  deleteDocument,
  searchDocuments,
  createChat,
  getChats,
  getChat,
  saveChatMessage,
} from "./services/api";
import {
  BrainCircuit,
  LayoutDashboard,
  Files,
  MessageSquareText,
  Settings,
  Search,
  Plus,
  FileText,
  Upload,
  Sparkles,
  ArrowUp,
  Paperclip,
  X,
  Trash2,
  MessageCircle,
  FileUp,
  Image as ImageIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import "./App.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "documents", label: "My Documents", icon: Files },
  { id: "assistant", label: "AI Assistant", icon: MessageSquareText },
];

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState(() => {
    const route = window.location.hash.replace("#", "");
    return ["dashboard", "documents", "assistant", "settings"].includes(route)
      ? route
      : "dashboard";
  });

  const [documents, setDocuments] = useState([]);
  const [documentQuery, setDocumentQuery] = useState("");
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [question, setQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const chatScrollRef = useRef(null);
 const pdfInputRef = useRef(null);
const attachmentInputRef = useRef(null);

  useEffect(() => {
    const syncRoute = () => {
      const route = window.location.hash.replace("#", "");
      setPage(
        ["dashboard", "documents", "assistant", "settings"].includes(route)
          ? route
          : "dashboard",
      );
    };
    window.addEventListener("hashchange", syncRoute);
    if (!window.location.hash) window.location.hash = "dashboard";
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const navigate = (nextPage) => {
    setPage(nextPage);
    window.location.hash = nextPage;
    setMobileNavOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        setUser(null);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const refreshDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const data = await getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      setDocumentsError(
        error.response?.data?.detail || "Could not load your documents.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setChats([]);
      setActiveChatId(null);
      setChatHistory([]);
      return;
    }
    refreshDocuments();
    refreshChats();
  }, [user]);

  const refreshChats = async () => {
    setChatsLoading(true);
    try {
      const data = await getChats();
      const items = Array.isArray(data) ? data : Array.isArray(data?.chats) ? data.chats : [];
      setChats(items);
    } catch (error) {
      console.error("Could not load recent chats:", error);
      setChatError(error.response?.data?.detail || "Could not load your recent chats.");
    } finally {
      setChatsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setChatHistory([]);
    setChatAnswer(null);
    setChatError("");
    setQuestion("");
    navigate("assistant");
  };

  const openChat = async (chat) => {
    setChatLoading(true);
    setChatError("");
    setChatAnswer(null);
    try {
      const data = await getChat(chat.id);
      setActiveChatId(data.id);
      setChatHistory(Array.isArray(data.messages) ? data.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      })) : []);
      navigate("assistant");
    } catch (error) {
      setChatError(error.response?.data?.detail || "Could not open this chat.");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const container = chatScrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [chatHistory, chatLoading]);


const handleUpload = async (file) => {
  if (!file) return;

  setUploading(true);
  setUploadError("");
  setUploadMessage("");

  try {
    const result = await uploadDocument(file);
    await refreshDocuments();
    setUploadMessage(
      `${result.filename || file.name} uploaded successfully.`
    );
  } catch (error) {
    setUploadError(
      error.response?.data?.detail ||
        "Upload failed. Please try again."
    );
  } finally {
    setUploading(false);
  }
};


  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete ${doc.filename}?`))
      return;
    setDeletingId(doc.id);
    setDocumentsError("");
    try {
      await deleteDocument(doc.id);
      setDocuments((previous) => previous.filter((item) => item.id !== doc.id));
    } catch (error) {
      setDocumentsError(
        error.response?.data?.detail || "Could not delete this document.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const addImages = (files) => {
    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setSelectedImages((previous) => [
      ...previous,
      ...validFiles.map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeImage = (image) => {
    URL.revokeObjectURL(image.url);
    setSelectedImages((previous) =>
      previous.filter((item) => item.id !== image.id),
    );
  };

  useEffect(
    () => () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.url));
    },
    [selectedImages],
  );

  const sendQuestion = async (event) => {
    event.preventDefault();
    const currentQuestion = question.trim();
    if ((!currentQuestion && selectedImages.length === 0) || chatLoading)
      return;

    if (selectedImages.length > 0) {
      setChatError(
        "Image attachments are selected, but image analysis is not connected to the backend yet. You can remove them or ask a text question for now.",
      );
      return;
    }
    if (!currentQuestion) return;

    setChatLoading(true);
    setChatError("");
    setChatAnswer(null);
    const historyForRequest = chatHistory.map(({ role, content }) => ({ role, content }));
    setQuestion("");

    try {
      let chatId = activeChatId;
      if (!chatId) {
        const created = await createChat(currentQuestion.slice(0, 80) || "New chat");
        chatId = created.id;
        setActiveChatId(chatId);
        setChats((previous) => [created, ...previous.filter((item) => item.id !== created.id)]);
      }

      await saveChatMessage(chatId, "user", currentQuestion);
      setChatHistory((previous) =>
        [...previous, { role: "user", content: currentQuestion }].slice(-12),
      );

      const result = await searchDocuments(currentQuestion, historyForRequest);
      const answer = result.answer || "I couldn't generate an answer.";
      await saveChatMessage(chatId, "assistant", answer);
      setChatAnswer(result);
      setChatHistory((previous) =>
        [...previous, { role: "assistant", content: answer }].slice(-12),
      );
      await refreshChats();
    } catch (error) {
      setChatError(
        error.response?.data?.detail ||
          "Could not get an answer. Please try again.",
      );
    } finally {
      setChatLoading(false);
    }
  };

  if (checkingAuth) return <div className="app-loading">Loading DocuMind…</div>;
  if (!user) return <Auth onLogin={setUser} />;

  const pageTitles = {
    dashboard: ["Workspace", "Your knowledge, in one place"],
    documents: ["Library", "Manage your documents"],
    assistant: ["AI workspace", "Ask questions and explore your files"],
    settings: ["Preferences", "Manage your account"],
  };

  return (
    <div className={`app-shell ${leftSidebarCollapsed ? "left-sidebar-collapsed" : ""} ${rightSidebarCollapsed ? "right-sidebar-collapsed" : ""}`}>
      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""} ${leftSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("dashboard")}
          aria-label="DocuMind home"
        >
          <span className="brand-icon">
            <BrainCircuit size={24} />
          </span>
          <span className="brand-copy">
            <strong>DocuMind</strong>
            <small>AI DOCUMENT WORKSPACE</small>
          </span>
        </button>

        <div className="workspace-switcher">
          <span className="workspace-avatar">D</span>
          <span>
            <strong>My Workspace</strong>
            <small>Personal account</small>
          </span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="recent-chats-section" aria-label="Recent chats">
          <div className="section-heading recent-chats-heading">
            <p className="nav-label">RECENT CHATS</p>
            <button
              className="icon-button recent-chat-new"
              type="button"
              aria-label="Start a new chat"
              title="New chat"
              onClick={startNewChat}
            >
              <Plus size={16} />
            </button>
          </div>
          {chatsLoading ? (
            <p className="recent-chats-empty">Loading chats…</p>
          ) : chats.length === 0 ? (
            <p className="recent-chats-empty">No saved chats yet</p>
          ) : (
            <nav className="recent-chats-list" aria-label="Saved conversations">
              {chats.slice(0, 8).map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`nav-item recent-chat-item ${activeChatId === chat.id ? "active" : ""}`}
                  title={chat.title || "Untitled chat"}
                  onClick={() => openChat(chat)}
                >
                  <MessageCircle size={17} />
                  <span>{chat.title || "Untitled chat"}</span>
                </button>
              ))}
            </nav>
          )}
        </section>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <div className="user-profile">
            <span className="user-avatar">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="profile-copy">
              <strong>{user.name || "My Account"}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <button className="signout-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="mobile-menu"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="breadcrumb">
                {pageTitles[page]?.[0] || "Workspace"} /{" "}
                {NAV_ITEMS.find((item) => item.id === page)?.label ||
                  "Settings"}
              </p>
              <h1>
                {page === "dashboard"
                  ? `Good to see you, ${(user.name || "there").split(" ")[0]}`
                  : page === "documents"
                    ? "My Documents"
                    : page === "assistant"
                      ? "AI Assistant"
                      : "Settings"}{" "}
                <span>{page === "dashboard" ? "👋" : ""}</span>
              </h1>
              <p className="subtitle">{pageTitles[page]?.[1]}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button desktop-sidebar-toggle"
              type="button"
              aria-label={leftSidebarCollapsed ? "Expand left sidebar" : "Collapse left sidebar"}
              title={leftSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setLeftSidebarCollapsed((collapsed) => !collapsed)}
            >
              {leftSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {page === "dashboard" && (
              <button
                className="icon-button desktop-sidebar-toggle"
                type="button"
                aria-label={rightSidebarCollapsed ? "Show recent documents" : "Hide recent documents"}
                title={rightSidebarCollapsed ? "Show recent documents" : "Hide recent documents"}
                onClick={() => setRightSidebarCollapsed((collapsed) => !collapsed)}
              >
                {rightSidebarCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Search documents"
              onClick={() => navigate("documents")}
            >
              <Search size={18} />
            </button>
            <span className="top-avatar">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {page === "dashboard" && (
          <section className="page-scroll dashboard-page figma-dashboard">
            <div className="dashboard-layout">
              <section className="assistant-workspace dashboard-assistant">
                <div className="assistant-toolbar">
                  <div>
                    <span className="assistant-status-dot" />
                    <div><strong>DocuMind Assistant</strong><small>Answers grounded in your uploaded documents</small></div>
                  </div>
                  <button className="text-button" onClick={startNewChat}>
                    <Plus size={15} /> New chat
                  </button>
                </div>
                <div className="chat-messages" ref={chatScrollRef}>
                  {chatHistory.length === 0 && !chatLoading && (
                    <div className="assistant-empty">
                      <span className="assistant-empty-icon"><Sparkles size={25} /></span>
                      <h2>Good to see you, {(user.name || "there").split(" ")[0]}</h2>
                      <p>Upload your PDFs, find the details that matter, and get answers grounded in your knowledge base.</p>
                      <div className="prompt-suggestions">
                        <button onClick={() => setQuestion("Summarize my uploaded documents")}>Summarize my documents</button>
                        <button onClick={() => setQuestion("Find the key points in my documents")}>Find key points</button>
                        <button onClick={() => setQuestion("What are the most important findings?")}>Important findings</button>
                      </div>
                    </div>
                  )}
                  {chatHistory.map((message, index) => (
                    <div key={`${index}-${message.role}`} className={`chat-message ${message.role}`}>
                      {message.role === "assistant" && <span className="message-avatar"><BrainCircuit size={17} /></span>}
                      <div className="message-content"><span className="message-label">{message.role === "user" ? "You" : "DocuMind"}</span>
                        <div className="message-bubble">{message.content}</div>
                        {message.role === "assistant" && index === chatHistory.length - 1 && chatAnswer?.results?.length > 0 && (
                          <div className="message-sources"><strong>Sources</strong>{chatAnswer.results.map((result, i) => <div key={i}><FileText size={14} /><span>{result.source_filename || result.filename || `Source ${i + 1}`}</span></div>)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div className="chat-loading"><Sparkles size={17} /> DocuMind is thinking…</div>}
                </div>
                {chatError && <p className="error-message composer-error" role="alert">{chatError}</p>}
                <form className="composer" onSubmit={sendQuestion}>
                  <button className="attach-button" type="button" title="Upload a PDF" aria-label="Upload a PDF" onClick={() => pdfInputRef.current?.click()}><Paperclip size={18} /></button>
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion(e); } }} placeholder="Ask a question about your documents..." aria-label="Ask DocuMind a question" rows={1} />
                  <button className="send-button" type="submit" aria-label="Send question" disabled={chatLoading || !question.trim()}><ArrowUp size={20} /></button>
                </form>
                <p className="privacy-note">Review important answers against the cited source documents.</p>
              </section>
              {!rightSidebarCollapsed && <aside className="dashboard-recent section-card">
                <div className="eyebrow">YOUR AI KNOWLEDGE SPACE</div>
                <div className="section-heading dashboard-recent-heading"><div><h2>Recent documents</h2></div></div>
                <button className="primary-button dashboard-upload-button" onClick={() => pdfInputRef.current?.click()} disabled={uploading}><Plus size={16} /> {uploading ? "Uploading…" : "Add a document"}</button>
                <div className="dashboard-mini-stats"><span>Total documents <strong>{documents.length}</strong></span><span>Messages this session <strong>{Math.ceil(chatHistory.length / 2)}</strong></span></div>
                {uploadMessage && <p className="success-message" role="status">{uploadMessage}</p>}
                {uploadError && <p className="error-message" role="alert">{uploadError}</p>}
                <DocumentList documents={documents.slice(0, 4)} loading={documentsLoading} error={documentsError} onDelete={handleDelete} deletingId={deletingId} onUpload={() => pdfInputRef.current?.click()} />
                <button className="text-button dashboard-view-all" onClick={() => navigate("documents")}>View all documents →</button>
              </aside>}
            </div>
            <input ref={pdfInputRef} className="visually-hidden" type="file" accept=".pdf,application/pdf" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file); e.target.value = ""; }} />
          </section>
        )}

        {page === "documents" && (
          <section className="page-scroll documents-page">
            <div className="library-toolbar">
              <div className="library-search">
                <Search size={17} />
                <input
                  aria-label="Search documents"
                  placeholder="Search your documents…"
                  value={documentQuery}
                  onChange={(e) => setDocumentQuery(e.target.value)}
                />
              </div>
              <button
                className="primary-button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={17} /> {uploading ? "Uploading…" : "Upload PDF"}
              </button>
              <button
                className="icon-button"
                aria-label="Refresh documents"
                onClick={refreshDocuments}
              >
                <span className="refresh-symbol">↻</span>
              </button>
            </div>
            <input
              ref={pdfInputRef}
              className="visually-hidden"
              type="file"
              accept=".pdf,application/pdf"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            {uploadMessage && (
              <p className="success-message" role="status">
                {uploadMessage}
              </p>
            )}
            {uploadError && (
              <p className="error-message" role="alert">
                {uploadError}
              </p>
            )}
            <section className="section-card library-card">
              <div className="section-heading">
                <div>
                  <h2>Your library</h2>
                  <p>
                    {documents.length}{" "}
                    {documents.length === 1 ? "document" : "documents"} in your
                    workspace
                  </p>
                </div>
              </div>
              <DocumentList
                documents={documents.filter((doc) => (doc.filename || "").toLowerCase().includes(documentQuery.toLowerCase()))}
                loading={documentsLoading}
                error={documentsError}
                onDelete={handleDelete}
                deletingId={deletingId}
                onUpload={() => pdfInputRef.current?.click()}
              />
            </section>
          </section>
        )}

        {page === "assistant" && (
          <section className="assistant-workspace">
            <div className="assistant-toolbar">
              <div>
                <span className="assistant-status-dot" />
                <div>
                  <strong>DocuMind Assistant</strong>
                  <small>Answers grounded in your uploaded documents</small>
                </div>
              </div>
              <button
                className="text-button"
                onClick={startNewChat}
              >
                New chat <Plus size={15} />
              </button>
            </div>
            <div className="chat-messages" ref={chatScrollRef}>
              {chatHistory.length === 0 && !chatLoading && (
                <div className="assistant-empty">
                  <span className="assistant-empty-icon">
                    <Sparkles size={25} />
                  </span>
                  <h2>What would you like to know?</h2>
                  <p>
                    Ask a question about your PDFs, or start with one of these
                    prompts.
                  </p>
                  <div className="prompt-suggestions">
                    <button
                      onClick={() =>
                        setQuestion("Summarize my uploaded documents")
                      }
                    >
                      Summarize my documents
                    </button>
                    <button
                      onClick={() =>
                        setQuestion("Find the key points in my documents")
                      }
                    >
                      Find key points
                    </button>
                    <button
                      onClick={() =>
                        setQuestion("What are the most important findings?")
                      }
                    >
                      Important findings
                    </button>
                  </div>
                  {documents.length === 0 && (
                    <button
                      className="secondary-button"
                      onClick={() => navigate("documents")}
                    >
                      <Upload size={16} /> Upload a PDF first
                    </button>
                  )}
                </div>
              )}
              {chatHistory.map((message, index) => (
                <div
                  key={`${index}-${message.role}`}
                  className={`chat-message ${message.role}`}
                >
                  {message.role === "assistant" && (
                    <span className="message-avatar">
                      <BrainCircuit size={17} />
                    </span>
                  )}
                  <div className="message-content">
                    <span className="message-label">
                      {message.role === "user" ? "You" : "DocuMind"}
                    </span>
                    <div className="message-bubble">{message.content}</div>
                    {message.role === "assistant" &&
                      index === chatHistory.length - 1 &&
                      chatAnswer?.results?.length > 0 && (
                        <div className="message-sources">
                          <strong>Sources</strong>
                          {chatAnswer.results.map((result, i) => (
                            <div key={i}>
                              <FileText size={14} />
                              <span>
                                {result.source_filename ||
                                  result.filename ||
                                  `Source ${i + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-loading">
                  <Sparkles size={17} /> DocuMind is thinking…
                </div>
              )}
            </div>
            {chatError && (
              <p className="error-message composer-error" role="alert">
                {chatError}
              </p>
            )}
            {selectedImages.length > 0 && (
              <div className="attachment-strip">
                {selectedImages.map((image) => (
                  <div className="attachment-chip" key={image.id}>
                    <img src={image.url} alt={image.file.name} />
                    <span>{image.file.name}</span>
                    <button
                      onClick={() => removeImage(image)}
                      aria-label={`Remove ${image.file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form className="composer" onSubmit={sendQuestion}>
              <input
                ref={attachmentInputRef}
                className="visually-hidden"
                type="file"
                accept=".pdf,application/pdf,image/*,.txt,.doc,.docx,.csv,.xlsx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => handleUpload(file));
                  e.target.value = "";
                }}
              />
              <button
                className="attach-button"
                type="button"
                title="Attach files"
                aria-label="Attach files"
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Paperclip size={19} />
              </button>

              <input
                ref={pdfInputRef}
                className="visually-hidden"
                type="file"
                accept=".pdf,application/pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendQuestion(e);
                  }
                }}
                placeholder="Ask a question about your documents…"
                aria-label="Ask DocuMind a question"
                rows={1}
              />
              <button
                className="send-button"
                type="submit"
                aria-label="Send question"
                disabled={
                  chatLoading ||
                  (!question.trim() && selectedImages.length === 0)
                }
              >
                <ArrowUp size={20} />
              </button>
            </form>
            <p className="privacy-note">
              Review important answers against the cited source documents.
            </p>
          </section>
        )}

        {page === "settings" && (
          <section className="page-scroll settings-page">
            <section className="section-card settings-card">
              <div className="settings-icon">
                <Settings size={22} />
              </div>
              <h2>Account settings</h2>
              <p>Manage the account currently signed in to DocuMind.</p>
              <div className="settings-row">
                <span>
                  <strong>Name</strong>
                  <small>{user.name || "Not provided"}</small>
                </span>
              </div>
              <div className="settings-row">
                <span>
                  <strong>Email address</strong>
                  <small>{user.email || "Not provided"}</small>
                </span>
              </div>
              <button
                className="secondary-button"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

function DocumentList({
  documents,
  loading,
  error,
  onDelete,
  deletingId,
  onUpload,
}) {
  if (loading)
    return (
      <div className="list-state">
        <span className="loading-spinner" />
        Loading documents…
      </div>
    );
  if (error)
    return (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  if (!documents.length)
    return (
      <div className="document-empty">
        <span>
          <Files size={26} />
        </span>
        <h3>No documents yet</h3>
        <p>Upload a PDF to build your searchable knowledge base.</p>
        <button className="secondary-button" onClick={onUpload}>
          <Upload size={16} /> Upload your first PDF
        </button>
      </div>
    );
  return (
    <div className="document-list">
      {documents.map((doc) => (
        <article className="document-row" key={doc.id}>
          <span className="document-icon">
            <FileText size={22} />
          </span>
          <div className="document-meta">
            <strong title={doc.filename}>{doc.filename}</strong>
            <small>
              {Number.isFinite(Number(doc.file_size))
                ? `${(Number(doc.file_size) / 1024).toFixed(1)} KB`
                : "PDF document"}
            </small>
          </div>
          <span className="file-type">PDF</span>
          <button
            className="delete-button"
            disabled={deletingId === doc.id}
            onClick={() => onDelete(doc)}
            aria-label={`Delete ${doc.filename}`}
            title="Delete document"
          >
            {deletingId === doc.id ? (
              <span className="loading-spinner" />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </article>
      ))}
    </div>
  );
}

export default App;
