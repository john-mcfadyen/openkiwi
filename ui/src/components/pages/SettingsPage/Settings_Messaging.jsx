import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faLink, faTrash, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { Loader2 } from 'lucide-react'
import Page from '../Page'
import Card from '../../Card'
import SectionHeader from '../../SectionHeader'
import Text from '../../Text'
import Button from '../../Button'

export default function Settings_Messaging({
    whatsappStatus,
    onLogoutWhatsApp,
    onConnectWhatsApp,
    telegramStatus,
    onConnectTelegram,
    onDisconnectTelegram
}) {
    return (
        <Page gridCols={1} padding={0}>
            <SectionHeader
                icon={faWhatsapp}
                iconClasses="w-10 h-10 rounded-full bg-[#25D366] text-white"
                title="WhatsApp Integration"
            />
            <Card>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {whatsappStatus.connected ? (
                        <div className="flex flex-col items-center gap-4 text-center w-full">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <FontAwesomeIcon icon={faLink} size="2x" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-emerald-500">Connected</h4>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Your WhatsApp account is linked and ready to receive messages.
                                </p>
                            </div>
                            <Button
                                themed={true}
                                className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                                onClick={onLogoutWhatsApp}
                                icon={faTrash}
                            >
                                Disconnect / Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8 w-full items-center">
                            <div className="flex-1">
                                <Text bold={true}>
                                    Scan the QR code below with your phone to link WhatsApp.
                                </Text>
                                <Text block={true} className="mt-4">
                                    1. Open WhatsApp on your phone
                                    <br />
                                    2. Go to Settings {'>'} Linked Devices
                                    <br />
                                    3. Tap "Link a Device"
                                    <br />
                                    4. Point your phone at this screen
                                </Text>
                            </div>

                            <div className="w-64 h-64 bg-white dark:bg-neutral-900 p-4 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                                {whatsappStatus.qrCode ? (
                                    <img src={whatsappStatus.qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                                ) : whatsappStatus.isInitializing ? (
                                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                                        <Loader2 className="animate-spin" />
                                        <span className="text-xs">Generating QR...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-neutral-400">
                                        <Button
                                            themed={false}
                                            onClick={onConnectWhatsApp}
                                            icon={faLink}
                                        >
                                            Generate QR Code
                                        </Button>
                                        <span className="text-xs">WhatsApp is currently inactive.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <SectionHeader
                icon={faPaperPlane}
                iconClasses="w-10 h-10 rounded-full bg-[#0088cc] text-white"
                title="Telegram Integration"
            />
            <Card>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {telegramStatus.connected ? (
                        <div className="flex flex-col items-center gap-4 text-center w-full">
                            <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                                <FontAwesomeIcon icon={faLink} size="2x" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-sky-500">Connected</h4>
                                <p className="text-sm text-neutral-500 mt-1">
                                    {telegramStatus.botUsername
                                        ? <>Your Telegram bot <strong>@{telegramStatus.botUsername}</strong> is online and ready to receive messages.</>
                                        : 'Your Telegram bot is online and ready to receive messages.'}
                                </p>
                            </div>
                            <Button
                                themed={true}
                                className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                                onClick={onDisconnectTelegram}
                                icon={faTrash}
                            >
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 w-full">
                            <div>
                                <Text bold={true}>
                                    Connect a Telegram bot to receive and respond to messages.
                                </Text>
                                <Text block={true} className="mt-4">
                                    1. Open Telegram and search for <strong>@BotFather</strong>
                                    <br />
                                    2. Send <code>/newbot</code> and follow the prompts
                                    <br />
                                    3. Copy the bot token and set it as <code>TELEGRAM_BOT_TOKEN</code> in your <code>.env</code> file
                                    <br />
                                    4. Restart the gateway, then click Connect below
                                </Text>
                            </div>

                            <div className="flex items-center gap-4">
                                {telegramStatus.isInitializing ? (
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span className="text-sm">Connecting...</span>
                                    </div>
                                ) : (
                                    <Button
                                        themed={false}
                                        onClick={onConnectTelegram}
                                        icon={faLink}
                                    >
                                        Connect Bot
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </Page>
    );
}
