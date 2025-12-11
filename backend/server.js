//"Node.js Express Server Example" (GitHub, 2021). Available at: https://github.com/username/express-server-example
const express = require('express'); // Express.js framework (Express, 2021) Available at: https://expressjs.com/
const mysql = require('mysql2/promise'); // MySQL2 library for promise-based MySQL queries (MySQL2, 2021). Available at: https://github.com/sidorares/node-mysql2
const bcrypt = require('bcryptjs'); // Password hashing and comparison (BcryptJS, 2021). Available at: https://github.com/dcodeIO/bcrypt.js/
const cors = require('cors'); // CORS middleware for Express (Express, 2021). Available at: https://www.npmjs.com/package/cors
const helmet = require('helmet'); // Helmet.js for securing HTTP headers (Helmet, 2021). Available at: https://helmetjs.github.io/
const rateLimit = require('express-rate-limit'); // Rate limiting middleware for Express (Express Rate Limit, 2021). Available at: https://www.npmjs.com/package/express-rate-limit
const { body, validationResult } = require('express-validator'); // Express-Validator middleware for validation (Express Validator, 2021). Available at: https://express-validator.github.io/
const https = require('https'); // Node.js https module (Node.js, 2021). Available at: https://nodejs.org/en/docs/
const fs = require('fs'); // File system module for reading SSL certificates (Node.js, 2021). Available at: https://nodejs.org/en/docs/
require('dotenv').config(); // dotenv for environment variables (dotenv, 2021). Available at: https://github.com/motdotla/dotenv

const app = express();

app.use(helmet()); //Adds security headers (Helmet, 2021). Available at: https://helmetjs.github.io/
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter); 

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'payment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}); //MySQL connection pool (MySQL2, 2021). Available at: https://github.com/sidorares/node-mysql2

const validationPatterns = {
  username: /^[a-zA-Z0-9_]{3,20}$/, //Username validation regex
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, //Password validation regex
  fullName: /^[a-zA-Z\s]{2,50}$/, //Full name validation regex
  idNumber: /^\d{13}$/, //ID number validation regex
  accountNumber: /^\d{10,16}$/, //Account number validation regex
  amount: /^\d+(\.\d{1,2})?$/, //Amount validation regex
  swiftCode: /^\d{8,11}$/, //SWIFT code validation regex
  payeeAccount: /^\d{10,16}$/ //Payee account validation regex
};

const validatePattern = (field, pattern) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && !pattern.test(value)) {
      return res.status(400).json({ 
        error: `Invalid ${field} format`,
        field 
      });
    }
    next();
  };
};

//CUSTOMER REGISTRATION 
app.post('/api/customer/register',
  [
    body('fullName').trim().escape(),
    body('idNumber').trim().escape(),
    body('accountNumber').trim().escape(),
    body('username').trim().escape(),
    body('password').trim()
  ],
  validatePattern('fullName', validationPatterns.fullName),
  validatePattern('idNumber', validationPatterns.idNumber),
  validatePattern('accountNumber', validationPatterns.accountNumber),
  validatePattern('username', validationPatterns.username),
  validatePattern('password', validationPatterns.password),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, idNumber, accountNumber, username, password } = req.body;

      //Check if username already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM customers WHERE username = ?',
        [username]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      //Hash password with salt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await pool.execute(
        `INSERT INTO customers (fullName, idNumber, accountNumber, username, password, salt, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [fullName, idNumber, accountNumber, username, hashedPassword, salt]
      );

      res.status(201).json({
        message: 'Registration successful',
        customerId: result.insertId
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

//CUSTOMER LOGIN 
app.post('/api/customer/login',
  [
    body('username').trim().escape(),
    body('accountNumber').trim().escape(),
    body('password').trim()
  ],
  async (req, res) => {
    try {
      const { username, accountNumber, password } = req.body;

      //Fetch customer
      const [customers] = await pool.execute(
        'SELECT * FROM customers WHERE username = ? AND accountNumber = ?',
        [username, accountNumber]
      );

      if (customers.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const customer = customers[0];

      //Verify password
      const isValidPassword = await bcrypt.compare(password, customer.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        message: 'Login successful',
        customer: {
          id: customer.id,
          username: customer.username,
          fullName: customer.fullName,
          accountNumber: customer.accountNumber
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

//EMPLOYEE LOGIN 
app.post('/api/employee/login',
  [
    body('username').trim().escape(),
    body('password').trim()
  ],
  async (req, res) => {
    try {
      const { username, password } = req.body;

      //Fetch employee
      const [employees] = await pool.execute(
        'SELECT * FROM employees WHERE username = ?',
        [username]
      );

      if (employees.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const employee = employees[0];

      //Verify password
      const isValidPassword = await bcrypt.compare(password, employee.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        message: 'Login successful',
        employee: {
          id: employee.id,
          username: employee.username,
          name: employee.name,
          role: employee.role
        }
      });

    } catch (error) {
      console.error('Employee login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

//CREATE PAYMENT 
app.post('/api/payment/create',
  [
    body('customerId').isInt(),
    body('amount').trim().escape(),
    body('currency').trim().escape(),
    body('provider').trim().escape(),
    body('payeeAccount').trim().escape(),
    body('swiftCode').trim().escape()
  ],
  validatePattern('amount', validationPatterns.amount),
  validatePattern('swiftCode', validationPatterns.swiftCode),
  validatePattern('payeeAccount', validationPatterns.payeeAccount),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customerId, amount, currency, provider, payeeAccount, swiftCode } = req.body;

      //Validate amount is positive
      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      //Insert transaction
      const [result] = await pool.execute(
        `INSERT INTO transactions (customerId, amount, currency, provider, payeeAccount, swiftCode, status, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [customerId, amount, currency, provider, payeeAccount, swiftCode]
      );

      res.status(201).json({
        message: 'Payment created successfully',
        transactionId: result.insertId
      });

    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(500).json({ error: 'Payment creation failed' });
    }
  }
);

//GET ALL TRANSACTIONS (EMPLOYEE) 
app.get('/api/transactions', async (req, res) => {
  try {
    const [transactions] = await pool.execute(
      `SELECT t.*, c.fullName as customerName, c.username as customerUsername
       FROM transactions t
       JOIN customers c ON t.customerId = c.id
       ORDER BY t.createdAt DESC`
    );

    res.json({ transactions });

  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

//VERIFY TRANSACTION
app.put('/api/transaction/:id/verify',
  [
    body('employeeId').isInt(),
    body('employeeName').trim().escape()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId, employeeName } = req.body;

      //Update transaction status
      const [result] = await pool.execute(
        `UPDATE transactions 
         SET status = 'verified', verifiedBy = ?, verifiedAt = NOW() 
         WHERE id = ? AND status = 'pending'`,
        [employeeName, id]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'Transaction not found or already verified' });
      }

      res.json({ message: 'Transaction verified successfully' });

    } catch (error) {
      console.error('Verify transaction error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }
);

//SUBMIT TO SWIFT
app.post('/api/transactions/submit-swift',
  [
    body('transactionIds').isArray(),
    body('employeeId').isInt()
  ],
  async (req, res) => {
    try {
      const { transactionIds, employeeId } = req.body;

      if (transactionIds.length === 0) {
        return res.status(400).json({ error: 'No transactions to submit' });
      }

      //Update all verified transactions to submitted
      const placeholders = transactionIds.map(() => '?').join(',');
      const [result] = await pool.execute(
        `UPDATE transactions 
         SET status = 'submitted', submittedAt = NOW() 
         WHERE id IN (${placeholders}) AND status = 'verified'`,
        transactionIds
      );

      res.json({
        message: `${result.affectedRows} transaction(s) submitted to SWIFT`,
        count: result.affectedRows
      });

    } catch (error) {
      console.error('Submit to SWIFT error:', error);
      res.status(500).json({ error: 'Submission failed' });
    }
  }
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//Start Server
const PORT = process.env.PORT || 5000;

//For development (HTTP)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  const httpsOptions = {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt')
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔒 Secure server running on https://localhost:${PORT}`);
  });
}

module.exports = app;
