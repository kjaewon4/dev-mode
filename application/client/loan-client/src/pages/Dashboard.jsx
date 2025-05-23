import React, { useState, useEffect } from "react";
import axios from "axios";

// 1개월 ~ 60개월까지 반복 생성
const durationOptions = Array.from({ length: 60 }, (_, i) => i + 1);

const Dashboard = () => {
  const [loanList, setLoanList] = useState([]);
  // 체인에 올릴 정보들
  const [formData, setFormData] = useState({
    requester: "A",
    receiver: "B",
    amount: "",
    durationMonths: "",  // 개월 단위
    interestRate: "",
    startDate: new Date(),  // 계약일
    endDate: null          // 자동 계산될 상환일
  });

  // 개월 수 → 종료일 계산 함수
  const calculateEndDate = (startDate, months) => {
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + months);
    return end;
  };


  const fetchLoans = async () => {
    try {
      const res = await axios.get("/api/loans");
      setLoanList(res.data);
    } catch (e) {
      console.error("조회 실패", e);
    }
  };

  // 처음 렌더링 할 때 대출 리스트 불러오기
  useEffect(() => {
    fetchLoans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "durationMonths") {
      const endDate = calculateEndDate(formData.startDate, parseInt(value));
      setFormData({ ...formData, [name]: value, endDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    };

    const handleCreate = async () => {
  const { requester, amount, durationMonths } = formData;

  if (!amount || !durationMonths) {
    alert("금액과 기간을 모두 입력해주세요.");
    return;
  }

  try {
    const id = Date.now().toString(); // 또는 UUID 생성 등 고유 ID 부여
    const durationDays = parseInt(durationMonths) * 30;

    const url = `/createLoan?id=${id}&requester=${requester}&amount=${amount}&durationDays=${durationDays}`;

    const res = await axios.get(url);

    alert("블록체인에 대출 요청이 성공적으로 등록되었습니다.");
    fetchLoans();

    setFormData({
      requester: "A",
      receiver: "B",
      amount: "",
      durationMonths: "",
      interestRate: "",
      startDate: new Date(),
      endDate: null,
    });
  } catch (error) {
    console.error("대출 요청 실패:", error);
    alert("대출 요청 중 오류가 발생했습니다.");
  }
};


  return (
    <div className="bg-white text-gray-800 p-10 text-[17px]">
      {/* 상단 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="p-6 border rounded-xl">
          <p className="text-sm text-gray-500">신용 점수</p>
          <p className="text-3xl font-bold">850 <span className="text-green-500 text-base">▲2.5%</span></p>
        </div>
        <div className="p-6 border rounded-xl">
          <p className="text-sm text-gray-500">활성 대출</p>
          <p className="text-3xl font-bold">2 <span className="text-base">총 1,000,000 KRW</span></p>
        </div>
        <div className="p-6 border rounded-xl">
          <p className="text-sm text-gray-500">대출 상환율</p>
          <p className="text-3xl font-bold">98%</p>
          <p className="text-xs text-gray-400">지난 12개월</p>
        </div>
        <div className="p-6 border rounded-xl">
          <p className="text-sm text-gray-500">이용 가능한 한도</p>
          <p className="text-3xl font-bold">3,000,000 KRW</p>
          <p className="text-xs text-gray-400">최대 한도</p>
        </div>
      </div>

      {/* 친구 대출 요청 */}
      <div className="p-8 border rounded-xl mb-12">
        <h2 className="text-xl font-semibold mb-6">친구 대출 요청</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center border rounded-lg px-4 py-3">
            <input
              type="text"
              name="amount"
              placeholder="금액을 입력하세요"
              className="flex-grow outline-none placeholder-gray-400 text-lg"
              onChange={handleChange}
            />
            <span className="text-gray-400 ml-2">KRW</span>
          </div>
          <div>
      <div className="relative w-full">
    {/* 상환일 표시 (겹치게 배치됨) */}
    {formData.endDate && (
      <span className="absolute right-5 top-3 text-md text-gray-500 pointer-events-none z-10">
        {formData.endDate.toISOString().split("T")[0]}
      </span>
    )}

    {/*  select 영역 */}
    <select
      name="durationMonths"
      value={formData.durationMonths}
      onChange={handleChange}
      className="border px-4 py-3 rounded-lg w-full text-lg relative z-0"
    >
      <option value="">상환 기간 선택 (개월)</option>
      {durationOptions.map((month) => (
        <option key={month} value={month}>
          {month}개월
        </option>
      ))}
    </select>
    </div>

      </div>
          <input
            type="text"
            placeholder="연 이자율 입력"
            name="interestRate"
            className="border px-4 py-3 rounded-lg w-full text-lg"
            onChange={handleChange}

          />
          <select
            name="receiver"
            value={formData.receiver}
            onChange={handleChange}
            className="border px-4 py-3 rounded-lg w-full text-lg"
          >
            <option value="">친구를 선택하세요</option>
            <option value="B">친구 B</option>
            <option value="C">친구 C</option>
          </select>

        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button className="border px-6 py-2 rounded-lg">취소</button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg" onClick={handleCreate}>계약서 생성</button>
        </div>
      </div>

      {/* 최근 활동 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 border rounded-xl">
            <div className="flex items-center space-x-4">
              <img src="https://via.placeholder.com/40" className="rounded-full" alt="user1" />
              <div>
                <p className="text-base">김철수님이 대출을 요청했습니다</p>
                <p className="text-sm text-gray-500">500,000 KRW • 3개월</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className="text-green-600 text-sm bg-green-50 px-3 py-1 rounded-md">수락</span>
              <span className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-md">거절</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-5 border rounded-xl">
            <div className="flex items-center space-x-4">
              <img src="https://via.placeholder.com/40" className="rounded-full" alt="user2" />
              <div>
                <p className="text-base">이영희님이 상환했습니다</p>
                <p className="text-sm text-gray-500">300,000 KRW</p>
              </div>
            </div>
            <span className="text-green-600 text-sm flex items-center space-x-1">
              <span className="text-xl">✔</span> <span>완료</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
