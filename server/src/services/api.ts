function processPaymentAndSendReceipt(payment) {
  // Validate payment
  if (payment.amount <= 0) throw new Error('Invalid amount');
  
  // Process payment
  const result = paymentGateway.charge(payment);
  
  // Update database
  database.payments.insert(result);
  
  // Send email
  emailService.send(payment.email, 'Receipt', generateReceipt(result));
  
  // Log analytics
  analytics.track('payment_processed', { amount: payment.amount });
  
  return result;
}

class UserManager {
  createUser(data) { }
  deleteUser(id) { }
  validateUser(data) { }
  hashPassword(password) { }
  sendWelcomeEmail(user) { }
  logUserActivity(user, action) { }
  generateReport(userId) { }
  exportToCSV(users) { }
}