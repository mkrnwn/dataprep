'use client';

import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface FeatureExplainerProps {
  title: string;
  description: string;
}

export default function FeatureExplainer({ title, description }: FeatureExplainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 flex items-start space-x-3 text-blue-900"
    >
      {/* Badge Icon */}
      <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg shrink-0">
        <Lightbulb className="w-4 h-4" />
      </div>

      {/* Description Content */}
      <div className="space-y-1 text-xs">
        <h4 className="font-bold text-slate-800 tracking-tight">{title}</h4>
        <p className="text-slate-500 leading-relaxed text-[11px] sm:text-xs">{description}</p>
      </div>
    </motion.div>
  );
}
