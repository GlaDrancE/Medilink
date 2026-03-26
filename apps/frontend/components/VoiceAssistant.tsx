"use client"
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { voiceAssistantService } from '@/services/voiceAssistant.api';
import { usePatient } from '@/hooks/usePatient';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

export default function VoiceAssistant() {
    const { patient } = usePatient();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [transcript, setTranscript] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef<string>('');

    // Initialize Web Speech API (fallback for STT)
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update the final transcript reference
                if (finalTranscript) {
                    finalTranscriptRef.current += finalTranscript;
                }

                // Display interim + final for real-time feedback
                setTranscript(finalTranscriptRef.current + interimTranscript);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // Restart if still in listening mode
                    recognitionRef.current.start();
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    const startListening = async () => {
        try {
            setIsListening(true);
            setTranscript('');
            finalTranscriptRef.current = ''; // Reset final transcript
            audioChunksRef.current = [];

            // Start Web Speech Recognition (for real-time transcript display)
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            // Start MediaRecorder (for sending audio to backend)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processVoiceInput(audioBlob);

                // Stop the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
            setIsListening(false);
        }
    };

    const stopListening = () => {
        setIsListening(false);

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        console.log('Stopped listening. Final transcript:', finalTranscriptRef.current);
    };

    const processVoiceInput = async (audioBlob: Blob) => {
        if (!patient?.id) {
            alert('Please select a patient first');
            return;
        }

        setIsProcessing(true);

        try {
            // Use the final transcript from recognition
            const finalText = finalTranscriptRef.current.trim() || transcript.trim();

            // Add user message
            const userMessage: Message = {
                id: Date.now().toString(),
                type: 'user',
                text: finalText || 'Processing audio...',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);

            console.log('Sending transcript to backend:', finalText);

            // Send to backend for processing
            const response = await voiceAssistantService.processVoiceInput(
                audioBlob,
                patient.id,
                finalText || undefined
            );

            // Add assistant response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                text: response.text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Play audio response if available and not muted
            if (response.audioUrl && !isMuted) {
                await playAudioResponse(response.audioUrl);
            }

            setTranscript('');
        } catch (error) {
            console.error('Error processing voice input:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                text: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    const playAudioResponse = async (audioUrl: string) => {
        return new Promise<void>((resolve, reject) => {
            setIsSpeaking(true);

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                resolve();
            };

            audio.onerror = (error) => {
                setIsSpeaking(false);
                console.error('Error playing audio:', error);
                reject(error);
            };

            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                setIsSpeaking(false);
                reject(error);
            });
        });
    };

    const stopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted && audioRef.current) {
            audioRef.current.pause();
            setIsSpeaking(false);
        }
    };

    const clearConversation = () => {
        setMessages([]);
        setTranscript('');
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 notranslate"
                    aria-label="Voice Assistant"
                >
                    <MessageSquare className="w-6 h-6 notranslate" aria-hidden="true" />
                </Button>
            </div>

            {/* Voice Assistant Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 z-40">
                    <Card className="shadow-2xl border-2 border-purple-200">
                        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center notranslate">
                                        <MessageSquare className="w-4 h-4 text-white notranslate" aria-hidden="true" />
                                    </div>
                                    <CardTitle className="text-base font-bold">AI Voice Assistant</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleMute}
                                        className="h-8 w-8 p-0 notranslate"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-4 h-4 notranslate" aria-hidden="true" />
                                        ) : (
                                            <Volume2 className="w-4 h-4 notranslate" aria-hidden="true" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8 p-0 notranslate"
                                        aria-label="Close"
                                    >
                                        <X className="w-4 h-4 notranslate" aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            {/* Messages */}
                            <div className="h-64 overflow-y-auto mb-4 space-y-3 scroll-smooth">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 notranslate" aria-hidden="true" />
                                        <p>Click the microphone to start</p>
                                        <p className="text-xs mt-1">Ask about your medical records, prescriptions, or health data</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg px-3 py-2 ${message.type === 'user'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                    <p className="text-[10px] mt-1 opacity-70">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Current Transcript */}
                            {transcript && (
                                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-900">
                                        <span className="font-semibold">You're saying:</span> {transcript}
                                    </p>
                                </div>
                            )}

                            {/* Status Indicators */}
                            {(isProcessing || isSpeaking) && (
                                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600 notranslate" aria-hidden="true" />
                                    <p className="text-xs text-purple-900">
                                        {isProcessing ? 'Processing your request...' : 'Speaking...'}
                                    </p>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={isProcessing}
                                    className={`flex-1 notranslate ${isListening
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                        }`}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="w-4 h-4 mr-2 notranslate" aria-hidden="true" />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-4 h-4 mr-2 notranslate" aria-hidden="true" />
                                            {isProcessing ? 'Processing...' : 'Speak'}
                                        </>
                                    )}
                                </Button>

                                {messages.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={clearConversation}
                                        disabled={isListening || isProcessing}
                                        className="notranslate"
                                    >
                                        Clear
                                    </Button>
                                )}

                                {isSpeaking && (
                                    <Button
                                        variant="outline"
                                        onClick={stopSpeaking}
                                        className="notranslate"
                                    >
                                        <VolumeX className="w-4 h-4 notranslate" aria-hidden="true" />
                                    </Button>
                                )}
                            </div>

                            {/* Tips */}
                            <div className="mt-3 text-[10px] text-gray-500 text-center">
                                <p>💡 Try: "What are my recent prescriptions?" or "Summarize my medical records"</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}

