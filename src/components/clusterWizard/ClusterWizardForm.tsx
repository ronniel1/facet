import React from 'react';
import { Formik, FormikHelpers, validateYupSchema, yupToFormErrors } from 'formik';
import {
  Form,
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import ClusterWizardToolbar from './ClusterWizardToolbar';
import PageSection from '../ui/PageSection';
import { ToolbarButton, ToolbarText } from '../ui/Toolbar';
import { InputField, TextAreaField } from '../ui/formik';
import validationSchema from './validationSchema';
import { ClusterDefinition } from '../../types/clusterDefinition';
import { postInstallConfig } from '../../api/clusterDefinition';
import GridGap from '../ui/GridGap';
import { Cluster } from '../../api/types';
import { Link } from 'react-router-dom';
import { WizardStep } from '../../types/wizard';

interface ClusterWizardFormProps {
  cluster: Cluster;
  setStep: React.Dispatch<React.SetStateAction<WizardStep>>;
}

const ClusterWizardForm: React.FC<ClusterWizardFormProps> = ({ cluster, setStep }) => {
  const initialValues: ClusterDefinition = {
    clusterName: cluster.name || '',
    DNSDomain: '',
    openshiftVersion: '',
    apiVIP: '',
    dnsVIP: '',
    ingressVIP: '',
    machineCIDR: '',
    pullSecret: '',
    sshPrivateKey: '',
    sshPublicKey: '',
  };

  const validate = (values: ClusterDefinition) => {
    // NOTE(jtomasek): This allows passing context to Yup schema
    // https://github.com/jaredpalmer/formik/issues/506#issuecomment-372229014
    try {
      validateYupSchema<ClusterDefinition>(values, validationSchema, true);
    } catch (err) {
      return yupToFormErrors(err);
    }
    return {};
  };

  const handleSubmit = (
    values: ClusterDefinition,
    formikActions: FormikHelpers<ClusterDefinition>,
  ) => {
    postInstallConfig(values)
      .then((response) => {
        // TODO(jtomasek): dispatch a success action
        console.log(response); // eslint-disable-line
        formikActions.setSubmitting(false);
      })
      .catch((e) => {
        console.log(e); // eslint-disable-line
        formikActions.setStatus({ error: e.message });
        formikActions.setSubmitting(false);
        // TODO(jtomasek): dispatch a failure action
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, isSubmitting, isValid, submitForm, status }) => (
        <>
          <PageSection variant={PageSectionVariants.light} isMain>
            <Form onSubmit={handleSubmit}>
              <Grid gutter="md">
                <GridItem span={12} lg={10} xl={6}>
                  {/* TODO(jtomasek): remove this if we're not putting full width content here (e.g. hosts table)*/}
                  <GridGap>
                    <TextContent>
                      <Text component="h1">Configure a bare metal OpenShift cluster</Text>
                    </TextContent>
                    <InputField
                      label="Cluster name"
                      name="clusterName"
                      helperText="This can not be changed after cluster is deployed"
                      isRequired
                    />
                    <InputField label="Base DNS domain" name="DNSDomain" isRequired />
                    <InputField label="OpenShift Version" name="openshiftVersion" isRequired />
                    <TextContent>
                      <Text component="h2">Networking</Text>
                    </TextContent>
                    <InputField
                      label="API Virtual IP"
                      name="apiVIP"
                      helperText="This can not be changed after cluster is deployed"
                      isRequired
                    />
                    <InputField name="dnsVIP" label="Internal DNS Virtual IP" isRequired />
                    <InputField name="ingressVIP" label="Ingress Virtual IP" isRequired />
                    <InputField name="machineCIDR" label="Machine CIDR" placeholder="" isRequired />
                    <TextContent>
                      <Text component="h2">Security</Text>
                    </TextContent>
                    <TextAreaField name="pullSecret" label="Pull Secret" isRequired />
                    <TextAreaField name="sshPrivateKey" label="SSH Private Key" isRequired />
                    <TextAreaField name="sshPublicKey" label="SSH Public Key" isRequired />
                  </GridGap>
                </GridItem>
              </Grid>
            </Form>
          </PageSection>
          <ClusterWizardToolbar>
            <ToolbarButton
              variant={ButtonVariant.secondary}
              onClick={() => setStep(WizardStep.BaremetalInventory)}
            >
              Back
            </ToolbarButton>
            <ToolbarButton
              variant="primary"
              onClick={submitForm}
              isDisabled={isSubmitting || !isValid}
            >
              Deploy cluster
            </ToolbarButton>
            <ToolbarButton
              variant={ButtonVariant.secondary}
              component={(props) => <Link to="/clusters" {...props} />}
            >
              Cancel
            </ToolbarButton>
            {isSubmitting && <ToolbarText>Form is being submitted</ToolbarText>}
            {status.error && (
              <ToolbarText>
                <ExclamationCircleIcon /> {status.error}
              </ToolbarText>
            )}
          </ClusterWizardToolbar>
        </>
      )}
    </Formik>
  );
};

export default ClusterWizardForm;