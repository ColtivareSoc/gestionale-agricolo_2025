// index.js - Gestionale Agricolo con Frontend integrato
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from React build
const buildPath = path.join(__dirname, "client/build");
app.use(express.static(buildPath));

// 🗄️ CONNESSIONE A MONGODB
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://coltivaresocagricola:4GtsVKfDO1NGpYn8@gestionale-agricolo.tucgzws.mongodb.net/?retryWrites=true&w=majority&appName=gestionale-agricolo";

// Connessione MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connesso a MongoDB Atlas!"))
  .catch((err) => {
    console.error("❌ Errore connessione MongoDB:", err);
  });

// 📋 SCHEMI DATABASE
const fornitoreSchema = new mongoose.Schema({
  ragioneSociale: { type: String, required: true },
  partitaIva: { type: String, required: true },
  codiceFiscale: String,
  indirizzo: String,
  citta: String,
  cap: String,
  provincia: String,
  nazione: { type: String, default: "Italia" },
  telefono: String,
  email: String,
  iban: String,
  condizionePagamento: String,
  giorni: { type: Number, default: 30 },
  scontistica: { type: Number, default: 0 },
  biologico: { type: Boolean, default: false },
  certificazioniBio: String,
  note: String,
  dataCreazione: { type: Date, default: Date.now },
});

const prodottoSchema = new mongoose.Schema({
  categoria: { type: String, required: true },
  nome: { type: String, required: true },
  varieta: String,
  codice: String,
  descrizione: String,
  biologico: { type: Boolean, default: false },
  calibrabile: { type: Boolean, default: true },
  dataCreazione: { type: Date, default: Date.now },
});

const arrivoMerceSchema = new mongoose.Schema({
  dataArrivo: { type: Date, required: true },
  oraArrivo: String,
  fornitoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fornitore",
    required: true,
  },
  prodottoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prodotto",
    required: true,
  },
  lotto: String,
  qualita: { type: String, enum: ["I", "II", "III"], default: "I" },
  tipoImballaggio: {
    type: String,
    enum: ["bins", "cassette"],
    default: "bins",
  },
  numeroColli: { type: Number, required: true },
  pesoLordo: { type: Number, required: true },
  pesoNetto: { type: Number, required: true },
  prezzoKg: { type: Number, required: true },
  percentualeScartoPrevista: Number,
  pesoCommerciabile: Number,
  prezzoTotale: Number,
  numeroDocumento: String,
  dataDocumento: Date,
  documentoAllegato: { type: Boolean, default: false },
  biologico: { type: Boolean, default: false },
  note: String,
  dataCreazione: { type: Date, default: Date.now },
  dataModifica: Date,
});

// Modelli
const Fornitore = mongoose.model("Fornitore", fornitoreSchema);
const Prodotto = mongoose.model("Prodotto", prodottoSchema);
const ArrivoMerce = mongoose.model("ArrivoMerce", arrivoMerceSchema);

// 🚀 API ROUTES

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "🚀 API Gestionale Agricolo funzionante!",
    timestamp: new Date(),
    status: "online",
  });
});

// === FORNITORI ===
app.get("/api/fornitori", async (req, res) => {
  try {
    const fornitori = await Fornitore.find().sort({ dataCreazione: -1 });
    res.json(fornitori);
  } catch (error) {
    console.error("Errore GET fornitori:", error);
    res.status(500).json({ error: "Errore nel recuperare i fornitori" });
  }
});

app.post("/api/fornitori", async (req, res) => {
  try {
    const nuovoFornitore = new Fornitore(req.body);
    const fornitore = await nuovoFornitore.save();
    res.status(201).json(fornitore);
  } catch (error) {
    console.error("Errore POST fornitore:", error);
    res.status(400).json({
      error: "Errore nella creazione del fornitore: " + error.message,
    });
  }
});

app.put("/api/fornitori/:id", async (req, res) => {
  try {
    const fornitore = await Fornitore.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!fornitore) {
      return res.status(404).json({ error: "Fornitore non trovato" });
    }
    res.json(fornitore);
  } catch (error) {
    console.error("Errore PUT fornitore:", error);
    res.status(400).json({
      error: "Errore nell'aggiornamento del fornitore: " + error.message,
    });
  }
});

app.delete("/api/fornitori/:id", async (req, res) => {
  try {
    const fornitore = await Fornitore.findByIdAndDelete(req.params.id);
    if (!fornitore) {
      return res.status(404).json({ error: "Fornitore non trovato" });
    }
    res.json({ message: "Fornitore eliminato con successo" });
  } catch (error) {
    console.error("Errore DELETE fornitore:", error);
    res.status(400).json({
      error: "Errore nell'eliminazione del fornitore: " + error.message,
    });
  }
});

// === PRODOTTI ===
app.get("/api/prodotti", async (req, res) => {
  try {
    const prodotti = await Prodotto.find().sort({ categoria: 1, nome: 1 });
    res.json(prodotti);
  } catch (error) {
    console.error("Errore GET prodotti:", error);
    res.status(500).json({ error: "Errore nel recuperare i prodotti" });
  }
});

app.post("/api/prodotti", async (req, res) => {
  try {
    const nuovoProdotto = new Prodotto(req.body);
    const prodotto = await nuovoProdotto.save();
    res.status(201).json(prodotto);
  } catch (error) {
    console.error("Errore POST prodotto:", error);
    res.status(400).json({
      error: "Errore nella creazione del prodotto: " + error.message,
    });
  }
});

app.put("/api/prodotti/:id", async (req, res) => {
  try {
    const prodotto = await Prodotto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!prodotto) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }
    res.json(prodotto);
  } catch (error) {
    console.error("Errore PUT prodotto:", error);
    res.status(400).json({
      error: "Errore nell'aggiornamento del prodotto: " + error.message,
    });
  }
});

app.delete("/api/prodotti/:id", async (req, res) => {
  try {
    const prodotto = await Prodotto.findByIdAndDelete(req.params.id);
    if (!prodotto) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }
    res.json({ message: "Prodotto eliminato con successo" });
  } catch (error) {
    console.error("Errore DELETE prodotto:", error);
    res.status(400).json({
      error: "Errore nell'eliminazione del prodotto: " + error.message,
    });
  }
});

// === ARRIVI MERCE ===
app.get("/api/arrivi", async (req, res) => {
  try {
    const arrivi = await ArrivoMerce.find()
      .populate("fornitoreId", "ragioneSociale")
      .populate("prodottoId", "categoria nome")
      .sort({ dataCreazione: -1 });
    res.json(arrivi);
  } catch (error) {
    console.error("Errore GET arrivi:", error);
    res.status(500).json({ error: "Errore nel recuperare gli arrivi" });
  }
});

app.post("/api/arrivi", async (req, res) => {
  try {
    const nuovoArrivo = new ArrivoMerce(req.body);
    const arrivo = await nuovoArrivo.save();
    await arrivo.populate("fornitoreId", "ragioneSociale");
    await arrivo.populate("prodottoId", "categoria nome");
    res.status(201).json(arrivo);
  } catch (error) {
    console.error("Errore POST arrivo:", error);
    res.status(400).json({
      error: "Errore nella registrazione dell'arrivo: " + error.message,
    });
  }
});

app.put("/api/arrivi/:id", async (req, res) => {
  try {
    const arrivo = await ArrivoMerce.findByIdAndUpdate(
      req.params.id,
      { ...req.body, dataModifica: new Date() },
      { new: true }
    )
      .populate("fornitoreId", "ragioneSociale")
      .populate("prodottoId", "categoria nome");

    if (!arrivo) {
      return res.status(404).json({ error: "Arrivo non trovato" });
    }
    res.json(arrivo);
  } catch (error) {
    console.error("Errore PUT arrivo:", error);
    res.status(400).json({
      error: "Errore nell'aggiornamento dell'arrivo: " + error.message,
    });
  }
});

app.delete("/api/arrivi/:id", async (req, res) => {
  try {
    const arrivo = await ArrivoMerce.findByIdAndDelete(req.params.id);
    if (!arrivo) {
      return res.status(404).json({ error: "Arrivo non trovato" });
    }
    res.json({ message: "Arrivo eliminato con successo" });
  } catch (error) {
    console.error("Errore DELETE arrivo:", error);
    res.status(400).json({
      error: "Errore nell'eliminazione dell'arrivo: " + error.message,
    });
  }
});

// === STATISTICHE ===
app.get("/api/stats", async (req, res) => {
  try {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const arriviOggi = await ArrivoMerce.countDocuments({
      dataArrivo: { $gte: oggi },
    });

    const valoreOggiResult = await ArrivoMerce.aggregate([
      { $match: { dataArrivo: { $gte: oggi } } },
      { $group: { _id: null, totale: { $sum: "$prezzoTotale" } } },
    ]);

    const totaleFornitori = await Fornitore.countDocuments();
    const totaleProdotti = await Prodotto.countDocuments();
    const totaleArrivi = await ArrivoMerce.countDocuments();

    res.json({
      arriviOggi,
      valoreOggi: valoreOggiResult[0]?.totale || 0,
      totaleFornitori,
      totaleProdotti,
      totaleArrivi,
    });
  } catch (error) {
    console.error("Errore GET stats:", error);
    res.status(500).json({ error: "Errore nel recuperare le statistiche" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Errore server:", err.stack);
  res.status(500).json({ error: "Errore interno del server" });
});

// Export per Vercel
module.exports = app;
