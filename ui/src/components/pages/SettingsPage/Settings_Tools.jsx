import { faWrench } from '@fortawesome/free-solid-svg-icons'
import Page from '../Page'
import SectionHeader from '../../SectionHeader'
import Text from '../../Text'
import SkillsAndToolsCard from '../../SkillsAndToolsCard'
import Column from '../../Column'

export default function Settings_Tools({
    tools,
    config,
    setConfig,
    saveConfig,
    gatewayAddr,
    gatewayToken,
    loadingReadme,
    setLoadingReadme,
    setViewingReadme
}) {
    return (
        <Page padding={0}>
            <Column>
                <SectionHeader
                    icon={faWrench}
                    title="Skills & Tools"
                />
                <Text secondary={true} size="sm" block={true}>
                    These are the capabilities currently discovered by the Gateway. Agents can autonomously choose to use these tools to interact with your environment.
                </Text>
            </Column>

            {tools.map(tool => (
                <SkillsAndToolsCard
                    key={tool.name}
                    tool={tool}
                    config={config}
                    setConfig={setConfig}
                    saveConfig={saveConfig}
                    gatewayAddr={gatewayAddr}
                    gatewayToken={gatewayToken}
                    loadingReadme={loadingReadme}
                    setLoadingReadme={setLoadingReadme}
                    setViewingReadme={setViewingReadme}
                />
            ))}
        </Page >
    );
}
