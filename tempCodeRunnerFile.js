// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("ems_mona");

use("ems_mona");

db.users.deleteMany({});
db.onboardingapplications.deleteMany({});
db.registrationtokens.deleteMany({});
db.refreshtokens.deleteMany({});
db.documents.deleteMany({});
db.notifications.deleteMany({});

db.users.insertOne({
  username: "hr1",
  email: "hr@test.com",
  passwordHash: "$2a$12$L9aqmCovj3F9au/fQ7SR6.zxYfa0fg6kbkoGuJWH62otDzyuCNQBe",
  role: "hr",
  profile: {},
  workAuthorization: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});
