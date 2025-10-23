/* 💬 CHAT WIDGET - AI Persona Conversation Interface */
.chat-widget {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    width: 400px;
    height: 600px;
    background: var(--dark-card);
    border: 2px solid var(--neon-cyan);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-glow-cyan), var(--shadow-card);
    z-index: 1000;
    display: none;
    flex-direction: column;
    backdrop-filter: blur(10px);
    transition: all var(--transition-normal);
}

.chat-widget.open {
    display: flex;
    animation: slideInUp 0.3s ease-out;
}

.chat-widget.minimized {
    height: 60px;
}

/* Chat Header */
.chat-header {
    background: rgba(0, 255, 255, 0.1);
    padding: var(--space-md);
    border-bottom: 1px solid var(--neon-cyan);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.chat-header h4 {
    margin: 0;
    color: var(--neon-cyan);
    font-size: 1.1rem;
}

.chat-controls {
    display: flex;
    gap: var(--space-xs);
}

.chat-control-btn {
    background: none;
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    width: 30px;
    height: 30px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-normal);
}

.chat-control-btn:hover {
    background: var(--neon-cyan);
    color: var(--dark-bg);
}

.close-chat {
    background: none;
    border: none;
    color: var(--neon-pink);
    font-size: 1.5rem;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-normal);
}

.close-chat:hover {
    color: var(--neon-cyan);
    transform: scale(1.1);
}

/* Chat Messages */
.chat-messages {
    flex: 1;
    padding: var(--space-md);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
}

.chat-messages::-webkit-scrollbar-thumb {
    background: var(--neon-cyan);
    border-radius: var(--radius-sm);
}

.message {
    max-width: 80%;
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    position: relative;
    animation: messageSlide 0.3s ease-out;
}

.message.user {
    align-self: flex-end;
    background: rgba(0, 255, 255, 0.2);
    border: 1px solid var(--neon-cyan);
    border-bottom-right-radius: var(--radius-xs);
}

.message.assistant {
    align-self: flex-start;
    background: rgba(255, 20, 147, 0.2);
    border: 1px solid var(--neon-pink);
    border-bottom-left-radius: var(--radius-xs);
}

.message.system {
    align-self: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--dark-border);
    max-width: 90%;
    text-align: center;
    font-style: italic;
    color: var(--text-muted);
}

.message-content {
    color: var(--text-primary);
    line-height: 1.4;
}

.message-time {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
    text-align: right;
}

.message.assistant .message-time {
    text-align: left;
}

/* Chat Input */
.chat-input {
    padding: var(--space-md);
    border-top: 1px solid var(--dark-border);
    display: flex;
    gap: var(--space-sm);
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.chat-input input {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--dark-border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-primary);
    transition: var(--transition-normal);
}

.chat-input input:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.chat-input input::placeholder {
    color: var(--text-muted);
}

.chat-input button {
    padding: var(--space-sm) var(--space-md);
    background: var(--neon-cyan);
    border: none;
    border-radius: var(--radius-md);
    color: var(--dark-bg);
    font-family: var(--font-primary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
}

.chat-input button:hover:not(:disabled) {
    background: var(--neon-pink);
    transform: scale(1.05);
}

.chat-input button:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
}

/* Typing Indicator */
.typing-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    color: var(--text-muted);
    font-style: italic;
}

.typing-dots {
    display: flex;
    gap: 2px;
}

.typing-dot {
    width: 6px;
    height: 6px;
    background: var(--neon-cyan);
    border-radius: var(--radius-full);
    animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

/* Quick Actions */
.quick-actions {
    display: flex;
    gap: var(--space-xs);
    padding: 0 var(--space-md) var(--space-md);
    flex-wrap: wrap;
}

.quick-action {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--dark-border);
    color: var(--text-secondary);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: 0.8rem;
    cursor: pointer;
    transition: var(--transition-normal);
}

.quick-action:hover {
    background: rgba(0, 255, 255, 0.2);
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
}

/* Persona Info in Chat */
.chat-persona-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 20, 147, 0.1);
    border-bottom: 1px solid var(--neon-pink);
}

.chat-persona-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    border: 2px solid var(--neon-pink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.chat-persona-name {
    color: var(--neon-pink);
    font-weight: 600;
}

.chat-persona-tagline {
    color: var(--text-muted);
    font-size: 0.8rem;
}

/* Animations */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typingBounce {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Responsive Chat */
@media (max-width: 768px) {
    .chat-widget {
        width: 350px;
        height: 500px;
        right: var(--space-md);
        bottom: var(--space-md);
    }
    
    .chat-messages {
        padding: var(--space-sm);
    }
    
    .message {
        max-width: 85%;
        padding: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .chat-widget {
        width: calc(100vw - var(--space-lg));
        height: 70vh;
        right: var(--space-sm);
        left: var(--space-sm);
        bottom: var(--space-sm);
    }
    
    .chat-header {
        padding: var(--space-sm);
    }
    
    .chat-input {
        padding: var(--space-sm);
    }
    
    .quick-actions {
        padding: 0 var(--space-sm) var(--space-sm);
    }
}

/* Chat Trigger Button */
.chat-trigger {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--radius-full);
    color: var(--dark-bg);
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: var(--shadow-glow);
    z-index: 999;
    transition: all var(--transition-bounce);
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-trigger:hover {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 0 30px rgba(255, 20, 147, 0.8);
}

.chat-trigger.pulsing {
    animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {
    0%, 100% {
        box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);
    }
    50% {
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
    }
}
