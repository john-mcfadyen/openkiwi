import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Page from '../Page'
import Card from '../../Card'
import SectionHeader from '../../SectionHeader'
import Text from '../../Text'
import Row from '../../Row'
import Column from '../../Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faCircleCheck, faCircleXmark, faRotateRight } from '@fortawesome/free-solid-svg-icons'

const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

interface GoogleStatus {
    connected: boolean;
    email?: string | null;
}

interface Settings_ConnectionsProps {
    gatewayAddr: string;
    gatewayToken: string;
}

export default function Settings_Connections({ gatewayAddr, gatewayToken }: Settings_ConnectionsProps) {
    const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({ connected: false })
    const [loading, setLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const popupRef = useRef<Window | null>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const base = gatewayAddr.replace(/\/$/, '')

    const fetchGoogleStatus = async () => {
        try {
            const res = await fetch(`${base}/api/auth/google/status`, {
                headers: { 'Authorization': `Bearer ${gatewayToken}` }
            })
            if (res.ok) {
                setGoogleStatus(await res.json())
            }
        } catch {
            // Backend not yet configured — leave status as disconnected
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoogleStatus()
    }, [gatewayAddr, gatewayToken])

    // Clean up popup poll on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [])

    const handleConnect = () => {
        const url = `${base}/api/auth/google?token=${encodeURIComponent(gatewayToken)}`
        const popup = window.open(url, 'google-oauth', 'width=520,height=640,left=200,top=100')
        if (!popup) {
            toast.error('Popup blocked — please allow popups for this page')
            return
        }
        popupRef.current = popup
        setIsConnecting(true)

        // Listen for postMessage from the OAuth callback page
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type === 'google-oauth-success') {
                window.removeEventListener('message', onMessage)
                if (pollRef.current) clearInterval(pollRef.current)
                popup.close()
                setIsConnecting(false)
                fetchGoogleStatus()
                toast.success('Google account connected')
            } else if (event.data?.type === 'google-oauth-error') {
                window.removeEventListener('message', onMessage)
                if (pollRef.current) clearInterval(pollRef.current)
                popup.close()
                setIsConnecting(false)
                toast.error(event.data.message ?? 'Google authentication failed')
            }
        }
        window.addEventListener('message', onMessage)

        // Fallback: poll for popup closure and re-check status
        pollRef.current = setInterval(() => {
            if (popup.closed) {
                clearInterval(pollRef.current!)
                window.removeEventListener('message', onMessage)
                setIsConnecting(false)
                fetchGoogleStatus()
            }
        }, 500)
    }

    const handleDisconnect = async () => {
        try {
            const res = await fetch(`${base}/api/auth/google/disconnect`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${gatewayToken}` }
            })
            if (res.ok) {
                setGoogleStatus({ connected: false, email: null })
                toast.success('Google account disconnected')
            } else {
                toast.error('Failed to disconnect Google account')
            }
        } catch {
            toast.error('Error disconnecting Google account')
        }
    }

    return (
        <Page gridCols={2} padding={0}>
            {/* <SectionHeader columns={2} icon={faLink} title="Google" /> */}

            <Card>
                <Row>
                    <Column grow={true}>
                        <div className="flex items-center gap-2 mb-1">
                            <GoogleLogo />
                            <Text bold={true}>Google</Text>
                            {!loading && (
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                    googleStatus.connected
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                }`}>
                                    <FontAwesomeIcon
                                        icon={googleStatus.connected ? faCircleCheck : faCircleXmark}
                                        className="text-xs"
                                    />
                                    {googleStatus.connected ? 'Connected' : 'Not connected'}
                                </span>
                            )}
                        </div>
                        <Text size="sm" secondary={true}>
                            {googleStatus.connected && googleStatus.email
                                ? `Signed in as ${googleStatus.email}`
                                : 'Connect your Google account to enable Gmail, Calendar, and Tasks integrations.'
                            }
                        </Text>
                    </Column>

                    <div className="flex-shrink-0 flex items-center">
                        {loading ? (
                            <FontAwesomeIcon icon={faRotateRight} className="text-secondary animate-spin" />
                        ) : googleStatus.connected ? (
                            <button
                                onClick={handleDisconnect}
                                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <GoogleLogo />
                                {isConnecting ? 'Connecting…' : 'Sign in with Google'}
                            </button>
                        )}
                    </div>
                </Row>
            </Card>
        </Page>
    )
}
