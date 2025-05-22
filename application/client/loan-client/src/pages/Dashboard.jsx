// 📁 src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [loanList, setLoanList] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    requester: "",
    receiver: "",
    amount: "",
    durationDays: "",
    interestRate: ""
  });

  const fetchLoans = async () => {
    try {
      const res = await axios.get("/api/loans");
      setLoanList(res.data);
    } catch (e) {
      console.error("조회 실패", e);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const newLoan = { ...formData, id: `loan-${Date.now()}` };
      await axios.post("/api/loan", newLoan);
      alert("대출 생성 완료");
      fetchLoans();
    } catch (e) {
      alert("에러 발생: " + e.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put("/api/loan/status", { id, newStatus });
      fetchLoans();
    } catch (e) {
      alert("상태 변경 실패: " + e.message);
    }
  };

  return (
    <div className="p-10 bg-white text-gray-900">
      <h2 className="text-xl font-bold mb-4">📥 대출 요청</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input name="requester" placeholder="보내는 사람" onChange={handleChange} className="border p-2" />
        <input name="receiver" placeholder="받는 사람" onChange={handleChange} className="border p-2" />
        <input name="amount" placeholder="금액" onChange={handleChange} className="border p-2" />
        <input name="durationDays" placeholder="기간(일)" onChange={handleChange} className="border p-2" />
        <input name="interestRate" placeholder="이자율(%)" onChange={handleChange} className="border p-2" />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreate}>대출 생성</button>

      <h2 className="text-xl font-bold mt-10 mb-4">📋 대출 목록</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">보낸사람</th>
            <th className="border p-2">받는사람</th>
            <th className="border p-2">금액</th>
            <th className="border p-2">이자율</th>
            <th className="border p-2">상태</th>
            <th className="border p-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {loanList.map((loan) => (
            <tr key={loan.id}>
              <td className="border p-2">{loan.id}</td>
              <td className="border p-2">{loan.requester}</td>
              <td className="border p-2">{loan.receiver}</td>
              <td className="border p-2">{loan.amount}</td>
              <td className="border p-2">{loan.interestRate}%</td>
              <td className="border p-2">{loan.status}</td>
              <td className="border p-2 space-x-2">
                <button className="bg-green-500 text-white px-2 py-1 text-sm rounded" onClick={() => updateStatus(loan.id, 'active')}>승인</button>
                <button className="bg-yellow-500 text-white px-2 py-1 text-sm rounded" onClick={() => updateStatus(loan.id, 'repay')}>상환</button>
                <button className="bg-gray-500 text-white px-2 py-1 text-sm rounded" onClick={() => updateStatus(loan.id, 'overdue')}>연체</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
