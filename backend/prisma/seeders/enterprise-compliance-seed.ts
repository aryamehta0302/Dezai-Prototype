/**
 * Enterprise Compliance Seed — Sprint 8
 *
 * Seeds 4 demo compliance tracks with 25 questions each:
 * 1. Cyber Security
 * 2. Password Security
 * 3. Data Privacy
 * 4. Secure Email
 *
 * Usage: npx ts-node prisma/seeders/enterprise-compliance-seed.ts
 * Or import and call seedEnterpriseCompliance(prisma, orgId) from the main seed.
 */

import { PrismaClient, ComplianceTrack, QuestionBankSourceType, Difficulty } from '@prisma/client';

interface SeedQuestion {
  text: string;
  category: string;
  difficulty: Difficulty;
  explanation: string;
  options: { text: string; isCorrect: boolean }[];
}

interface TrackSeed {
  track: ComplianceTrack;
  bankTitle: string;
  bankDescription: string;
  assessmentTitle: string;
  questions: SeedQuestion[];
}

// ─────────────────── QUESTION DATA ───────────────────

const cyberSecurityQuestions: SeedQuestion[] = [
  { text: 'What is the primary goal of a phishing attack?', category: 'Phishing', difficulty: 'EASY', explanation: 'Phishing attacks trick users into revealing sensitive information.', options: [{ text: 'Steal sensitive information', isCorrect: true }, { text: 'Speed up network', isCorrect: false }, { text: 'Improve security', isCorrect: false }, { text: 'Update software', isCorrect: false }] },
  { text: 'Which of the following is a sign of a phishing email?', category: 'Phishing', difficulty: 'EASY', explanation: 'Urgent language and suspicious links are common phishing indicators.', options: [{ text: 'Urgent language demanding immediate action', isCorrect: true }, { text: 'Company logo present', isCorrect: false }, { text: 'Sent during business hours', isCorrect: false }, { text: 'Contains a signature', isCorrect: false }] },
  { text: 'What is social engineering?', category: 'Social Engineering', difficulty: 'MEDIUM', explanation: 'Social engineering manipulates people into divulging confidential information.', options: [{ text: 'Manipulating people to gain unauthorized access', isCorrect: true }, { text: 'A type of software', isCorrect: false }, { text: 'A network protocol', isCorrect: false }, { text: 'A firewall technique', isCorrect: false }] },
  { text: 'What does the term "malware" stand for?', category: 'Malware', difficulty: 'EASY', explanation: 'Malware = Malicious Software.', options: [{ text: 'Malicious software', isCorrect: true }, { text: 'Managed software', isCorrect: false }, { text: 'Mail software', isCorrect: false }, { text: 'Maintenance software', isCorrect: false }] },
  { text: 'What type of malware encrypts files and demands payment?', category: 'Malware', difficulty: 'MEDIUM', explanation: 'Ransomware encrypts victim files and demands a ransom for decryption.', options: [{ text: 'Ransomware', isCorrect: true }, { text: 'Spyware', isCorrect: false }, { text: 'Adware', isCorrect: false }, { text: 'Worms', isCorrect: false }] },
  { text: 'What is a firewall used for?', category: 'Network Security', difficulty: 'EASY', explanation: 'A firewall monitors and controls incoming and outgoing network traffic.', options: [{ text: 'Monitoring and controlling network traffic', isCorrect: true }, { text: 'Encrypting emails', isCorrect: false }, { text: 'Storing passwords', isCorrect: false }, { text: 'Backing up data', isCorrect: false }] },
  { text: 'What does VPN stand for?', category: 'Network Security', difficulty: 'EASY', explanation: 'VPN = Virtual Private Network.', options: [{ text: 'Virtual Private Network', isCorrect: true }, { text: 'Very Protected Network', isCorrect: false }, { text: 'Visual Private Network', isCorrect: false }, { text: 'Verified Public Network', isCorrect: false }] },
  { text: 'What is the purpose of two-factor authentication (2FA)?', category: 'Authentication', difficulty: 'MEDIUM', explanation: '2FA adds a second layer of verification beyond just a password.', options: [{ text: 'Adding an extra layer of security beyond passwords', isCorrect: true }, { text: 'Replacing passwords entirely', isCorrect: false }, { text: 'Speeding up logins', isCorrect: false }, { text: 'Reducing storage usage', isCorrect: false }] },
  { text: 'Which protocol is used to securely browse websites?', category: 'Network Security', difficulty: 'EASY', explanation: 'HTTPS encrypts data transmitted between browser and website.', options: [{ text: 'HTTPS', isCorrect: true }, { text: 'FTP', isCorrect: false }, { text: 'HTTP', isCorrect: false }, { text: 'SMTP', isCorrect: false }] },
  { text: 'What is a zero-day vulnerability?', category: 'Threats', difficulty: 'HARD', explanation: 'A zero-day vulnerability is unknown to the vendor and has no patch.', options: [{ text: 'A security flaw unknown to the vendor with no available patch', isCorrect: true }, { text: 'A vulnerability found on day zero of deployment', isCorrect: false }, { text: 'A fixed security issue', isCorrect: false }, { text: 'A low-risk vulnerability', isCorrect: false }] },
  { text: 'What is the principle of least privilege?', category: 'Access Control', difficulty: 'MEDIUM', explanation: 'Users should only have the minimum access required for their job.', options: [{ text: 'Giving users only the access they need to do their job', isCorrect: true }, { text: 'Giving all users admin access', isCorrect: false }, { text: 'Restricting all access by default', isCorrect: false }, { text: 'Allowing free access to all resources', isCorrect: false }] },
  { text: 'What is a DDoS attack?', category: 'Threats', difficulty: 'MEDIUM', explanation: 'DDoS overwhelms a target with traffic from multiple sources.', options: [{ text: 'Overwhelming a system with traffic from multiple sources', isCorrect: true }, { text: 'Stealing data from a database', isCorrect: false }, { text: 'Encrypting files on a server', isCorrect: false }, { text: 'Installing spyware remotely', isCorrect: false }] },
  { text: 'What is the best practice when you receive an unexpected email attachment?', category: 'Email Safety', difficulty: 'EASY', explanation: 'Never open unexpected attachments — verify with the sender first.', options: [{ text: 'Do not open it and verify with the sender', isCorrect: true }, { text: 'Open it immediately', isCorrect: false }, { text: 'Forward it to colleagues', isCorrect: false }, { text: 'Delete your email account', isCorrect: false }] },
  { text: 'What is encryption?', category: 'Data Protection', difficulty: 'EASY', explanation: 'Encryption converts data into coded form so only authorized parties can read it.', options: [{ text: 'Converting data into a coded format for authorized access only', isCorrect: true }, { text: 'Deleting sensitive data', isCorrect: false }, { text: 'Compressing files for storage', isCorrect: false }, { text: 'Backing up data to the cloud', isCorrect: false }] },
  { text: 'What should you do if you suspect a security breach?', category: 'Incident Response', difficulty: 'MEDIUM', explanation: 'Report immediately to IT/security team per company incident response policy.', options: [{ text: 'Report it immediately to your IT/security team', isCorrect: true }, { text: 'Ignore it and continue working', isCorrect: false }, { text: 'Try to fix it yourself', isCorrect: false }, { text: 'Post about it on social media', isCorrect: false }] },
  { text: 'What is a man-in-the-middle attack?', category: 'Threats', difficulty: 'HARD', explanation: 'An attacker intercepts communication between two parties.', options: [{ text: 'Intercepting communication between two parties', isCorrect: true }, { text: 'A type of physical break-in', isCorrect: false }, { text: 'A software update method', isCorrect: false }, { text: 'A backup recovery technique', isCorrect: false }] },
  { text: 'Why should you keep software updated?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Updates patch known security vulnerabilities.', options: [{ text: 'To patch known security vulnerabilities', isCorrect: true }, { text: 'To change the user interface', isCorrect: false }, { text: 'To increase storage space', isCorrect: false }, { text: 'To remove features', isCorrect: false }] },
  { text: 'What is a honeypot in cybersecurity?', category: 'Defense', difficulty: 'HARD', explanation: 'A honeypot is a decoy system designed to attract and study attackers.', options: [{ text: 'A decoy system designed to attract attackers', isCorrect: true }, { text: 'A type of encryption', isCorrect: false }, { text: 'A secure server room', isCorrect: false }, { text: 'A password manager', isCorrect: false }] },
  { text: 'What is the purpose of an intrusion detection system (IDS)?', category: 'Defense', difficulty: 'MEDIUM', explanation: 'IDS monitors network traffic for suspicious activity and alerts administrators.', options: [{ text: 'Detecting and alerting on suspicious network activity', isCorrect: true }, { text: 'Blocking all incoming traffic', isCorrect: false }, { text: 'Encrypting data in transit', isCorrect: false }, { text: 'Storing network logs', isCorrect: false }] },
  { text: 'What is the difference between a virus and a worm?', category: 'Malware', difficulty: 'MEDIUM', explanation: 'A virus requires a host file; a worm self-replicates independently.', options: [{ text: 'A virus needs a host file; a worm spreads on its own', isCorrect: true }, { text: 'They are the same thing', isCorrect: false }, { text: 'Worms are less dangerous', isCorrect: false }, { text: 'Viruses only affect mobile devices', isCorrect: false }] },
  { text: 'What is SQL injection?', category: 'Application Security', difficulty: 'HARD', explanation: 'SQL injection inserts malicious SQL code into application queries.', options: [{ text: 'Inserting malicious SQL code into application queries', isCorrect: true }, { text: 'A database backup method', isCorrect: false }, { text: 'A type of encryption', isCorrect: false }, { text: 'A network scanning tool', isCorrect: false }] },
  { text: 'What is a security audit?', category: 'Best Practices', difficulty: 'MEDIUM', explanation: 'A systematic evaluation of an organization\'s security posture.', options: [{ text: 'A systematic evaluation of security policies and controls', isCorrect: true }, { text: 'Installing new antivirus software', isCorrect: false }, { text: 'Resetting all passwords', isCorrect: false }, { text: 'Deleting old files', isCorrect: false }] },
  { text: 'What does "defense in depth" mean?', category: 'Strategy', difficulty: 'HARD', explanation: 'Multiple layers of security controls to protect information assets.', options: [{ text: 'Using multiple layers of security controls', isCorrect: true }, { text: 'Having one strong firewall', isCorrect: false }, { text: 'Using only encryption', isCorrect: false }, { text: 'Hiring more IT staff', isCorrect: false }] },
  { text: 'Which of the following is NOT a type of malware?', category: 'Malware', difficulty: 'EASY', explanation: 'A router is a networking device, not malware.', options: [{ text: 'Router', isCorrect: true }, { text: 'Trojan', isCorrect: false }, { text: 'Rootkit', isCorrect: false }, { text: 'Keylogger', isCorrect: false }] },
  { text: 'What is the role of a Security Operations Center (SOC)?', category: 'Defense', difficulty: 'HARD', explanation: 'A SOC monitors, detects, investigates, and responds to security threats.', options: [{ text: 'Monitoring and responding to security threats 24/7', isCorrect: true }, { text: 'Managing employee payroll', isCorrect: false }, { text: 'Developing new products', isCorrect: false }, { text: 'Handling customer support', isCorrect: false }] },
];

const passwordSecurityQuestions: SeedQuestion[] = [
  { text: 'What is the minimum recommended password length?', category: 'Password Policy', difficulty: 'EASY', explanation: 'NIST recommends at least 12 characters for passwords.', options: [{ text: '12 characters', isCorrect: true }, { text: '4 characters', isCorrect: false }, { text: '6 characters', isCorrect: false }, { text: '8 characters', isCorrect: false }] },
  { text: 'Which is the strongest password?', category: 'Password Strength', difficulty: 'EASY', explanation: 'Long, random passwords with mixed character types are strongest.', options: [{ text: 'Tr0ub4dor&3#Lp!x', isCorrect: true }, { text: 'password123', isCorrect: false }, { text: 'admin', isCorrect: false }, { text: 'qwerty', isCorrect: false }] },
  { text: 'What is multi-factor authentication (MFA)?', category: 'MFA', difficulty: 'MEDIUM', explanation: 'MFA requires two or more verification methods (knowledge, possession, inherence).', options: [{ text: 'Using two or more verification methods to prove identity', isCorrect: true }, { text: 'Using the same password on multiple sites', isCorrect: false }, { text: 'Logging in from multiple devices', isCorrect: false }, { text: 'Having multiple email accounts', isCorrect: false }] },
  { text: 'Why should you never reuse passwords across accounts?', category: 'Password Policy', difficulty: 'EASY', explanation: 'If one account is breached, all accounts with the same password are compromised.', options: [{ text: 'A breach on one site compromises all accounts using the same password', isCorrect: true }, { text: 'It makes passwords harder to remember', isCorrect: false }, { text: 'It slows down your computer', isCorrect: false }, { text: 'It has no real impact', isCorrect: false }] },
  { text: 'What is a password manager?', category: 'Credential Management', difficulty: 'EASY', explanation: 'A password manager securely stores and generates passwords for your accounts.', options: [{ text: 'Software that securely stores and generates passwords', isCorrect: true }, { text: 'A spreadsheet with passwords', isCorrect: false }, { text: 'A physical notebook for passwords', isCorrect: false }, { text: 'An email folder for passwords', isCorrect: false }] },
  { text: 'What is credential stuffing?', category: 'Attacks', difficulty: 'HARD', explanation: 'Credential stuffing uses leaked username/password pairs to break into other accounts.', options: [{ text: 'Using stolen credentials from one breach to access other accounts', isCorrect: true }, { text: 'Creating new passwords', isCorrect: false }, { text: 'A password reset method', isCorrect: false }, { text: 'A type of encryption', isCorrect: false }] },
  { text: 'Which MFA factor category does a fingerprint belong to?', category: 'MFA', difficulty: 'MEDIUM', explanation: 'Biometrics like fingerprints are "something you are" (inherence factor).', options: [{ text: 'Something you are (inherence)', isCorrect: true }, { text: 'Something you know', isCorrect: false }, { text: 'Something you have', isCorrect: false }, { text: 'Somewhere you are', isCorrect: false }] },
  { text: 'What is a brute force attack?', category: 'Attacks', difficulty: 'MEDIUM', explanation: 'A brute force attack tries all possible password combinations until finding the correct one.', options: [{ text: 'Trying every possible combination until the password is found', isCorrect: true }, { text: 'Guessing a password based on personal information', isCorrect: false }, { text: 'Sending phishing emails', isCorrect: false }, { text: 'Using a password manager', isCorrect: false }] },
  { text: 'How often should enterprise passwords be rotated?', category: 'Password Policy', difficulty: 'MEDIUM', explanation: 'NIST no longer recommends arbitrary rotation — change only when compromise is suspected.', options: [{ text: 'Only when a compromise is suspected or detected', isCorrect: true }, { text: 'Every day', isCorrect: false }, { text: 'Every 30 days', isCorrect: false }, { text: 'Never', isCorrect: false }] },
  { text: 'What is a passphrase?', category: 'Password Strength', difficulty: 'EASY', explanation: 'A passphrase is a sequence of words used as a password, often longer and easier to remember.', options: [{ text: 'A long password made of multiple words strung together', isCorrect: true }, { text: 'A single word', isCorrect: false }, { text: 'A number sequence', isCorrect: false }, { text: 'Your username', isCorrect: false }] },
  { text: 'What is the risk of writing passwords on sticky notes?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Physical password notes can be seen by anyone who passes by.', options: [{ text: 'Anyone who sees the note can access your account', isCorrect: true }, { text: 'There is no risk', isCorrect: false }, { text: 'It makes passwords stronger', isCorrect: false }, { text: 'It helps IT support', isCorrect: false }] },
  { text: 'What is a dictionary attack?', category: 'Attacks', difficulty: 'MEDIUM', explanation: 'A dictionary attack uses common words and phrases to guess passwords.', options: [{ text: 'Trying common words and phrases to guess a password', isCorrect: true }, { text: 'Looking up words in a dictionary', isCorrect: false }, { text: 'Encrypting a dictionary file', isCorrect: false }, { text: 'A type of phishing', isCorrect: false }] },
  { text: 'What is account lockout policy?', category: 'Password Policy', difficulty: 'MEDIUM', explanation: 'Account lockout temporarily disables login after too many failed attempts.', options: [{ text: 'Temporarily disabling an account after repeated failed login attempts', isCorrect: true }, { text: 'Permanently deleting an account', isCorrect: false }, { text: 'Requiring a new email address', isCorrect: false }, { text: 'Sending a warning email', isCorrect: false }] },
  { text: 'Which authentication method is most secure?', category: 'MFA', difficulty: 'HARD', explanation: 'Hardware security keys (FIDO2/WebAuthn) are the most phishing-resistant MFA method.', options: [{ text: 'Hardware security key (FIDO2)', isCorrect: true }, { text: 'SMS one-time code', isCorrect: false }, { text: 'Security questions', isCorrect: false }, { text: 'Email verification', isCorrect: false }] },
  { text: 'What is password salting?', category: 'Password Storage', difficulty: 'HARD', explanation: 'Salting adds random data to a password before hashing to prevent rainbow table attacks.', options: [{ text: 'Adding random data to a password before hashing', isCorrect: true }, { text: 'Adding special characters to a password', isCorrect: false }, { text: 'Encrypting the password twice', isCorrect: false }, { text: 'Storing passwords in plain text', isCorrect: false }] },
  { text: 'What is password hashing?', category: 'Password Storage', difficulty: 'MEDIUM', explanation: 'Hashing transforms a password into a fixed-length string that cannot be reversed.', options: [{ text: 'Converting a password into a fixed-length irreversible string', isCorrect: true }, { text: 'Encrypting a password so it can be decrypted later', isCorrect: false }, { text: 'Compressing a password for storage', isCorrect: false }, { text: 'Splitting a password into parts', isCorrect: false }] },
  { text: 'Why are security questions considered weak authentication?', category: 'Authentication', difficulty: 'MEDIUM', explanation: 'Answers to security questions can often be found via social media or public records.', options: [{ text: 'Answers can often be found through social media or public records', isCorrect: true }, { text: 'They are too complex', isCorrect: false }, { text: 'They change too frequently', isCorrect: false }, { text: 'They require special software', isCorrect: false }] },
  { text: 'What is a time-based one-time password (TOTP)?', category: 'MFA', difficulty: 'MEDIUM', explanation: 'TOTP generates a temporary code that changes every 30 seconds.', options: [{ text: 'A temporary code generated by an app that changes every 30 seconds', isCorrect: true }, { text: 'A permanent password', isCorrect: false }, { text: 'A password sent via email', isCorrect: false }, { text: 'A PIN for your bank card', isCorrect: false }] },
  { text: 'What is the danger of using personal information in passwords?', category: 'Password Strength', difficulty: 'EASY', explanation: 'Personal information like birthdays and pet names is easy to guess or find online.', options: [{ text: 'Personal information is easily guessable or publicly available', isCorrect: true }, { text: 'It makes passwords too long', isCorrect: false }, { text: 'It is against the law', isCorrect: false }, { text: 'It uses too much storage', isCorrect: false }] },
  { text: 'What is Single Sign-On (SSO)?', category: 'Authentication', difficulty: 'MEDIUM', explanation: 'SSO lets users authenticate once to access multiple applications.', options: [{ text: 'Logging in once to access multiple applications', isCorrect: true }, { text: 'Using the same password everywhere', isCorrect: false }, { text: 'Having only one user account', isCorrect: false }, { text: 'A type of two-factor authentication', isCorrect: false }] },
  { text: 'What is a rainbow table attack?', category: 'Attacks', difficulty: 'HARD', explanation: 'Rainbow tables are precomputed hash tables used to reverse-engineer hashed passwords.', options: [{ text: 'Using precomputed hash tables to crack hashed passwords', isCorrect: true }, { text: 'Using colorful charts to track passwords', isCorrect: false }, { text: 'A type of phishing attack', isCorrect: false }, { text: 'A network scanning technique', isCorrect: false }] },
  { text: 'What should you do if you think your password has been compromised?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Change the password immediately and enable MFA on the account.', options: [{ text: 'Change it immediately and enable MFA', isCorrect: true }, { text: 'Keep using it but be careful', isCorrect: false }, { text: 'Share it with IT so they can check', isCorrect: false }, { text: 'Write it down so you remember the old one', isCorrect: false }] },
  { text: 'What is the recommended way to share passwords with a colleague?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Use a password manager\'s secure sharing feature — never share via email/chat.', options: [{ text: 'Use a password manager\'s secure sharing feature', isCorrect: true }, { text: 'Send it via email', isCorrect: false }, { text: 'Write it on a sticky note', isCorrect: false }, { text: 'Say it over the phone', isCorrect: false }] },
  { text: 'What is biometric authentication?', category: 'Authentication', difficulty: 'EASY', explanation: 'Biometric auth uses unique physical characteristics like fingerprints or face scans.', options: [{ text: 'Verifying identity using unique physical characteristics', isCorrect: true }, { text: 'Using a password and username', isCorrect: false }, { text: 'Using a PIN code', isCorrect: false }, { text: 'Using security questions', isCorrect: false }] },
  { text: 'Why should default passwords always be changed?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Default passwords are publicly known and are the first thing attackers try.', options: [{ text: 'Default passwords are publicly known and easily exploited', isCorrect: true }, { text: 'Default passwords are too long', isCorrect: false }, { text: 'It is a legal requirement only', isCorrect: false }, { text: 'Default passwords expire automatically', isCorrect: false }] },
];

const dataPrivacyQuestions: SeedQuestion[] = [
  { text: 'What does GDPR stand for?', category: 'Regulation', difficulty: 'EASY', explanation: 'GDPR = General Data Protection Regulation, an EU data protection law.', options: [{ text: 'General Data Protection Regulation', isCorrect: true }, { text: 'Global Data Privacy Rules', isCorrect: false }, { text: 'Government Data Processing Requirements', isCorrect: false }, { text: 'General Database Protection Rules', isCorrect: false }] },
  { text: 'What is Personally Identifiable Information (PII)?', category: 'Data Classification', difficulty: 'EASY', explanation: 'PII is data that can identify a specific individual.', options: [{ text: 'Data that can identify a specific individual', isCorrect: true }, { text: 'Any data stored on a computer', isCorrect: false }, { text: 'Publicly available information only', isCorrect: false }, { text: 'Data that is encrypted', isCorrect: false }] },
  { text: 'Which of the following is an example of PII?', category: 'Data Classification', difficulty: 'EASY', explanation: 'A Social Security number uniquely identifies an individual.', options: [{ text: 'Social Security number', isCorrect: true }, { text: 'Company revenue', isCorrect: false }, { text: 'Weather forecast', isCorrect: false }, { text: 'Product SKU', isCorrect: false }] },
  { text: 'What is data minimization?', category: 'GDPR Principles', difficulty: 'MEDIUM', explanation: 'Data minimization means collecting only the data strictly necessary for the stated purpose.', options: [{ text: 'Collecting only the data necessary for a specific purpose', isCorrect: true }, { text: 'Deleting all data regularly', isCorrect: false }, { text: 'Compressing data to save space', isCorrect: false }, { text: 'Encrypting all data', isCorrect: false }] },
  { text: 'What is the right to be forgotten?', category: 'GDPR Rights', difficulty: 'MEDIUM', explanation: 'Individuals can request deletion of their personal data under GDPR Article 17.', options: [{ text: 'The right to request deletion of personal data', isCorrect: true }, { text: 'The right to forget your password', isCorrect: false }, { text: 'The right to not be recorded', isCorrect: false }, { text: 'The right to anonymous browsing', isCorrect: false }] },
  { text: 'What is a Data Protection Officer (DPO)?', category: 'GDPR Compliance', difficulty: 'MEDIUM', explanation: 'A DPO oversees data protection strategy and GDPR compliance within an organization.', options: [{ text: 'A person responsible for overseeing data protection compliance', isCorrect: true }, { text: 'An IT support technician', isCorrect: false }, { text: 'The CEO of a company', isCorrect: false }, { text: 'A software developer', isCorrect: false }] },
  { text: 'What is informed consent in data privacy?', category: 'Consent', difficulty: 'MEDIUM', explanation: 'Informed consent means individuals clearly understand what data is collected and how it will be used.', options: [{ text: 'Individuals understanding and agreeing to how their data will be used', isCorrect: true }, { text: 'Automatically accepting terms and conditions', isCorrect: false }, { text: 'Consenting by continuing to use a website', isCorrect: false }, { text: 'A form of encryption', isCorrect: false }] },
  { text: 'What is a data breach?', category: 'Incident Response', difficulty: 'EASY', explanation: 'A data breach is an unauthorized access to or disclosure of personal data.', options: [{ text: 'Unauthorized access to or disclosure of personal data', isCorrect: true }, { text: 'A planned data migration', isCorrect: false }, { text: 'A software update', isCorrect: false }, { text: 'A new privacy policy', isCorrect: false }] },
  { text: 'Under GDPR, how quickly must a data breach be reported?', category: 'GDPR Compliance', difficulty: 'HARD', explanation: 'GDPR requires breach notification to the supervisory authority within 72 hours.', options: [{ text: 'Within 72 hours', isCorrect: true }, { text: 'Within 24 hours', isCorrect: false }, { text: 'Within 1 week', isCorrect: false }, { text: 'Within 30 days', isCorrect: false }] },
  { text: 'What is data anonymization?', category: 'Data Processing', difficulty: 'MEDIUM', explanation: 'Anonymization removes all identifying information so data cannot be linked to an individual.', options: [{ text: 'Removing all identifying information from data', isCorrect: true }, { text: 'Encrypting data', isCorrect: false }, { text: 'Storing data in the cloud', isCorrect: false }, { text: 'Sharing data with third parties', isCorrect: false }] },
  { text: 'What is the difference between anonymization and pseudonymization?', category: 'Data Processing', difficulty: 'HARD', explanation: 'Anonymization is irreversible; pseudonymization replaces identifiers but can be reversed with a key.', options: [{ text: 'Anonymization is irreversible; pseudonymization can be reversed with a key', isCorrect: true }, { text: 'They are the same thing', isCorrect: false }, { text: 'Pseudonymization is more secure', isCorrect: false }, { text: 'Anonymization uses encryption', isCorrect: false }] },
  { text: 'What is a Privacy Impact Assessment (PIA)?', category: 'GDPR Compliance', difficulty: 'HARD', explanation: 'A PIA evaluates how personal data is collected, used, and protected in a project.', options: [{ text: 'An assessment of how personal data is handled in a project', isCorrect: true }, { text: 'A security scan of the network', isCorrect: false }, { text: 'A review of employee performance', isCorrect: false }, { text: 'A financial audit', isCorrect: false }] },
  { text: 'What is the principle of purpose limitation?', category: 'GDPR Principles', difficulty: 'MEDIUM', explanation: 'Data should only be collected for specified, explicit, and legitimate purposes.', options: [{ text: 'Data should only be collected for specific, stated purposes', isCorrect: true }, { text: 'Data should be stored for as long as possible', isCorrect: false }, { text: 'Data should be shared with all departments', isCorrect: false }, { text: 'Data should be collected as broadly as possible', isCorrect: false }] },
  { text: 'What are data subject rights under GDPR?', category: 'GDPR Rights', difficulty: 'MEDIUM', explanation: 'Data subject rights include access, rectification, erasure, portability, and objection.', options: [{ text: 'Rights including access, correction, deletion, and portability of personal data', isCorrect: true }, { text: 'The right to sell personal data', isCorrect: false }, { text: 'The right to hack into systems', isCorrect: false }, { text: 'The right to unlimited data storage', isCorrect: false }] },
  { text: 'What is a data processor vs. a data controller?', category: 'GDPR Roles', difficulty: 'HARD', explanation: 'Controller determines purposes/means of processing; processor processes data on behalf of controller.', options: [{ text: 'Controller decides why/how data is processed; processor handles data on controller\'s behalf', isCorrect: true }, { text: 'They are the same role', isCorrect: false }, { text: 'Processor makes all data decisions', isCorrect: false }, { text: 'Controller only stores data', isCorrect: false }] },
  { text: 'What is cross-border data transfer?', category: 'Data Transfer', difficulty: 'MEDIUM', explanation: 'Moving personal data from one country/jurisdiction to another, subject to regulations.', options: [{ text: 'Moving personal data between different countries or jurisdictions', isCorrect: true }, { text: 'Transferring data between departments', isCorrect: false }, { text: 'Emailing data to a colleague', isCorrect: false }, { text: 'Backing up data to a local server', isCorrect: false }] },
  { text: 'What is data retention policy?', category: 'Data Governance', difficulty: 'MEDIUM', explanation: 'Rules for how long data is stored and when it should be deleted.', options: [{ text: 'Rules defining how long data is kept and when it must be deleted', isCorrect: true }, { text: 'A policy about data encryption', isCorrect: false }, { text: 'A backup schedule', isCorrect: false }, { text: 'A user authentication policy', isCorrect: false }] },
  { text: 'What is the CCPA?', category: 'Regulation', difficulty: 'MEDIUM', explanation: 'CCPA = California Consumer Privacy Act, a US state privacy law.', options: [{ text: 'California Consumer Privacy Act', isCorrect: true }, { text: 'Canadian Consumer Privacy Act', isCorrect: false }, { text: 'Central Consumer Protection Authority', isCorrect: false }, { text: 'Cybersecurity Consumer Protection Act', isCorrect: false }] },
  { text: 'What is the lawful basis for processing personal data under GDPR?', category: 'GDPR Principles', difficulty: 'HARD', explanation: 'Six lawful bases: consent, contract, legal obligation, vital interests, public task, legitimate interests.', options: [{ text: 'Consent, contract, legal obligation, vital interests, public task, or legitimate interests', isCorrect: true }, { text: 'Only consent', isCorrect: false }, { text: 'Only legal obligation', isCorrect: false }, { text: 'Only contract', isCorrect: false }] },
  { text: 'What is a cookie consent banner?', category: 'Consent', difficulty: 'EASY', explanation: 'A banner informing users about cookies used on a website and collecting consent.', options: [{ text: 'A website notice informing users about cookies and requesting consent', isCorrect: true }, { text: 'An advertisement popup', isCorrect: false }, { text: 'A login form', isCorrect: false }, { text: 'A newsletter signup', isCorrect: false }] },
  { text: 'What is data portability?', category: 'GDPR Rights', difficulty: 'MEDIUM', explanation: 'The right to receive personal data in a structured, machine-readable format and transfer it.', options: [{ text: 'The right to receive and transfer personal data in a standard format', isCorrect: true }, { text: 'Carrying a laptop with your data', isCorrect: false }, { text: 'Storing data on a USB drive', isCorrect: false }, { text: 'Printing all your data', isCorrect: false }] },
  { text: 'What should employees do when they accidentally email PII to the wrong person?', category: 'Incident Response', difficulty: 'EASY', explanation: 'Report it immediately as a data breach incident per company policy.', options: [{ text: 'Report it immediately as a potential data breach', isCorrect: true }, { text: 'Ignore it', isCorrect: false }, { text: 'Ask the recipient to delete it and do nothing else', isCorrect: false }, { text: 'Send a follow-up email apologizing', isCorrect: false }] },
  { text: 'What is data classification?', category: 'Data Classification', difficulty: 'MEDIUM', explanation: 'Categorizing data by sensitivity level (public, internal, confidential, restricted).', options: [{ text: 'Categorizing data by sensitivity level to apply appropriate protections', isCorrect: true }, { text: 'Sorting files alphabetically', isCorrect: false }, { text: 'Deleting unnecessary data', isCorrect: false }, { text: 'Compressing data files', isCorrect: false }] },
  { text: 'What is end-to-end encryption?', category: 'Data Protection', difficulty: 'MEDIUM', explanation: 'Data is encrypted on the sender side and only decrypted by the intended recipient.', options: [{ text: 'Data encrypted at the source and decrypted only by the intended recipient', isCorrect: true }, { text: 'Encrypting data on the server only', isCorrect: false }, { text: 'Using HTTPS on a website', isCorrect: false }, { text: 'Password-protecting a file', isCorrect: false }] },
  { text: 'What is the penalty for GDPR non-compliance?', category: 'GDPR Compliance', difficulty: 'HARD', explanation: 'Up to €20 million or 4% of annual global turnover, whichever is higher.', options: [{ text: 'Up to €20 million or 4% of annual global turnover', isCorrect: true }, { text: 'A warning letter only', isCorrect: false }, { text: 'Up to €1,000', isCorrect: false }, { text: 'A temporary website shutdown', isCorrect: false }] },
];

const secureEmailQuestions: SeedQuestion[] = [
  { text: 'What is email encryption?', category: 'Encryption', difficulty: 'EASY', explanation: 'Email encryption converts email content into coded text only the intended recipient can read.', options: [{ text: 'Converting email content so only the intended recipient can read it', isCorrect: true }, { text: 'Compressing email attachments', isCorrect: false }, { text: 'Filtering spam emails', isCorrect: false }, { text: 'Forwarding emails securely', isCorrect: false }] },
  { text: 'What is a Business Email Compromise (BEC)?', category: 'Threats', difficulty: 'MEDIUM', explanation: 'BEC is a scam where attackers impersonate executives to trick employees into transfers.', options: [{ text: 'A scam where attackers impersonate executives to authorize fraudulent transfers', isCorrect: true }, { text: 'A type of email encryption', isCorrect: false }, { text: 'A legitimate business email service', isCorrect: false }, { text: 'An email backup method', isCorrect: false }] },
  { text: 'What is email spoofing?', category: 'Threats', difficulty: 'MEDIUM', explanation: 'Email spoofing forges the sender address to make an email appear from a trusted source.', options: [{ text: 'Forging the sender address to appear as someone else', isCorrect: true }, { text: 'Sending emails in bulk', isCorrect: false }, { text: 'Encrypting email content', isCorrect: false }, { text: 'Archiving old emails', isCorrect: false }] },
  { text: 'What does SPF stand for in email security?', category: 'Email Authentication', difficulty: 'HARD', explanation: 'SPF = Sender Policy Framework, which specifies authorized mail servers for a domain.', options: [{ text: 'Sender Policy Framework', isCorrect: true }, { text: 'Secure Private Firewall', isCorrect: false }, { text: 'Standard Protection Filter', isCorrect: false }, { text: 'Spam Prevention Feature', isCorrect: false }] },
  { text: 'What is DKIM in email security?', category: 'Email Authentication', difficulty: 'HARD', explanation: 'DKIM adds a digital signature to verify the email was sent from the claimed domain.', options: [{ text: 'DomainKeys Identified Mail — verifies email sender authenticity with digital signatures', isCorrect: true }, { text: 'Data Key Integration Module', isCorrect: false }, { text: 'Digital Knowledge Information Management', isCorrect: false }, { text: 'Domain Key Infrastructure Management', isCorrect: false }] },
  { text: 'What is DMARC?', category: 'Email Authentication', difficulty: 'HARD', explanation: 'DMARC builds on SPF and DKIM to tell receivers how to handle unauthenticated emails.', options: [{ text: 'Domain-based Message Authentication, Reporting, and Conformance', isCorrect: true }, { text: 'Digital Mail Address Registration Certificate', isCorrect: false }, { text: 'Direct Mail Access Remote Control', isCorrect: false }, { text: 'Data Management and Recovery Center', isCorrect: false }] },
  { text: 'What should you check before clicking a link in an email?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Hover over the link to verify the actual URL matches the expected destination.', options: [{ text: 'Hover over the link to verify the actual URL', isCorrect: true }, { text: 'Check the email font', isCorrect: false }, { text: 'Look at the email background color', isCorrect: false }, { text: 'Check the time the email was sent', isCorrect: false }] },
  { text: 'Why should you avoid sending sensitive data via regular email?', category: 'Data Protection', difficulty: 'EASY', explanation: 'Regular email is sent in plain text and can be intercepted or accessed by unauthorized parties.', options: [{ text: 'Regular email is not encrypted and can be intercepted', isCorrect: true }, { text: 'Email is too slow for sensitive data', isCorrect: false }, { text: 'Email servers have limited storage', isCorrect: false }, { text: 'Email cannot handle large files', isCorrect: false }] },
  { text: 'What is a secure email gateway?', category: 'Email Security Tools', difficulty: 'MEDIUM', explanation: 'A secure email gateway filters incoming/outgoing emails for threats, spam, and policy violations.', options: [{ text: 'A system that filters emails for threats, spam, and policy compliance', isCorrect: true }, { text: 'A VPN for email', isCorrect: false }, { text: 'An email backup service', isCorrect: false }, { text: 'A type of webmail', isCorrect: false }] },
  { text: 'What should you do if you receive a suspicious email from your CEO requesting an urgent wire transfer?', category: 'BEC Prevention', difficulty: 'MEDIUM', explanation: 'Verify the request through a separate communication channel (phone call) before acting.', options: [{ text: 'Verify the request through a phone call or in-person confirmation', isCorrect: true }, { text: 'Complete the transfer immediately', isCorrect: false }, { text: 'Reply to the email asking for confirmation', isCorrect: false }, { text: 'Forward it to all employees', isCorrect: false }] },
  { text: 'What is S/MIME?', category: 'Encryption', difficulty: 'HARD', explanation: 'S/MIME provides end-to-end encryption and digital signatures for email.', options: [{ text: 'Secure/Multipurpose Internet Mail Extensions — encryption and digital signing for email', isCorrect: true }, { text: 'Standard Mail Internet Messaging Extension', isCorrect: false }, { text: 'Secure Mail Integration Management Engine', isCorrect: false }, { text: 'Simple Mail Interface Module', isCorrect: false }] },
  { text: 'What is the danger of auto-forwarding rules in email?', category: 'Threats', difficulty: 'MEDIUM', explanation: 'Attackers may set up auto-forwarding to exfiltrate data without the user knowing.', options: [{ text: 'Attackers can secretly forward all your emails to their account', isCorrect: true }, { text: 'It slows down your email', isCorrect: false }, { text: 'It uses too much storage', isCorrect: false }, { text: 'It deletes old emails', isCorrect: false }] },
  { text: 'How can you verify an email sender\'s identity?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Check the actual email address (not just the display name) and look for domain mismatches.', options: [{ text: 'Check the actual email address, not just the display name', isCorrect: true }, { text: 'Check if the email has a logo', isCorrect: false }, { text: 'Check the email length', isCorrect: false }, { text: 'Check the font used in the email', isCorrect: false }] },
  { text: 'What is email archiving?', category: 'Email Management', difficulty: 'EASY', explanation: 'Storing copies of emails for compliance, legal, and business continuity purposes.', options: [{ text: 'Storing email copies for compliance, legal, and business continuity purposes', isCorrect: true }, { text: 'Deleting old emails', isCorrect: false }, { text: 'Marking emails as read', isCorrect: false }, { text: 'Moving emails to spam', isCorrect: false }] },
  { text: 'What type of file attachments are most commonly used to deliver malware?', category: 'Threats', difficulty: 'MEDIUM', explanation: 'Executable files (.exe), Office documents with macros (.docm), and archive files (.zip) are common.', options: [{ text: '.exe files, Office documents with macros, and .zip archives', isCorrect: true }, { text: 'Plain text files (.txt)', isCorrect: false }, { text: 'Image files (.jpg)', isCorrect: false }, { text: 'PDF files only', isCorrect: false }] },
  { text: 'What is the best practice for handling email attachments from unknown senders?', category: 'Best Practices', difficulty: 'EASY', explanation: 'Do not open attachments from unknown senders; report them to IT security.', options: [{ text: 'Do not open them and report to IT security', isCorrect: true }, { text: 'Open them to check if they are safe', isCorrect: false }, { text: 'Forward them to a colleague', isCorrect: false }, { text: 'Download and scan them yourself', isCorrect: false }] },
  { text: 'What is a phishing simulation?', category: 'Training', difficulty: 'MEDIUM', explanation: 'A controlled exercise that sends fake phishing emails to employees to test awareness.', options: [{ text: 'A controlled test sending fake phishing emails to employees to measure awareness', isCorrect: true }, { text: 'An actual phishing attack', isCorrect: false }, { text: 'A type of email encryption', isCorrect: false }, { text: 'A spam filter configuration', isCorrect: false }] },
  { text: 'Why should you use BCC when emailing a large group of external recipients?', category: 'Best Practices', difficulty: 'EASY', explanation: 'BCC hides recipient addresses, protecting their privacy and preventing reply-all storms.', options: [{ text: 'To protect recipient email addresses from being exposed to others', isCorrect: true }, { text: 'To make the email load faster', isCorrect: false }, { text: 'To reduce file size', isCorrect: false }, { text: 'To avoid spam filters', isCorrect: false }] },
  { text: 'What is a mail relay?', category: 'Email Infrastructure', difficulty: 'HARD', explanation: 'A mail relay transfers email from one server to another, potentially exploited for spam.', options: [{ text: 'A server that forwards email from one server to another', isCorrect: true }, { text: 'A type of email encryption', isCorrect: false }, { text: 'An email client application', isCorrect: false }, { text: 'A spam filter', isCorrect: false }] },
  { text: 'What is the purpose of an email disclaimer?', category: 'Email Management', difficulty: 'EASY', explanation: 'Legal notices at the bottom of emails about confidentiality and intended recipients.', options: [{ text: 'A legal notice about confidentiality and intended use of the email', isCorrect: true }, { text: 'A way to encrypt the email', isCorrect: false }, { text: 'A signature design element', isCorrect: false }, { text: 'A spam prevention measure', isCorrect: false }] },
  { text: 'What is typosquatting in email context?', category: 'Threats', difficulty: 'HARD', explanation: 'Registering domains with slight misspellings of legitimate domains to deceive email recipients.', options: [{ text: 'Registering domains with slight misspellings to deceive recipients', isCorrect: true }, { text: 'Making typos in emails', isCorrect: false }, { text: 'A type of email formatting', isCorrect: false }, { text: 'A spam filter technique', isCorrect: false }] },
  { text: 'What is email DLP (Data Loss Prevention)?', category: 'Email Security Tools', difficulty: 'MEDIUM', explanation: 'DLP monitors outgoing emails to prevent unauthorized sharing of sensitive information.', options: [{ text: 'Monitoring outgoing emails to prevent unauthorized data sharing', isCorrect: true }, { text: 'Deleting lost emails', isCorrect: false }, { text: 'A type of encryption', isCorrect: false }, { text: 'An email backup solution', isCorrect: false }] },
  { text: 'What is the safest way to share confidential documents via email?', category: 'Best Practices', difficulty: 'MEDIUM', explanation: 'Use encrypted email or a secure file-sharing platform with access controls.', options: [{ text: 'Use encrypted email or a secure file-sharing platform with access controls', isCorrect: true }, { text: 'Attach the file to a regular email', isCorrect: false }, { text: 'Upload to a public cloud drive', isCorrect: false }, { text: 'Print and fax the documents', isCorrect: false }] },
  { text: 'What should be included in an email security policy?', category: 'Policy', difficulty: 'MEDIUM', explanation: 'Acceptable use, attachment rules, encryption requirements, and incident reporting procedures.', options: [{ text: 'Acceptable use, attachment rules, encryption requirements, and incident reporting', isCorrect: true }, { text: 'Only password requirements', isCorrect: false }, { text: 'Only spam filter settings', isCorrect: false }, { text: 'Only email signature guidelines', isCorrect: false }] },
  { text: 'What is an email sandbox?', category: 'Email Security Tools', difficulty: 'HARD', explanation: 'A sandbox opens email attachments in an isolated environment to detect malicious behavior.', options: [{ text: 'An isolated environment that tests email attachments for malicious behavior', isCorrect: true }, { text: 'A folder for draft emails', isCorrect: false }, { text: 'A type of email archive', isCorrect: false }, { text: 'A testing email account', isCorrect: false }] },
];

// ─────────────────── TRACK DEFINITIONS ───────────────────

const trackSeeds: TrackSeed[] = [
  {
    track: 'CYBER_SECURITY',
    bankTitle: 'Cyber Security Compliance — Question Bank',
    bankDescription: 'Enterprise cyber security awareness training questions covering phishing, malware, network security, and incident response.',
    assessmentTitle: 'Cyber Security Compliance Assessment',
    questions: cyberSecurityQuestions,
  },
  {
    track: 'PASSWORD_SECURITY',
    bankTitle: 'Password Security Compliance — Question Bank',
    bankDescription: 'Enterprise password security training questions covering password policies, MFA, credential management, and authentication best practices.',
    assessmentTitle: 'Password Security Compliance Assessment',
    questions: passwordSecurityQuestions,
  },
  {
    track: 'DATA_PRIVACY',
    bankTitle: 'Data Privacy Compliance — Question Bank',
    bankDescription: 'Enterprise data privacy training questions covering GDPR, data classification, PII handling, consent, and regulatory compliance.',
    assessmentTitle: 'Data Privacy Compliance Assessment',
    questions: dataPrivacyQuestions,
  },
  {
    track: 'SECURE_EMAIL',
    bankTitle: 'Secure Email Compliance — Question Bank',
    bankDescription: 'Enterprise secure email training questions covering email encryption, spoofing, BEC prevention, and email security best practices.',
    assessmentTitle: 'Secure Email Compliance Assessment',
    questions: secureEmailQuestions,
  },
];

// ─────────────────── SEEDER FUNCTION ───────────────────

export async function seedEnterpriseCompliance(
  prisma: PrismaClient,
  organizationId: string,
) {
  console.log('🏢 Seeding Enterprise Compliance tracks...');

  for (const trackSeed of trackSeeds) {
    // Check if bank already exists
    const existing = await prisma.enterpriseQuestionBank.findFirst({
      where: {
        organizationId,
        complianceTrack: trackSeed.track,
        sourceType: 'SEEDED_DEMO',
      },
    });

    if (existing) {
      console.log(`  ⏭ ${trackSeed.track} already seeded, skipping.`);
      continue;
    }

    // Create question bank
    const bank = await prisma.enterpriseQuestionBank.create({
      data: {
        title: trackSeed.bankTitle,
        description: trackSeed.bankDescription,
        organizationId,
        complianceTrack: trackSeed.track,
        sourceType: 'SEEDED_DEMO',
      },
    });

    // Create questions with options
    for (const q of trackSeed.questions) {
      await prisma.enterpriseQuestion.create({
        data: {
          questionBankId: bank.id,
          text: q.text,
          category: q.category,
          difficulty: q.difficulty,
          explanation: q.explanation,
          options: {
            create: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        },
      });
    }

    // Create compliance assessment
    await prisma.complianceAssessment.create({
      data: {
        organizationId,
        questionBankId: bank.id,
        title: trackSeed.assessmentTitle,
        complianceTrack: trackSeed.track,
        passingScore: 80,
        sampleSize: 15,
        timeLimit: 900,
        maxAttempts: 3,
        timeLimitEnabled: true,
        allowResume: true,
      },
    });

    console.log(`  ✅ ${trackSeed.track}: ${trackSeed.questions.length} questions + assessment seeded.`);
  }

  console.log('🏢 Enterprise Compliance seeding complete!');
}

// ─────────────────── STANDALONE RUNNER ───────────────────

async function main() {
  const prisma = new PrismaClient();

  try {
    // Find or create a demo organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Dezai Demo Enterprise',
          industry: 'Technology',
          size: 'MEDIUM',
        },
      });
      console.log(`📁 Created demo organization: ${org.name} (ID: ${org.id})`);
    } else {
      console.log(`📁 Using existing organization: ${org.name} (ID: ${org.id})`);
    }

    await seedEnterpriseCompliance(prisma, org.id);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  main().catch(console.error);
}
