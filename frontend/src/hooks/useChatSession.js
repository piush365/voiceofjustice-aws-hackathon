import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, generateLegalNotice } from '../services/chatApi';
import { formatTime } from '../utils/time';
import { getApiErrorMessage } from '../utils/errors';

export function useChatSession() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Refs to always access latest values inside async callbacks (avoids stale closures)
  const sessionIdRef = useRef(sessionId);
  const inputMessageRef = useRef(inputMessage);
  const isLoadingRef = useRef(isLoading);

  // Keep refs in sync with state
  const setSessionIdSynced = useCallback((id) => {
    sessionIdRef.current = id;
    setSessionId(id);
  }, []);

  const setInputMessageSynced = useCallback((msg) => {
    inputMessageRef.current = typeof msg === 'function' ? msg(inputMessageRef.current) : msg;
    setInputMessage(msg);
  }, []);

  const setIsLoadingSynced = useCallback((val) => {
    isLoadingRef.current = val;
    setIsLoading(val);
  }, []);

  const appendMessage = useCallback((role, content) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: formatTime(),
      },
    ]);
  }, []);

  /** Reset everything so the user can start over. */
  const resetSession = useCallback(() => {
    setSessionIdSynced(null);
    setMessages([]);
    setInputMessageSynced('');
    setIsLoadingSynced(false);
    setIsComplete(false);
    setGeneratedDocument(null);
    setQuestionNumber(0);
  }, [setSessionIdSynced, setInputMessageSynced, setIsLoadingSynced]);

  /** Returns true if the error was a session-expired (440) and was handled. */
  const handleSessionExpiry = useCallback((error) => {
    if (error.response?.status === 440) {
      resetSession();
      appendMessage(
        'assistant',
        '⏰ Your session has expired. Starting a fresh conversation — please try again!'
      );
      return true;
    }
    return false;
  }, [resetSession, appendMessage]);

  const startConversation = useCallback(async () => {
    if (isLoadingRef.current) return;

    setIsLoadingSynced(true);

    try {
      const data = await sendChatMessage(null, 'start');

      setSessionIdSynced(data.session_id);
      appendMessage('assistant', data.ai_response);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setIsComplete(data.is_complete);
    } catch (error) {
      console.error('Error starting conversation:', error);
      if (!handleSessionExpiry(error)) {
        const message = getApiErrorMessage(
          error,
          '❌ Sorry, there was an error starting the chat. Please try again.'
        );
        appendMessage('assistant', message);
      }
    } finally {
      setIsLoadingSynced(false);
    }
  }, [appendMessage, handleSessionExpiry, setIsLoadingSynced, setSessionIdSynced]);

  const sendMessageToAssistant = useCallback(async (directMessage) => {
    // Use ref to always get the latest inputMessage value
    const text = directMessage !== undefined ? directMessage : inputMessageRef.current;
    const trimmed = (text ?? '').trim();

    console.log('[sendMessageToAssistant] trimmed:', trimmed, '| isLoading:', isLoadingRef.current, '| sessionId:', sessionIdRef.current);

    if (!trimmed || isLoadingRef.current) return;

    appendMessage('user', trimmed);
    setInputMessageSynced('');
    setIsLoadingSynced(true);

    try {
      const data = await sendChatMessage(sessionIdRef.current, trimmed);

      // Always update session ID from response (in case it changed)
      if (data.session_id) {
        setSessionIdSynced(data.session_id);
      }

      appendMessage('assistant', data.ai_response);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setIsComplete(data.is_complete);
    } catch (error) {
      console.error('Error sending message:', error);
      if (!handleSessionExpiry(error)) {
        const message = getApiErrorMessage(
          error,
          '❌ Sorry, there was an error. Please try again.'
        );
        appendMessage('assistant', message);
      }
    } finally {
      setIsLoadingSynced(false);
    }
  }, [appendMessage, handleSessionExpiry, setInputMessageSynced, setIsLoadingSynced, setSessionIdSynced]);

  const generateDocument = useCallback(async () => {
    if (!sessionIdRef.current || isLoadingRef.current) return;

    setIsLoadingSynced(true);

    try {
      const data = await generateLegalNotice(sessionIdRef.current);

      setGeneratedDocument(data.document);
      appendMessage('assistant', `✅ ${data.message}`);
    } catch (error) {
      console.error('Error generating document:', error);
      if (!handleSessionExpiry(error)) {
        const message = getApiErrorMessage(
          error,
          '❌ Error generating document. Please try again.'
        );
        appendMessage('assistant', message);
      }
    } finally {
      setIsLoadingSynced(false);
    }
  }, [appendMessage, handleSessionExpiry, setIsLoadingSynced]);

  const startNewConversation = useCallback(() => {
    resetSession();
  }, [resetSession]);

  // Keep inputMessageRef in sync whenever setInputMessage is called externally
  // (e.g. via the returned setInputMessage setter used in App for typing)
  const setInputMessageTracked = useCallback((val) => {
    const newVal = typeof val === 'function' ? val(inputMessageRef.current) : val;
    inputMessageRef.current = newVal;
    setInputMessage(newVal);
  }, []);

  return {
    sessionId,
    messages,
    inputMessage,
    isLoading,
    isComplete,
    generatedDocument,
    questionNumber,
    totalQuestions,
    setInputMessage: setInputMessageTracked,
    startConversation,
    sendMessageToAssistant,
    generateDocument,
    startNewConversation,
  };
}
