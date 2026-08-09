import { motion } from "framer-motion";
import PageHead from "./PageHead";
import Navbar from "@/components/Reuseable/Navbar";

export default function LoadingScreen({ dark, onToggleDark }) {
  return (
    <div className={`flex flex-col font-copy min-h-screen ${dark ? "bg-[#121213]" : "bg-white"}`}>
      <PageHead
        title="Mindleap — Brain Training Games"
        description="Play daily brain training games to boost memory, attention and cognitive speed."
      />
      <Navbar dark={dark} onToggleDark={onToggleDark} />
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#6AAA64] border-t-transparent rounded-full"
        />
      </div>
    </div>
  );
}