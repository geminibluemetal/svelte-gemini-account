// import db from '$lib/core/server/db';

// // CORRECT: Prepare ALL statements OUTSIDE the transaction
// const getBalance = db.prepare('SELECT balance FROM users WHERE id = ?');
// const updateBalance = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
// const recordTx = db.prepare('INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)');

// function correctTransaction(user1Id, user2Id, amount) {
//   const transaction = db.transaction(() => {
//     // Get current balances
//     const user1Balance = getBalance.get(user1Id).balance;
//     const user2Balance = getBalance.get(user2Id).balance;

//     // Check if user1 has enough balance
//     if (user1Balance < amount) {
//       throw new Error('Insufficient funds');
//     }

//     // Update balances - USE THE SAME PREPARED STATEMENT
//     updateBalance.run(-amount, user1Id); // Subtract from user1
//     updateBalance.run(amount, user2Id); // Add to user2

//     // Record transactions
//     recordTx.run(user1Id, -amount, 'transfer');
//     recordTx.run(user2Id, amount, 'transfer');
//   });

//   try {
//     transaction();
//     console.log('Transaction completed successfully');
//     return true;
//   } catch (error) {
//     console.error('Transaction failed:', error.message);
//     return false;
//   }
// }
