"use client"

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import Image from "next/image";
import Link from "next/link";
import Hero from "./Hero";
// import logo from '@/public/logo-nobg.png'

export const Navbar = ({ children }) => {
  return (
    <section className="h-screen bg-neutral-950">
      <nav className=" z-50 fixed left-[50%] top-8 flex w-fit -translate-x-[50%] items-center gap-6 rounded-lg border-[1px] border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-500">
        {/* <Image src={logo} alt="logo" width={100} height={100} /> */}

        <NavLink href="#home">Home</NavLink>
        <NavLink href="#about">About</NavLink>
        <NavLink href="#pricing">Pricing</NavLink>

        <Link href="/dashboard/create">
          <Button>Create</Button>
        </Link>
      </nav>
      {children}
    </section>
  );
};

const Logo = () => {
  return (
    <svg
      width="24"
      height="auto"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-2 fill-neutral-50"
    >
      <path
        d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        stopColor="#000000"
      ></path>
      <path
        d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        stopColor="#000000"
      ></path>
    </svg>
  );
};

const NavLink = ({ children, href }) => {
  const handleClick = () => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button className="block overflow-hidden">
      <motion.div
        whileHover={{ y: -20 }}
        transition={{ ease: "backInOut", duration: 0.5 }}
        className="h-[20px] cursor-pointer"
        onClick={handleClick}
      >
        <span className="flex h-[20px] items-center">{children}</span>
        <span className="flex h-[20px] items-center text-neutral-50">
          {children}
        </span>
      </motion.div>
    </button>
  );
};