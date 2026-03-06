import { useState } from 'react'
import { toast } from 'sonner'
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Loader2 } from 'lucide-react'
import Button from '../../Button'
import Text from '../../Text'
import Card from '../../Card'
import Badge from '../../Badge'
import MarkdownRenderer from '../../MarkdownRenderer'
import Page from '../Page'
import HR from '../../HR'

export default function Settings_Version({ config, setConfig, gatewayAddr, gatewayToken }) {
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const handleCheckUpdate = async () => {
        setIsCheckingUpdates(true);
        setHasChecked(false);
        try {
            const res = await fetch(`${gatewayAddr.replace(/\/$/, '')}/api/system/update`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${gatewayToken}` }
            });

            if (res.ok) {
                console.log('[Update] Check request successful, fetching new config...');
                // Fetch fresh config to update UI
                const configRes = await fetch(`${gatewayAddr.replace(/\/$/, '')}/api/config`, {
                    headers: { 'Authorization': `Bearer ${gatewayToken}` }
                });
                if (configRes.ok) {
                    const newConfig = await configRes.json();
                    console.log('[Update] New config received:', newConfig.system);
                    setConfig(newConfig);
                }
            } else {
                const errText = await res.text();
                console.error('[Update] Server error:', errText);
                toast.error("Failed to check for updates");
            }
        } catch (e) {
            console.error('[Update] request failed:', e);
            toast.error("Error checking for updates");
        } finally {
            setIsCheckingUpdates(false);
            setHasChecked(true);
        }
    };

    return (
        <Page padding={0}>
            <Card gridCols={1} align="center" gap={3}>
                <Text size="3xl" bold={true}>OpenKIWI</Text>
                <Text secondary={true}>Version {config?.system?.version || 'Unknown'}</Text>
                {/* <Badge className="uppercase">beta</Badge> */}

                <Button
                    themed={true}
                    onClick={handleCheckUpdate}
                    disabled={isCheckingUpdates}
                    icon={isCheckingUpdates ? undefined : faInfoCircle}
                >
                    {isCheckingUpdates ? (
                        "Checking for update..."
                    ) : "Check for Updates"}
                </Button>
            </Card>

            {(hasChecked || config?.system?.latestVersion) && config?.system && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mx-auto">
                    {config.system.version === config.system.latestVersion ? (
                        <div className="flex items-center bg-emerald-500/20 p-2 rounded-xl">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 dark:text-emerald-400 mr-2" />
                            <Text className="text-emerald-500 dark:text-emerald-400" bold={true}>You are running the latest version</Text>
                        </div>
                    ) : config?.system?.latestVersion && config?.system?.version && config.system.latestVersion > config.system.version ? (
                        <div className="flex items-center bg-amber-500/20 p-2 rounded-xl">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-500 dark:text-amber-400 mr-2" />
                            <Text className="text-amber-500 dark:text-amber-400" bold={true}>Update Available: {config.system.latestVersion}</Text>
                        </div>
                    ) : config.system.latestVersion ? (
                        <div className="flex items-center bg-neutral-500/20 p-2 rounded-xl">
                            <Text bold={true}>
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                                Latest Version: {config.system.latestVersion}
                            </Text>
                        </div>
                    ) : (
                        <div className="text-neutral-500 text-sm italic">
                            Check finished but no remote version was found.
                        </div>
                    )}
                </div>
            )}

            {config?.system?.latestVersion && config?.system?.version && config.system.latestVersion > config.system.version && (
                <Card>
                    <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-6 p-2 rounded-2xl">
                            <Text bold={true} size="xl">Upgrade Steps</Text>

                            <section className="space-y-3">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <span className="mr-2 w-6 h-6 rounded-full bg-neutral-700 dark:bg-white text-white dark:text-neutral-800 flex items-center justify-center text-xs">1</span>
                                    <Text size="lg" bold={true}>Stop services</Text>
                                </h3>
                                <Text><Badge>cd</Badge> to the directory where you have the <Badge>docker-compose.yml</Badge> file</Text>
                                <MarkdownRenderer content={"```bash\ndocker compose down\n```"} />
                                <Text>Or <Badge>CTRL + C</Badge> in the terminal where the services are running</Text>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <span className="mr-2 w-6 h-6 rounded-full bg-neutral-700 dark:bg-white text-white dark:text-neutral-800 flex items-center justify-center text-xs">2</span>
                                    <Text size="lg" bold={true}>Update your local copy</Text>
                                </h3>
                                <MarkdownRenderer content={"```bash\rgit pull\r\n```"} />
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <span className="mr-2 w-6 h-6 rounded-full bg-neutral-700 dark:bg-white text-white dark:text-neutral-800 flex items-center justify-center text-xs">3</span>
                                    <Text size="lg" bold={true}>Restart the services</Text>
                                </h3>
                                <Text>To run services in foreground use:</Text>
                                <MarkdownRenderer content={"```bash\ndocker compose up --build\n```"} />
                                <Text>To run services in background use:</Text>
                                <MarkdownRenderer content={"```bash\ndocker compose up --detach --build\n```"} />
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <span className="mr-2 w-6 h-6 rounded-full bg-neutral-700 dark:bg-white text-white dark:text-neutral-800 flex items-center justify-center text-xs">4</span>
                                    <Text size="lg" bold={true}>Reload the UI</Text>
                                </h3>
                                <Text>Refresh your browser tab once the gateway is back online to see the latest changes.</Text>
                                <p className="text-center text-4xl">🎉</p>
                            </section>
                        </div>
                    </div>
                </Card>
            )}
        </Page >
    );
}
