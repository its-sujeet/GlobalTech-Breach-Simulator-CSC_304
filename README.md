# SQL Injection Educational Lab (Project VulnVault)

This repository contains a complete, self-contained educational laboratory for demonstrating SQL Injection (SQLi) vulnerabilities. It includes a vulnerable web application, an automated exploit script, and a comprehensive vulnerability assessment report.

This project was built to demonstrate how a database-backed web application can be susceptible to SQL injection, how to identify those injection points, and how an attacker might extract sensitive data to demonstrate impact.

## Project Components

1.  **Vulnerable Web Application (`server.js`, `db.js`, `index.html`)**
    *   A Node.js/Express web application simulating a corporate portal ("GlobalTech Solutions").
    *   Uses an in-memory SQLite database seeded with user accounts and a `secret_vault` table containing sensitive data.
    *   Features an interactive UI with a "Researcher Toolbox" that allows toggling between secure (parameterized) and vulnerable code to see the differences in real-time.
    *   Contains 5 distinct SQL injection vulnerabilities:
        *   Authentication Bypass (Error-Based)
        *   Data Exfiltration (UNION-Based)
        *   Privilege Escalation (UPDATE Statement)
        *   Unrestricted Account Creation (INSERT Statement)
        *   Blind/Time-Based Inference

2.  **Automated Exploit Script (`exploit.py`)**
    *   A Python script that automatically exploits the UNION-based vulnerability on the `/api/search` endpoint.
    *   Extracts and neatly formats the contents of the hidden `secret_vault` table, demonstrating the severe impact of the vulnerability.

3.  **Vulnerability Assessment Report (`vulnerability_report.md`)**
    *   A professional penetration testing report detailing the findings.
    *   Includes vulnerable code snippets, exploit payloads, a proof of concept, and remediation recommendations (using parameterized queries).

## Prerequisites

*   **Node.js** (v14 or higher recommended)
*   **npm** (Node Package Manager)
*   **Python 3** (for the exploit script)
*   `requests` library for Python (`pip install requests`)

## Installation and Setup

1.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

2.  **Start the vulnerable server:**
    ```bash
    npm start
    ```
    *The server will start running at `http://localhost:3000`.*

3.  **Access the Lab:**
    Open your web browser and navigate to `http://localhost:3000`. You can interact with the different pages and use the "Researcher Toolbox" to analyze the queries.

## Running the Exploit

1.  Ensure the Node.js server is running (see above).
2.  Make sure the "Parameterized Shield" in the Researcher Toolbox (in the web UI) is **Disabled**.
3.  Run the exploit script from your terminal:
    ```bash
    python3 exploit.py
    ```
4.  Observe the script automatically extracting the sensitive data from the database.

## Educational Purpose

This project is intended strictly for educational purposes and security awareness. The vulnerabilities demonstrated here are common in real-world applications and understanding them is crucial for building secure software.
