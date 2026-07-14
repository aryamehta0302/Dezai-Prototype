# Enterprise Assessments & Compliance API Reference

Base path: `/api/enterprise/assessments`

## Authentication
All routes require a valid JWT token passed in the Authorization header:
`Authorization: Bearer <token>`

---

## 1. Enterprise Question Banks

### Get All Question Banks
*   **Method**: `GET`
*   **Path**: `/question-banks`
*   **Query Parameters**:
    *   `organizationId` (string, optional) - Filter by organization
    *   `complianceTrack` (string, optional) - Filter by compliance track (`CYBER_SECURITY`, `PASSWORD_SECURITY`, `DATA_PRIVACY`, `SECURE_EMAIL`)
*   **Success Response**: `200 OK`
    ```json
    {
      "success": true,
      "questionBanks": [
        {
          "id": "bank-uuid",
          "title": "Cyber Security Awareness",
          "description": "Basic security training question bank",
          "organizationId": "org-uuid",
          "complianceTrack": "CYBER_SECURITY",
          "_count": {
            "questions": 25
          }
        }
      ]
    }
    ```

### Get Question Bank by ID
*   **Method**: `GET`
*   **Path**: `/question-banks/:id`
*   **Success Response**: `200 OK`

### Create Question Bank
*   **Method**: `POST`
*   **Path**: `/question-banks`
*   **Roles Required**: `DEZAI_ADMIN`
*   **Request Body**:
    ```json
    {
      "title": "Data Privacy Bank",
      "description": "GDPR and CCPA regulations",
      "organizationId": "org-uuid",
      "complianceTrack": "DATA_PRIVACY"
    }
    ```

### Add Question to Bank
*   **Method**: `POST`
*   **Path**: `/question-banks/:bankId/questions`
*   **Roles Required**: `DEZAI_ADMIN` (with ownership check)
*   **Request Body**:
    ```json
    {
      "text": "What does PII stand for?",
      "category": "PII",
      "difficulty": "EASY",
      "explanation": "PII stands for Personally Identifiable Information.",
      "options": [
        { "text": "Personally Identifiable Information", "isCorrect": true },
        { "text": "Public Internet Information", "isCorrect": false }
      ]
    }
    ```

### Ingest AI-Generated Assessment
*   **Method**: `POST`
*   **Path**: `/generated`
*   **Roles Required**: `DEZAI_ADMIN`
*   **Description**: Ingests AI-parsed questions to dynamically create a linked `EnterpriseQuestionBank` (sourceType: `AI_GENERATED`) and a ready `ComplianceAssessment` in a single transaction. Requires at least 10 questions.
*   **Request Body**:
    ```json
    {
      "organizationId": "org-uuid",
      "departmentId": "dept-uuid",
      "title": "AI Compliance Quiz",
      "complianceTrack": "CYBER_SECURITY",
      "sourceDocumentId": "doc-uuid",
      "questions": [
        {
          "text": "What is the primary sign of a phishing email?",
          "category": "Phishing",
          "difficulty": "EASY",
          "explanation": "Urgent language demanding action is highly indicative of phishing.",
          "options": [
            { "text": "Urgent language", "isCorrect": true },
            { "text": "Sender email is correct", "isCorrect": false }
          ]
        }
      ]
    }
    ```
*   **Success Response**: `201 Created`

---

## 2. Compliance Assessments

### Create Compliance Assessment
*   **Method**: `POST`
*   **Path**: `/compliance`
*   **Roles Required**: `DEZAI_ADMIN`
*   **Request Body**:
    ```json
    {
      "organizationId": "org-uuid",
      "questionBankId": "bank-uuid",
      "title": "Annual Cyber Security Assessment",
      "complianceTrack": "CYBER_SECURITY",
      "passingScore": 80,
      "sampleSize": 15,
      "timeLimit": 900
    }
    ```

### Get Shuffled Assessment Questions
*   **Method**: `GET`
*   **Path**: `/compliance/:id/questions/select`
*   **Description**: Retrieves a randomized subset of questions for the test session. Correct answer flags are stripped.
*   **Success Response**: `200 OK`

---

## 3. Compliance Attempts

### Start Attempt
*   **Method**: `POST`
*   **Path**: `/attempts/start`
*   **Request Body**:
    ```json
    {
      "assessmentId": "assessment-uuid"
    }
    ```
*   **Success Response**: `201 Created`

### Submit Attempt
*   **Method**: `POST`
*   **Path**: `/attempts/:attemptId/submit`
*   **Description**: Grades and finalizes a compliance attempt. Enforces attempt settings: if `timeLimitEnabled` is true and `timeTakenSeconds` exceeds `timeLimit`, the attempt is auto-failed (`passed: false`).
*   **Request Body**:
    ```json
    {
      "answers": {
        "question-id-1": "selected-option-id-1",
        "question-id-2": "selected-option-id-2"
      }
    }
    ```
*   **Success Response**: `200 OK`
    ```json
    {
      "success": true,
      "attemptId": "attempt-uuid",
      "score": 12,
      "percentage": 80.0,
      "passed": true,
      "timeTakenSeconds": 340,
      "totalQuestions": 15
    }
    ```

---

## 4. Dashboards

### Organization Dashboard
*   **Method**: `GET`
*   **Path**: `/dashboard/organization/:orgId`
*   **Success Response**: `200 OK`

### Employee Dashboard
*   **Method**: `GET`
*   **Path**: `/dashboard/employee`
*   **Description**: Get personal compliance dashboard for the logged-in employee user.
*   **Success Response**: `200 OK`
