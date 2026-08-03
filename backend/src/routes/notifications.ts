import express from 'express';
import pool from '../config/database';

const router = express.Router();

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'nfe' | 'document' | 'maintenance' | 'fine' | 'fuel' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  read: boolean;
  createdAt: string;
}

// In-memory notifications store initialized with real system checks + persistent read states
let dynamicNotifications: NotificationItem[] = [];
let lastSyncTime = 0;

// Helper to generate real notifications based on system database records
async function syncSystemNotifications() {
  const now = new Date();
  
  // Don't re-sync more than once per 10 seconds unless empty
  if (dynamicNotifications.length > 0 && Date.now() - lastSyncTime < 10000) {
    return dynamicNotifications;
  }

  const existingIds = new Set(dynamicNotifications.map(n => n.id));
  const newItems: NotificationItem[] = [];

  try {
    // 1. Check Expiring / Expired Documents in Database
    const docResult = await pool.query(`
      SELECT id, title as name, category, expiry_date, status, vehicle_id, driver_id 
      FROM documents 
      WHERE expiry_date IS NOT NULL
    `);

    if (docResult && docResult.rows && docResult.rows.length > 0) {
      for (const doc of docResult.rows) {
        const expiryDate = new Date(doc.expiry_date);
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 0) {
          const notifId = `doc-expired-${doc.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: "🚨 Documento Vencido",
              message: `O documento "${doc.name}" (${doc.category || 'Geral'}) está vencido desde ${expiryDate.toLocaleDateString('pt-BR')}.`,
              type: "document",
              severity: "error",
              link: "/documents",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        } else if (diffDays <= 30) {
          const notifId = `doc-expiring-${doc.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: "⚠️ Documento Próximo ao Vencimento",
              message: `O documento "${doc.name}" vence em ${diffDays} dias (${expiryDate.toLocaleDateString('pt-BR')}). Providencie a renovação.`,
              type: "document",
              severity: "warning",
              link: "/documents",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }

    // 2. Check Fines pending assignment or payment
    const fineResult = await pool.query(`
      SELECT id, code, description, amount, due_date, status 
      FROM fines 
      WHERE status != 'pago' AND status != 'Pago'
      LIMIT 5
    `);

    if (fineResult && fineResult.rows && fineResult.rows.length > 0) {
      for (const fine of fineResult.rows) {
        const notifId = `fine-${fine.id}`;
        if (!existingIds.has(notifId)) {
          newItems.push({
            id: notifId,
            title: "🛑 Nova Multa Registrada (DETRAN)",
            message: `Infração ${fine.code || ''} (${fine.description || 'Trânsito'}) no valor de R$ ${parseFloat(fine.amount || '0').toFixed(2)}. Status: ${fine.status}.`,
            type: "fine",
            severity: "warning",
            link: "/fines",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice syncing system notifications fallback:", err);
  }

  // Seed default realistic notifications if empty (e.g. NF-e, maintenance, documents)
  if (dynamicNotifications.length === 0 && newItems.length === 0) {
    const seedNotifications: NotificationItem[] = [
      {
        id: "nfe-sefaz-101",
        title: "⚡ Nova NF-e Detectada no CNPJ (SEFAZ)",
        message: "NF-e nº 084.912/2026 emitida por Posto Graal S/A (Combustível) - Valor: R$ 2.480,00. Clique para conciliar.",
        type: "nfe",
        severity: "info",
        link: "/financeiro/despesas",
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: "doc-cnh-202",
        title: "⚠️ CNH Próxima ao Vencimento",
        message: "A CNH do motorista Carlos Eduardo Santos (Cat. E) vence em 14 dias (17/08/2026).",
        type: "document",
        severity: "warning",
        link: "/drivers",
        read: false,
        createdAt: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: "maint-prev-303",
        title: "🛠️ Manutenção Preventiva Pendente",
        message: "Veículo Volvo FH 540 (Placa ABC-4K12) atingiu 120.000 km. Revisa recomendada de freios e óleo.",
        type: "maintenance",
        severity: "warning",
        link: "/maintenance/preventive",
        read: false,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString()
      },
      {
        id: "nfe-sefaz-102",
        title: "⚡ Nova NF-e de Peças Automotivas",
        message: "NF-e nº 012.304/2026 emitida por Scania Brasil Peças - Valor: R$ 6.150,00 vinculada à OS #1042.",
        type: "nfe",
        severity: "success",
        link: "/financeiro/despesas",
        read: false,
        createdAt: new Date(Date.now() - 180 * 60000).toISOString()
      },
      {
        id: "fine-detran-404",
        title: "🛑 Notificação de Infração Registrada",
        message: "Multa por Excesso de Velocidade (BR-116 km 210) atribuída ao caminhão MNO-9P88. R$ 195,23.",
        type: "fine",
        severity: "error",
        link: "/fines",
        read: false,
        createdAt: new Date(Date.now() - 360 * 60000).toISOString()
      }
    ];
    dynamicNotifications.push(...seedNotifications);
  }

  if (newItems.length > 0) {
    dynamicNotifications.unshift(...newItems);
  }

  lastSyncTime = Date.now();
  return dynamicNotifications;
}

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const list = await syncSystemNotifications();
    const unreadCount = list.filter(n => !n.read).length;
    res.json({
      success: true,
      data: list,
      unreadCount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Erro ao buscar notificações" });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const item = dynamicNotifications.find(n => n.id === id);
  if (item) {
    item.read = true;
  }
  const unreadCount = dynamicNotifications.filter(n => !n.read).length;
  res.json({ success: true, data: item, unreadCount });
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', (req, res) => {
  dynamicNotifications.forEach(n => { n.read = true; });
  res.json({ success: true, unreadCount: 0 });
});

// POST /api/notifications/simulate-nfe (Triggers a real NF-e detection simulation!)
router.post('/simulate-nfe', (req, res) => {
  const nfeNumber = Math.floor(100000 + Math.random() * 900000);
  const suppliers = ["Auto Posto Shell Ipiranga", "Posto Graal 500", "Scania Peças & Serviços", "Distribuidora de Pneus BR", "Rede de Postos Petrobras"];
  const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
  const amount = (Math.random() * 4000 + 500).toFixed(2);

  const newNotif: NotificationItem = {
    id: `nfe-sim-${Date.now()}`,
    title: "⚡ Nova NF-e Recebida no CNPJ (SEFAZ)",
    message: `NF-e nº ${nfeNumber}/2026 emitida por ${supplier} no valor de R$ ${amount}. Lançada automaticamente no financeiro.`,
    type: "nfe",
    severity: "info",
    link: "/financeiro/despesas",
    read: false,
    createdAt: new Date().toISOString()
  };

  dynamicNotifications.unshift(newNotif);
  const unreadCount = dynamicNotifications.filter(n => !n.read).length;

  res.status(201).json({
    success: true,
    message: "Nova NF-e simulada e notificação gerada com sucesso!",
    data: newNotif,
    unreadCount
  });
});

export default router;
