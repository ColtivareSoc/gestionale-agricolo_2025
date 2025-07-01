// App.js - Gestionale Agricolo React
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import axios from "axios";

// Configurazione API
const API_BASE =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";

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

  // Stats
  getStats: () => axios.get(`${API_BASE}/api/stats`),
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
    }
    setLoading(false);
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

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Dati Anagrafici
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ragione Sociale *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.ragioneSociale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ragioneSociale: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Partita IVA *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.partitaIva}
                    onChange={(e) =>
                      setFormData({ ...formData, partitaIva: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Codice Fiscale
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.codiceFiscale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codiceFiscale: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.indirizzo}
                    onChange={(e) =>
                      setFormData({ ...formData, indirizzo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Città
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.citta}
                    onChange={(e) =>
                      setFormData({ ...formData, citta: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CAP</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.cap}
                    onChange={(e) =>
                      setFormData({ ...formData, cap: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.provincia}
                    onChange={(e) =>
                      setFormData({ ...formData, provincia: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nazione
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.nazione}
                    onChange={(e) =>
                      setFormData({ ...formData, nazione: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Contatti
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IBAN</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Condizioni Commerciali
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condizione Pagamento
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.condizionePagamento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condizionePagamento: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleziona...</option>
                    <option value="contanti">Contanti</option>
                    <option value="bonifico">Bonifico</option>
                    <option value="riba">RIBA</option>
                    <option value="rimessa_diretta">Rimessa Diretta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giorni Pagamento
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.giorni}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giorni: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Scontistica (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.scontistica}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scontistica: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.biologico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          biologico: e.target.checked,
                        })
                      }
                    />
                    Produttore Biologico
                  </label>
                </div>
              </div>
            </div>

            {formData.biologico && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                  Certificazioni Biologiche
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Certificazioni Bio
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded"
                      rows={2}
                      value={formData.certificazioniBio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certificazioniBio: e.target.value,
                        })
                      }
                      placeholder="Ente certificatore, numero certificato, scadenza..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Note
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Note aggiuntive
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Informazioni aggiuntive sul fornitore..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
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
    </div>
  );
};

// Form Prodotto
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
    }
    setLoading(false);
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
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
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
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="es. Big Top, Hayward, ecc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Codice Prodotto
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.codice}
              onChange={(e) =>
                setFormData({ ...formData, codice: e.target.value })
              }
              placeholder="Codice interno (opzionale)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descrizione
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              value={formData.descrizione}
              onChange={(e) =>
                setFormData({ ...formData, descrizione: e.target.value })
              }
              placeholder="Caratteristiche, periodo di raccolta, note..."
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.biologico}
                onChange={(e) =>
                  setFormData({ ...formData, biologico: e.target.checked })
                }
              />
              Biologico
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.calibrabile}
                onChange={(e) =>
                  setFormData({ ...formData, calibrabile: e.target.checked })
                }
              />
              Calibrabile
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
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
    </div>
  );
};

// Form Merce Entrata
const FormMerceEntrata = ({
  onSave,
  onCancel,
  fornitori,
  prodotti,
  arrivo = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    dataArrivo: new Date().toISOString().split("T")[0],
    oraArrivo: new Date().toTimeString().slice(0, 5),
    fornitoreId: "",
    prodottoId: "",
    qualita: "I",
    tipoImballaggio: "bins",
    numeroColli: "",
    pesoLordo: "",
    pesoNetto: "",
    prezzoKg: "",
    numeroDocumento: "",
    dataDocumento: "",
    documentoAllegato: false,
    biologico: false,
    percentualeScartoPrevista: "",
    note: "",
    ...arrivo,
  });
  const [loading, setLoading] = useState(false);
  const [lotto, setLotto] = useState("");

  useEffect(() => {
    if (formData.prodottoId && formData.dataArrivo) {
      const prodotto = prodotti.find((p) => p._id === formData.prodottoId);
      if (prodotto) {
        const data = formData.dataArrivo.replace(/-/g, "");
        const progressivo = 1;
        const nuovoLotto = `${progressivo}${prodotto.categoria}${data}`;
        setLotto(nuovoLotto);
      }
    }
  }, [formData.prodottoId, formData.dataArrivo, prodotti]);

  const calcolaPesoNetto = () => {
    if (formData.pesoLordo && formData.numeroColli) {
      const lordo = parseFloat(formData.pesoLordo);
      const colli = parseInt(formData.numeroColli);
      const taraSingola = formData.tipoImballaggio === "bins" ? 30 : 1.5;
      const netto = lordo - colli * taraSingola;
      setFormData({ ...formData, pesoNetto: netto.toFixed(1) });
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.fornitoreId ||
      !formData.prodottoId ||
      !formData.numeroColli ||
      !formData.pesoLordo ||
      !formData.prezzoKg
    ) {
      alert("Compila tutti i campi obbligatori");
      return;
    }

    const arrivoData = {
      ...formData,
      lotto: lotto,
      pesoLordo: parseFloat(formData.pesoLordo),
      pesoNetto: parseFloat(formData.pesoNetto),
      numeroColli: parseInt(formData.numeroColli),
      prezzoKg: parseFloat(formData.prezzoKg),
      percentualeScartoPrevista: formData.percentualeScartoPrevista
        ? parseFloat(formData.percentualeScartoPrevista)
        : null,
      pesoCommerciabile: formData.percentualeScartoPrevista
        ? parseFloat(formData.pesoNetto) *
          (1 - parseFloat(formData.percentualeScartoPrevista) / 100)
        : parseFloat(formData.pesoNetto),
      prezzoTotale: formData.percentualeScartoPrevista
        ? parseFloat(formData.pesoNetto) *
          (1 - parseFloat(formData.percentualeScartoPrevista) / 100) *
          parseFloat(formData.prezzoKg)
        : parseFloat(formData.pesoNetto) * parseFloat(formData.prezzoKg),
    };

    setLoading(true);
    try {
      await onSave(arrivoData);
    } catch (error) {
      console.error("Errore salvataggio arrivo:", error);
      alert("Errore nel salvataggio dell'arrivo");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="mr-2" />
            {isEdit
              ? "Modifica Arrivo Merce"
              : "Registrazione Merce in Entrata"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {lotto && (
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                  <span className="font-bold text-blue-900">
                    Lotto: {lotto}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Data e Ora Arrivo
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data Arrivo *
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.dataArrivo}
                    onChange={(e) =>
                      setFormData({ ...formData, dataArrivo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ora Arrivo
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.oraArrivo}
                    onChange={(e) =>
                      setFormData({ ...formData, oraArrivo: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Fornitore e Prodotto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fornitore *
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.fornitoreId}
                    onChange={(e) =>
                      setFormData({ ...formData, fornitoreId: e.target.value })
                    }
                  >
                    <option value="">Seleziona fornitore...</option>
                    {fornitori.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.ragioneSociale}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prodotto *
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.prodottoId}
                    onChange={(e) =>
                      setFormData({ ...formData, prodottoId: e.target.value })
                    }
                  >
                    <option value="">Seleziona prodotto...</option>
                    {prodotti.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.categoria} - {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Caratteristiche
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Qualità *
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.qualita}
                    onChange={(e) =>
                      setFormData({ ...formData, qualita: e.target.value })
                    }
                  >
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo Imballaggio *
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.tipoImballaggio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoImballaggio: e.target.value,
                      })
                    }
                  >
                    <option value="bins">Bins (300kg)</option>
                    <option value="cassette">Cassette (20kg)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.biologico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          biologico: e.target.checked,
                        })
                      }
                    />
                    Prodotto Biologico
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Quantità e Pesi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    N° Colli *
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.numeroColli}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroColli: e.target.value })
                    }
                    onBlur={calcolaPesoNetto}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Peso Lordo (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.pesoLordo}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoLordo: e.target.value })
                    }
                    onBlur={calcolaPesoNetto}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Peso Netto (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    value={formData.pesoNetto}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prezzo €/kg *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.prezzoKg}
                    onChange={(e) =>
                      setFormData({ ...formData, prezzoKg: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                Condizioni Commerciali
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Scarto Previsto (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.percentualeScartoPrevista}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentualeScartoPrevista: e.target.value,
                      })
                    }
                    placeholder="es. 5.5"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Percentuale pattuita con il fornitore
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Peso Commerciabile (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded bg-blue-50"
                    value={
                      formData.pesoNetto && formData.percentualeScartoPrevista
                        ? (
                            parseFloat(formData.pesoNetto) *
                            (1 -
                              parseFloat(
                                formData.percentualeScartoPrevista || 0
                              ) /
                                100)
                          ).toFixed(1)
                        : ""
                    }
                    readOnly
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Peso netto - scarto previsto
                  </div>
                </div>
              </div>
            </div>

            {formData.pesoNetto && formData.prezzoKg && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-green-800 mb-3 border-b border-green-200 pb-1">
                  Riepilogo Economico
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Peso Netto:</span>
                    <div className="font-semibold">{formData.pesoNetto} kg</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Prezzo/kg:</span>
                    <div className="font-semibold">€ {formData.prezzoKg}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tara:</span>
                    <div className="font-semibold">
                      {(
                        parseFloat(formData.pesoLordo || 0) -
                        parseFloat(formData.pesoNetto || 0)
                      ).toFixed(1)}{" "}
                      kg
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Scarto Previsto:</span>
                    <div className="font-semibold">
                      {formData.percentualeScartoPrevista
                        ? `${formData.percentualeScartoPrevista}%`
                        : "Non specificato"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Peso Commerciabile:</span>
                    <div className="font-semibold text-blue-700">
                      {formData.percentualeScartoPrevista
                        ? `${(
                            parseFloat(formData.pesoNetto) *
                            (1 -
                              parseFloat(formData.percentualeScartoPrevista) /
                                100)
                          ).toFixed(1)} kg`
                        : `${formData.pesoNetto} kg`}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Totale:</span>
                    <div className="font-bold text-green-700 text-lg">
                      €{" "}
                      {formData.percentualeScartoPrevista
                        ? (
                            parseFloat(formData.pesoNetto) *
                            (1 -
                              parseFloat(formData.percentualeScartoPrevista) /
                                100) *
                            parseFloat(formData.prezzoKg || 0)
                          ).toFixed(2)
                        : (
                            parseFloat(formData.pesoNetto || 0) *
                            parseFloat(formData.prezzoKg || 0)
                          ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Salvando...
                </div>
              ) : isEdit ? (
                "Aggiorna Arrivo"
              ) : (
                "Registra Arrivo"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function App() {
  const [fornitori, setFornitori] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [arriviMerce, setArriviMerce] = useState([]);

  const [showFormFornitore, setShowFormFornitore] = useState(false);
  const [showFormProdotto, setShowFormProdotto] = useState(false);
  const [showFormMerce, setShowFormMerce] = useState(false);
  const [editingFornitore, setEditingFornitore] = useState(null);
  const [editingProdotto, setEditingProdotto] = useState(null);
  const [editingArrivo, setEditingArrivo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica dati all'avvio
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fornitoriRes, prodottiRes, arriviRes] = await Promise.all([
        api.getFornitori(),
        api.getProdotti(),
        api.getArrivi(),
      ]);

      setFornitori(fornitoriRes.data);
      setProdotti(prodottiRes.data);
      setArriviMerce(arriviRes.data);
      setError(null);
    } catch (error) {
      console.error("Errore caricamento dati:", error);
      setError(
        "Errore nel caricamento dei dati. Verifica la connessione al database."
      );
    } finally {
      setLoading(false);
    }
  };

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
        setFornitori([...fornitori, response.data]);
      }
      setShowFormFornitore(false);
    } catch (error) {
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
      throw error;
    }
  };

  const handleDeleteFornitore = async (fornitoreId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo fornitore?")) {
      try {
        await api.deleteFornitore(fornitoreId);
        setFornitori(fornitori.filter((f) => f._id !== fornitoreId));
      } catch (error) {
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
        alert("Errore nell'eliminazione dell'arrivo");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="spinner mx-auto mb-4"
            style={{ width: "40px", height: "40px" }}
          ></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Errore di Connessione
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestionale Azienda Agricola
          </h1>
          <p className="text-gray-600">
            Sistema di gestione per arrivi merce, fornitori e magazzino
          </p>
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Registra Arrivo Merce
            </button>
            <button
              onClick={() => setShowFormFornitore(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Users className="mr-2 h-5 w-5" />
              Nuovo Fornitore
            </button>
            <button
              onClick={() => setShowFormProdotto(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center"
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
                    <th className="text-left p-2">Lotto</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Fornitore</th>
                    <th className="text-left p-2">Prodotto</th>
                    <th className="text-left p-2">Peso Netto</th>
                    <th className="text-left p-2">Prezzo</th>
                    <th className="text-left p-2">Totale</th>
                    <th className="text-left p-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {arriviMerce.slice(0, 10).map((arrivo) => (
                    <tr key={arrivo._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{arrivo.lotto}</td>
                      <td className="p-2">
                        {new Date(arrivo.dataArrivo).toLocaleDateString(
                          "it-IT"
                        )}
                      </td>
                      <td className="p-2">
                        {arrivo.fornitoreId?.ragioneSociale || "N/A"}
                      </td>
                      <td className="p-2">
                        {arrivo.prodottoId
                          ? `${arrivo.prodottoId.categoria} - ${arrivo.prodottoId.nome}`
                          : "N/A"}
                      </td>
                      <td className="p-2">{arrivo.pesoNetto} kg</td>
                      <td className="p-2">€ {arrivo.prezzoKg}/kg</td>
                      <td className="p-2 font-semibold">
                        € {arrivo.prezzoTotale?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingArrivo(arrivo);
                              setShowFormMerce(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArrivo(arrivo._id)}
                            className="text-red-600 hover:text-red-800 p-1"
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

        {/* Fornitori Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Fornitori</h2>
            <button
              onClick={() => setShowFormFornitore(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi
            </button>
          </div>
          {fornitori.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun fornitore registrato
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Ragione Sociale</th>
                    <th className="text-left p-2">P.IVA</th>
                    <th className="text-left p-2">Città</th>
                    <th className="text-left p-2">Telefono</th>
                    <th className="text-left p-2">Bio</th>
                    <th className="text-left p-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {fornitori.map((fornitore) => (
                    <tr
                      key={fornitore._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2 font-semibold">
                        {fornitore.ragioneSociale}
                      </td>
                      <td className="p-2">{fornitore.partitaIva}</td>
                      <td className="p-2">{fornitore.citta}</td>
                      <td className="p-2">{fornitore.telefono}</td>
                      <td className="p-2">
                        {fornitore.biologico ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Bio
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            Convenzionale
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingFornitore(fornitore);
                              setShowFormFornitore(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFornitore(fornitore._id)}
                            className="text-red-600 hover:text-red-800 p-1"
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

        {/* Prodotti Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Prodotti</h2>
            <button
              onClick={() => setShowFormProdotto(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi
            </button>
          </div>
          {prodotti.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun prodotto registrato
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Categoria</th>
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Codice</th>
                    <th className="text-left p-2">Bio</th>
                    <th className="text-left p-2">Calibrabile</th>
                    <th className="text-left p-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {prodotti.map((prodotto) => (
                    <tr
                      key={prodotto._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {prodotto.categoria}
                        </span>
                      </td>
                      <td className="p-2 font-semibold">{prodotto.nome}</td>
                      <td className="p-2">{prodotto.codice || "-"}</td>
                      <td className="p-2">
                        {prodotto.biologico ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        {prodotto.calibrabile ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingProdotto(prodotto);
                              setShowFormProdotto(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProdotto(prodotto._id)}
                            className="text-red-600 hover:text-red-800 p-1"
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

        {/* Forms and Modals */}
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
          <FormMerceEntrata
            arrivo={editingArrivo}
            fornitori={fornitori}
            prodotti={prodotti}
            onSave={handleSaveArrivo}
            onCancel={() => {
              setShowFormMerce(false);
              setEditingArrivo(null);
            }}
            isEdit={!!editingArrivo}
          />
        )}
      </div>
    </div>
  );
}
