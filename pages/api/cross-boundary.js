import * as Sentry from '@sentry/nextjs';

class OrderValidationError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'OrderValidationError';
    this.context = context;
  }
}

async function validateOrder(payload) {
  const order = payload?.order ?? { items: [], shippingCountry: 'AQ' };

  if (!order.items || order.items.length === 0) {
    throw new OrderValidationError('Order payload missing line items', { order });
  }

  if (order.shippingCountry === 'AQ') {
    throw new OrderValidationError('Shipping not supported for Antarctica', { order });
  }

  return { ok: true };
}

export default Sentry.wrapApiHandlerWithSentry(async function crossBoundaryHandler(req, res) {
  try {
    const payload = (() => {
      if (req.method !== 'POST') {
        return undefined;
      }

      if (typeof req.body === 'string') {
        try {
          return JSON.parse(req.body);
        } catch (error) {
          throw new OrderValidationError('Request body is not valid JSON', { error });
        }
      }

      return req.body;
    })();

    await validateOrder(payload);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { scenario: 'cross-boundary', surface: 'server' },
    });

    res.status(422).json({
      detail: error.message,
      type: error.name,
    });
  }
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1kb',
    },
  },
};
