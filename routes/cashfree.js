

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import dotenv from 'dotenv';
import db from '../db.js';

dotenv.config();

const router = express.Router();
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// v5 initialization (constructor-based)
const cf = new Cashfree(
	process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
	process.env.CASHFREE_CLIENT_ID,
	process.env.CASHFREE_CLIENT_SECRET
);


function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);
    const orderId = hash.digest('hex');
    return orderId.slice(0, 12); // substr is deprecated, use slice
}

router.get('/payment', async (req, res) => {
	console.log('[Cashfree][payment] Environment:', req.query);
	try {
		// Accept user_details from frontend as query param
		const user_details = req.query.user_details || {};
    const { customer_id, customer_phone, customer_name, customer_email } = user_details;
		let request = {
			order_amount: req.query.amount,
			order_currency: 'INR',
			order_id: generateOrderId(),
			customer_details: {
				customer_id,
				customer_phone,
				customer_name,
				customer_email
			},
			order_meta: {
				payment_methods: 'upi',
				return_url: 'https://yourapp.com/success?order_id={order_id}'
			}
		};
    console.log('[Cashfree][payment] Request payload:', request);
		const response = await cf.PGCreateOrder(request);
    try {
    await db.execute(
    `INSERT INTO payments (order_id, customer_id, customer_email, amount, currency, status, request_payload, response_payload)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.order_id,
      customer_id,
      customer_email,
      request.order_amount,
      request.order_currency,
      response.data.order_status || 'created',
      JSON.stringify(request),
      JSON.stringify(response.data)
    ]
  );
  console.log('[DB][payments][insert] Payment record inserted for order_id:', request.order_id);
  } catch (dbErr) {
  console.error('[DB][payments][insert] Error:', dbErr);
  }
		res.json(response.data);
	} catch (error) {
		console.error(error?.response?.data || error.message);
		res.status(500).json({ error: error?.response?.data?.message || 'Payment creation failed' });
	}
});

router.post('/verify', async (req, res) => {
	try {
		let { orderId } = req.body;
		const response = await cf.PGFetchOrder(orderId);
		res.json(response.data);
    try {
  await db.execute(
    `UPDATE payments SET verify_response = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
    [
      JSON.stringify(response.data),
      response.data.order_status || 'verified',
      orderId
    ]
  );
  console.log('[DB][payments][update] Payment record updated for order_id:', orderId);
  } catch (dbErr) {
    console.error('[DB][payments][update] Error:', dbErr);
  }
	} catch (error) {
		console.error(error?.response?.data || error.message);
		res.status(500).json({ error: error?.response?.data?.message || 'Verification failed' });
	}
});

export default router;
