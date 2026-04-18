'use client';

import { useState } from 'react';

// ============================================
// 🔧 CONFIGURATION — Change your number here
// Format: country code + number, no spaces/dashes/plus
// Nigeria: 08012345678 → 2348012345678
// UK: 07412345678 → 447412345678
const WHATSAPP_NUMBER = '2347040884245'; // ← YOUR NUMBER HERE

const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Change Art Gallerie! 👋 I'm interested in your creative books for kids. Can you tell me more?";
// ============================================

export default function WhatsAppButton() {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const quickMessages = [
    { label: '📚 Book Enquiry', text: "Hi! I'd like to know more about your book collection — what age ranges do you cover?" },
    { label: '🛒 Order Help', text: "Hi! I need help placing an order. Can you assist?" },
    { label: '🏫 School/Bulk Order', text: "Hello! I'm a teacher/school admin interested in bulk ordering your books for our school." },
    { label: '📞 Call Me', text: "Hi! Can someone call me back? I'd like to discuss your books." },
  ];

  function openWhatsApp(msg: string) {
    const encoded = encodeURIComponent(msg || WHATSAPP_DEFAULT_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setExpanded(false);
    setMessage('');
  }

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      {expanded && (
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow-lg w-[320px] md:w-[360px] overflow-hidden animate-fade-in-up">
          <div className="bg-[#25D366] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm font-headline">Change Art Gallerie</p>
                <p className="text-white/80 text-xs">Typically replies within minutes</p>
              </div>
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/80 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 bg-[#ECE5DD]">
            <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[85%] ambient-shadow text-sm">
              <p className="text-on-surface">Hello! 👋 Welcome to Change Art Gallerie. How can we help you today?</p>
              <p className="text-[10px] text-outline-variant mt-1 text-right">just now</p>
            </div>
          </div>

          <div className="px-4 py-3 bg-surface-container-lowest space-y-2">
            <p className="text-xs text-on-surface-variant font-medium mb-2">Quick messages:</p>
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((qm) => (
                <button
                  key={qm.label}
                  onClick={() => openWhatsApp(qm.text)}
                  className="bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-full hover:bg-surface-container-high transition-colors font-medium"
                >
                  {qm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 bg-surface-container-lowest border-t border-outline-variant/10 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && message.trim() && openWhatsApp(message)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2.5 bg-surface-container-high rounded-full text-sm ghost-border-focus transition-all"
            />
            <button
              onClick={() => openWhatsApp(message || WHATSAPP_DEFAULT_MESSAGE)}
              className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="group w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all relative"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        {expanded ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
        {!expanded && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-container rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">1</span>
          </span>
        )}
      </button>
    </div>
  );
}