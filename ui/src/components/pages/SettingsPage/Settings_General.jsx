import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faFlask } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import Page from '../Page'
import Card from '../../Card'
import SectionHeader from '../../SectionHeader'
import Text from '../../Text'
import Toggle from '../../Toggle'
import Row from '../../Row'
import Column from '../../Column'

export default function Settings_General({
    isProjectManagementEnabled,
    setIsProjectManagementEnabled,
    isAgentCollaborationEnabled,
    setIsAgentCollaborationEnabled,
    isAgentActivityEnabled,
    setIsAgentActivityEnabled,
    theme,
    setTheme
}) {
    return (
        <Page gridCols={2} padding={0}>
            <SectionHeader
                columns={2}
                icon={faDesktop}
                title="Appearance"
            />
            <Card>
                <Text>Theme settings will go here</Text>
            </Card>

            <SectionHeader
                columns={2}
                icon={faFlask}
                title="Experimental"
            />
            <Card>
                <Row>
                    <Column grow={true}>
                        <Text bold={true}>Project Management</Text>
                        <Text size="sm" secondary={true}>Enable the new Projects sidebar and workspace isolation.</Text>
                    </Column>
                    <Toggle
                        checked={isProjectManagementEnabled}
                        onChange={() => {
                            const newValue = !isProjectManagementEnabled;
                            setIsProjectManagementEnabled(newValue);
                            localStorage.setItem('experimental_projects', newValue.toString());
                            toast.success(`${newValue ? 'Enabled' : 'Disabled'} Project Management`);
                        }}
                    />
                </Row>
            </Card>

            <Card>
                <Row>
                    <Column grow={true}>
                        <Text bold={true}>Agent Collaboration</Text>
                        <Text size="sm" secondary={true}>Enable the "Agent Collaboration" section in agent settings.</Text>
                    </Column>
                    <Toggle
                        checked={isAgentCollaborationEnabled}
                        onChange={() => {
                            const newValue = !isAgentCollaborationEnabled;
                            setIsAgentCollaborationEnabled(newValue);
                            localStorage.setItem('experimental_collaboration', newValue.toString());
                            toast.success(`${newValue ? 'Enabled' : 'Disabled'} Agent Collaboration`);
                        }}
                    />
                </Row>
            </Card>

            <Card>
                <Row>
                    <Column grow={true}>
                        <Text bold={true}>Agent Activity</Text>
                        <Text size="sm" secondary={true}>Enable the "Activity" button in the side bar.</Text>
                    </Column>
                    <Toggle
                        checked={isAgentActivityEnabled}
                        onChange={() => {
                            const newValue = !isAgentActivityEnabled;
                            setIsAgentActivityEnabled(newValue);
                            localStorage.setItem('experimental_activity', newValue.toString());
                            toast.success(`${newValue ? 'Enabled' : 'Disabled'} Agent Activity`);
                        }}
                    />
                </Row>
            </Card>
        </Page>
    );
}
