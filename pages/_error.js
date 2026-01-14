import NextErrorComponent from 'next/error';
import * as Sentry from '@sentry/nextjs';

const CustomErrorComponent = props => <NextErrorComponent {...props} />;

CustomErrorComponent.getInitialProps = async contextData => {
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
