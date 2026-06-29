import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheckCircle, FiInfo, FiXCircle } from "react-icons/fi";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            background: 'var(--surface-high)',
            border: `1px solid ${type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--error)' : 'var(--primary)'}`,
            borderRadius: '12px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            color: 'var(--on-surface)',
            minWidth: '300px'
          }}
        >
          <div style={{ 
            color: type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--error)' : 'var(--primary)',
            display: 'flex'
          }}>
            {type === 'success' && <FiCheckCircle size={24} />}
            {type === 'error' && <FiXCircle size={24} />}
            {type === 'info' && <FiInfo size={24} />}
          </div>
          <span style={{ fontSize: '15px', fontWeight: 500, flex: 1 }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
