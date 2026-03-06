export const sessionManager = {
  getSessionId(): string {
    let sessionId = localStorage.getItem('paperpal_session');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('paperpal_session', sessionId);
    }
    return sessionId;
  }
};