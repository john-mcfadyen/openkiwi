import { useState, useEffect } from 'react'
import Text from '../../Text'
import Card from '../../Card'
import SectionHeader from '../../SectionHeader'
import TextArea from '../../TextArea'
import Page from '../Page'
import Column from '../../Column'
import { faFileCode } from '@fortawesome/free-solid-svg-icons'

export default function Settings_Config({ config, gatewayAddr, gatewayToken }) {
    const [publicConfig, setPublicConfig] = useState(null);

    useEffect(() => {
        fetch(`${gatewayAddr.replace(/\/$/, '')}/api/config/public`, {
            headers: {
                'Authorization': `Bearer ${gatewayToken}`
            }
        })
            .then(res => res.json())
            .then(data => setPublicConfig(data))
            .catch(err => console.error('Failed to fetch public config:', err));
    }, [gatewayAddr, gatewayToken]);

    return (
        <Page padding={0}>
            <Column>
                <SectionHeader title="config.json" icon={faFileCode} />
                <Text secondary={true} size="sm">Raw configuration file contents. Changes made through the UI are saved to this file.</Text>
                <Text size="sm" secondary={true}>Editing this file manually is not recommended.</Text>
            </Column>

            <Card>
                <TextArea
                    currentText={JSON.stringify(publicConfig || config, null, 2)}
                    readOnly={true}
                    rows={30}
                    code={true}
                />
            </Card>
        </Page>
    );
}
