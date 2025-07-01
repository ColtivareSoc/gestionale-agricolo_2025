// App.js - Gestionale Agricolo React - Versione Produzione
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

// Configurazione API con fallback per development/production
const API_BASE =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5000";

// Configurazione Axios con timeout e gestione errori
axios.defaults.timeout = 10000;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Interceptor per gestione errori globale
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.code === "ECONNABORTED") {
      alert("Richiesta scaduta. Controlla la connessione.");
    } else if (error.response?.status === 500) {
      alert("Errore del server. Riprova più tardi.");
    }
    return Promise.reject(error);
  }
);

// Utility per le chiamate API
const api = {
  // Fornitori
  getFornitori: () => axios.get(`${API_BASE}/api/fornitori`),
  createFornitore: (data) => axios.post(`${API_BASE}/api/fornitori`, data),
  updateFornitore: (id, data) =>
    axios.put(`${API_BASE}/api/fornitori/${id}`, data),
  deleteFornitore: (id) => axios.delete(`${API_BASE}/api/fornitori/${id}`),

  // Prodotti
  getProdotti: () => axios.get(`${API_BASE}/api/prodotti`),
  createProdotto: (data) => axios.post(`${API_BASE}/api/prodotti`, data),
  updateProdotto: (id, data) =>
    axios.put(`${API_BASE}/api/prodotti/${id}`, data),
  deleteProdotto: (id) => axios.delete(`${API_BASE}/api/prodotti/${id}`),

  // Arrivi
  getArrivi: () => axios.get(`${API_BASE}/api/arrivi`),
  createArrivo: (data) => axios.post(`${API_BASE}/api/arrivi`, data),
  updateArrivo: (id, data) => axios.put(`${API_BASE}/api/arrivi/${id}`, data),
  deleteArrivo: (id) => axios.delete(`${API_BASE}/api/arrivi/${id}`),

  // Stats e Health Check
  getStats: () => axios.get(`${API_BASE}/api/stats`),
  healthCheck: () => axios.get(`${API_BASE}/api/health`),
};

// Badge Components
const FornitoriBadge = ({ fornitori, onAddFornitore }) => (
  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-blue-900 flex items-center">
        <Users className="mr-2 h-4 w-4" />
        Fornitori ({fornitori.length})
      </h3>
      <button
        onClick={onAddFornitore}
        className="text-blue-600 hover:text-blue-800 text-sm"
        type="button"
      >
        + Aggiungi
      </button>
    </div>
    <div className="text-sm text-blue-700">
      {fornitori.length === 0
        ? "Nessun fornitore registrato"
        : `Ultimo: ${fornitori[fornitori.length - 1]?.ragioneSociale || "N/A"}`}
    </div>
  </div>
);

const ProdottiBadge = ({ prodotti, onAddProdotto }) => (
  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-green-900 flex items-center">
        <Package className="mr-2 h-4 w-4" />
        Prodotti ({prodotti.length})
      </h3>
      <button
        onClick={onAddProdotto}
        className="text-green-600 hover:text-green-800 text-sm"
        type="button"
      >
        + Aggiungi
      </button>
    </div>
    <div className="text-sm text-green-700">
      {prodotti.length === 0
        ? "Nessun prodotto registrato"
        : `Categorie: ${[...new Set(prodotti.map((p) => p.categoria))].join(
            ", "
          )}`}
    </div>
  </div>
);

const ArriviMerceBadge = ({ arriviMerce, onRegistraArrivo }) => {
  const oggi = new Date().toDateString();
  const arriviOggi = arriviMerce.filter(
    (a) => new Date(a.dataArrivo).toDateString() === oggi
  );

  const valoreTotaleOggi = arriviOggi.reduce(
    (acc, a) => acc + (a.prezzoTotale || 0),
    0
  );

  return (
    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-orange-900 flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Arrivi Merce
        </h3>
        <button
          onClick={onRegistraArrivo}
          className="text-orange-600 hover:text-orange-800 text-sm"
          type="button"
        >
          + Registra
        </button>
      </div>
      <div className="text-sm text-orange-700 space-y-1">
        <div>Arrivi oggi: {arriviOggi.length}</div>
        <div>Valore oggi: € {valoreTotaleOggi.toFixed(2)}</div>
        <div>Totale registrati: {arriviMerce.length}</div>
      </div>
    </div>
  );
};

// Form Fornitore
const FormFornitore = ({ fornitore, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    ragioneSociale: "",
    partitaIva: "",
    codiceFiscale: "",
    indirizzo: "",
    citta: "",
    cap: "",
    provincia: "",
    nazione: "Italia",
    telefono: "",
    email: "",
    iban: "",
    condizionePagamento: "",
    giorni: 30,
    scontistica: 0,
    biologico: false,
    certificazioniBio: "",
    note: "",
    ...fornitore,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.ragioneSociale || !formData.partitaIva) {
      alert("Compila i campi obbligatori: Ragione Sociale e Partita IVA");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Errore salvataggio fornitore:", error);
      alert("Errore nel salvataggio del fornitore");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">
            {isEdit ? "Modifica Fornitore" : "Nuovo Fornitore"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Ragione Sociale *
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.ragioneSociale}
                onChange={(e) =>
                  setFormData({ ...formData, ragioneSociale: e.target.value })
                }
                placeholder="Nome dell'azienda fornitrice"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Partita IVA *
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.partitaIva}
                onChange={(e) =>
                  setFormData({ ...formData, partitaIva: e.target.value })
                }
                placeholder="12345678901"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Codice Fiscale
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.codiceFiscale}
                onChange={(e) =>
                  setFormData({ ...formData, codiceFiscale: e.target.value })
                }
                placeholder="Se diverso dalla P.IVA"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Indirizzo
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.indirizzo}
                onChange={(e) =>
                  setFormData({ ...formData, indirizzo: e.target.value })
                }
                placeholder="Via, numero civico"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Città</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.citta}
                onChange={(e) =>
                  setFormData({ ...formData, citta: e.target.value })
                }
                placeholder="Città"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CAP</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.cap}
                onChange={(e) =>
                  setFormData({ ...formData, cap: e.target.value })
                }
                placeholder="12345"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Provincia
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.provincia}
                onChange={(e) =>
                  setFormData({ ...formData, provincia: e.target.value })
                }
                placeholder="XX"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nazione</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.nazione}
                onChange={(e) =>
                  setFormData({ ...formData, nazione: e.target.value })
                }
                placeholder="Italia"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefono</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="+39 123 456 7890"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="info@fornitore.it"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">IBAN</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Condizione Pagamento
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.condizionePagamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condizionePagamento: e.target.value,
                  })
                }
                placeholder="es. Bonifico bancario"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Giorni di Pagamento
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.giorni}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    giorni: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="30"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Scontistica (%)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.scontistica}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scontistica: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="biologico"
                className="mr-2 focus:ring-2 focus:ring-blue-500"
                checked={formData.biologico}
                onChange={(e) =>
                  setFormData({ ...formData, biologico: e.target.checked })
                }
                disabled={loading}
              />
              <label htmlFor="biologico" className="text-sm font-medium">
                Prodotti Biologici
              </label>
            </div>

            {formData.biologico && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Certificazioni Bio
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.certificazioniBio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificazioniBio: e.target.value,
                    })
                  }
                  placeholder="Enti certificatori, numero certificato"
                  disabled={loading}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Note aggiuntive sul fornitore"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Salvando...
              </div>
            ) : isEdit ? (
              "Aggiorna"
            ) : (
              "Salva"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Form Prodotto (continua nel prossimo artifact per limiti di spazio)
const FormProdotto = ({ prodotto, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    categoria: "",
    nome: "",
    varieta: "",
    codice: "",
    descrizione: "",
    biologico: false,
    calibrabile: true,
    ...prodotto,
  });
  const [loading, setLoading] = useState(false);

  const categorieDisponibili = [
    { value: "NG", label: "Nettarine Gialle" },
    { value: "PG", label: "Pesche Gialle" },
    { value: "PR", label: "Percoche" },
    { value: "PB", label: "Pesche Bianche" },
    { value: "KW", label: "Kiwi" },
  ];

  const handleSubmit = async () => {
    if (!formData.categoria || !formData.nome) {
      alert("Compila i campi obbligatori: Categoria e Nome Varietà");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Errore salvataggio prodotto:", error);
      alert("Errore nel salvataggio del prodotto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Modifica Prodotto" : "Nuovo Prodotto"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Categoria *
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Seleziona categoria...</option>
              {categorieDisponibili.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nome Varietà *
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="es. Big Top, Hayward, ecc."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Varietà</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.varieta}
              onChange={(e) =>
                setFormData({ ...formData, varieta: e.target.value })
              }
              placeholder="Sottocategoria o varietà specifica"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Codice</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.codice}
              onChange={(e) =>
                setFormData({ ...formData, codice: e.target.value })
              }
              placeholder="Codice interno prodotto"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descrizione
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows="3"
              value={formData.descrizione}
              onChange={(e) =>
                setFormData({ ...formData, descrizione: e.target.value })
              }
              placeholder="Descrizione dettagliata del prodotto"
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 focus:ring-2 focus:ring-green-500"
                checked={formData.biologico}
                onChange={(e) =>
                  setFormData({ ...formData, biologico: e.target.checked })
                }
                disabled={loading}
              />
              <span className="text-sm">Biologico</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 focus:ring-2 focus:ring-green-500"
                checked={formData.calibrabile}
                onChange={(e) =>
                  setFormData({ ...formData, calibrabile: e.target.checked })
                }
                disabled={loading}
              />
              <span className="text-sm">Calibrabile</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Salvando...
              </div>
            ) : isEdit ? (
              "Aggiorna"
            ) : (
              "Salva"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Resto del componente App e altri form nel prossimo commento...
// Continuazione del file App.js - Form Arrivo Merce e Componente Principale

// Form Arrivo Merce
const FormArrivoMerce = ({
  arrivo,
  onSave,
  onCancel,
  fornitori,
  prodotti,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    dataArrivo: new Date().toISOString().split("T")[0],
    oraArrivo: new Date().toTimeString().slice(0, 5),
    fornitoreId: "",
    prodottoId: "",
    lotto: "",
    qualita: "I",
    tipoImballaggio: "bins",
    numeroColli: "",
    pesoLordo: "",
    pesoNetto: "",
    prezzoKg: "",
    percentualeScartoPrevista: 5,
    pesoCommerciabile: "",
    prezzoTotale: "",
    numeroDocumento: "",
    dataDocumento: "",
    documentoAllegato: false,
    biologico: false,
    note: "",
    ...arrivo,
  });
  const [loading, setLoading] = useState(false);

  // Calcolo automatico peso commerciabile e prezzo totale
  useEffect(() => {
    const pesoNetto = parseFloat(formData.pesoNetto) || 0;
    const percentualeScarto =
      parseFloat(formData.percentualeScartoPrevista) || 0;
    const prezzoKg = parseFloat(formData.prezzoKg) || 0;

    const pesoCommerciabile = pesoNetto - (pesoNetto * percentualeScarto) / 100;
    const prezzoTotale = pesoCommerciabile * prezzoKg;

    setFormData((prev) => ({
      ...prev,
      pesoCommerciabile: pesoCommerciabile.toFixed(2),
      prezzoTotale: prezzoTotale.toFixed(2),
    }));
  }, [
    formData.pesoNetto,
    formData.percentualeScartoPrevista,
    formData.prezzoKg,
  ]);

  const handleSubmit = async () => {
    if (
      !formData.fornitoreId ||
      !formData.prodottoId ||
      !formData.numeroColli ||
      !formData.pesoLordo ||
      !formData.pesoNetto ||
      !formData.prezzoKg
    ) {
      alert("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Errore salvataggio arrivo:", error);
      alert("Errore nel salvataggio dell'arrivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">
            {isEdit ? "Modifica Arrivo Merce" : "Registra Arrivo Merce"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Data Arrivo *
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.dataArrivo}
                onChange={(e) =>
                  setFormData({ ...formData, dataArrivo: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ora Arrivo
              </label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.oraArrivo}
                onChange={(e) =>
                  setFormData({ ...formData, oraArrivo: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fornitore *
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.fornitoreId}
                onChange={(e) =>
                  setFormData({ ...formData, fornitoreId: e.target.value })
                }
                disabled={loading}
              >
                <option value="">Seleziona fornitore...</option>
                {fornitori.map((fornitore) => (
                  <option key={fornitore._id} value={fornitore._id}>
                    {fornitore.ragioneSociale}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prodotto *
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.prodottoId}
                onChange={(e) =>
                  setFormData({ ...formData, prodottoId: e.target.value })
                }
                disabled={loading}
              >
                <option value="">Seleziona prodotto...</option>
                {prodotti.map((prodotto) => (
                  <option key={prodotto._id} value={prodotto._id}>
                    {prodotto.categoria} - {prodotto.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lotto</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.lotto}
                onChange={(e) =>
                  setFormData({ ...formData, lotto: e.target.value })
                }
                placeholder="Codice lotto"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Qualità *
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.qualita}
                onChange={(e) =>
                  setFormData({ ...formData, qualita: e.target.value })
                }
                disabled={loading}
              >
                <option value="I">I Qualità</option>
                <option value="II">II Qualità</option>
                <option value="III">III Qualità</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo Imballaggio *
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.tipoImballaggio}
                onChange={(e) =>
                  setFormData({ ...formData, tipoImballaggio: e.target.value })
                }
                disabled={loading}
              >
                <option value="bins">Bins</option>
                <option value="cassette">Cassette</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Numero Colli *
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.numeroColli}
                onChange={(e) =>
                  setFormData({ ...formData, numeroColli: e.target.value })
                }
                placeholder="Quantità"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Peso Lordo (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.pesoLordo}
                onChange={(e) =>
                  setFormData({ ...formData, pesoLordo: e.target.value })
                }
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Peso Netto (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.pesoNetto}
                onChange={(e) =>
                  setFormData({ ...formData, pesoNetto: e.target.value })
                }
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prezzo per Kg (€) *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.prezzoKg}
                onChange={(e) =>
                  setFormData({ ...formData, prezzoKg: e.target.value })
                }
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                % Scarto Prevista
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.percentualeScartoPrevista}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentualeScartoPrevista: e.target.value,
                  })
                }
                placeholder="5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Peso Commerciabile (kg)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                value={formData.pesoCommerciabile}
                readOnly
                placeholder="Calcolato automaticamente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prezzo Totale (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                value={formData.prezzoTotale}
                readOnly
                placeholder="Calcolato automaticamente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Numero Documento
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.numeroDocumento}
                onChange={(e) =>
                  setFormData({ ...formData, numeroDocumento: e.target.value })
                }
                placeholder="DDT, Fattura, ecc."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Data Documento
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.dataDocumento}
                onChange={(e) =>
                  setFormData({ ...formData, dataDocumento: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 focus:ring-2 focus:ring-orange-500"
                  checked={formData.documentoAllegato}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentoAllegato: e.target.checked,
                    })
                  }
                  disabled={loading}
                />
                <span className="text-sm">Documento Allegato</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 focus:ring-2 focus:ring-orange-500"
                  checked={formData.biologico}
                  onChange={(e) =>
                    setFormData({ ...formData, biologico: e.target.checked })
                  }
                  disabled={loading}
                />
                <span className="text-sm">Biologico</span>
              </label>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="3"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Note aggiuntive sull'arrivo"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Salvando...
              </div>
            ) : isEdit ? (
              "Aggiorna"
            ) : (
              "Registra"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principale App
const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Stati per i dati
  const [fornitori, setFornitori] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [arriviMerce, setArriviMerce] = useState([]);

  // Stati per i modali
  const [showFormFornitore, setShowFormFornitore] = useState(false);
  const [showFormProdotto, setShowFormProdotto] = useState(false);
  const [showFormMerce, setShowFormMerce] = useState(false);

  // Stati per modifica
  const [editingFornitore, setEditingFornitore] = useState(null);
  const [editingProdotto, setEditingProdotto] = useState(null);
  const [editingArrivo, setEditingArrivo] = useState(null);

  // Health check e caricamento dati
  const loadData = async () => {
    setLoading(true);
    setError(null);
    setConnectionStatus("checking");

    try {
      // Prima verifica la connessione
      try {
        await api.healthCheck();
        setConnectionStatus("connected");
      } catch (healthError) {
        console.warn("Health check failed, proceeding anyway:", healthError);
        setConnectionStatus("unknown");
      }

      // Carica i dati
      const [fornitoriRes, prodottiRes, arriviRes] = await Promise.all([
        api.getFornitori().catch((err) => ({ data: [] })),
        api.getProdotti().catch((err) => ({ data: [] })),
        api.getArrivi().catch((err) => ({ data: [] })),
      ]);

      setFornitori(fornitoriRes.data || []);
      setProdotti(prodottiRes.data || []);
      setArriviMerce(arriviRes.data || []);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Errore caricamento dati:", error);
      setConnectionStatus("failed");
      setError(
        "Errore di connessione al server. Verifica che il backend sia attivo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler per salvataggio con gestione errori migliorata
  const handleSaveFornitore = async (fornitoreData) => {
    try {
      if (editingFornitore) {
        const response = await api.updateFornitore(
          editingFornitore._id,
          fornitoreData
        );
        setFornitori(
          fornitori.map((f) =>
            f._id === editingFornitore._id ? response.data : f
          )
        );
        setEditingFornitore(null);
      } else {
        const response = await api.createFornitore(fornitoreData);
        setFornitori([response.data, ...fornitori]);
      }
      setShowFormFornitore(false);
    } catch (error) {
      console.error("Errore salvataggio fornitore:", error);
      throw error;
    }
  };

  const handleSaveProdotto = async (prodottoData) => {
    try {
      if (editingProdotto) {
        const response = await api.updateProdotto(
          editingProdotto._id,
          prodottoData
        );
        setProdotti(
          prodotti.map((p) =>
            p._id === editingProdotto._id ? response.data : p
          )
        );
        setEditingProdotto(null);
      } else {
        const response = await api.createProdotto(prodottoData);
        setProdotti([...prodotti, response.data]);
      }
      setShowFormProdotto(false);
    } catch (error) {
      console.error("Errore salvataggio prodotto:", error);
      throw error;
    }
  };

  const handleSaveArrivo = async (arrivoData) => {
    try {
      if (editingArrivo) {
        const response = await api.updateArrivo(editingArrivo._id, arrivoData);
        setArriviMerce(
          arriviMerce.map((a) =>
            a._id === editingArrivo._id ? response.data : a
          )
        );
        setEditingArrivo(null);
      } else {
        const response = await api.createArrivo(arrivoData);
        setArriviMerce([response.data, ...arriviMerce]);
      }
      setShowFormMerce(false);
    } catch (error) {
      console.error("Errore salvataggio arrivo:", error);
      throw error;
    }
  };

  const handleDeleteFornitore = async (fornitoreId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo fornitore?")) {
      try {
        await api.deleteFornitore(fornitoreId);
        setFornitori(fornitori.filter((f) => f._id !== fornitoreId));
      } catch (error) {
        console.error("Errore eliminazione fornitore:", error);
        alert("Errore nell'eliminazione del fornitore");
      }
    }
  };

  const handleDeleteProdotto = async (prodottoId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo prodotto?")) {
      try {
        await api.deleteProdotto(prodottoId);
        setProdotti(prodotti.filter((p) => p._id !== prodottoId));
      } catch (error) {
        console.error("Errore eliminazione prodotto:", error);
        alert("Errore nell'eliminazione del prodotto");
      }
    }
  };

  const handleDeleteArrivo = async (arrivoId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo arrivo?")) {
      try {
        await api.deleteArrivo(arrivoId);
        setArriviMerce(arriviMerce.filter((a) => a._id !== arrivoId));
      } catch (error) {
        console.error("Errore eliminazione arrivo:", error);
        alert("Errore nell'eliminazione dell'arrivo");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="spinner mx-auto mb-4"
            style={{ width: "40px", height: "40px" }}
          ></div>
          <p className="text-gray-600">Caricamento dati...</p>
          <p className="text-sm text-gray-500 mt-2">
            Connessione: {connectionStatus}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Errore di Connessione
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">
              Stato connessione: {connectionStatus}
            </p>
            <p className="text-sm text-gray-500">API Base: {API_BASE}</p>
          </div>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            type="button"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestionale Azienda Agricola
              </h1>
              <p className="text-gray-600">
                Sistema di gestione per arrivi merce, fornitori e magazzino
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <div
                className={`inline-flex items-center px-2 py-1 rounded ${
                  connectionStatus === "connected"
                    ? "bg-green-100 text-green-800"
                    : connectionStatus === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "failed"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
                {connectionStatus === "connected"
                  ? "Online"
                  : connectionStatus === "failed"
                  ? "Offline"
                  : "Controllo..."}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FornitoriBadge
            fornitori={fornitori}
            onAddFornitore={() => setShowFormFornitore(true)}
          />
          <ProdottiBadge
            prodotti={prodotti}
            onAddProdotto={() => setShowFormProdotto(true)}
          />
          <ArriviMerceBadge
            arriviMerce={arriviMerce}
            onRegistraArrivo={() => setShowFormMerce(true)}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Azioni Rapide</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowFormMerce(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              type="button"
            >
              <Plus className="mr-2 h-5 w-5" />
              Registra Arrivo Merce
            </button>
            <button
              onClick={() => setShowFormFornitore(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center transition-colors"
              type="button"
            >
              <Users className="mr-2 h-5 w-5" />
              Nuovo Fornitore
            </button>
            <button
              onClick={() => setShowFormProdotto(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center transition-colors"
              type="button"
            >
              <Package className="mr-2 h-5 w-5" />
              Nuovo Prodotto
            </button>
          </div>
        </div>

        {/* Recent Arrivals */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Ultimi Arrivi Merce</h2>
          {arriviMerce.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun arrivo registrato
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Fornitore</th>
                    <th className="text-left p-2">Prodotto</th>
                    <th className="text-left p-2">Peso (kg)</th>
                    <th className="text-left p-2">Prezzo €</th>
                    <th className="text-left p-2">Qualità</th>
                    <th className="text-left p-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {arriviMerce.slice(0, 10).map((arrivo) => (
                    <tr
                      key={arrivo._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-2">
                        {new Date(arrivo.dataArrivo).toLocaleDateString(
                          "it-IT"
                        )}
                      </td>
                      <td className="p-2">
                        {arrivo.fornitoreId?.ragioneSociale || "N/A"}
                      </td>
                      <td className="p-2">
                        {arrivo.prodottoId?.categoria || ""} -{" "}
                        {arrivo.prodottoId?.nome || "N/A"}
                      </td>
                      <td className="p-2">{arrivo.pesoNetto}</td>
                      <td className="p-2">€ {arrivo.prezzoTotale}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            arrivo.qualita === "I"
                              ? "bg-green-100 text-green-800"
                              : arrivo.qualita === "II"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {arrivo.qualita}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingArrivo(arrivo);
                              setShowFormMerce(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            type="button"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArrivo(arrivo._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fornitori e Prodotti Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fornitori */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Fornitori</h2>
              <button
                onClick={() => setShowFormFornitore(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center transition-colors"
                type="button"
              >
                <Plus className="mr-1 h-4 w-4" />
                Aggiungi
              </button>
            </div>
            {fornitori.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessun fornitore registrato
              </p>
            ) : (
              <div className="space-y-2">
                {fornitori.slice(0, 5).map((fornitore) => (
                  <div
                    key={fornitore._id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {fornitore.ragioneSociale}
                      </div>
                      <div className="text-sm text-gray-500">
                        {fornitore.partitaIva}
                        {fornitore.biologico && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            BIO
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingFornitore(fornitore);
                          setShowFormFornitore(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFornitore(fornitore._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {fornitori.length > 5 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    ... e altri {fornitori.length - 5} fornitori
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prodotti */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Prodotti</h2>
              <button
                onClick={() => setShowFormProdotto(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center transition-colors"
                type="button"
              >
                <Plus className="mr-1 h-4 w-4" />
                Aggiungi
              </button>
            </div>
            {prodotti.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessun prodotto registrato
              </p>
            ) : (
              <div className="space-y-2">
                {prodotti.slice(0, 5).map((prodotto) => (
                  <div
                    key={prodotto._id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {prodotto.categoria} - {prodotto.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prodotto.biologico && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                            BIO
                          </span>
                        )}
                        {prodotto.calibrabile && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                            CALIBRABILE
                          </span>
                        )}
                        {prodotto.varieta && `Varietà: ${prodotto.varieta}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProdotto(prodotto);
                          setShowFormProdotto(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProdotto(prodotto._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {prodotti.length > 5 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    ... e altri {prodotti.length - 5} prodotti
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer con informazioni sistema */}
        <footer className="mt-12 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sistema</h3>
              <p>Gestionale Agricolo v1.0</p>
              <p>Ambiente: {process.env.NODE_ENV || "development"}</p>
              <p>API: {API_BASE}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Stato Database
              </h3>
              <p>Fornitori: {fornitori.length}</p>
              <p>Prodotti: {prodotti.length}</p>
              <p>Arrivi Merce: {arriviMerce.length}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Ultima Sincronizzazione
              </h3>
              <p>{new Date().toLocaleString("it-IT")}</p>
              <button
                onClick={loadData}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                type="button"
              >
                Aggiorna Dati
              </button>
            </div>
          </div>
        </footer>

        {/* Modali */}
        {showFormFornitore && (
          <FormFornitore
            fornitore={editingFornitore}
            onSave={handleSaveFornitore}
            onCancel={() => {
              setShowFormFornitore(false);
              setEditingFornitore(null);
            }}
            isEdit={!!editingFornitore}
          />
        )}

        {showFormProdotto && (
          <FormProdotto
            prodotto={editingProdotto}
            onSave={handleSaveProdotto}
            onCancel={() => {
              setShowFormProdotto(false);
              setEditingProdotto(null);
            }}
            isEdit={!!editingProdotto}
          />
        )}

        {showFormMerce && (
          <FormArrivoMerce
            arrivo={editingArrivo}
            onSave={handleSaveArrivo}
            onCancel={() => {
              setShowFormMerce(false);
              setEditingArrivo(null);
            }}
            fornitori={fornitori}
            prodotti={prodotti}
            isEdit={!!editingArrivo}
          />
        )}
      </div>
    </div>
  );
};

export default App;
