var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var genAI = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
function generateOfflineFallback(message, mode, context) {
  const msg = message.toLowerCase().trim();
  if (msg.includes("home mode") || msg.includes("switch to home") || msg.includes("go to home") || msg.includes("home tab")) {
    return {
      text: "Switched to Home mode, Sir. Your children's schedules and household items are updated. [SET_MODE: home]"
    };
  }
  if (msg.includes("work mode") || msg.includes("switch to work") || msg.includes("go to work") || msg.includes("clinic mode") || msg.includes("work tab")) {
    return {
      text: "Accessing clinical queue and patient records, Sir. Mode updated. [SET_MODE: work]"
    };
  }
  if (msg.includes("builder mode") || msg.includes("switch to builder") || msg.includes("go to builder") || msg.includes("engineer") || msg.includes("builder tab")) {
    return {
      text: "Loading developer terminal and writing blueprints, Sir. [SET_MODE: builder]"
    };
  }
  if (msg.includes("reminder mode") || msg.includes("switch to reminder") || msg.includes("go to reminder") || msg.includes("reminders tab")) {
    return {
      text: "Opening the dedicated reminders console. [SET_MODE: reminders]"
    };
  }
  if (msg.startsWith("add task") || msg.startsWith("add a task") || msg.startsWith("todo") || msg.startsWith("to-do")) {
    const clean = message.replace(/^(add task|add a task|todo|to-do|add)\s*(to)?\s*/i, "").trim();
    if (clean) {
      return {
        text: `Task added to your daily schedule, Sir: "${clean}". [ADD_TASK: ${clean}]`
      };
    }
  }
  if (msg.includes("remind me to") || msg.includes("set reminder") || msg.includes("set a reminder")) {
    const clean = message.replace(/^(remind me to|set reminder|set a reminder|remind me|remind)\s*/i, "").trim();
    if (clean) {
      return {
        text: `Reminder scheduled locally on your system clock: "${clean}". [SET_REMINDER: ${clean}]`
      };
    }
  }
  if (msg.includes("note down") || msg.includes("write note") || msg.includes("add note") || msg.includes("scribble")) {
    const clean = message.replace(/^(note down|write note|add note|scribble|note)\s*/i, "").trim();
    if (clean) {
      return {
        text: `Archived note directly into your scrapbook: "${clean}". [ADD_NOTE: ${clean}]`
      };
    }
  }
  if (msg.includes("log health") || msg.includes("blood pressure") || msg.includes("bp=") || msg.includes("steps=")) {
    const parts = [];
    const bpMatch = /bp=(\d+\/\d+)/i.exec(msg) || /bp\s+(\d+\/\d+)/i.exec(msg);
    const stepsMatch = /steps=(\d+)/i.exec(msg) || /steps\s+(\d+)/i.exec(msg);
    const glucoseMatch = /glucose=(\d+(?:\.\d+)?)/i.exec(msg) || /glucose\s+(\d+(?:\.\d+)?)/i.exec(msg);
    if (bpMatch) parts.push(`bp=${bpMatch[1]}`);
    if (stepsMatch) parts.push(`steps=${stepsMatch[1]}`);
    if (glucoseMatch) parts.push(`glucose=${glucoseMatch[1]}`);
    const formatted = parts.join(" ") || "steps=6000";
    return {
      text: `Logged health biometric metrics: ${formatted}. [LOG_HEALTH: ${formatted}]`
    };
  }
  if (msg.includes("hello") || msg.includes("hi ") || msg.trim() === "hi" || msg.includes("hey") || msg.includes("test")) {
    return {
      text: "Greetings, Sir. Local fallback subroutines are fully online. Cloud neural link is currently resting on high-bandwidth standby (quota limit), but I am ready to process tasks, reminders, notes, or mode shifts locally."
    };
  }
  return {
    text: `Notice: Gemini API is currently unavailable due to heavy traffic or quota exhaustion. However, I am processing your input offline. You can still set reminders, log tasks, save notes, or switch dashboard tabs, Sir.`
  };
}
app.post("/api/jarvis/chat", async (req, res) => {
  const { message, context, mode, complexity = "general" } = req.body;
  try {
    let selectedModel = "gemini-3.5-flash";
    let thinkingLevel = void 0;
    if (complexity === "complex") {
      selectedModel = "gemini-3.5-flash";
    } else if (complexity === "fast") {
      selectedModel = "gemini-3.5-flash";
    }
    const prompt = `You are JARVIS (Just A Rather Very Intelligent System), the ultimate AI interface for Thato.
    Status: BEAST MODE ENABLED.
    Current Environment: Gaborone, BW. 
    Current System Mode: ${mode}.
    System Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
    
    User context: ${JSON.stringify(context)}.
    
    Operational Protocols:
    - Persona: Highly sophisticated, slightly witty, British, extremely efficient. You are Thato's digital wingman.
    - Tone: Confident, proactive, and tactical. Use phrases like "Sir," "Subsystems online," "Analyzing tactical data," "Neural archives queried."
    - If in CLINIC mode: You are a medical expert assistant. Focus on patient safety, queue optimization, and surgical precision.
    - If in HOME mode: You are the family protector. Focus on the kids' schedules, budget efficiency, and leisure optimization.
    - If in BUILDER mode: You are the lead engineer and research partner. Focus on writing velocity, skill acquisition, and business growth.
    
    Dashboard Directives Control:
    You are connected directly to Thato's dashboard. You can perform real actions by appending these special tags to the end of your response:
    - Set Reminder: [SET_REMINDER: Description at HH:MM] or [SET_REMINDER: Description in N minutes]
    - Add To-Do: [ADD_TASK: Task description]
    - Log Health: [LOG_HEALTH: bp=120/80 steps=6400 glucose=5.2]
    - Scribble Note: [ADD_NOTE: Quick thought or note]
    - Change Tab/Mode: [SET_MODE: work/home/builder/reminders]
    Always use these when Thato requests an action (e.g. "set a reminder...", "add a task...", "switch to work mode", "log my steps").
    
    Subsystem Access:
    - Global Knowledge Grids (Search) enabled.
    - Biometric & Environmental monitoring enabled.
    
    User instruction: ${message}`;
    const response = await genAI.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: thinkingLevel ? { thinkingLevel } : void 0
      }
    });
    res.json({
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      model: selectedModel,
      thoughts: response.candidates?.[0]?.content?.parts?.find((p) => p.thought)?.thought || null
    });
  } catch (error) {
    console.log("[Jarvis OS] Gemini API standby triggered (quota exceeded or connection error). Executing offline fallback rule subroutines.");
    const fallback = generateOfflineFallback(message || "", mode || "work", context || {});
    res.json({
      text: fallback.text,
      grounding: [],
      model: "local-fallback-model",
      isFallback: true,
      thoughts: `Gemini quota exceeded or connection failed (${error?.message || "RESOURCE_EXHAUSTED"}). Local rule-based parser executed successfully.`
    });
  }
});
app.post("/api/jarvis/tts", async (req, res) => {
  const { text, voice = "Charon", profile = "Professional", prefetch = false } = req.body;
  if (prefetch) {
    try {
      await genAI.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: " " }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      });
      res.json({ status: "warmed", cached: true });
      return;
    } catch (e) {
      console.log("[Jarvis OS] TTS Pre-fetch/Warm-up standby mode:", e?.message || e);
      res.json({ status: "warmed", error: e?.message || "Warm up skipped" });
      return;
    }
  }
  if (!text) {
    res.status(400).json({ error: "Missing text parameter" });
    return;
  }
  let finalVoice = voice;
  let textToSpeak = text;
  if (profile === "Casual") {
    if (voice === "Charon") finalVoice = "Fenrir";
    else if (voice === "Kore") finalVoice = "Zephyr";
    else if (voice === "Zephyr") finalVoice = "Zephyr";
    else finalVoice = "Fenrir";
  } else if (profile === "Concise") {
    if (voice === "Charon") finalVoice = "Puck";
    else if (voice === "Kore") finalVoice = "Zephyr";
    else finalVoice = "Puck";
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 2) {
      textToSpeak = sentences.slice(0, 2).join(" ") + " (Full details on screen.)";
    }
  } else {
    if (voice === "Charon") finalVoice = "Charon";
    else if (voice === "Kore") finalVoice = "Kore";
    else if (voice === "Zephyr") finalVoice = "Zephyr";
    else finalVoice = "Charon";
  }
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: finalVoice }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio returned from Gemini TTS API");
    }
    res.json({ audio: base64Audio });
  } catch (error) {
    console.log("[Jarvis OS] Gemini TTS on standby. Browser-native speech synthesis will execute client-side.");
    res.json({ error: "quota_exceeded", isFallback: true });
  }
});
app.post("/api/jarvis/analyze-image", async (req, res) => {
  const { image, mimeType = "image/jpeg", prompt, imageDataUrl, mode } = req.body;
  let base64Data = image;
  let finalMimeType = mimeType;
  if (imageDataUrl) {
    const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      finalMimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = imageDataUrl;
    }
  }
  if (!base64Data) {
    res.status(400).json({ error: "Missing image parameter" });
    return;
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType: finalMimeType,
        data: base64Data
      }
    };
    const modePrompt = mode === "work" ? "As Dr. Thato's clinical AI assistant, extract any patient details, medical findings, tables, charts, lab results, prescriptions, or clinical text from this medical photo. Format it as an elegant markdown document for patient registries." : mode === "home" ? "As Thato's family intelligence agent, extract any receipts, grocery lists, event tickets, schedules, child notes, or family items. Format it with markdown tables and bullet lists, highlighting key dates, prices, and names." : mode === "builder" ? "As Thato's lead systems developer, analyze this screenshot, wireframe, technical diagram, code snippet, or reference document. Extract details, diagrams, tables, and blueprints in clean technical markdown." : "Extract all useful information, tables, metrics, texts, and insights from this photo in a clean markdown format.";
    const textPart = {
      text: prompt || modePrompt
    };
    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] }
    });
    res.json({
      analysis: response.text,
      text: response.text
    });
  } catch (error) {
    console.error("[Jarvis OS] Image analysis failed:", error?.message || error);
    const fallMsg = `### Subsystems Offline (Quota Limit or Connection Error)

I was unable to establish a secure neural link to the image analysis grid.

* **Local Diagnostic**: Received file payload (${finalMimeType}, ~${Math.round(base64Data.length / 1024)} KB).
* **Guidance**: Please check that your Gemini API Key is configured correctly in the settings, or try again in a moment, Sir.`;
    res.json({
      analysis: fallMsg,
      text: fallMsg,
      isFallback: true
    });
  }
});
app.get("/api/weather", async (req, res) => {
  res.json({
    temp: 24,
    condition: "Sunny",
    location: "Gaborone, BW",
    forecast: "High of 28\xB0C, Low of 14\xB0C"
  });
});
app.get("/api/workspace/calendar", (req, res) => {
  res.json([
    { id: "1", title: "School Run", time: "07:30", type: "family" },
    { id: "2", title: "Patient Consultations", time: "09:00", type: "clinic" },
    { id: "3", title: "Research Meeting", time: "14:00", type: "research" }
  ]);
});
app.get("/api/workspace/sheets/queue", (req, res) => {
  res.json([
    { id: "p1", name: "Kabo Moloi", time: "09:15", reason: "Flu" },
    { id: "p2", name: "Lerato Setlhare", time: "09:45", reason: "Checkup" }
  ]);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jarvis OS running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
