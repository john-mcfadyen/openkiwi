import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faLock, faPlug, faDesktop, faGlobeAmericas, faShield } from '@fortawesome/free-solid-svg-icons'
import Page from './Page'
import Card from '../Card'
import Input from '../Input'
import Button from '../Button'
import Text from '../Text'
import Code from '../Code'
import Row from '../Row'
import Column from '../Column'
import HR from '../HR'
import SectionHeader from '../SectionHeader'

import { TABLE } from '../Table'
import ConnectedComputer from '../ConnectedComputer'

interface GatewayPageProps {
    gatewayAddr: string;
    gatewayToken: string;
    isGatewayConnected: boolean;
    initializeApp: (isSilent?: boolean, addrOverride?: string, tokenOverride?: string) => Promise<void>;
    connectedClients: any[];
    fetchConnectedClients: () => Promise<void>;
    config: any;
    saveConfig: (e?: React.FormEvent, configOverride?: any) => Promise<void>;
}

export default function GatewayPage({
    gatewayAddr,
    gatewayToken,
    isGatewayConnected,
    initializeApp,
    connectedClients,
    fetchConnectedClients,
    config,
    saveConfig
}: GatewayPageProps) {
    const [localAddr, setLocalAddr] = useState(gatewayAddr);
    const [localToken, setLocalToken] = useState(gatewayToken);
    const [allowedOrigins, setAllowedOrigins] = useState<string>('');

    // Sync with global state when it changes (e.g. on successful connection)
    useEffect(() => {
        setLocalAddr(gatewayAddr);
    }, [gatewayAddr]);

    useEffect(() => {
        setLocalToken(gatewayToken);
    }, [gatewayToken]);

    useEffect(() => {
        if (config?.gateway?.allowedOrigins) {
            setAllowedOrigins(config.gateway.allowedOrigins.join(', '));
        }
    }, [config]);

    const handleSaveOrigins = async () => {
        if (!config) return;
        const originsArray = allowedOrigins.split(',').map(o => o.trim()).filter(o => o.length > 0);
        const updatedConfig = {
            ...config,
            gateway: {
                ...config.gateway,
                allowedOrigins: originsArray
            }
        };
        await saveConfig(undefined, updatedConfig);
    };

    return (
        <Page
            title="Gateway"
            subtitle="Manage your gateway connections and connected clients."
        >
            <Card gap={3}>
                <Row align="end" gap="gap-4">
                    <Column grow={true}>
                        <Input
                            label="Endpoint"
                            currentText={localAddr}
                            onChange={e => setLocalAddr(e.target.value)}
                            placeholder="http://localhost:3808"
                            icon={faGlobe}
                            clearText={() => setLocalAddr('')}
                            className="!mt-0"
                        />
                    </Column>
                    <Column grow={true}>
                        <Input
                            label="Token"
                            currentText={localToken}
                            onChange={e => setLocalToken(e.target.value)}
                            placeholder="Secret Token"
                            icon={faLock}
                            clearText={() => setLocalToken('')}
                            className="!mt-0"
                        />
                    </Column>
                </Row>

                <Button
                    className="w-full"
                    themed={true}
                    onClick={() => initializeApp(false, localAddr, localToken)}
                    disabled={!localAddr || !localToken}
                    icon={faPlug}
                >
                    Connect to Gateway
                </Button>


                {/* <Column gap="gap-2">
                    <Text>Specify the address of your gateway. For local development use <Code>http://localhost:3808</Code></Text>
                    <Text secondary={true} size="sm">
                        Changes to endpoint or token will only take effect after clicking "Connect to Gateway"
                    </Text>
                </Column> */}

                {isGatewayConnected && config && (
                    <>
                        <HR />
                        <Column>
                            <SectionHeader icon={faShield} title="Security: CORS" subtitle="CORS" />
                            <Text secondary={true} size="sm">Specify which origins are allowed to make requests to this gateway. This prevents malicious websites from accessing your gateway.</Text>
                        </Column>
                        <Row align="end">
                            <Column grow={true}>
                                <Input
                                    icon={faGlobeAmericas}
                                    label="Allowed Origins (comma separated)"
                                    currentText={allowedOrigins}
                                    onChange={e => setAllowedOrigins(e.target.value)}
                                    placeholder="http://localhost:3000, http://127.0.0.1:3000"
                                />
                            </Column>
                            <Button onClick={handleSaveOrigins}>Save Origins</Button>
                        </Row>
                        <Text secondary={true} size="sm">Recommended for local use: <Code>http://localhost:3000, http://127.0.0.1:3000</Code></Text>

                        <HR />

                        <SectionHeader icon={faDesktop} title="Connected Computers" />
                        {connectedClients.length === 0 ? (
                            <Text secondary={true}>No other computers currently connected to this gateway.</Text>
                        ) : (
                            <TABLE header={[
                                { name: "Hostname", alignment: "left" },
                                { name: "IP", alignment: "center" },
                                { name: "Connected Since", alignment: "right" }
                            ]}>
                                {connectedClients.map((client, idx) => (
                                    <ConnectedComputer
                                        key={idx}
                                        hostname={client.hostname}
                                        id={client.id}
                                        ip={client.ip}
                                        connectedAt={client.connectedAt}
                                    />
                                ))}
                            </TABLE>
                        )}
                    </>
                )}
            </Card>
        </Page>
    )
}
