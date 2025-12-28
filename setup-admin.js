const readline = require('readline');
const { sequelize, User, Admin } = require('./src/models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
  try {
    await sequelize.sync();
    console.log('✅ Connected to database\n');

    console.log('📋 Available Users:');
    const users = await User.findAll();

    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first by starting the bot and using /start');
      process.exit(0);
    }

    users.forEach(user => {
      console.log(`   ID: ${user.id} | Chat ID: ${user.chatId} | Language: ${user.language}`);
    });

    console.log('\n');

    const userId = await question('Enter the User ID to make admin: ');
    const paymentLink = await question('Enter payment link (or press Enter to skip): ');

    const user = await User.findByPk(parseInt(userId));

    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    // Check if already admin
    const existingAdmin = await Admin.findOne({ where: { userId: user.id } });

    if (existingAdmin) {
      console.log('\n⚠️  User is already an admin. Updating...');
      await existingAdmin.update({
        paymentLink: paymentLink || existingAdmin.paymentLink
      });
      console.log('✅ Admin updated successfully!');
    } else {
      await Admin.create({
        userId: user.id,
        paymentLink: paymentLink || null
      });
      console.log('\n✅ Admin created successfully!');
    }

    console.log(`\n👑 User ${user.chatId} is now an admin`);
    console.log('💡 They can now use /admin command in the bot');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    rl.close();
    process.exit(0);
  }
}

console.log('👑 Admin Setup Utility\n');
setupAdmin();
