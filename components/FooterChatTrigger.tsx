"use client";

import React from 'react';

export default function FooterChatTrigger() {
    return (
        <button
            onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
            className="hover:text-slate-300 transition-colors cursor-pointer text-left"
        >
            Help & Support
        </button>
    );
}
