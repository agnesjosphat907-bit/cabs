import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { user } = useParams();
  const homePath = user ? `/${user}` : '/user11';

  return (
    <header className="_topHeader_c2hzr_1 top-header">
      <Link to={homePath} className="_logo_c2hzr_14 brand-logo">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfq46FSuuLtrLgwOG7roK61jl2pgnDCWZbn5Jx2a8O_Q&s=10"
          alt="CABS Loans"
          onError={(e) => { e.target.src = '/favicon.jpeg'; }}
        />
        <span className="brand-title">CABS Loans</span>
      </Link>
      <div className="header-security-badge">
        <ShieldCheck size={16} color="#38bdf8" />
        <span>Bank-level security 🔒</span>
      </div>
    </header>
  );
};
