// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.SMTP_MAIL,
//     pass: process.env.SMTP_PASSWORD
//   }
// });

// const sendOrderConfirmationEmail = async (to, order) => {
//   const itemsHtml = order.items.map(item =>
//     `<tr>
//       <td style="padding:8px 0;">${item.name} x ${item.quantity}</td>
//       <td style="text-align:right;">₹${item.price * item.quantity}</td>
//     </tr>`
//   ).join('');

//   const htmlContent = `
//     <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; background:#f9f9f9; padding:20px;">
//       <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
//         <div style="background:#6c5ce7; color:white; padding:20px; text-align:center;">
//           <h2 style="margin:0;">🎉 Thank you for your order!</h2>
//         </div>
//         <div style="padding:20px;">
//           <p style="font-size:16px; color:#333;">Hi there,</p>
//           <p style="font-size:16px; color:#333;">
//             We've received your order and are getting it ready. You’ll receive another email when your order ships.
//           </p>

//           <h3 style="color:#6c5ce7; border-bottom:1px solid #eee; padding-bottom:6px;">🛒 Order Summary</h3>
//           <table style="width:100%; font-size:15px; border-collapse:collapse;">
//             <tbody>
//               ${itemsHtml}
//             </tbody>
//             <tfoot>
//               <tr style="border-top:1px solid #eee;">
//                 <td style="padding:10px 0; font-weight:bold;">Total</td>
//                 <td style="padding:10px 0; text-align:right; font-weight:bold;">₹${order.amount}</td>
//               </tr>
//             </tfoot>
//           </table>

//           <h3 style="color:#6c5ce7; margin-top:20px;">📍 Shipping Address</h3>
//           <p style="font-size:15px; color:#333;">
//             ${order.address.street}<br>
//             ${order.address.city}
//           </p>

//           <p style="margin-top:30px; font-size:14px; color:#555;">
//             Thanks for shopping with us! 💖<br>
//             <strong>Bhatia's Closet</strong>
//           </p>
//         </div>
//       </div>
//       <p style="text-align:center; font-size:12px; color:#aaa; margin-top:20px;">
//         If you have questions, just reply to this email. We’re always happy to help.
//       </p>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: `"Bhatia's Closet" <${process.env.SMTP_MAIL}>`,
//     to,
//     subject: 'Order Confirmation - Your order has been placed!',
//     html: htmlContent
//   });
// };

// export default sendOrderConfirmationEmail;
