(function () {
  "use strict";

  /* Ensure window.__SS_CONFIG__ exists */
  if (typeof window.__SS_CONFIG__ === 'undefined') {
    window.__SS_CONFIG__ = {};
  }

  /* Read the current config (may be partially populated by server) */
  var config = window.__SS_CONFIG__;

  /* Apply defaults only for missing values */
  var C = {
    apiBase:        config.apiBase        || "http://localhost:8000",
    botName:        config.botName        || "Support",
    primaryColor:   config.primaryColor   || "#2563eb",
    secondaryColor: config.secondaryColor || "#1d4ed8",
    welcomeMessage: config.welcomeMessage || "Hello! How can I help you today?",
    fallbackMessage:config.fallbackMessage|| "I am not sure about that. Please contact our support team.",
    position:       config.position       || "bottom-right",
    buttonSize:     config.buttonSize     || "56px",
    apiKey:         config.apiKey         || "",
  };


  var SESSION_ID = _uid();
  var isOpen     = false;
  var PANEL_ID   = "ss-panel";
  var BTN_ID     = "ss-launcher";

  /* Utilities */

  function _uid() {
    return Math.random().toString(36).slice(2, 14);
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  function _hex2rgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return r + "," + g + "," + b;
  }

  /* Styles */

  function _injectStyles() {
    var p   = C.primaryColor;
    var s   = C.secondaryColor;
    var rgb = _hex2rgb(p);
    var isLeft = C.position === "bottom-left";
    var posBtn  = isLeft ? "left:24px;" : "right:24px;";
    var posPanel = isLeft ? "left:24px;" : "right:24px;";

    var css = [
      "#ss-launcher{",
        "position:fixed;bottom:24px;" + posBtn,
        "width:" + C.buttonSize + ";height:" + C.buttonSize + ";",
        "border-radius:50%;",
        "background:linear-gradient(135deg," + p + "," + s + ");",
        "border:none;cursor:pointer;",
        "display:flex;align-items:center;justify-content:center;",
        "box-shadow:0 4px 20px rgba(" + rgb + ",0.45);",
        "transition:transform 0.2s,box-shadow 0.2s;",
        "z-index:2147483646;",
        "outline:none;",
      "}",
      "#ss-launcher:hover{",
        "transform:scale(1.08) translateY(-2px);",
        "box-shadow:0 8px 28px rgba(" + rgb + ",0.55);",
      "}",
      "#ss-launcher svg{pointer-events:none;}",

      "#ss-panel{",
        "position:fixed;bottom:calc(24px + " + C.buttonSize + " + 12px);" + posPanel,
        "width:368px;max-height:560px;",
        "background:#0d0d14;",
        "border-radius:16px;overflow:hidden;",
        "display:flex;flex-direction:column;",
        "box-shadow:0 24px 64px rgba(0,0,0,0.65),0 0 0 1px rgba(" + rgb + ",0.18);",
        "transform:scale(0.88) translateY(16px);opacity:0;pointer-events:none;",
        "transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.25s;",
        "z-index:2147483645;",
        "font-family:-apple-system,'Segoe UI',sans-serif;",
      "}",
      "#ss-panel.ss-open{",
        "transform:scale(1) translateY(0);opacity:1;pointer-events:all;",
      "}",

      "#ss-header{",
        "background:linear-gradient(135deg," + p + "," + s + ");",
        "padding:14px 18px;",
        "display:flex;align-items:center;gap:12px;",
        "flex-shrink:0;",
      "}",
      "#ss-header-avatar{",
        "width:36px;height:36px;border-radius:50%;",
        "background:rgba(255,255,255,0.15);",
        "display:flex;align-items:center;justify-content:center;",
        "flex-shrink:0;",
      "}",
      "#ss-header-avatar svg{width:18px;height:18px;fill:white;}",
      "#ss-header-info{flex:1;min-width:0;}",
      "#ss-header-name{color:white;font-size:14px;font-weight:600;margin:0;}",
      "#ss-header-status{",
        "color:rgba(255,255,255,0.75);font-size:11px;margin:2px 0 0;",
        "display:flex;align-items:center;gap:4px;",
      "}",
      ".ss-dot{",
        "width:6px;height:6px;border-radius:50%;",
        "background:#4ade80;flex-shrink:0;",
      "}",
      "#ss-close-btn{",
        "background:rgba(255,255,255,0.12);border:none;",
        "color:white;cursor:pointer;",
        "width:28px;height:28px;border-radius:6px;",
        "display:flex;align-items:center;justify-content:center;",
        "transition:background 0.15s;flex-shrink:0;",
        "font-size:14px;",
      "}",
      "#ss-close-btn:hover{background:rgba(255,255,255,0.22);}",

      "#ss-messages{",
        "flex:1;overflow-y:auto;padding:16px;",
        "display:flex;flex-direction:column;gap:10px;",
        "scrollbar-width:thin;",
        "scrollbar-color:rgba(" + rgb + ",0.25) transparent;",
      "}",
      "#ss-messages::-webkit-scrollbar{width:4px;}",
      "#ss-messages::-webkit-scrollbar-thumb{",
        "background:rgba(" + rgb + ",0.25);border-radius:4px;",
      "}",

      ".ss-msg{display:flex;gap:8px;align-items:flex-end;}",
      ".ss-msg.ss-bot{flex-direction:row;}",
      ".ss-msg.ss-user{flex-direction:row-reverse;}",

      ".ss-msg-icon{",
        "width:26px;height:26px;border-radius:50%;flex-shrink:0;",
        "background:rgba(" + rgb + ",0.12);",
        "border:1px solid rgba(" + rgb + ",0.2);",
        "display:flex;align-items:center;justify-content:center;",
      "}",
      ".ss-msg-icon svg{width:13px;height:13px;}",
      ".ss-bot .ss-msg-icon svg{fill:rgba(" + rgb + ",0.9);}",
      ".ss-user .ss-msg-icon svg{fill:white;}",
      ".ss-user .ss-msg-icon{background:" + p + ";border-color:" + p + ";}",

      ".ss-bubble{",
        "max-width:78%;padding:9px 13px;",
        "font-size:13.5px;line-height:1.55;",
        "border-radius:14px;",
      "}",
      ".ss-bot .ss-bubble{",
        "background:#1a1a28;color:#dde1ea;",
        "border:1px solid rgba(" + rgb + ",0.14);",
        "border-bottom-left-radius:4px;",
        "white-space: pre-wrap;line-height: 1.6;",
      "}",
      ".ss-user .ss-bubble{",
        "background:linear-gradient(135deg," + p + "," + s + ");",
        "color:white;border-bottom-right-radius:4px;",
      "}",

      ".ss-typing{",
        "display:flex;gap:5px;padding:10px 14px;",
        "background:#1a1a28;border-radius:14px;",
        "border:1px solid rgba(" + rgb + ",0.14);",
        "border-bottom-left-radius:4px;width:fit-content;",
      "}",
      ".ss-typing span{",
        "width:7px;height:7px;border-radius:50%;",
        "background:" + p + ";",
        "animation:ss-bounce 1.1s infinite;",
      "}",
      ".ss-typing span:nth-child(2){animation-delay:0.18s;}",
      ".ss-typing span:nth-child(3){animation-delay:0.36s;}",
      "@keyframes ss-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}",

      "@keyframes ss-fadein{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}",
      ".ss-msg{animation:ss-fadein 0.2s ease-out;}",

      "#ss-input-area{",
        "padding:10px 12px;",
        "border-top:1px solid rgba(" + rgb + ",0.1);",
        "display:flex;gap:8px;align-items:center;",
        "background:#0d0d14;flex-shrink:0;",
      "}",
      "#ss-input{",
        "flex:1;background:#181826;",
        "border:1px solid rgba(" + rgb + ",0.2);",
        "border-radius:10px;padding:9px 13px;",
        "color:#dde1ea;font-size:13.5px;",
        "outline:none;font-family:inherit;",
        "transition:border-color 0.15s;",
        "resize:none;height:38px;line-height:20px;",
      "}",
      "#ss-input:focus{border-color:" + p + ";}",
      "#ss-input::placeholder{color:#4a4a68;}",
      "#ss-send{",
        "background:linear-gradient(135deg," + p + "," + s + ");",
        "border:none;border-radius:9px;",
        "width:38px;height:38px;cursor:pointer;",
        "display:flex;align-items:center;justify-content:center;",
        "transition:transform 0.15s,box-shadow 0.15s;flex-shrink:0;",
      "}",
      "#ss-send:hover{",
        "transform:scale(1.06);",
        "box-shadow:0 4px 12px rgba(" + rgb + ",0.4);",
      "}",
      "#ss-send:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none;}",
      "#ss-send svg{width:16px;height:16px;fill:white;pointer-events:none;}",

      "#ss-brand{",
        "text-align:center;padding:5px 0 8px;",
        "font-size:10.5px;color:#363650;",
      "}",
      "#ss-brand a{color:" + p + ";text-decoration:none;}",

      "@media(max-width:420px){",
        "#ss-panel{width:calc(100vw - 20px);right:10px !important;left:10px !important;}",
      "}",
    ].join("");

    var el = document.createElement("style");
    el.id  = "ss-styles";
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* DOM */

  var _botIcon = [
    `<svg width="800px" height="800px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 5C6.67157 5 6 5.67157 6 6.5C6 7.32843 6.67157 8 7.5 8C8.32843 8 9 7.32843 9 6.5C9 5.67157 8.32843 5 7.5 5Z" fill="#2564eb"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.99999 1.99988L8 1.99989V0H7V1.9999L5.99991 1.9999C2.68625 1.99993 9.17923e-06 4.68619 0 7.99985C-9.179e-06 11.3135 2.68627 13.9998 5.99996 13.9998H9.00004C9.13059 13.9998 9.26024 13.9957 9.38884 13.9874L13.3788 14.9849C13.5492 15.0275 13.7294 14.9776 13.8536 14.8534C13.9778 14.7292 14.0277 14.549 13.9851 14.3786L13.4081 12.0704C14.3958 11.0012 15 9.57071 15 7.99985C15 4.68614 12.3137 1.99985 8.99999 1.99988ZM5 6.5C5 5.11929 6.11929 4 7.5 4C8.88071 4 10 5.11929 10 6.5C10 7.88071 8.88071 9 7.5 9C6.11929 9 5 7.88071 5 6.5ZM7.49998 12C6.43628 12 5.45756 11.6303 4.68726 11.0128L5.31272 10.2326C5.91201 10.713 6.67179 11 7.49998 11C8.32816 11 9.08794 10.713 9.68723 10.2326L10.3127 11.0128C9.54239 11.6303 8.56367 12 7.49998 12Z" fill="#fff"/>
    </svg>`
  ].join("");

  var _userIcon = [
    '<svg viewBox="0 0 24 24" fill="currentColor">',
      '<circle cx="12" cy="7" r="4"/>',
      '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
    "</svg>",
  ].join("");

  var _sendIcon = [
    '<svg viewBox="0 0 24 24">',
      '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>',
    "</svg>",
  ].join("");

  var _chatIcon = [
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chat-fab-icon-open" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="white" stroke="none"/><circle cx="12" cy="10" r="1" fill="white" stroke="none"/><circle cx="15" cy="10" r="1" fill="white" stroke="none"/></svg>`
  ].join("");

  var _closeIcon = '<span style="font-size:16px;line-height:1;">&#215;</span>';

  function _buildDOM() {
    var btn = document.createElement("button");
    btn.id            = BTN_ID;
    btn.setAttribute("aria-label", "Open chat");
    btn.innerHTML     = _chatIcon;
    document.body.appendChild(btn);

    var panel = document.createElement("div");
    panel.id  = PANEL_ID;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", C.botName + " support chat");
    panel.innerHTML = [
      '<div id="ss-header">',
        '<div id="ss-header-avatar">' + _botIcon + "</div>",
        '<div id="ss-header-info">',
          '<p id="ss-header-name">' + _escape(C.botName) + "</p>",
          '<p id="ss-header-status"><span class="ss-dot"></span>Online - Replies instantly</p>',
        "</div>",
        '<button id="ss-close-btn" aria-label="Close chat">' + _closeIcon + "</button>",
      "</div>",
      '<div id="ss-messages"></div>',
      '<div id="ss-input-area">',
        '<input id="ss-input" type="text" placeholder="Type a message..." autocomplete="off" />',
        '<button id="ss-send" aria-label="Send">' + _sendIcon + "</button>",
      "</div>",
      '<div id="ss-brand">Powered by <a href="https://github.com/apdoolhamza/smartsupport-ai" target="_blank">SmartSupport AI</a></div>',
    ].join("");
    document.body.appendChild(panel);

    _addMessage("bot", C.welcomeMessage);
  }

  /* Events */

  function _bindEvents() {
    document.getElementById(BTN_ID).addEventListener("click", _toggle);
    document.getElementById("ss-close-btn").addEventListener("click", _close);
    document.getElementById("ss-send").addEventListener("click", _send);
    document.getElementById("ss-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        _send();
      }
    });
  }

  function _toggle() { isOpen ? _close() : _open(); }

  function _open() {
    isOpen = true;
    document.getElementById(PANEL_ID).classList.add("ss-open");
    document.getElementById(BTN_ID).innerHTML = _closeIcon;
    setTimeout(function () {
      var el = document.getElementById("ss-input");
      if (el) el.focus();
    }, 260);
  }

  function _close() {
    isOpen = false;
    document.getElementById(PANEL_ID).classList.remove("ss-open");
    document.getElementById(BTN_ID).innerHTML = _chatIcon;
  }

  /* Messaging */

  function _addMessage(role, text) {
    var container = document.getElementById("ss-messages");
    if (!container) return;

    var div  = document.createElement("div");
    div.className = "ss-msg ss-" + role;

    var icon   = role === "bot" ? _botIcon : _userIcon;
    var html = window.marked ? marked.parse(text) : _escape(text);
    var bubble = '<div class="ss-bubble">' + html + "</div>"; 
    var avatar = '<div class="ss-msg-icon">' + icon + "</div>";

    div.innerHTML = role === "bot"
      ? avatar + bubble
      : bubble + avatar;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _showTyping() {
    var container = document.getElementById("ss-messages");
    var div = document.createElement("div");
    div.className = "ss-msg ss-bot";
    div.id = "ss-typing";
    div.innerHTML = [
      '<div class="ss-msg-icon">' + _botIcon + "</div>",
      '<div class="ss-typing"><span></span><span></span><span></span></div>',
    ].join("");
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _hideTyping() {
    var el = document.getElementById("ss-typing");
    if (el) el.parentNode.removeChild(el);
  }

  /* API call */

  /* true = streaming (default), false = regular */
  var _useStream = (C.stream === false) ? false : true;

  /* Create an empty bot bubble and return the bubble element for live updates */
  function _createStreamBubble() {
    var container = document.getElementById("ss-messages");
    var div = document.createElement("div");
    div.className = "ss-msg ss-bot";
    div.id = "ss-stream-bubble";

    var avatarDiv = document.createElement("div");
    avatarDiv.className = "ss-msg-icon";
    avatarDiv.innerHTML = _botIcon;

    var bubble = document.createElement("div");
    bubble.className = "ss-bubble";

    div.appendChild(avatarDiv);
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  function _finaliseStreamBubble() {
    var el = document.getElementById("ss-stream-bubble");
    if (el) el.removeAttribute("id");
    var container = document.getElementById("ss-messages");
    if (container) container.scrollTop = container.scrollHeight;
  }

  function _removeStreamBubble() {
    var el = document.getElementById("ss-stream-bubble");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function _block() {
    var input   = document.getElementById("ss-input");
    var sendBtn = document.getElementById("ss-send");
    if (input)   input.disabled   = true;
    if (sendBtn) sendBtn.disabled = true;
  }

  function _unblock() {
    var input   = document.getElementById("ss-input");
    var sendBtn = document.getElementById("ss-send");
    if (input)   { input.disabled   = false; input.focus(); }
    if (sendBtn) sendBtn.disabled = false;
  }

  /* Streaming via /api/chat/stream */
  function _sendStream(text) {
    var bubble   = null;   /* the live bubble element        */
    var fullText = "";     /* accumulated text so far        */
    var finished = false;  /* guard against double-finish    */

    _showTyping();

    var streamHeaders = { "Content-Type": "application/json" };
    if (C.apiKey) streamHeaders["X-API-Key"] = C.apiKey;

    fetch(C.apiBase + "/api/chat/stream", {
      method:  "POST",
      headers: streamHeaders,
      body:    JSON.stringify({ message: text, session_id: SESSION_ID, api_key: C.apiKey || undefined }),
    })
    .then(function (res) {
      if (res.status === 401) {
        _hideTyping();
        _addMessage("bot", "Access denied. Invalid or missing API key.");
        _unblock();
        return Promise.reject(new Error("401"));
      }
      if (res.status === 429) {
        _hideTyping();
        _addMessage("bot", "Too many requests. Please wait a moment before trying again.");
        _unblock();
        return Promise.reject(new Error("429"));
      }
      if (!res.ok) throw new Error("HTTP " + res.status);

      var reader  = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer  = "";

      function _finish(errorMsg) {
        if (finished) return;
        finished = true;
        _hideTyping();
        if (errorMsg) {
          _removeStreamBubble();
          _addMessage("bot", errorMsg);
        } else if (!bubble || fullText === "") {
          /* Stream ended but nothing received */
          _removeStreamBubble();
          _addMessage("bot", C.fallbackMessage || "Sorry, I could not process that.");
        } else {
          _finaliseStreamBubble();
        }
        _unblock();
      }

      function _read() {
        reader.read().then(function (chunk) {

          if (chunk.done) { _finish(null); return; }

          buffer += decoder.decode(chunk.value, { stream: true });

          /* Split on newlines; keep last partial line in buffer */
          var lines = buffer.split("\n");
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            /* SSE lines must start with "data:" */
            if (line.slice(0, 5) !== "data:") continue;

            var payload = line.slice(5).trim();

            /* End-of-stream sentinel */
            if (payload === "[DONE]") { _finish(null); return; }

            /* Parse token JSON */
            var obj;
            try { obj = JSON.parse(payload); } catch (e) { continue; }

            if (obj.error) {
              _finish(C.fallbackMessage || "Sorry, an error occurred.");
              return;
            }

            if (typeof obj.token === "string") {
              /* First token: hide typing indicator, create live bubble */
              if (!bubble) {
                _hideTyping();
                bubble = _createStreamBubble();
              }

              /* Append ONLY the new token — never set full text again */
              fullText += obj.token;
              bubble.textContent = fullText;

              /* Keep scroll at bottom */
              var msgs = document.getElementById("ss-messages");
              if (msgs) msgs.scrollTop = msgs.scrollHeight;
            }
          }

          _read(); /* continue */

        }).catch(function () {
          _finish("Connection error. Please try again.");
        });
      }

      _read();
    })
    .catch(function () {
      _hideTyping();
      _addMessage("bot", "Connection error. Please try again.");
      _unblock();
    });
  }
  /* Regular (non-streaming) via /api/chat */
    /* ── Regular (non-streaming) via /api/chat ── */
  function _sendRegular(text) {
    _showTyping();

    var regularHeaders = { "Content-Type": "application/json" };
    if (C.apiKey) regularHeaders["X-API-Key"] = C.apiKey;

    fetch(C.apiBase + "/api/chat", {
      method:  "POST",
      headers: regularHeaders,
      body:    JSON.stringify({ message: text, session_id: SESSION_ID, api_key: C.apiKey || undefined }),
    })
    .then(function (res) {
      if (res.status === 401) {
        throw new Error("Access denied. Invalid or missing API key.");
      }
      if (res.status === 429) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      _hideTyping();
      _addMessage("bot", data.answer || C.fallbackMessage || "Sorry, I could not process that.");
    })
    .catch(function (err) {
      _hideTyping();
      var msg = (err && err.message && err.message.length < 120)
        ? err.message
        : "Connection error. Please try again.";
      _addMessage("bot", msg);
    })
    .finally(function () { _unblock(); });
  }

  /* Main send entry point */
  function _send() {
    var input = document.getElementById("ss-input");
    var text  = (input ? input.value || "" : "").trim();
    if (!text) return;

    input.value = "";
    _block();
    _addMessage("user", text);

    /* Use streaming only if browser supports ReadableStream + TextDecoder */
    var streamOK = !!(window.ReadableStream && window.TextDecoder);

    if (_useStream && streamOK) {
      _sendStream(text);
    } else {
      _sendRegular(text);
    }
  }

  /* Init */

  function init() {
    if (document.getElementById(BTN_ID)) return; // already mounted
    _injectStyles();
    _buildDOM();
    _bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
