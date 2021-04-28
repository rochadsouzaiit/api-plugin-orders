import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  action: {
    type: String,
    optional: true
  },
  fromShop: {
    type: Object,
    blackbox: true
  },
  to: {
    type: String
  },
  language: {
    type: String,
    optional: true
  },
  dataForEmail: {
    type: Object,
    blackbox: true
  }
});

/**
 * @name sendOrderEmail
 * @summary A mutation that compiles and server-side renders the email template with order data, and sends the email
 * @param {Object} context GraphQL context
 * @param {Object} input Data for email: action, dataForEmail, fromShop, to
 * @returns {Undefined} no return
 */
export default async function sendOrderEmail(context, input) {
  inputSchema.validate(input);

  const { dataForEmail, fromShop, language, to } = input;


  // Customer email
  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    from: `ProximCity <${process.env.PROXIM_COMMUNICATION_EMAIL}>`,
    fromShop,
    templateName: "orders/new",
    language,
    to
  });

  // Shop owner email
  const { emails } = dataForEmail.shop;
  if (!emails || !emails.length) return;

  const shopEmail = emails[0].address;
  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    from: `ProximCity <${process.env.PROXIM_COMMUNICATION_EMAIL}>`,
    fromShop,
    templateName: "orders/shop-owner/new",
    language,
    to: shopEmail
  });
}
