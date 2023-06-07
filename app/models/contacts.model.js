const ContactsSchema = `
CREATE TABLE Contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INT,
    linkPrecedence ENUM('secondary', 'primary') DEFAULT 'primary',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
  );
`

module.exports = ContactsSchema