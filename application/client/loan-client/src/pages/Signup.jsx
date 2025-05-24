// 파일: src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabaseClient';
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  "https://nujgcyryhvogafapepyn.supabase.co", // Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51amdjeXJ5aHZvZ2FmYXBlcHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTg0NTgsImV4cCI6MjA2MzM3NDQ1OH0.PMN8j92B3UngKfIwj9Gp5hq9TnsyF6Nv_SBhm3T3JAY" // Supabase public anon key
);


const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    gender: '',
    agree: false,
  });
  const [isSocialUser, setIsSocialUser] = useState(false);

  // 소셜 로그인 후 전달된 세션 정보에서 사용자 정보 자동완성
  useEffect(() => {
    const fillFromSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsSocialUser(true);
        setForm((prev) => ({
          ...prev,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
        }));
      }
    };
    fillFromSession();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSignup = async () => {
    if (!form.email || !form.name || !form.gender) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!isSocialUser && form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!form.agree) {
      alert('약관에 동의해야 가입이 가능합니다.');
      return;
    }

    const session = await supabase.auth.getSession();

    if (!session.data.session) {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            gender: form.gender,
          },
        },
      });
      if (error) {
        alert('회원가입 실패: ' + error.message);
        return;
      } else {
        alert('회원가입 성공! 이메일을 확인해주세요.');
      }
    } else {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: form.name,
          gender: form.gender,
        },
      });
      if (error) {
        alert('프로필 저장 실패: ' + error.message);
        return;
      }
      alert('추가 정보가 저장되었습니다.');
    }
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 leading-tight">
          회원 가입을 위해<br />정보를 입력해주세요
        </h2>

        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="* 이메일"
          className="w-full border-b border-gray-300 py-2 mb-4 outline-none focus:border-blue-500 transition-colors duration-300" />
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="* 이름"
          className="w-full border-b border-gray-300 py-2 mb-4 outline-none focus:border-blue-500 transition-colors duration-300" />

        {/* 일반 가입자만 비밀번호 입력 */}
        {!isSocialUser && (
          <>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="* 비밀번호"
              className="w-full border-b border-gray-300 py-2 mb-4 outline-none focus:border-blue-500 transition-colors duration-300" />
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="* 비밀번호 확인"
              className="w-full border-b border-gray-300 py-2 mb-4 outline-none focus:border-blue-500 transition-colors duration-300" />
          </>
        )}

        <div className="flex justify-around my-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="gender" value="여성" checked={form.gender === '여성'} onChange={handleChange} />
            <span>여성</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="gender" value="남성" checked={form.gender === '남성'} onChange={handleChange} />
            <span>남성</span>
          </label>
        </div>

        <label className="flex items-center text-sm text-gray-600 mb-6">
          <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mr-2" />
          이용약관과 개인정보 수집 및 이용, 마케팅 활용 선택에 모두 동의합니다.
        </label>

        <button onClick={handleSignup} className="w-full border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50">
          가입하기
        </button>
      </div>
    </div>
  );
};

export default Signup;
