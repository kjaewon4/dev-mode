// 📁 rest/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { send } = require('./sdk.js');  // sdk.js 경로 확인 필요

const app = express();
app.use(cors());
app.use(bodyParser.json());

const HOST = '0.0.0.0';
const PORT = 8001;

// ✅ 대출 생성: 금액, 기간, 이자율, 보낸사람, 받는사람 포함
app.post('/api/loan', (req, res) => {
  const { id, requester, receiver, amount, durationDays, interestRate } = req.body;
  send(
    false,
    'CreateLoanRequest',
    [id, requester, receiver, amount.toString(), durationDays.toString(), interestRate.toString()],
    res
  );
});

// ✅ 전체 대출 목록 조회
app.get('/api/loans', async (req, res) => {
  try {
    await send(true, 'QueryAllLoanRequests', [], res);
  } catch (err) {
    console.error("❌ /api/loans 처리 중 오류:", err);
    res.status(500).json({ message: "내부 서버 오류", error: err.toString() });
  }
});

// ✅ 단일 대출 조회
app.get('/api/loan/:id', (req, res) => {
  send(true, 'QueryLoanRequest', [req.params.id], res);
});

// ✅ 대출 상태 변경 (pending, active, denial, repay, overdue)
app.put('/api/loan/status', (req, res) => {
  const { id, newStatus } = req.body;
  send(false, 'UpdateLoanStatus', [id, newStatus], res);
});

// ================= 정적 파일 서비스 및 React 라우팅 ==================

const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// 마지막에만 index.html 반환 (SPA 대응용)
app.get('*', function (req, res) {
    res.sendFile(path.join(clientPath, 'index.html'));
});

// 서버 시작
app.listen(PORT, HOST);
console.log(`서버 시작중 => http://${HOST}:${PORT}/`);
