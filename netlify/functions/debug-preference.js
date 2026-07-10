const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing id" }) };
  }

  try {
    const preference = await new Preference(client).get({ preferenceId: id });
    return {
      statusCode: 200,
      body: JSON.stringify({
        payment_methods: preference.payment_methods,
        collector_id: preference.collector_id,
        client_id: preference.client_id,
        marketplace: preference.marketplace,
        operation_type: preference.operation_type,
        binary_mode: preference.binary_mode
      }, null, 2)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
