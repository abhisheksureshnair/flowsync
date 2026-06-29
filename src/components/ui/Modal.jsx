import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX } from "react-icons/fi";

function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-card"
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '500px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--surface)', 
              boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>{title}</h3>
              <button 
                onClick={onClose}
                className="icon-btn"
                style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '4px' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
