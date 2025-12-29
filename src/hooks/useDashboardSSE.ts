import { useState, useEffect, useRef } from 'react';

// Types
export interface Query {
    studentName: string;
    question: string;
    answer: string;
    time: string;
}

export interface Feedback {
    studentName: string;
    feedbackText: string;
    rating: number;
    time: string;
}

export interface Uploads {
    notice: string[];
    faq: string[];
    impData: string[];
}

export interface Counts {
    totalQueries: number;
    todayTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
}

interface InitialData {
    timestamp: string;
    counts: Counts;
    recentQueries: Query[];
    uploads: Uploads;
    topFeedbacks: Feedback[];
}

interface UpdateData {
    newQueries?: Query[];
    counts?: Counts;
    uploads?: Uploads;
    topFeedbacks?: Feedback[];
}

interface SSEEvent {
    type: 'initial' | 'update';
    data: InitialData | UpdateData;
}

// Hook for SSE
export const useDashboardSSE = (accountEmail: string) => {
    const [counts, setCounts] = useState<Counts | null>(null);
    const [queries, setQueries] = useState<Query[]>([]);
    const [uploads, setUploads] = useState<Uploads | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!accountEmail) return;

        const connectSSE = () => {
            setConnectionStatus('connecting');
            setError(null);

            const encodedEmail = encodeURIComponent(accountEmail);
            const url = `https://campusai-916628151603.asia-south1.run.app/api/account/dashboard/stream/${encodedEmail}`;

            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setConnectionStatus('connected');
                console.log('SSE Connected');
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsedData: SSEEvent = JSON.parse(event.data);

                    if (parsedData.type === 'initial') {
                        const data = parsedData.data as InitialData;
                        setCounts(data.counts);
                        setQueries(data.recentQueries);
                        setUploads(data.uploads);
                        setFeedbacks(data.topFeedbacks);
                    } else if (parsedData.type === 'update') {
                        const data = parsedData.data as UpdateData;

                        if (data.counts) {
                            setCounts(data.counts);
                        }

                        if (data.uploads) {
                            setUploads(data.uploads);
                        }

                        if (data.topFeedbacks) {
                            setFeedbacks(data.topFeedbacks);
                        }

                        if (data.newQueries && data.newQueries.length > 0) {
                            // Determine if we should append or prepend based on UI needs. 
                            // Instructions say "APPEND to existing queries list". 
                            // However, "Recent Queries" usually shows newest at top. 
                            // If the UI iterates naturally (top to bottom), prepending puts them at the top.
                            // But typically chats append to bottom.
                            // The user prompt specifically says: "Queries: When newQueries received -> APPEND to existing queries list"
                            // So I will append.
                            setQueries(prev => [...prev, ...data.newQueries!]);
                        }
                    }
                } catch (err) {
                    console.error('Error parsing SSE message:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE Error:', err);
                setConnectionStatus('error');
                setError('Connection lost. Retrying...');
                // EventSource automatically attempts to reconnect, usually. 
                // We can just leave it to the browser, or close and reopen if needed.
                // If the server closes connection, ReadyState becomes CLOSED (2).
                if (eventSource.readyState === EventSource.CLOSED) {
                    setConnectionStatus('disconnected');
                }
            };
        };

        connectSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                setConnectionStatus('disconnected');
            }
        };
    }, [accountEmail]);

    return {
        counts,
        queries,
        uploads,
        feedbacks,
        connectionStatus,
        error
    };
};
